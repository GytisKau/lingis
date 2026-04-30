import { useEffect, useState } from 'react';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { TimerAlerts } from './TimerAlerts';
import { useTimerContext } from '../context/TimerContext';
import { eventBus } from '../utils/eventBus';

interface TimerProps {
  onSwitchToBreak: () => void;
  onSwitchToStudy: () => void;
  onFinish: () => void;
  onGoHome: () => void;
}

export function Timer(props: TimerProps) {
  const [showStudyAlert, setShowStudyAlert] = useState(false);
  const [showBreakAlert, setShowBreakAlert] = useState(false);
  
  const {time, running, mode, start, pause, setStudyTime} = useTimerContext()

  useEffect(() => {
    const handleFinish = (data: { mode: string }) => {
      if (data.mode === 'study') {
        setShowStudyAlert(true);
        props.onFinish();
      } else {
        setShowBreakAlert(true);
      }
    };

    eventBus.on('TimerFinished', handleFinish);
    return () => eventBus.off('TimerFinished', handleFinish);
  }, []);


  return (
    <>
      <TimerDisplay time={time} />

      <TimerControls
        running={running}
        mode={mode}
        onStart={start}
        onPause={pause}
        onSwitch={ mode === 'study' ? props.onSwitchToBreak : props.onSwitchToStudy }
        onFinish={props.onGoHome}
      />

      <TimerAlerts
        showStudyAlert={showStudyAlert}
        showBreakAlert={showBreakAlert}
        onCloseStudy={() => setShowStudyAlert(false)}
        onCloseBreak={() => setShowBreakAlert(false)}
        onExtendStudy={(m: number) => {
          setStudyTime(m * 60);
          setShowStudyAlert(false);
        }}
        onExtendBreak={(m: number) => {
          setStudyTime(m * 60);
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