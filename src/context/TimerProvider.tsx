import { useState, useEffect } from 'react';
import { TimerContext, TimerMode } from './TimerContext';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { getBreakMinutesFromStudy } from '../data/breakSuggestions';
import { eventBus } from '../utils/eventBus';

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<TimerMode>('study');
  const [time, setTime] = useState(30 * 60);
  const [studyTime, setStudyTime] = useState(30 * 60);
  const [running, setRunning] = useState(false);

  const users = useLiveQuery(() => db.users.toArray())
  const user = users !== undefined ? users[0] : undefined
  const preferredMinutes = user?.preffered_session_time;

  useEffect(() => {
    if (preferredMinutes)
      setStudyTime(preferredMinutes * 60)
  }, [preferredMinutes])

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTime((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (time === 0 && running) {
      if (mode === 'study') {
        eventBus.emit('TimerFinished', { mode: 'study' });
      } else {
        eventBus.emit('TimerFinished', { mode: 'break' });
      }
      setRunning(false)
    }
  }, [time, running, mode]);

  const start = () => setRunning(true);
  const pause = () => setRunning(false);

  const switchToStudy = () => {
    setMode('study');
    setTime(studyTime);
    setRunning(true);
  };

  const switchToBreak = () => {
    setMode('break');
    setTime(getBreakMinutesFromStudy(studyTime) * 60);
    setRunning(true);
  };

  return (
    <TimerContext.Provider
      value={{
        time,
        studyTime,
        breakTime: getBreakMinutesFromStudy(studyTime) * 60,
        running,
        mode,
        start,
        pause,
        switchToStudy,
        switchToBreak,
        setStudyTime,
        setTime
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};