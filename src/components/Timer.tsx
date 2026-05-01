import { useEffect, useState } from 'react';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { TimerAlerts } from './TimerAlerts';
import { useTimerContext } from '../context/TimerContext';
import { eventBus } from '../utils/eventBus';

interface TimerProps {
  onSwitchToBreak: () => void;
  onSwitchToStudy: () => void;
  onFinishStudying: () => void;
  onGoStudy: () => void;
}

export function Timer(props: TimerProps) {
  const [showStudyAlert, setShowStudyAlert] = useState(false);
  const [showBreakAlert, setShowBreakAlert] = useState(false);
  
  const {time, running, mode, start, pause, setTime} = useTimerContext()

  useEffect(() => {
    const handleFinish = (data: { mode: string }) => {
      if (data.mode === 'study') {
        setShowStudyAlert(true);
      } else {
        setShowBreakAlert(true);
      }
    };

    eventBus.on('TimerFinished', handleFinish);
    return () => eventBus.off('TimerFinished', handleFinish);
  });

  return (
    <>
      <TimerDisplay time={time} />

      <TimerControls
        running={running}
        mode={mode}
        onStart={start}
        onPause={pause}
        onSwitch={ mode === 'study' ? props.onSwitchToBreak : props.onSwitchToStudy }
        onFinish={props.onFinishStudying}
      />

      <TimerAlerts
        showStudyAlert={showStudyAlert}
        showBreakAlert={showBreakAlert}
        onCloseStudy={() => setShowStudyAlert(false)}
        onCloseBreak={() => setShowBreakAlert(false)}
        onExtendStudy={(minutes: number) => {
          setTime(minutes * 60);
          start()
        }}
        onExtendBreak={(minutes: number) => {
          setTime(minutes * 60);
          start()
        }}
        onGoBreak={props.onSwitchToBreak}
        onGoStudy={props.onGoStudy}
      />
    </>
  );
}