import { createContext, useContext } from 'react';

export type TimerMode = 'study' | 'break';

interface TimerContextType {
  time: number;
  running: boolean;
  mode: TimerMode;

  start: () => void;
  pause: () => void;
  switchToStudy: () => void;
  switchToBreak: () => void;
  setTime: (t: number) => void;
}

export const TimerContext = createContext<TimerContextType | null>(null);

export const useTimerContext = () => {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimerContext must be used inside TimerProvider');
  return ctx;
};