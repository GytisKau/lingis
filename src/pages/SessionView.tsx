import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonText, IonModal, 
  IonButtons, IonInput, IonItem, IonRippleEffect, IonLabel, IonSelect, IonSelectOption } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './SessionView.css';
import { db } from '../db/db';
import { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { RouteComponentProps } from 'react-router';
import QuestionnaireModal from '../forms/QuestionnaireModal';

interface AssignmentViewProps extends RouteComponentProps<{ id: string }> {}


const SessionView: React.FC<AssignmentViewProps> = ({match}) => {
  const id = Number(match.params.id);

  const assignment = useLiveQuery(() => db.assignments.get(id), [id]);


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

          <QuestionnaireModal trigger={'mental-test'}/>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default SessionView;
