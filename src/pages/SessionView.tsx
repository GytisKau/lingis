import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonText, IonModal, IonButtons, IonItem, IonRippleEffect } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './SessionView.css';
import { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { useRef, useState } from 'react';

const Assignments: React.FC = () => {
  const modal = useRef<HTMLIonModalElement>(null);


  const confirm = () => {
    modal.current?.dismiss({}, 'confirm'); // Set first argument to edited draft events
  }

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
        <IonButton id ="mental-test" color="coral" className="session-button">Mental test</IonButton>
        <IonButton routerLink='/session' id ="edit-session" color="coral" className="session-button">Edit session</IonButton>
        <IonButton routerLink='/session' id ="start-session" color="coral" className="session-button">Start session</IonButton>
         <IonModal ref={modal} trigger="mental-test" onWillDismiss={(event) => onWillDismiss(event)}>
            <IonHeader>
              <IonToolbar>
                <IonButtons slot="start">
                  <IonButton onClick={() => modal.current?.dismiss()}>Cancel</IonButton>
                  </IonButtons>
                  <IonButtons slot="end">
                  <IonButton strong={true} onClick={() => confirm()}>
                    Confirm
                  </IonButton>
                </IonButtons>
                <IonTitle>Questionnaire</IonTitle>
                <IonButtons slot="end">

                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              <IonText className="centered-text">*Čia bus pateikti klausimai apie savijautą, pasiruošimą ir pan.*</IonText>
            </IonContent>
          </IonModal>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Assignments;
