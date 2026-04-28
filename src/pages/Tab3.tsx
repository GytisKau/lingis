import { useEffect, useRef } from 'react';
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
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import './Tab3.css';
import TipsCarousel from '../components/TipsCarousel';
import DailyLearningTip from '../components/DailyLearningTip';
import { useLocation } from 'react-router';

const Tab3: React.FC = () => {
  const modal = useRef<HTMLIonModalElement>(null);
  const location = useLocation<{ openAssignmentPicker?: boolean }>();

  const assignments =
  useLiveQuery(async () => {
    const allAssignments = await db.assignments.toArray();
    const today = new Date();

    return allAssignments
      .filter((ass) => {
        const startDate = new Date(ass.start_date);
        const deadline = new Date(ass.date);

        return (
          !ass.is_done &&
          today >= startDate &&
          today <= deadline
        );
      })
      .map((ass) => ({
        title: ass.title,
        id: ass.id
      }));
  }, []) ?? [];

  const username =
    useLiveQuery(async () => {
      const users = await db.users.toArray();
      return users[0]?.username?.trim() || '';
    }, []) ?? '';

  useEffect(() => {
    if (location.state?.openAssignmentPicker && assignments.length > 0) {
      setTimeout(() => {
        modal.current?.present();
        window.history.replaceState({}, document.title);
      }, 100);
    }
  }, [location.state, assignments.length]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{username ? `Hello, ${username}` : 'Hello'}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="tab3-page">
        <DailyLearningTip />

        {assignments.length === 0 ? (
          <>
            <IonText className="empty-text">No assignments added yet</IonText>
            <TipsCarousel />
          </>
        ) : (
          <>
            <TipsCarousel />

            <div className="start-session-wrap">
              <IonButton
                id="assignment-picker"
                className="start-session-button"
              >
                Start session
              </IonButton>
            </div>

            <IonModal
              ref={modal}
              trigger="assignment-picker"
              className="assignment-modal"
            >
              <IonHeader>
                <IonToolbar className="assignment-toolbar">
                  <IonTitle className="assignment-title">
                    Pick the assignment
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
                  {assignments.map((ass) => (
                    <IonItem
                      key={ass.id}
                      lines="none"
                      className="assignment-item"
                    >
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