import { useRef, useState } from "react"
import { db } from "../db/db"
import { IonButton, IonInput, IonLabel, IonModal, IonIcon, IonText, IonSelect, IonSelectOption  } from "@ionic/react"
import { close } from "ionicons/icons"
import { useLiveQuery } from "dexie-react-hooks";

function formatDateTimeLocal(date: Date) {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

interface AddAssignmentModal {
  trigger: string;
}

const AddAssignmentModal: React.FC<AddAssignmentModal> = ({ trigger }) => {
  const [title, setTitle] = useState("")
  const [dueDate, setDueDate] = useState<Date>(new Date())
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [timeEst, setTimeEst] = useState<number>(0)
  const [testType, setTestType] = useState<number>(0)
  const [status, setStatus] = useState("")
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const subjects = useLiveQuery(() => db.subjects.toArray(), []) ?? [];

  const modal = useRef<HTMLIonModalElement>(null);

  function confirm() {
    addAssignment()
  }

  function clearValues() {
    setStatus("")
    setTitle("")
    setDueDate(new Date())
    setStartDate(new Date())
    setTimeEst(0)
    setTestType(0)
    setSelectedSubjectId(null);
  }

  async function addAssignment() {
    if (!title || timeEst <= 0 || !dueDate) {
      setStatus("Please fill all required fields")
      return false;
    }

    try {
      // Add the new assignment!
      await db.assignments.add({
        title: title,
        date: dueDate,
        is_done: false,
        start_date: startDate,
        est_hours: timeEst * 60,
        assignment_type: testType,
        fk_subject: selectedSubjectId
      })

      modal.current?.dismiss();
    } catch (error) {
      setStatus(`Failed to add ${title}: ${error}`)
    }
  }

  const getModalColor = () => {
    switch (testType) {
      case 0:
        return '#ffecec'; // Exam - light red
      case 1:
        return '#eef4ff'; // Lab - light blue
      case 2:
        return '#eafaf1'; // Other - light green
      default:
        return 'white';
    }
  };

  return (
    <IonModal ref={modal} trigger={trigger} onDidDismiss={clearValues} className="add-modal" initialBreakpoint={0.75} breakpoints={[0, 0.75, 1]}>
      <div className="ion-padding">
        <h2>Add Assignment</h2>

        <div className="modal-body">
          {status && (
            <IonText color="danger" style={{ marginBottom: '16px', display: 'block' }}>
              {status}
            </IonText>
          )}

          <div className="form-group">
            <label>Title</label>
            <IonInput
              className="form-input title-input"
              value={title}
              placeholder="Assignment title"
              autocapitalize="off"
              onIonChange={(e) => setTitle(e.detail.value!)}
            />
          </div>

          <div className="form-group">
            <label>Due date</label>
            <IonInput
              className="form-input"
              type="date"
              value={formatDateTimeLocal(dueDate).slice(0,10)}
              onIonChange={(e) => setDueDate(new Date(e.detail.value!))}
            />
          </div>

          <div className="form-group">
            <label>From which date would you like to study?</label>
            <IonInput
              className="form-input"
              type="date"
              value={formatDateTimeLocal(startDate).slice(0,10)}
              onIonChange={(e) => setStartDate(new Date(e.detail.value!))}
            />
          </div>

          <div className="form-group">
            <label>Time estimate (hours)</label>
            <IonInput
              className="form-input"
              type="number"
              placeholder="Time estimate (hours)"
              value={timeEst}
              onIonChange={(e) => setTimeEst(Number(e.detail.value))}
            />
          </div>

          <div className="form-group">
          <label>Subject optional</label>

          <IonSelect
            className="form-input"
            interface="popover"
            placeholder="No subject"
            value={selectedSubjectId}
            onIonChange={(e) => {
              const value = e.detail.value;
              setSelectedSubjectId(value === "none" ? null : Number(value));
            }}
          >
            <IonSelectOption value="none">No subject</IonSelectOption>

            {subjects.map((subject) => (
              <IonSelectOption key={subject.id} value={subject.id}>
                {subject.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </div>

          <div className="form-group">
            <label>Test type</label>
            <div className="button-group">
              {[
                { value: 0, label: 'Exam' },
                { value: 1, label: 'Lab' },
                { value: 2, label: 'Other' }
              ].map((option) => (
                <button
                  key={option.value}
                  className={`custom-button ${testType === option.value ? 'active' : ''}`}
                  onClick={() => setTestType(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <IonButton
              expand="block"
              fill="solid"
              disabled={!title || timeEst <= 0}
              onClick={confirm}
              className="add-btn"
              style={{ '--background': '#491B6D' } as React.CSSProperties}
            >
              Add Assignment
            </IonButton>
            <IonButton
              expand="block"
              fill="outline"
              onClick={() => modal.current?.dismiss()}
              className="cancel-btn"
              style={{ '--border-color': '#491B6D', '--color': '#491B6D' } as React.CSSProperties}
            >
              Cancel
            </IonButton>
          </div>
        </div>
      </div>
    </IonModal>
  )
}

export default AddAssignmentModal;