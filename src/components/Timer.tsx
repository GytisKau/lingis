import { useEffect, useState } from 'react';
import { useTimer } from '../hooks/useTimer';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { TimerAlerts } from './TimerAlerts';

interface TimerProps {
  studyMinutes: number;
  breakMinutes: number;
  mode: 'study' | 'break';
  onSwitchToBreak: () => void;
  onSwitchToStudy: () => void;
  onFinish: () => void;
  onGoHome: () => void;
}

export function Timer(props: TimerProps) {
  const studySeconds = props.studyMinutes * 60;
  const breakSeconds = props.breakMinutes * 60;

  const [showStudyAlert, setShowStudyAlert] = useState(false);
  const [showBreakAlert, setShowBreakAlert] = useState(false);

  const timer = useTimer(
    props.mode === 'study' ? studySeconds : breakSeconds,
    props.mode,
    () => {
      if (props.mode === 'study') {
        setShowStudyAlert(true);
        props.onFinish();
      } else {
        setShowBreakAlert(true);
      }
    }
  );

  // 🔑 Svarbiausia dalis – resetinti laiką kai keičiasi mode
  useEffect(() => {
    if (props.mode === 'study') {
      timer.setTime(studySeconds);
    } else {
      timer.setTime(breakSeconds);
    }

    timer.setRunning(true);
  }, [props.mode, studySeconds, breakSeconds]);

  return (
    <>
      <TimerDisplay time={timer.time} />

      <TimerControls
        running={timer.running}
        mode={props.mode}
        onStart={timer.start}
        onPause={timer.pause}
        onSwitch={
          props.mode === 'study'
            ? props.onSwitchToBreak
            : props.onSwitchToStudy
        }
        onFinish={props.onGoHome}
      />

      <TimerAlerts
        showStudyAlert={showStudyAlert}
        showBreakAlert={showBreakAlert}
        onCloseStudy={() => setShowStudyAlert(false)}
        onCloseBreak={() => setShowBreakAlert(false)}
        onExtendStudy={(m: number) => {
          timer.setTime(m * 60);
          setShowStudyAlert(false);
        }}
        onExtendBreak={(m: number) => {
          timer.setTime(m * 60);
          setShowBreakAlert(false);
        }}
        onGoBreak={() => {
          setShowStudyAlert(false);
          props.onSwitchToBreak();
        }}
        onGoHome={props.onGoHome}
      />
    </>
  );
}