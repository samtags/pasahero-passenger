import { useRef, useEffect } from "react";
import getNearbyDrivers from "../api/getNearbyDrivers";
import { useQuery } from "@tanstack/react-query";
import log from "../log";
import { gb } from "../growthbook";

export default function useGetNearbyDrivers(latitude, longitude) {
  const nearbyDriverLocationMapRef = useRef(new Map());

  const { data, refetch } = useQuery({
    queryKey: ["getNearbyDrivers", latitude, longitude],
    queryFn: async () => {
      if (!latitude || !longitude) return [];

      const nearbyDrivers = await getNearbyDrivers(latitude, longitude);
      return nearbyDrivers;
    },
  });

  useEffect(() => {
    const intervalInSeconds = gb.getFeatureValue("passenger-nearby-driver-interval-in-seconds", 20); // prettier-ignore
    log.debug("Checked for nearby drivers.", { latitude, longitude, intervalInSeconds }); // prettier-ignore

    const interval = setInterval(() => {
      log.debug("Checking for nearby drivers.");
      refetch();
    }, 1000 * intervalInSeconds);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const nearbyDriverIds = data?.map((driver) => driver?.user_id) || [];
  data?.forEach((driver) => {
    nearbyDriverLocationMapRef.current.set(driver?.user_id, driver);
  });

  return {
    nearbyDriverIds,
    nearbyDriverLocationMap: nearbyDriverLocationMapRef.current,
  };
}
