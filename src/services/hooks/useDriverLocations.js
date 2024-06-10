import { useEffect, useState } from "react";
import log from "../log";

/**
 *
 * @param {string} driver_id
 * @returns {Return}
 */
export default function useWatchDriverLocation(driver_id) {
  const [coordinates] = useState();

  useEffect(() => handleStop, []);

  function handleStart() {
    log.debug("Starting to watch for driver location", { driver_id });
  }
  function handleStop() {}

  return {
    handleStart,
    handleStop,
    coordinates,
  };
}

/**
 * @typedef {Object} Return
 * @property {Function} handleStart
 * @property {Function} handleStop
 * @property {Coordinates} [coordinates]
 *
 * @typedef {Object} Coordinates
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} [heading]
 */
