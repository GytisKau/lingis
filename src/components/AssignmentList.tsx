import { useLiveQuery } from "dexie-react-hooks"
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton,
   IonModal, IonButtons, IonItem, IonInput, IonLabel, IonSegment, IonSegmentButton, IonRippleEffect } from '@ionic/react';
import { db } from "../db/db"

interface AssignmentListProps {
}

const AssignmentList: React.FC<AssignmentListProps> = () => {
  const assignments = useLiveQuery(
    async () => await db.assignments.toArray(),
    []
  )

  return (
    <>
      {assignments?.length === 0 && <p className="centered-text">No assignments added yet.</p>}
      <ul>
        {assignments?.map((assignment) => (
          <IonItem key={assignment.id}>
            {/* <IonButton routerLink={`/viewassignment/${assignment.id}`} size="large" fill="clear"> */}
              <IonButton routerLink={`/viewassignment`} size="large" fill="clear">
              {assignment.title}
            </IonButton>
            <IonLabel> {new Date(assignment.date).toLocaleDateString()}, {assignment.est_hours/60} hours </IonLabel>
            <IonRippleEffect />
          </IonItem>
        ))}
      </ul>
    </>
  )
}

export default AssignmentList;
