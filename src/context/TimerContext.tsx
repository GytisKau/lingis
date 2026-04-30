import { createContext, useContext } from 'react';
import { BreakLength } from '../data/breakSuggestions';

export type TimerMode = 'study' | 'break';

interface TimerContextType {
  /** Timer time in seconds */
  time: number;
  /** Study time in seconds */
  studyTime: number;
  /** Break time in seconds */
  breakTime: number;
  /** Is running */
  running: boolean;
  /** Study or Break */
  mode: TimerMode;

  /** Starts or unpauses the timer */
  start: () => void;
  /** Pauses the timer */
  pause: () => void;
  /** Switches the mode to study and starts the timer from studyTime */
  switchToStudy: () => void;
  /** Switches the mode to break and starts the timer from breakTime */
  switchToBreak: () => void;
  /**
   * Sets the studyTime and breakTime
   * @param t Study time in seconds
   */
  setStudyTime: (t: number) => void;
}

export const TimerContext = createContext<TimerContextType | null>(null);

export const useTimerContext = () => {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimerContext must be used inside TimerProvider');
  return ctx;
};