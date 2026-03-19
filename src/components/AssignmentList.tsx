import { useLiveQuery } from "dexie-react-hooks"
import { useState } from "react"
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton,
   IonModal, IonButtons, IonItem, IonInput, IonLabel, IonCol,
   IonSegment, IonSegmentButton, IonRippleEffect, IonIcon, IonGrid, 
   IonRow, 
   IonList,
   IonText,
   IonChip,
   IonNote} from '@ionic/react';
import { db } from "../db/db"
import { pencil, trash } from 'ionicons/icons'
import EditAssignmentForm from "../forms/EditAssignmentForm"; // your modal form

interface AssignmentListProps {}

const AssignmentList: React.FC<AssignmentListProps> = () => {
  const assignments = useLiveQuery(
    async () => await db.assignments.toArray(),
    []
  )

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [currentAssignmentId, setCurrentAssignmentId] = useState<number | null>(null)

  const openEditModal = (id: number) => {
    setCurrentAssignmentId(id)
    setModalOpen(true)
  }

  const deleteAssignment = async (assignmentId: number) => {
    // Delete all tasks related to this assignment
    await db.tasks.where("fk_assignment").equals(assignmentId).delete()

    // Delete the assignment itself
    await db.assignments.delete(assignmentId)
  }

  if (assignments == undefined || assignments.length === 0){
    return <p className="centered-text">No assignments added yet.</p>;
  }

  return (
    <>
      <IonList>
        {assignments.map((assignment) => (
          <IonItem key={assignment.id} button={true} routerLink={`/tabs/tab4/viewassignment/${assignment.id}`}>
            <IonNote slot="start">{new Date(assignment.date).toLocaleDateString()}</IonNote>
            <IonText>{assignment.title}</IonText>
            <IonNote slot="end">{assignment.est_hours / 60}h</IonNote>

            {/* <IonCol size="1">
              <IonButton size="small" onClick={() => openEditModal(assignment.id!)}>
                <IonIcon icon={pencil}></IonIcon>
              </IonButton>
            </IonCol> */}

            {/* <IonButton 
              size="small" 
              color="danger" 
              onClick={() => deleteAssignment(assignment.id!)}
            >
              <IonIcon icon={trash}></IonIcon>
            </IonButton> */}
          </IonItem>
        ))}
      </IonList>

      {/* Modal */}
      {currentAssignmentId !== null && (
        <IonModal isOpen={modalOpen} onDidDismiss={() => setModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Edit Assignment</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setModalOpen(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent>
            <EditAssignmentForm assignmentId={currentAssignmentId} />
          </IonContent>
        </IonModal>
      )}
    </>
  )
}

export default AssignmentList