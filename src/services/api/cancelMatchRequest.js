import axios from "axios";

export default async function cancelMatchRequest({ id }) {
  try {
    const res = await axios.delete("https://demand-2h6pkmfalq-et.a.run.app", {
      params: {
        id,
      },
    });

    return res?.data;
  } catch (error) {
    return null;
  }
}
