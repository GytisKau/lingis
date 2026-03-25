import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFab, IonFabButton, IonIcon, IonProgressBar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonChip } from '@ionic/react';
import { db } from '../db/db';
import { RouteComponentProps } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import TaskList from '../components/TaskList';
import './AssignmentView.css';
import { closeOutline, pencil } from 'ionicons/icons';
import { useState } from 'react';
import EditAssignmentForm from '../forms/EditAssignmentForm';
import AssignmentCard from '../components/AssignmentCard';

interface AssignmentViewProps extends RouteComponentProps<{ id: string }> {}

const AssignmentsView: React.FC<AssignmentViewProps> = ({ match }) => {
  const [isEditing, setIsEditing] = useState(false);
  const id = Number(match.params.id);
  
  const assignment = useLiveQuery(() => db.assignments.get(id), [id]);

  if (assignment == undefined){
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Loading...</IonTitle>
            <IonProgressBar type="indeterminate"></IonProgressBar>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Loading...</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
          </IonContent>                
      </IonContent>
    </IonPage>
    )
  }

  return (
    <IonPage>
      <IonContent fullscreen className='ion-padding'>
        {isEditing ? (
          <EditAssignmentForm assignmentId={id} onSaved={() => setIsEditing(false)}/>
        ) : (
          <AssignmentCard assignment={assignment} />
        )}
        
        <TaskList assignmentId={id}/>

        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton id="open-modal" onClick={() => setIsEditing(before => !before)}>
            <IonIcon icon={isEditing ? closeOutline : pencil}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default AssignmentsView;