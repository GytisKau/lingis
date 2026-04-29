import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButtons,
  IonButton,
  IonModal
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>

          <IonTitle>{assignment ? assignment.title : 'Loading...'}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {assignment && (
          <>
            <AssignmentCard assignment={assignment}>
              <button
                type="button"
                className="assignment-card-edit-button"
                onClick={() => setIsEditing(true)}
                aria-label="Edit assignment"
              >
                <IonIcon icon={pencil} />
              </button>
            </AssignmentCard>

            <IonModal
              isOpen={isEditing}
              onDidDismiss={() => setIsEditing(false)}
              className="edit-assignment-modal"
            >
              <div className="edit-assignment-modal-shell">
                <div className="edit-assignment-modal-header">
                  <h2>Edit assignment</h2>

                  <button
                    type="button"
                    className="edit-assignment-close-button"
                    onClick={() => setIsEditing(false)}
                    aria-label="Close edit assignment modal"
                  >
                    <IonIcon icon={close} />
                  </button>
                </div>

                <EditAssignmentForm
                  assignmentId={id}
                  onSaved={() => setIsEditing(false)}
                />
              </div>
            </IonModal>

            <TaskList assignmentId={id} />
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AssignmentsView;