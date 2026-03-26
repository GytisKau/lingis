import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonChip } from "@ionic/react";
import { Assignment } from "../db/db";

interface AssignmentCardProps {
  assignment?: Assignment;
  children?: React.ReactNode; // for edit button/form
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, children }) => {
  if (!assignment) return <p>No Assignment</p>;

  return (
    <IonCard>
      <IonCardHeader>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <IonCardTitle>{assignment.title}</IonCardTitle>
          {children}
        </div>

        <IonCardSubtitle style={{ marginTop: "4px" }}>
          From: {new Date(assignment.start_date).toLocaleDateString()}{" "}
          Due: {new Date(assignment.date).toLocaleDateString()}

          <IonChip color="primary" style={{ marginLeft: "8px" }}>
            {assignment.est_hours / 60}h
          </IonChip>
        </IonCardSubtitle>
      </IonCardHeader>
    </IonCard>
  );
};

export default AssignmentCard;