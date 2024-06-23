import { useEffect, useRef, useState } from "react";
import getMatchById from "../api/getMatchById";
import log from "../log";
import useWatchDriverLocation from "./useDriverLocations";
import getDirections from "../api/getDirections";
import * as Polyline from "@mapbox/polyline";
import useOnUpdateSnapshot from "./useOnUpdateSnapshot";
import getDistance from "../util/haversine/getDistance";
import moment from "moment";
import getRecentLocationByMatchDriver from "../api/getRecentLocationByMatchDriver";

/**
 *
 * @param {Props} props
 * @returns {Return}
 */
export default function useDriverToPickUpRouteProcedure({ match_id }) {
  const isSettingCoordinates = useRef(false);
  const originalCoordinatesRef = useRef();
  const matchRef = useRef();

  const [coordinates, setCoordinates] = useState([]);

  const [isStarted, setIsStarted] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState("");
  const [eta, setEta] = useState(0);

  const [first, setFirst] = useState();
  const [last, setLast] = useState();

  const [driverId, setDriverId] = useState();

  const {
    coordinates: driverLocation,
    handleStop: handleStopWatchDriverLocation,
    handleStart: handleWatchDriverLocation,
  } = useWatchDriverLocation(driverId);

  useEffect(init, []);
  useEffect(() => handleStop, []);
  useOnUpdateSnapshot(incomingLocationProcedure, { driverLocation });

  function init() {
    (async () => {
      log.debug("Initializing Driver to Pickup route procedure.", { match_id });
      const match = await getMatchById(match_id);
      if (match) {
        matchRef.current = match;
        setLast(match.first_point);
        log.debug("Route destination initialized.", { last, match, match_id });
      } else {
        log.warn("Driver to Pickup route procedure failed.");
      }
    })();
  }

  async function handleGetMatch() {
    if (matchRef.current) {
      log.debug("match data already initialized", { matchRef: matchRef.current }); // prettier-ignore
      return matchRef.current;
    }

    log.debug("No match found in the match reference. Getting match from api.");
    const match = await getMatchById(match_id);

    if (!match) {
      setError("NO_MATCH_FOUND");
      setIsError(true);
      log.warn(
        "Unable to get match by id. No route is displayed upon driver assigned."
      );

      return undefined;
    }

    log.debug("Initializing match reference.", { match, matchRef: matchRef.current }); // prettier-ignore
    matchRef.current = match;

    return match;
  }

  /**
   * @returns {Coordinates[] | undefined}
   */
  async function handleGetLocations(match) {
    const destination = match.first_point;
    const origin = await getRecentLocationByMatchDriver({
      match_id: match.id,
      driver_id: match.driver_id,
    });

    if (!origin && !destination) {
      setIsError(true);
      setError("NO_INITIAL_DRIVER_LOCATION");
      log.warn(
        "Unable to get pickup location or initial driver location. No route is displayed upon driver assigned.",
        { match_id, match, destination, origin }
      );
      return undefined;
    }

    // store
    setFirst(origin);
    setLast(destination);

    return [origin, destination];
  }

  async function handleDirections(pickup, dropoff) {
    const origin = `${pickup.latitude},${pickup.longitude}`;
    const destination = `${dropoff.latitude},${dropoff.longitude}`;

    log.debug("Getting directions", { origin, destination });
    const direction = await handleGetDirections(origin, destination);

    if (!direction) {
      setIsError(true);
      setError("NO_DIRECTION_FOUND");
      log.warn(
        "No direction found. No route is displayed upon driver assigned.",
        { match_id, pickup, dropoff }
      );

      return undefined;
    }

    return direction;
  }

  function handleEta(direction) {
    const _eta = direction?.legs?.[0]?.duration?.value;
    if (_eta) {
      setEta(moment().add(_eta, "seconds").format("hh:mm A"));
    }
  }

  function handleConvertPolylineToCoordinates(direction) {
    const encoded = direction?.overview_polyline?.points;
    log.debug("Decoding encounted polyline", { encoded, direction });
    const points = Polyline.decode(encoded);
    log.debug("Decoded completed!", { points, encoded, direction });

    const _coordinates = points.map((point) => ({
      latitude: point[0],
      longitude: point[1],
    }));

    return _coordinates;
  }

  async function handleStartDriverLocationSubscription() {
    const match = await handleGetMatch();

    if (!match) {
      log.warn(
        "Unable to get match data. Unable to subscribe to driver location."
      );
    }

    setDriverId(match.driver_id);
    handleWatchDriverLocation(match.driver_id);
    log.debug("Initialized driver subscription upon starting the procedure.", match); // prettier-ignore
  }

  async function handleStart() {
    log.debug("Driver assigned route hook initiated.", { match_id });
    setIsStarted(true);
    setIsPending(true);

    await handleSetCoordinates();
    await handleStartDriverLocationSubscription();
    setIsPending(false);
  }

  async function handleSetCoordinates() {
    log.debug("Get coordinates started.", { match_id });
    isSettingCoordinates.current = true;

    const match = await handleGetMatch();
    if (!match) {
      isSettingCoordinates.current = false;
      return; // exit
    }

    const location = await handleGetLocations(match);
    if (!location) {
      isSettingCoordinates.current = false;
      return; // exit
    }

    const [_first, _last] = location;
    log.debug("Initial driver location", { _first, _last, match });

    const direction = await handleDirections(_first, _last);
    if (!direction) {
      isSettingCoordinates.current = false;
      return; // exit
    }

    handleEta(direction);

    const _coordinates = handleConvertPolylineToCoordinates(direction);

    _coordinates[0] = _first; // preserve the icon rotation

    originalCoordinatesRef.current = _coordinates;
    setCoordinates(_coordinates);

    log.debug("Coordinates", {coordinates: _coordinates, direction, location, match}); // prettier-ignore
    isSettingCoordinates.current = false;
  }

  function handleStop() {
    setIsStopped(true);
    handleStopWatchDriverLocation();
  }

  /**
   * @returns {boolean}
   */
  function handleIdentifyOffRoute(previousLocation, incomingLocation) {
    // 1. Off route by distance - check if the distance of the current location to the next coordinate is far from the previous
    // 2. Off route by angle - check if the angle of the previous location and the next coordinate is different from the angle of current location and next coordinate.

    log.debug("Identifying off route."); // prettier-ignore

    const nextCoordinate = coordinates?.[1];

    if (!nextCoordinate) {
      log.debug("No next coordinate found. Unable to identify off route.", { previousLocation, incomingLocation, coordinates }); // prettier-ignore
      return false;
    }

    if (coordinates?.length <= 2) {
      log.debug("To few coordinates to identify off route by angle.", { previousLocation, incomingLocation, coordinates }); // prettier-ignore
      // return false;
    }

    // 1. distance

    // legend:
    // P - previous location
    // N - next coordinate
    // I - incoming location
    // L - last coordinate

    // Formula:
    // off route if d2 is greater than d1 and
    // d4 is greater than d3

    // d1 = distance of P and N
    // d2 = distance of I and N
    // d3 = distance of P and L
    // d4 = distance of I and L

    const P = previousLocation;
    const N = coordinates[1];
    const I = incomingLocation;
    const L = coordinates;

    const d1 = handleGetDistance(P, N);
    const d2 = handleGetDistance(I, N);
    const d3 = handleGetDistance(P, L);
    const d4 = handleGetDistance(I, L);

    const isOffRouteByDistance = d2 > d1 && d4 > d3;

    const adjacent = d2 > d1;
    const overall = d4 > d3;

    log.debug(
      "Off route by distance calculated.",
      { isOffRouteByDistance, d1, d2, d3, d4, P, N, I, L, adjacent, overall } // prettier-ignore
    );

    // todo: implement off route by angle
    const offRouteByAngle = false;

    return isOffRouteByDistance && offRouteByAngle;
  }

  async function incomingLocationProcedure(prev, curr) {
    const previousLocation = prev.driverLocation;
    const incomingLocation = curr.driverLocation;

    if (isSettingCoordinates.current) {
      log.debug("Setting coordinates in progress. Aborting incoming location procedure."); // prettier-ignore
      return;
    }

    if (!previousLocation) {
      log.debug("Previous location is not available.", { previousLocation, incomingLocation }); // prettier-ignore
      await handleSetCoordinates();
      return;
    }

    const isOffRoute = handleIdentifyOffRoute(
      previousLocation,
      incomingLocation
    );
    if (isOffRoute) {
      log.debug("Off route detected.", { previousLocation, incomingLocation }); // prettier-ignore
      log.debug("Recalculating coordinates based on driver's new location.");
      handleSetCoordinates();
      return;
    }

    log.debug("Incoming location procedure initiated.", {previousLocation, incomingLocation}); // prettier-ignore

    // create distance representation of the coordinates
    const distanceRepresentation = coordinates.map((item) => {
      return getDistance(
        previousLocation.latitude,
        previousLocation.longitude,
        item.latitude,
        item.longitude
      );
    });

    log.debug("Created distance representation of the coordinates", {
      distanceRepresentation,
      previousLocation,
      incomingLocation,
    });

    // get distance between previousLocation and incomingLocation
    const distance = getDistance(
      previousLocation.latitude,
      previousLocation.longitude,
      incomingLocation.latitude,
      incomingLocation.longitude
    );

    log.debug("Got distance between previousLocation and incomingLocation", { distance, previousLocation, incomingLocation, }); // prettier-ignore

    // in distance representation, get the first index where the value is greater than the distance of previousLocation from incomingLocation
    const index = distanceRepresentation.findIndex((value) => value > distance);
    log.debug("Distance index found.", { index, distance, distanceRepresentation, coordinates }); // prettier-ignore

    // recreate the coordinates where the start of the new coordinates is the index we get from the previous step
    const newCoordinates = coordinates.slice(index);
    log.debug("New coordinates created.", { newCoordinates, index, coordinates }); // prettier-ignore

    // insert the incoming location to the start of the new coordinates
    newCoordinates.unshift(incomingLocation);
    log.debug("Incoming location inserted to the start of the new coordinates.", { newCoordinates, incomingLocation }); // prettier-ignore

    // set the new coordinates to the state
    setCoordinates(newCoordinates);
  }

  function reset() {
    log.debug("Initiated reset driver assigned route hook.");
    originalCoordinatesRef.current = undefined;
    matchRef.current = undefined;

    setCoordinates([]);
    setIsStarted(false);
    setIsStopped(false);
    setIsPending(false);
    setIsError(false);
    setError("");
    setFirst(undefined);
    setLast(undefined);
    setDriverId(undefined);

    handleStopWatchDriverLocation();
    log.debug("Reset driver assigned route hook completed.");
  }

  return {
    handleStart,
    handleStop,
    coordinates,
    isPending,
    isStarted,
    isStopped,
    isError,
    error,
    first,
    last,
    reset,
    eta,
  };
}

/**
 *
 * @param {string} origin
 * @param {string} destination
 */
async function handleGetDirections(origin, destination) {
  const directions = await getDirections(origin, destination);
  return directions?.routes?.[0];
}

function handleGetDistance(coor1, coor2) {
  return getDistance(
    coor1.latitude,
    coor1.longitude,
    coor2.latitude,
    coor2.longitude
  );
}

/**
 * @typedef {Object} Props
 * @property {string} match_id
 *
 * @typedef {Object} Coordinates
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} [heading]
 *
 * @typedef {Object} Return
 * @property {Function} handleStart
 * @property {Function} handleStop
 * @property {Coordinates[]} coordinates
 * @property {boolean} isPending
 * @property {boolean} isStarted
 * @property {boolean} isStopped
 * @property {boolean} isError
 * @property {string} error
 * @property {Coordinates} [first]
 * @property {Coordinates} [last]
 * @property {Function} reset
 * @property {string} eta
 */
