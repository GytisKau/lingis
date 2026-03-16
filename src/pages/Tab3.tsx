import { useRef } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, 
  IonModal, IonButtons, IonItem, IonRippleEffect} from '@ionic/react';

import './Tab3.css';

const Tab3: React.FC = () => {
  const modal = useRef<HTMLIonModalElement>(null);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 3</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 3</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonButton id ="assignment-picker" color="coral" className="start-session-button">Start session</IonButton>
        <IonModal ref={modal} trigger="assignment-picker">
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={() => modal.current?.dismiss()}>Cancel</IonButton>
              </IonButtons>
              <IonTitle>Pick the assignment</IonTitle>
              <IonButtons slot="end"></IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {[...Array(5)].map((_, i) => (
              <IonItem key={i}>
                <IonButton routerLink="/tabs/tab3/viewsession" size="large" fill="clear" onClick={() => modal.current?.dismiss()}>
                  Egzaminas {i}
                </IonButton>
                <IonRippleEffect />
              </IonItem>
            ))}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
