import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonFab,
  IonFabButton,
  IonIcon} from '@ionic/react';
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
      <IonContent  fullscreen className="tab4-page">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Assignments</IonTitle>
          </IonToolbar>
        </IonHeader>

        <AssignmentList />

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton id="open-modal">
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>

        <AddAssignmentModal trigger="open-modal" />

      </IonContent>
    </IonPage>
  );
};

export default Tab4;
