import { IonButtons, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonHeader, IonItem, IonMenuButton, IonNote, IonText, IonTitle, IonToolbar } from "@ionic/react";
import { Assignment } from "../db/db";

interface AssignmentCardProps{
  assignment?: Assignment
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({assignment}) => {
  if (assignment == undefined){
    return (
      <IonText>No Assignment</IonText>
    )
  }

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>
          {assignment?.title}
        </IonCardTitle>
        <IonCardSubtitle className="ion-justify-content-between">
          From: {new Date(assignment.start_date).toLocaleDateString()} Due: {new Date(assignment.date).toLocaleDateString()}
          <IonChip color="primary" className='ion-text-end'>{assignment.est_hours / 60}h</IonChip>
        </IonCardSubtitle>
      </IonCardHeader>
    </IonCard>
  )
}

export default AssignmentCard
