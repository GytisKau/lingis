import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonProgressBar,
  IonButtons,
  IonButton
} from '@ionic/react';

import { db } from '../db/db';
import { RouteComponentProps } from 'react-router';
import { useHistory } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import TaskList from '../components/TaskList';
import './AssignmentView.css';
import { close, pencil, arrowBack } from 'ionicons/icons';
import { useState } from 'react';
import EditAssignmentForm from '../forms/EditAssignmentForm';
import AssignmentCard from '../components/AssignmentCard';

interface AssignmentViewProps extends RouteComponentProps<{ id: string }> {}

const AssignmentsView: React.FC<AssignmentViewProps> = ({ match }) => {
  const [isEditing, setIsEditing] = useState(false);
  const history = useHistory();

  const id = Number(match.params.id);

  const assignment = useLiveQuery(() => db.assignments.get(id), [id]);

  if (assignment === undefined) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={() => history.goBack()}>
                <IonIcon icon={arrowBack} />
              </IonButton>
            </IonButtons>
            <IonTitle>Loading...</IonTitle>
          </IonToolbar>
          <IonProgressBar type="indeterminate" />
        </IonHeader>
        <IonContent fullscreen />
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>{assignment.title}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {/* Assignment Card with edit button inside */}
        <AssignmentCard assignment={assignment}>
          <IonButton
            fill="clear"
            size="small"
            onClick={() => setIsEditing((prev) => !prev)}
          >
            <IonIcon icon={isEditing ? close : pencil} />
          </IonButton>
        </AssignmentCard>

        {/* Show edit form below the card header when editing */}
        {isEditing && (
          <EditAssignmentForm
            assignmentId={id}
            onSaved={() => setIsEditing(false)}
          />
        )}

        {/* Task list for this assignment */}
        <TaskList assignmentId={id} />
      </IonContent>
    </IonPage>
  );
};

export default AssignmentsView;