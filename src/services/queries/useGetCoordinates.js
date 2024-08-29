import { useQuery } from "@tanstack/react-query";
import getCoordinatesByPlaceId from "../api/getCoordinatesByPlaceId";

/**
 *
 * @param {string} input
 */
export default function useGetCoordinates(id, lat = 0, lng = 0) {
  return useQuery({
    queryKey: ["getCoordinatesByPlaceId", id],
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

      if (res.data?.status !== "OK")
        return {
          latitude: 0,
          longitude: 0,
        };

      return {
        latitude: res.data?.result?.geometry?.location?.lat,
        longitude: res.data?.result?.geometry?.location?.lng,
      };
    },
    staleTime: 1000 * 60 * 30,
  });
}
