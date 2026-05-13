import { useState, useEffect, useRef } from 'react';
import { TimerContext, TimerMode } from './TimerContext';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { getBreakMinutesFromStudy } from '../data/breakSuggestions';
import { eventBus } from '../utils/eventBus';

const LONG_BREAK_AFTER_MINUTES = 90;
const MAX_GAP_BETWEEN_SESSIONS_MINUTES = 30;
const TIMER_SPEED = 1;

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
}

async function checkLongerBreak(){
  return (await getConsecutiveStudyMinutes()) >= LONG_BREAK_AFTER_MINUTES;
};

async function calculateBreakTime(studyTime: number) {
  console.log("Calculating break time for study time (seconds):", studyTime);
  const needLongerBreak = await checkLongerBreak();
  //console.log("Need longer break?", needLongerBreak);
  if (!needLongerBreak) {
    const breakMinutes = getBreakMinutesFromStudy(studyTime/60);
    //console.log(`Recommended break time based on study time: ${breakMinutes} minutes`);
    return breakMinutes;
  } 
  //console.log(`Study time exceeded ${LONG_BREAK_AFTER_MINUTES} minutes. Recommending long break of 30 minutes.`);
  return needLongerBreak ? 30 : getBreakMinutesFromStudy(studyTime/60);
}

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<TimerMode>('study');
  const [time, setTime] = useState(30 * 60);
  const [studyTime, setStudyTime] = useState(30 * 60);
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<Date>();

  const endAtRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const breakTime = useRef(getBreakMinutesFromStudy(studyTime/60) * 60);

  const users = useLiveQuery(() => db.users.toArray());
  const user = users !== undefined ? users[0] : undefined;
  const preferredMinutes = user?.preffered_session_time;

  useEffect(() => {
    if (!preferredMinutes) return;

    const newStudyTime = preferredMinutes * 60;
    setStudyTime(newStudyTime);
    breakTime.current = getBreakMinutesFromStudy(newStudyTime/60) * 60;

    if (!running && !startedAt && mode === 'study') {
      setTime(newStudyTime);
    }
  }, [preferredMinutes]);

  const emitNotification = (title: string, body: string) => {
    if (document.visibilityState === 'hidden' && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        badge: '/logo.svg',
        icon: '/logo.svg',
        tag: 'Done',
      });
    }
  };

  const finishTimer = () => {
    if (finishedRef.current) return;

    finishedRef.current = true;
    setTime(0);
    setRunning(false);
    endAtRef.current = null;
    document.title = "Lingis"

    if (mode === 'study') {
      eventBus.emit('TimerFinished', { mode: 'study' });
      emitNotification('Study session finished!', 'Extend session?');
    } else {
      eventBus.emit('TimerFinished', { mode: 'break' });
      emitNotification('Break finished!', 'Extend break?');
    }
  };

  const syncTimeWithClock = () => {
    if (!endAtRef.current){
      document.title = "Lingis"
      return;
    }

    const remainingSeconds = Math.max(
      0,
      Math.ceil(((endAtRef.current - Date.now()) / 1000) * TIMER_SPEED)
    );

    setTime(remainingSeconds);

    const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
    const seconds = String(remainingSeconds % 60).padStart(2, '0');

    document.title = running ? `${minutes}:${seconds} - Lingis` : "Lingis";

    if (remainingSeconds <= 0) {
      finishTimer();
    }
  };

  useEffect(() => {
    if (!running) return;

    syncTimeWithClock();

    const interval = window.setInterval(syncTimeWithClock, 1000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncTimeWithClock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [running, mode]);

  const start = () => {
    if (running || time <= 0) return;

    endAtRef.current = Date.now() + (time * 1000) / TIMER_SPEED;
    finishedRef.current = false;
    setRunning(true);

    if (!startedAt) {
      setStartedAt(new Date());
    }
  };

  const pause = () => {
    if (!running || !endAtRef.current) return;

    const remainingSeconds = Math.max(
      0,
      Math.ceil(((endAtRef.current - Date.now()) / 1000) * TIMER_SPEED)
    );

    setTime(remainingSeconds);
    endAtRef.current = null;
    setRunning(false);
  };

  const switchToStudy = () => {
    const duration = studyTime;

    setMode('study');
    setTime(duration);
    setStartedAt(new Date());
    setRunning(true);

    endAtRef.current = Date.now() + (duration * 1000) / TIMER_SPEED;
    finishedRef.current = false;
  };

  const switchToBreak = async () => {
    const breakMinutes = await calculateBreakTime(studyTime);

    const duration = breakMinutes * 60;

    breakTime.current = duration;

    setMode('break');
    setTime(duration);
    setRunning(true);

    endAtRef.current = Date.now() + (duration * 1000) / TIMER_SPEED;
    finishedRef.current = false;
  };

  const extendTimer = (seconds: number) => {
    if (seconds <= 0) return;

    setTime(seconds);
    endAtRef.current = Date.now() + (seconds * 1000) / TIMER_SPEED;
    finishedRef.current = false;
    setRunning(true);
  };

  return (
    <TimerContext.Provider
      value={{
        time,
        studyTime,
        breakTime: breakTime.current,
        running,
        mode,
        startedAt,
        start,
        pause,
        switchToStudy,
        switchToBreak,
        setStudyTime: async (newStudyTime) => {
          setStudyTime(newStudyTime);
          breakTime.current = await calculateBreakTime(newStudyTime) * 60;
        },
        setTime,
        extendTimer
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};