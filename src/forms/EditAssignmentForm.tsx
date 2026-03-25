import { useState, useEffect } from "react"
import { db } from "../db/db"
import {
  IonButton,
  IonItem,
  IonInput,
  IonCard,
  IonCardContent,
  IonSelect,
  IonSelectOption,
  IonNote
} from "@ionic/react"

function formatDateTimeLocal(date: Date) {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

interface EditAssignmentFormProps {
  assignmentId: number;
  onSaved: () => void;
}

export default function EditAssignmentForm({
  assignmentId,
  onSaved
}: EditAssignmentFormProps) {

  const [title, setTitle] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [timeEst, setTimeEst] = useState<number>(0) // stored in minutes
  const [testType, setTestType] = useState<number>(0)
  const [status, setStatus] = useState("")

  // Load assignment data
  useEffect(() => {
    const loadAssignment = async () => {
      const assignment = await db.assignments.get(assignmentId)
      if (assignment) {
        setTitle(assignment.title)
        setDate(new Date(assignment.date))
        setTimeEst(assignment.est_hours) // already in minutes
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
      const success = await db.assignments.update(assignmentId, {
        title: title,
        date: date,
        est_hours: timeEst,
        assignment_type: testType
      })

      if (success) {
        setStatus(`Assignment "${title}" successfully updated.`)
        onSaved()
      } else {
        setStatus("Failed to update assignment.")
      }

    } catch (error) {
      setStatus(`Error updating ${title}: ${error}`)
    }
  }

  return (
    <>
      {status && (
        <IonNote
          color="danger"
          style={{ display: "block", margin: "10px 0" }}
        >
          {status}
        </IonNote>
      )}

      <IonCard>
        <IonCardContent>

          {/* Title */}
          <IonItem>
            <IonInput
              label="Title"
              labelPlacement="stacked"
              type="text"
              placeholder="Assignment title"
              value={title}
              required
              onIonInput={(e) => setTitle(e.detail.value!)}
            />
          </IonItem>

          {/* Date */}
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

          {/* Time estimate */}
          <IonItem>
            <IonInput
              label="Time estimate (hours)"
              labelPlacement="stacked"
              type="number"
              placeholder="Time estimate (hours)"
              value={timeEst / 60}
              onIonChange={(e) => {
                const val = Number(e.detail.value)
                setTimeEst(isNaN(val) ? 0 : val * 60)
              }}
            />
          </IonItem>

          {/* Type */}
          <IonItem>
            <IonSelect
              label="Test type"
              labelPlacement="stacked"
              value={String(testType)}
              onIonChange={(e) => setTestType(Number(e.detail.value))}
            >
              <IonSelectOption value="0">Exam</IonSelectOption>
              <IonSelectOption value="1">Lab</IonSelectOption>
              <IonSelectOption value="2">Other</IonSelectOption>
            </IonSelect>
          </IonItem>

          {/* Save */}
          <IonButton expand="block" onClick={updateAssignment}>
            Save Changes
          </IonButton>

        </IonCardContent>
      </IonCard>
    </>
  )
}