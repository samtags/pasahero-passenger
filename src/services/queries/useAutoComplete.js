import { useQuery } from "@tanstack/react-query";
import autoComplete from "../api/autoComplete";

/**
 *
 * @param {string} input
 */
export default function useAutoComplete(input) {
  return useQuery({
    queryKey: ["autoComplete", input],
    queryFn: async () => {
      if (!input) return [];

      const res = await autoComplete(input);
      return res.data.predictions || [];
    },
    staleTime: 1000 * 60 * 30,
  });
}
