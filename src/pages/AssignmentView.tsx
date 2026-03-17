import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonText, IonLabel } from '@ionic/react';
import { db } from '../db/db';
import { RouteComponentProps } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import TaskList from '../components/TaskList';
import './AssignmentView.css';

interface AssignmentViewProps extends RouteComponentProps<{ id: string }> {}

const AssignmentsView: React.FC<AssignmentViewProps> = ({ match }) => {
  const id = Number(match.params.id);
  
  const assignment = useLiveQuery(() => db.assignments.get(id), [id]);
  const db_tasks = useLiveQuery(() => db.tasks.where("fk_assignment").equals(id).toArray(), [id]) ?? [];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar><IonTitle>Assignment view</IonTitle></IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="task-text">
          <p><IonText>{assignment?.title ?? "Loading..."}</IonText></p>
          <IonLabel>
            {assignment
              ? `${new Date(assignment.date).toLocaleDateString()}, estimated time: ${assignment.est_hours / 60} h`
              : "Loading..."}
          </IonLabel>
          <p><IonText> Current tasks: </IonText></p>
          
          {/* Use the new component */}
          <TaskList assignmentId={id} dbTasks={db_tasks} />
          
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AssignmentsView;