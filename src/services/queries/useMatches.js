import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-expo";
import getMatches from "../api/getMatches";
import getQueryClient from ".";
import storage from "../storage";
import log from "../log";

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

export function invalidateUseMatches() {
  const client = getQueryClient();
  const userId = storage.getString("user.id");

  log.debug("Invalidating matches query", { userId, client });

  if (client && userId) {
    client.invalidateQueries(["getMatches", userId]);
  }
}
