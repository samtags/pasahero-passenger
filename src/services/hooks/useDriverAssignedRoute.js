import { useEffect, useRef, useState } from "react";
import getMatchById from "../api/getMatchById";
import log from "../log";
import useWatchDriverLocation from "./useDriverLocations";
import getDirections from "../api/getDirections";
import * as Polyline from "@mapbox/polyline";
import useOnUpdateSnapshot from "./useOnUpdateSnapshot";
import getDistance from "../util/haversine/getDistance";

/**
 *
 * @param {Props} props
 * @returns {Return}
 */
export default function useDriverAssignedRoute({ match_id }) {
  const originalCoordinatesRef = useRef();

  const [coordinates, setCoordinates] = useState([]);

  const [isStarted, setIsStarted] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState("");

  const [first, setFirst] = useState();
  const [last, setLast] = useState();

  const [driverId, setDriverId] = useState();

  const {
    coordinates: driverLocation,
    handleStop: handleStopWatchDriverLocation,
    handleStart: handleWatchDriverLocation,
  } = useWatchDriverLocation(driverId);

  useEffect(() => handleStop, []);
  useOnUpdateSnapshot(incomingLocationProcedure, { driverLocation });

  async function handleStart() {
    log.debug("Driver assigned route hook initiated.", { match_id });
    setIsStarted(true);
    setIsPending(true);

    const match = await getMatchById(match_id);

    let _first, _last;

    if (match) {
      _first = match.initial_driver_location;
      _last = match.first_point;

      setFirst(_first);
      setLast(_last);

      // for subscription
      setDriverId(match.driver_id);
      handleWatchDriverLocation(match.driver_id);

      log.debug("Initial driver location", { _first, _last, match });

      if (_first && _last) {
        const origin = `${_first.latitude},${_first.longitude}`;
        const destination = `${_last.latitude},${_last.longitude}`;

        log.debug("Getting directions", { origin, destination });
        const direction = await handleGetDirections(origin, destination);

        if (direction) {
          const encoded = direction?.overview_polyline?.points;
          log.debug("Decoding encounted polyline", { encoded, direction });
          const points = Polyline.decode(encoded);
          log.debug("Decoded completed!", { points, encoded, direction });

          const _coordinates = points.map((point) => ({
            latitude: point[0],
            longitude: point[1],
          }));

          originalCoordinatesRef.current = _coordinates;
          setCoordinates(_coordinates);

          log.debug("Initial coordinates", {coordinates: _coordinates, points, encoded, direction}); // prettier-ignore
        } else {
          setIsError(true);
          setError("NO_DIRECTION_FOUND");
          log.warn(
            "No direction found. No route is displayed upon driver assigned.",
            { match_id, match, _first, _last, origin, destination }
          );
        }
      } else {
        setIsError(true);
        setError("NO_INITIAL_DRIVER_LOCATION");
        log.warn(
          "Unable to get pickup location or initial driver location. No route is displayed upon driver assigned.",
          { match_id, match, _first, _last }
        );
      }
    } else {
      setError("NO_MATCH_FOUND");
      setIsError(true);
      log.warn(
        "Unable to get match by id. No route is displayed upon driver assigned."
      );
    }

    setIsPending(false);
  }

  function handleStop() {
    setIsStopped(true);
    handleStopWatchDriverLocation();
  }

  function incomingLocationProcedure(prev, curr) {
    const previousLocation = prev.driverLocation;
    const incomingLocation = curr.driverLocation;

    if (!previousLocation) {
      log.debug("Previous location is not available.", { previousLocation, incomingLocation }); // prettier-ignore
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
 */
