import { IonBackButton, IonButtons, IonHeader, IonText, IonTitle, IonToolbar } from "@ionic/react";
import { useTimerContext } from "../context/TimerContext";

export const Header = ({title, backButton, noTimer}: {title: string, backButton?: boolean, noTimer?: boolean}) => {
  const { time, running } = useTimerContext()

  const minutes = String(Math.floor(time / 60)).padStart(2, '0');
  const seconds = String(time % 60).padStart(2, '0');

  return (
    <IonHeader>
      <IonToolbar>
        {backButton && (
          <IonButtons slot="start">
            <IonBackButton/>
          </IonButtons>
        )}
        <IonTitle>{title}</IonTitle>
        {running  && !noTimer && (
            <IonText slot="end" className="ion-padding-end">
              {minutes}:{seconds}
            </IonText>
        )}
      </IonToolbar>
    </IonHeader>
  )
}