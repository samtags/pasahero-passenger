import moment from "moment";
import { useEffect, useState } from "react";

export default function useTimer() {
  const [baseTime] = useState(moment());
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const duration = moment.duration(moment().diff(baseTime));
      setMinutes(duration.minutes());
      setSeconds(duration.seconds());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");

  return {
    text: `${mm}:${ss}`,
    mm,
    ss,
    minutes,
    seconds,
  };
}
