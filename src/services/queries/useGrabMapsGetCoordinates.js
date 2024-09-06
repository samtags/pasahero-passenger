import { useQuery } from "@tanstack/react-query";
import getCoordinatesByPlaceId from "../api/getGrabCoordinatesByPlaceId";

/**
 *
 * @param {string} input
 */
export default function useGrabMapsGetCoordinates(id, lat = 0, lng = 0) {
  return useQuery({
    queryKey: ["getGrabCoordinatesByPlaceId", id],
    queryFn: async () => {
      if (!id)
        return {
          latitude: 0,
          longitude: 0,
        };

      if (lat && lng) {
        return {
          latitude: Number(lat),
          longitude: Number(lng),
        };
      }

      const res = await getCoordinatesByPlaceId(id);

      return {
        latitude: res?.Place?.Geometry?.Point[1],
        longitude: res?.Place?.Geometry?.Point[0],
      };
    },
    staleTime: 1000 * 60 * 30,
  });
}
