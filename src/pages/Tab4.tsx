import {
  IonContent,
  IonPage,
  IonFab,
  IonFabButton,
  IonIcon
} from '@ionic/react';
import './Tab4.css';
import AddAssignmentModal from '../forms/AddAssignmentModal';
import AssignmentList from '../components/AssignmentList';
import { add } from 'ionicons/icons';
import { Header } from '../components/Header';

const Tab4: React.FC = () => {
  return (
    <IonPage>
      <Header title="Assignments"/>
      <IonContent className="tab4-page ion-padding" forceOverscroll={false}>
        <AssignmentList />

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton id="open-modal" className="assignment-add-fab">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <AddAssignmentModal trigger="open-modal" />
      </IonContent>
    </IonPage>
  );
};

export default Tab4;