import { useRef, useState } from "react"
import { db } from "../db/db"
import {
  IonButton,
  IonItem,
  IonInput,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonModal,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonContent,
  IonText
} from "@ionic/react"

function formatDateTimeLocal(date: Date) {
  const d = new Date(date) // copy
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

interface AddAssignmentModal {
  trigger: string;
}

const AddAssignmentModal: React.FC<AddAssignmentModal> = ({ trigger }) => {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [timeEst, setTimeEst] = useState<number>(0)
  const [testType, setTestType] = useState<number>(0)
  const [status, setStatus] = useState("")

  const modal = useRef<HTMLIonModalElement>(null);

  function confirm() {
    addAssignment()
  }

  function clearValues() {
    setStatus("")
    setTitle("")
    setDate(new Date())
    setTimeEst(0)
    setTestType(0)
  }

  async function addAssignment() {
    if (!title || timeEst <= 0 || !date) {
      setStatus("Please fill all required fields")
      return false;
    }

    try {
      await db.assignments.add({
        title: title,
        date: date,
        est_hours: timeEst * 60,
        assignment_type: testType,
        fk_user: 1, // TODO: replace with actual user id when auth is implemented
        sessions: [],
        tasks: []
      })

      modal.current?.dismiss();
    } catch (error) {
      setStatus(`Failed to add ${title}: ${error}`)
    }
  }

  return (
    <IonModal ref={modal} trigger={trigger} onDidDismiss={clearValues}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => modal.current?.dismiss()}>
              Cancel
            </IonButton>
          </IonButtons>

          <IonTitle>Add assignment</IonTitle>

          <IonButtons slot="end">
            <IonButton strong={true} routerLink="/tabs/tab4" onClick={confirm}>
              Add
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {status && (
          <IonText color="danger">{status}</IonText>
        )}

        <IonItem>
          <IonInput
            label="Title"
            labelPlacement="stacked"
            type="text"
            placeholder="Assignment title"
            value={title}
            required
            onIonChange={(e) => setTitle(e.detail.value!)}
          />
        </IonItem>

        <IonItem>
          <IonInput
            label="Due date"
            labelPlacement="stacked"
            type="date"
            required
            value={formatDateTimeLocal(date).slice(0, 10)}
            onIonChange={(e) => setDate(new Date(e.detail.value!))}
          />
        </IonItem>

        <IonItem>
          <IonInput
            label="Time estimate (hours)"
            labelPlacement="stacked"
            type="number"
            placeholder="Time estimate (hours)"
            value={timeEst}
            onIonChange={(e) => setTimeEst(Number(e.detail.value))}
          />
        </IonItem>

        <IonItem>
          <IonLabel>Test type</IonLabel>

          <IonSegment
            value={String(testType)}
            onIonChange={(e) => setTestType(Number(e.detail.value))}
          >
            <IonSegmentButton value="0">
              <IonLabel>Exam</IonLabel>
            </IonSegmentButton>

            <IonSegmentButton value="1">
              <IonLabel>Lab</IonLabel>
            </IonSegmentButton>

            <IonSegmentButton value="2">
              <IonLabel>Other</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonItem>
      </IonContent>
    </IonModal>
  )
}

export default AddAssignmentModal;