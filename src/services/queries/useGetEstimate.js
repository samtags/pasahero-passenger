import { useQuery } from "@tanstack/react-query";
import getEstimate from "../api/getEstimate";

export default function useGetEstimate(service, origin, destination) {
  return useQuery({
    queryKey: ["getEstimate", { service, origin, destination }],
    queryFn: async () => {
      if (!service || !origin || !destination) return null;

      const estimate = await getEstimate({ service, origin, destination });
      return estimate;
    },
    enabled: !!service && !!origin && !!destination,
  });
}
