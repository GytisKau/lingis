import { useState } from "react"
import { db } from "../db/db"
import { IonButton, IonItem, IonInput, IonSegment, IonSegmentButton, IonLabel  } from "@ionic/react"

function formatDateTimeLocal(date: Date) {
  const d = new Date(date) // copy
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export function AddAssignmentForm() {

  const [title, setTitle] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [timeEst, setTimeEst] = useState<number>(0)
  const [testType, setTestType] = useState<number>(0)
  const [status, setStatus] = useState("")

  async function addAssignment() {
    if (!title || timeEst <= 0 || !date) {
    setStatus("Please fill all required fields")
    return
  }
    try {
      // Add the new assignment!
      const id = await db.assignments.add({
        title: title,
        date: date,
        est_hours: timeEst,
        assignment_type: testType,
        fk_user: 1, // TODO: replace with actual user id when auth is implemented
        sessions: [],
        tasks: []
      })

      setStatus(`Assignment ${title} successfully added. Got id ${id}`)
      setTitle("")
      setDate(new Date())
      setTimeEst(0)
      setTestType(0)

    } catch (error) {
      setStatus(`Failed to add ${title}: ${error}`)
    }
  }

  return (
  <>
    <p>{status}</p>

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
        value={formatDateTimeLocal(date).slice(0,10)}
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
        onIonChange={(e) => setTimeEst(Number(e.detail.value)*60)}
      />
    </IonItem>

    <IonItem>
      <IonLabel>Test type</IonLabel>
      <IonSegment
        value={testType}
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

    <IonButton expand="block" onClick={addAssignment}>
      Add
    </IonButton>
  </>
)
}
