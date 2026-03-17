import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonText, IonModal, 
  IonButtons, IonInput, IonItem, IonRippleEffect, IonLabel, IonSelect, IonSelectOption } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './SessionView.css';
import { db } from '../db/db';
import { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { RouteComponentProps } from 'react-router';

interface AssignmentViewProps extends RouteComponentProps<{ id: string }> {}


const SessionView: React.FC<AssignmentViewProps> = ({match}) => {
  const id = Number(match.params.id);
  const [step, setStep] = useState<'questions' | 'result'>('questions');
  const modal = useRef<HTMLIonModalElement>(null);

  const questions = [
    "Would you like to take longer sessions?",
    "Have you done a lot of mental work in the past few hours?",
    "Have you done a lot of physical work in the past few hours?",
    "Do you feel mentally energised right now?",
    "How well do you feel emotionally?",
    "How well do you feel physically?"
  ];
  
  const assignment = useLiveQuery(() => db.assignments.get(id), [id]);

      
  const [confirmData, setConfirmData] = useState<{ timestamp: string; hour: number } | null>(null);

  const handleConfirm = () => {
    const now = new Date();
    if (step=='result') modal.current?.dismiss()

    const data = {
      timestamp: now.toISOString(),
      hour: now.getHours()
    };

    setConfirmData(data)
  };

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
        <IonText className="centered-text">{assignment?.title}</IonText>
        <div className="session-buttons">
          <IonButton id ="mental-test" color="coral" className="session-button">Mental test</IonButton>
          <IonButton routerLink={`/tabs/tab3/session/${id}`} id ="edit-session" color="coral" className="session-button">Edit session</IonButton>
          <IonButton routerLink={`/tabs/tab3/session/${id}`} id ="start-session" color="coral" className="session-button">Start session</IonButton>
          <IonModal ref={modal} trigger="mental-test"  onDidDismiss={() => setStep('questions')}>
            <IonHeader>
              <IonToolbar>
                <IonButtons slot="start">
                  <IonButton onClick={() => modal.current?.dismiss()}>Cancel</IonButton>
                  </IonButtons>
                  <IonButtons slot="end">
                  <IonButton id="questionnaire-confirm" strong={true} onClick={() => {
                        handleConfirm();
                        setStep('result');
                      }}>
                    Confirm
                  </IonButton>
                </IonButtons>
                <IonTitle>Questionnaire</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              {step === 'questions' ? (
              <>
              {questions.map((q, i) => (
                <IonItem key={i}>
                  <IonLabel>{q}</IonLabel>
                  <IonSelect placeholder="Rate 1–5">
                    {[1,2,3,4,5].map(n => (
                      <IonSelectOption key={n} value={n}>
                        {n}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              ))}
            <IonItem>
              <IonLabel>How many hours did you sleep today?</IonLabel>
              <IonSelect placeholder="Pick 0–13">
                {[0,1,2,3,4,5,6,7,8,9,10,11,12,13].map(n => (
                  <IonSelectOption key={n} value={n}>
                    {n}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            </>
            ) : (
              <IonText className="centered-text">
              {confirmData && <p>Answered at hour: {confirmData.hour}</p>}
              </IonText>
            )}
          </IonContent>
          </IonModal>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SessionView;
