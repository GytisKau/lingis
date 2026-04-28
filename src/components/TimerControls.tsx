import { IonButton } from '@ionic/react';

export const TimerControls = ({
  running,
  mode,
  onStart,
  onPause,
  onSwitch,
  onFinish
}: any) => {
  return (
    <div className="timer-buttons">
      {!running ? (
        <IonButton fill="outline" onClick={onStart}>Start</IonButton>
      ) : (
        <IonButton fill="outline" onClick={onPause}>Pause</IonButton>
      )}

      <IonButton fill="outline" onClick={onSwitch}>
        {mode === 'study' ? 'Go to break' : 'Go to study'}
      </IonButton>

      <IonButton fill="outline" onClick={onFinish}>
        Finish study
      </IonButton>
    </div>
  );
};