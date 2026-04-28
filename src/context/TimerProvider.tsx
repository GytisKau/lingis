import { useState, useEffect } from 'react';
import { TimerContext, TimerMode } from './TimerContext';

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<TimerMode>('study');
  const [time, setTime] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTime((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const start = () => setRunning(true);
  const pause = () => setRunning(false);

  const switchToStudy = () => {
    setMode('study');
    setTime(25 * 60);
    setRunning(true);
  };

  const switchToBreak = () => {
    setMode('break');
    setTime(5 * 60);
    setRunning(true);
  };

  return (
    <TimerContext.Provider
      value={{
        time,
        running,
        mode,
        start,
        pause,
        switchToStudy,
        switchToBreak,
        setTime
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};