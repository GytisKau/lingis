import { useRef } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, 
  IonModal, IonButtons, IonItem, IonRippleEffect, IonText} from '@ionic/react';
import { db } from '../db/db';
import './Tab3.css';
import { useLiveQuery } from 'dexie-react-hooks';

const Tab3: React.FC = () => {
  const modal = useRef<HTMLIonModalElement>(null);
  const assignments = useLiveQuery( async () => {
      const assignments = await db.assignments.toArray()
      return assignments.map((ass) => ({title: ass.title, id: ass.id}))
    }, []) ?? []

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
        {assignments.length == 0 ? (
          <>
          <IonText> No assignments added yet </IonText>
          </>
        ) : (
          <>
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
            {assignments?.map((ass, i) => (
              <IonItem key={i}>
                <IonButton routerLink={`/tabs/tab3/viewsession/${ass.id}`} size="large" fill="clear" onClick={() => modal.current?.dismiss()}>
                  {ass.title}
                </IonButton>
                <IonRippleEffect />
              </IonItem>
            ))}
          </IonContent>
        </IonModal>
        </>
        )}
       
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
