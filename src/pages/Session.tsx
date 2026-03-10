import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonText, IonButton,
  IonList, IonItem, IonCheckbox
 } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Session.css';

import { useState, useEffect } from "react";

export function Timer() {
  const totalSeconds = 300; // 5 minutes
  const [time, setTime] = useState(totalSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setRunning(false);
          alert("Time is up!");
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div>
      <h1 className="timer">
        {String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </h1>
      <div className="timer-buttons">
        <IonButton fill="outline" className="timer-button" onClick={() => setRunning(true)}>Start</IonButton>
        <IonButton fill="outline" className="timer-button" onClick={() => setRunning(false)}>Stop</IonButton>
        <IonButton fill="outline" className="timer-button" onClick={() => {setRunning(false); setTime(totalSeconds);}}>
          Reset
        </IonButton>
      </div>
    </div>
  );
}

const Assignments: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Session</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <Timer/>
        <IonList>
          <IonItem>
            <IonCheckbox labelPlacement="end">Task 1: Solve 5 problems</IonCheckbox>
          </IonItem>
          <IonItem>
            <IonCheckbox labelPlacement="end">Task 2: Write an essay</IonCheckbox>
          </IonItem>
          <IonItem>
            <IonCheckbox labelPlacement="end">Task 3: Take a quiz</IonCheckbox>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Assignments;
