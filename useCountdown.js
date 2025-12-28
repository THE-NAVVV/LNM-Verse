import { useEffect, useState } from "react";

const useCountdown = (targetMinutes, isEnabled) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isEnabled || targetMinutes == null) {
      setTimeLeft(null);
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const nowSeconds = now.getSeconds();

      let diffMinutes = targetMinutes - nowMinutes;
      let diffSeconds = 60 - nowSeconds;

      if (diffMinutes < 0) {
        setTimeLeft(null);
        setProgress(100);
        clearInterval(interval);
        return;
      }

      if (diffSeconds === 60) diffSeconds = 0;

      const totalSecondsLeft = diffMinutes * 60 + diffSeconds;

      const h = Math.floor(totalSecondsLeft / 3600);
      const m = Math.floor((totalSecondsLeft % 3600) / 60);
      const s = totalSecondsLeft % 60;

      setTimeLeft(
        `${h > 0 ? `${h}h ` : ""}${m}m ${s}s`
      );

      const totalWindow = 6 * 60 * 60; // 6 hours window
      const used = totalWindow - totalSecondsLeft;
      const pct = Math.min(100, Math.max(0, (used / totalWindow) * 100));
      setProgress(pct);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetMinutes, isEnabled]);

  return { timeLeft, progress };
};

export default useCountdown;
