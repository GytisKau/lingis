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
  /** Study start time */
  startedAt: Date | undefined;

  /** Active assignment id, used for Continue session */
  activeAssignmentId: number | null;

  /** Starts or unpauses the timer */
  start: () => void;
  /** Pauses the timer */
  pause: () => void;
  /** Switches the mode to study, starts the timer from studyTime and sets startedAt to now*/
  switchToStudy: (assignmentId?: number) => void;
  /** Switches the mode to break and starts the timer from breakTime */
  switchToBreak: () => void;
  /**
   * Sets the studyTime and breakTime
   * @param t Study time in seconds
   */
  setStudyTime: (t: number) => void;
  /**
   * Sets the Timer time
   * @param t Study time in seconds
   */
  setTime: (t: number) => void;
  /**
   * Extends the timer and starts it
   * @param seconds Time in seconds
   */
  extendTimer: (seconds: number) => void;

  /** Clears active session info after finishing */
  clearActiveSession: () => void;
}

export const TimerContext = createContext<TimerContextType | null>(null);

export const useTimerContext = () => {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimerContext must be used inside TimerProvider');
  return ctx;
};