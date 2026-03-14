import { useState, useEffect } from "react"
import { db } from "../db/db"
import { IonButton, IonItem, IonInput, IonSegment, IonSegmentButton, IonLabel } from "@ionic/react"

function formatDateTimeLocal(date: Date) {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

interface EditAssignmentFormProps {
  assignmentId: number
}

export default function EditAssignmentForm({ assignmentId }: EditAssignmentFormProps) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [timeEst, setTimeEst] = useState<number>(0)
  const [testType, setTestType] = useState<number>(0)
  const [status, setStatus] = useState("")

  // Load assignment data on mount
  useEffect(() => {
    const loadAssignment = async () => {
      const assignment = await db.assignments.get(assignmentId)
      if (assignment) {
        setTitle(assignment.title)
        setDate(new Date(assignment.date))
        setTimeEst(assignment.est_hours)
        setTestType(assignment.assignment_type)
      }
    }
    loadAssignment()
  }, [assignmentId])

  async function updateAssignment() {
    if (!title || timeEst <= 0 || !date) {
      setStatus("Please fill all required fields")
      return
    }

    try {
      // Update the existing assignment
      const success = await db.assignments.update(assignmentId, {
        title: title,
        date: date,
        est_hours: timeEst,
        assignment_type: testType
      })

      if (success) {
        setStatus(`Assignment ${title} successfully updated.`)
      } else {
        setStatus(`Failed to update assignment.`)
      }

    } catch (error) {
      setStatus(`Error updating ${title}: ${error}`)
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
          value={timeEst / 60} // convert back to hours for display
          onIonChange={(e) => setTimeEst(Number(e.detail.value) * 60)}
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

      <IonButton expand="block" onClick={updateAssignment}>
        Save Changes
      </IonButton>
    </>
  )
}