import { useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonModal,
  IonButtons,
  IonItem,
  IonText
} from '@ionic/react';
import { db } from '../db/db';
import './Tab3.css';
import { useLiveQuery } from 'dexie-react-hooks';

const Tab3: React.FC = () => {
  const modal = useRef<HTMLIonModalElement>(null);

  const assignments =
    useLiveQuery(async () => {
      const assignments = await db.assignments.toArray();
      return assignments.map((ass) => ({ title: ass.title, id: ass.id }));
    }, []) ?? [];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 3</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="tab3-page">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 3</IonTitle>
          </IonToolbar>
        </IonHeader>

        {assignments.length === 0 ? (
          <IonText className="empty-text">No assignments added yet</IonText>
        ) : (
          <>
            <IonButton
              id="assignment-picker"
              className="start-session-button"
            >
              Start session
            </IonButton>

            <IonModal
              ref={modal}
              trigger="assignment-picker"
              className="assignment-modal"
            >
              <IonHeader>
                <IonToolbar className="assignment-toolbar">
                  <IonTitle className="assignment-title">
                    <div>Pick the assignment</div>
                  </IonTitle>

                  <IonButtons slot="end">
                    <IonButton
                      fill="clear"
                      className="close-x"
                      onClick={() => modal.current?.dismiss()}
                    >
                      ✕
                    </IonButton>
                  </IonButtons>
                </IonToolbar>
              </IonHeader>

              <IonContent className="ion-padding assignment-content">
                <div className="assignment-list">
                  {assignments.map((ass, i) => (
                    <IonItem key={i} lines="none" className="assignment-item">
                      <IonButton
                        routerLink={`/tabs/tab3/viewsession/${ass.id}`}
                        size="large"
                        fill="clear"
                        className="assignment-button"
                        onClick={() => modal.current?.dismiss()}
                      >
                        {ass.title}
                      </IonButton>
                    </IonItem>
                  ))}
                </div>
              </IonContent>
            </IonModal>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tab3;