import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonText } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './SessionView.css';

const Assignments: React.FC = () => {
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
        <IonButton routerLink='/session' id ="assignment-picker" color="coral" className="edit-session-button">Edit session</IonButton>
        <IonButton routerLink='/session' id ="assignment-picker" color="coral" className="start-session-button">Start session</IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Assignments;
