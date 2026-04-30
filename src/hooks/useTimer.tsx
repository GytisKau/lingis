import { useState, useEffect } from 'react';

function useTimer(initialSeconds: number, mode: 'study' | 'break', onFinish: () => void) {
  const [time, setTime] = useState(initialSeconds);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setRunning(false);
          onFinish();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running, mode]);

  return {
    time,
    running,
    setTime,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    setRunning
  };
}