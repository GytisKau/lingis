import { useState, useEffect } from 'react';
import { TimerContext, TimerMode } from './TimerContext';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { getBreakMinutesFromStudy } from '../data/breakSuggestions';
import { eventBus } from '../utils/eventBus';

const LONG_BREAK_AFTER_MINUTES = 90;
const MAX_GAP_BETWEEN_SESSIONS_MINUTES = 30;

async function getConsecutiveStudyMinutes() {
  const sessions = await db.sessions.toArray();

  const sortedSessions = sessions.sort(
    (a, b) => new Date(b.end).getTime() - new Date(a.end).getTime()
  );

  let totalMinutes = 0;
  let newerSessionStart: Date | null = null;

  for (const session of sortedSessions) {
    const currentStart = new Date(session.start);
    const currentEnd = new Date(session.end);

    if (newerSessionStart) {
      const breakGapMinutes =
        (newerSessionStart.getTime() - currentEnd.getTime()) / 1000 / 60;

      if (breakGapMinutes >= MAX_GAP_BETWEEN_SESSIONS_MINUTES) {
        break;
      }
    }

    const sessionMinutes =
      (currentEnd.getTime() - currentStart.getTime()) / 1000 / 60;

    totalMinutes += sessionMinutes;
    newerSessionStart = currentStart;
  }

  return totalMinutes;
};

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<TimerMode>('study');
  const [time, setTime] = useState(30 * 60);
  const [studyTime, setStudyTime] = useState(30 * 60);
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<Date>();

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
    setStartedAt(new Date())
  };

  const checkLongerBreak = async () => {
    return await getConsecutiveStudyMinutes() >= LONG_BREAK_AFTER_MINUTES;;
  };

  const switchToBreak = async () => {
    setMode('break');
    setTime((await checkLongerBreak() ? 30 : getBreakMinutesFromStudy(studyTime)) * 60);
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
        startedAt,
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