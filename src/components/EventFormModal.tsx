import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonTitle, IonToolbar } from "@ionic/react";
import { useRef } from "react";
import { AddEventForm } from "../forms/AddEventForm";

function EventFormModal() {
  const modal = useRef<HTMLIonModalElement>(null);

  return (
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
        <AddEventForm />
      </IonContent>
    </IonModal>
  );

}

export default EventFormModal;