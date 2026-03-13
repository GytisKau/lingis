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
    <ul>
      {assignments?.map((assignment) => (
          <IonItem key={assignment.id}>
          <IonButton routerLink={`/viewassignment/${assignment.id}`} size="large" fill="clear">
            {assignment.title}
          </IonButton>
          <IonRippleEffect />
        </IonItem>
      ))}
    </ul>
  )
}

export default AssignmentList;
