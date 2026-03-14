import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton,
   IonModal, IonButtons, IonItem, IonInput, IonLabel, IonSegment, IonSegmentButton, IonRippleEffect } from '@ionic/react';
import { OverlayEventDetail } from '@ionic/core/components';
import ExploreContainer from '../components/ExploreContainer';
import './Tab4.css';
import { useRef, useState } from 'react';
import { AddAssignmentForm } from '../forms/AddAssignmentForm';
import AssignmentList from '../components/AssignmentList';


const Tab4: React.FC = () => {
  const modal = useRef<HTMLIonModalElement>(null);
  const input = useRef<HTMLIonInputElement>(null);

  const [message, setMessage] = useState(
    'This modal example uses triggers to automatically open a modal when the button is clicked.'
  );

  function confirm() {
    modal.current?.dismiss(input.current?.value, 'confirm');
  }

  function onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      setMessage(`Hello, ${event.detail.data}!`);
    }
  }
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Assignments</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Assignments</IonTitle>
          </IonToolbar>
        </IonHeader>

        <AssignmentList />

        <IonButton fill="outline" shape="round" id="open-modal"className="add-assignments-button"> + </IonButton>
        {/* <ExploreContainer name="Assignments" /> */}
        <IonModal ref={modal} trigger="open-modal" onWillDismiss={(event) => onWillDismiss(event)}>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={() => modal.current?.dismiss()}>Cancel</IonButton>
              </IonButtons>
              <IonTitle>Add assignment</IonTitle>
              <IonButtons slot="end">
                <IonButton strong={true} routerLink='/viewassignment'onClick={() => confirm()}>
                  Confirm
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <AddAssignmentForm />
          </IonContent>
        </IonModal>

      </IonContent>
    </IonPage>
  );
};

export default Tab4;
