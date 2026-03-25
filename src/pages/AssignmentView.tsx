import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonIcon,
  IonProgressBar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonChip,
  useIonViewWillLeave
} from '@ionic/react';

import { db } from '../db/db';
import { RouteComponentProps } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import TaskList from '../components/TaskList';
import './AssignmentView.css';
import { closeOutline, pencil } from 'ionicons/icons';
import { useState } from 'react';
import EditAssignmentForm from '../forms/EditAssignmentForm';
import { add } from 'ionicons/icons';

interface AssignmentViewProps extends RouteComponentProps<{ id: string }> {}

const AssignmentsView: React.FC<AssignmentViewProps> = ({ match }) => {
  const [isEditing, setIsEditing] = useState(false);

  // ✅ FIX: blur focus when leaving page
  useIonViewWillLeave(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  const id = Number(match.params.id);
  const assignment = useLiveQuery(() => db.assignments.get(id), [id]);

  // Loading state
  if (assignment === undefined) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Assignment View</IonTitle>
          </IonToolbar>
          <IonProgressBar type="indeterminate" />
        </IonHeader>
        <IonContent fullscreen className="assignment-view-page ion-padding">
          {/* Optional placeholder */}
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Assignment View</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="assignment-view-page ion-padding">
        {isEditing ? (
          <EditAssignmentForm
            assignmentId={id}
            onSaved={() => setIsEditing(false)}
          />
        ) : (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{assignment.title}</IonCardTitle>
              <IonCardSubtitle className="ion-justify-content-between">
                {new Date(assignment.date).toLocaleDateString()}{' '}
                <IonChip color="primary" className="ion-text-end">
                  {assignment.est_hours / 60}h
                </IonChip>
              </IonCardSubtitle>
            </IonCardHeader>
          </IonCard>
        )}

        <TaskList assignmentId={id} />

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton id="open-modal" className="outline-purple">
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default AssignmentsView;