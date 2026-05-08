import { IonButton } from '@ionic/react';

export const TimerControls = ({
  running,
  mode,
  onStart,
  onPause,
  onSwitch,
  onFinish
}: any) => {
  const isPaused = !running;

  return (
    <div className="timer-buttons">
      <IonButton
        fill="outline"
        className={`timer-button ${isPaused ? 'pause-active' : ''}`}
        onClick={running ? onPause : onStart}
      >
        {running ? 'Pause' : 'Continue'}
      </IonButton>

      <IonButton
        fill="outline"
        className="timer-button"
        onClick={onSwitch}
      >
        {mode === 'study' ? 'Go to break' : 'Go to study'}
      </IonButton>

      <IonButton
        fill="outline"
        className="timer-button"
        onClick={onFinish}
      >
        Finish study
      </IonButton>
    </div>
  );
};