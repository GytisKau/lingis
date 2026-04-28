import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonIcon
} from '@ionic/react';
import './Tab4.css';
import AddAssignmentModal from '../forms/AddAssignmentModal';
import AssignmentList from '../components/AssignmentList';
import { add } from 'ionicons/icons';

const Tab4: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Assignments</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="tab4-page ion-padding">
        <AssignmentList />

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton id="open-modal">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <AddAssignmentModal trigger="open-modal" />
      </IonContent>
    </IonPage>
  );
};

export default Tab4;