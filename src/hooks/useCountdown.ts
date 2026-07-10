import { useEffect, useState } from "react";

export const useCountdown = (endTime: string) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(endTime).getTime();
      const diff = target - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft("No time left & Not declared yet");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const parts = [
        `${String(hours).padStart(2, "0")}h`,
        `${String(minutes).padStart(2, "0")}m`,
        `${String(seconds).padStart(2, "0")}s`
      ];

      setTimeLeft(parts.join(": "));
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return timeLeft;
};