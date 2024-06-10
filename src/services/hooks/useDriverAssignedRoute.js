import { useEffect, useRef, useState } from "react";
import getMatchById from "../api/getMatchById";
import log from "../log";
import useWatchDriverLocation from "./useDriverLocations";
import getDirections from "../api/getDirections";
import JSON from "../json";
import * as Polyline from "@mapbox/polyline";
import useOnUpdateSnapshot from "./useOnUpdateSnapshot";

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

  // todo: implement the subscription hook
  const {
    coordinates: driverLocation,
    handleStop: handleStopWatchDriverLocation,
    handleStart: handleWatchDriverLocation,
  } = useWatchDriverLocation(driverId);

  useEffect(() => handleStop, []);
  useOnUpdateSnapshot(incomingLocationProcedure, driverLocation);

  async function handleStart() {
    setIsStarted(true);
    setIsPending(true);

    const match = await getMatchById(match_id);

    let _first, _last;

    if (match) {
      _first = JSON.parse(match.initial_driver_location);
      _last = JSON.parse(match.first_point);

      setFirst(_first);
      setLast(_last);

      // for subscription
      setDriverId(match.driver_id);
      handleWatchDriverLocation(match.driver_id);

      if (!_first || !_last) {
        const origin = `${_first.latitude},${_first.longitude}`;
        const destination = `${_last.latitude},${_last.longitude}`;

        log.debug("Getting directions", { origin, destination });
        const direction = await handleGetDirections();

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

  function incomingLocationProcedure(previousLocation, incomingLocation) {
    // create distance representation of the coordinates
    // get distance between previousLocation and incomingLocation
    // in distance representation, get the first index where the value is greater than the distance of previousLocation from incomingLocation
    // recreate the coordinates where the start of the new coordinates is the index we get from the previous step
    // insert the incoming location to the start of the new coordinates
    // set the new coordinates to the state
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
 * @property {Coordinates} [first]
 * @property {Coordinates} [last]
 */
