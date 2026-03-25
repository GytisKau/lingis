import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonModal,
  IonButtons,
  IonItem,
  IonNote,
  IonText,
  IonList,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon
} from "@ionic/react";
import { trash } from "ionicons/icons";
import { db } from "../db/db";
import EditAssignmentForm from "../forms/EditAssignmentForm";

interface AssignmentListProps {}

const AssignmentList: React.FC<AssignmentListProps> = () => {
  const assignments = useLiveQuery(
    async () => await db.assignments.toArray(),
    []
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [currentAssignmentId, setCurrentAssignmentId] = useState<number | null>(null);

  const openEditModal = (id: number) => {
    setCurrentAssignmentId(id);
    setModalOpen(true);
  };

  const deleteAssignment = async (assignmentId: number) => {
    await db.tasks.where("fk_assignment").equals(assignmentId).delete();
    await db.assignments.delete(assignmentId);
  };

  const getTypeClass = (type: number) => {
    if (type === 0) return "exam";
    if (type === 1) return "lab";
    return "other";
  };

  if (!assignments || assignments.length === 0) {
    return <p className="centered-text">No assignments added yet.</p>;
  }

  return (
    <>
      <IonList>
        {assignments.map((assignment) => (
          <IonItemSliding key={assignment.id}>

            {/* MAIN ITEM */}
            <IonItem
              button
              className={`assignment-item ${getTypeClass(assignment.assignment_type)}`}
              routerLink={`/tabs/tab4/viewassignment/${assignment.id}`}
            >
              <IonNote slot="start">
                {new Date(assignment.date).toLocaleDateString()}
              </IonNote>

              <IonText>{assignment.title}</IonText>

              <IonNote slot="end">
                {assignment.est_hours / 60}h
              </IonNote>
            </IonItem>

            {/* SWIPE DELETE */}
            <IonItemOptions side="end">
              <IonItemOption
                color="danger"
                onClick={() => deleteAssignment(assignment.id!)}
                className="trash-outline"
              >
                <IonIcon icon={trash} />
              </IonItemOption>
            </IonItemOptions>

          </IonItemSliding>
        ))}
      </IonList>

      {currentAssignmentId !== null && (
        <IonModal isOpen={modalOpen} onDidDismiss={() => setModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Edit Assignment</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setModalOpen(false)}>
                  Close
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent>
            <EditAssignmentForm
              assignmentId={currentAssignmentId}
              onSaved={() => setModalOpen(false)}
            />
          </IonContent>
        </IonModal>
      )}
    </>
  );
};

export default AssignmentList;