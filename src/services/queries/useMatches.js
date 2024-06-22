import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-expo";
import getMatches from "../api/getMatches";

/**
 *
 * @param {string} input
 */
export default function useMatches() {
  const user = useUser();

  return useQuery({
    queryKey: ["getMatches", user?.user?.id],
    queryFn: async () => {
      if (!user?.user?.id) return [];

      const matches = await getMatches(user?.user?.id);
      return matches;
    },
  });
}
