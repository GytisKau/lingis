import { IonBackButton, IonButtons, IonHeader, IonText, IonTitle, IonToolbar } from "@ionic/react";
import { useTimerContext } from "../context/TimerContext";

export const Header = ({title, backButton}: {title: string, backButton?: boolean}) => {
  const { time, running } = useTimerContext()

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <IonHeader>
      <IonToolbar>
        {backButton && (
          <IonButtons slot="start">
            <IonBackButton/>
          </IonButtons>
        )}
        <IonTitle>{title}</IonTitle>
        {running && (
          <IonText slot="end" className="ion-padding-end">
            {String(minutes).padStart(2, '0')}:
            {String(seconds).padStart(2, '0')}
          </IonText>
        )}
      </IonToolbar>
    </IonHeader>
  )
}