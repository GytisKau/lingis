import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonText, IonModal, IonButtons, IonItem, IonRippleEffect } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './SessionView.css';
import { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { useRef, useState } from 'react';

const Assignments: React.FC = () => {
  const modal = useRef<HTMLIonModalElement>(null);

  function onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    // Lia lia lia
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>View Session</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Assignments Form</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonText className="centered-text">*Informacija apie egzaminą*</IonText>
         <div className="session-buttons">
        <IonButton routerLink='/session' id ="mental-test" color="coral" className="session-button">Mental test</IonButton>
        <IonButton routerLink='/session' id ="edit-session" color="coral" className="session-button">Edit session</IonButton>
        <IonButton routerLink='/session' id ="start-session" color="coral" className="session-button">Start session</IonButton>
        <IonButton id ="assignment-picker" color="coral" className="start-session-button">Start session</IonButton>
          <IonModal ref={modal} trigger="assignment-picker" onWillDismiss={(event) => onWillDismiss(event)}>
            <IonHeader>
              <IonToolbar>
                <IonButtons slot="start">
                  <IonButton onClick={() => modal.current?.dismiss()}>Cancel</IonButton>
                </IonButtons>
                <IonTitle>Pick the assignment</IonTitle>
                <IonButtons slot="end">

                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              {[...Array(5)].map((_, i) => (
              <IonItem key={i}>
                <IonButton routerLink="/viewsession" size="large" fill="clear" onClick={() => modal.current?.dismiss()}>
                  Egzaminas {i}
                </IonButton>
                <IonRippleEffect />
              </IonItem>
            ))}
            </IonContent>
          </IonModal>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Assignments;
