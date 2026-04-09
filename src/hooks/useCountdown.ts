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

      const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
      const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
      const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
      // User specifically asked for year:months:days:mins:secs (skipping hours)
      // So minutes will include the hours (max 1439 mins)
      const minutes = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const parts = [
        `${String(years).padStart(2, "0")}y`,
        `${String(months).padStart(2, "0")}M`,
        `${String(days).padStart(2, "0")}d`,
        `${String(minutes).padStart(2, "0")}m`,
        `${String(seconds).padStart(2, "0")}s`
      ];

      setTimeLeft(parts.join(": "));
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return timeLeft;
};