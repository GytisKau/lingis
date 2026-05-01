import { useEffect, useRef, useState } from "react";
import { db } from "../db/db";
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonInput,
  IonModal,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { close } from "ionicons/icons";
import { useLiveQuery } from "dexie-react-hooks";

function formatDateTimeLocal(date: Date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

interface AddAssignmentModalProps {
  trigger: string;
}

type AssignmentTypeNames = {
  0: string;
  1: string;
  2: string;
};

const ASSIGNMENT_TYPE_NAMES_KEY = "assignmentTypeNames";

const defaultAssignmentTypeNames: AssignmentTypeNames = {
  0: "Exam",
  1: "Lab",
  2: "Other",
};

const getAssignmentTypeNames = (): AssignmentTypeNames => {
  try {
    const saved = localStorage.getItem(ASSIGNMENT_TYPE_NAMES_KEY);
    if (!saved) return defaultAssignmentTypeNames;

    return {
      ...defaultAssignmentTypeNames,
      ...JSON.parse(saved),
    };
  } catch {
    return defaultAssignmentTypeNames;
  }
};

const AddAssignmentModal: React.FC<AddAssignmentModalProps> = ({ trigger }) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [timeEst, setTimeEst] = useState<number>(0);
  const [testType, setTestType] = useState<number>(-1);
  const [status, setStatus] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [assignmentTypeNames, setAssignmentTypeNames] =
    useState<AssignmentTypeNames>(getAssignmentTypeNames);

  const subjects = useLiveQuery(() => db.subjects.toArray(), []) ?? [];
  const modal = useRef<HTMLIonModalElement>(null);

  useEffect(() => {
    const refreshTypeNames = () => {
      setAssignmentTypeNames(getAssignmentTypeNames());
    };

    window.addEventListener("assignmentTypeNamesChanged", refreshTypeNames);
    window.addEventListener("storage", refreshTypeNames);

    return () => {
      window.removeEventListener("assignmentTypeNamesChanged", refreshTypeNames);
      window.removeEventListener("storage", refreshTypeNames);
    };
  }, []);

  function clearValues() {
    setStatus("");
    setTitle("");
    setDueDate(new Date());
    setStartDate(new Date());
    setTimeEst(0);
    setTestType(-1);
    setSelectedSubjectId(null);
  }

  async function addAssignment() {
    if (!title.trim() || timeEst <= 0 || !dueDate) {
      setStatus("Please add a title and time estimate.");
      return false;
    }

    try {
      await db.assignments.add({
        title: title.trim(),
        date: dueDate,
        is_done: false,
        start_date: startDate,
        est_hours: timeEst * 60,
        assignment_type: testType,
        fk_subject: selectedSubjectId,
      });

      modal.current?.dismiss();
    } catch (error) {
      setStatus(`Failed to add ${title}: ${error}`);
    }
  }

  const subjectChoices = [
    { id: null as number | null, name: "No module", color: "#e6d8ff" },
    ...subjects.map((subject) => ({
      id: subject.id ?? null,
      name: subject.name,
      color: subject.color,
    })),
  ];

  const typeChoices = [
    { value: -1, label: "No type" },
    { value: 0, label: assignmentTypeNames[0] },
    { value: 1, label: assignmentTypeNames[1] },
    { value: 2, label: assignmentTypeNames[2] },
  ];

  return (
    <IonModal
      ref={modal}
      trigger={trigger}
      onDidDismiss={clearValues}
      className="assignment-form-modal"
    >
      <IonHeader className="assignment-form-header">
        <IonToolbar className="assignment-form-toolbar">
          <h2 className="assignment-form-title">Add assignment</h2>

          <IonButtons slot="end">
            <IonButton
              fill="clear"
              className="assignment-form-close"
              onClick={() => modal.current?.dismiss()}
            >
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <div className="assignment-form-content">
        {status && (
          <IonText color="danger" className="assignment-form-status">
            {status}
          </IonText>
        )}

        <div className="assignment-form-group">
          <label>Title</label>
          <IonInput
            className="assignment-form-input title-input"
            value={title}
            placeholder="Assignment title"
            autocapitalize="off"
            onIonInput={(e) => setTitle(e.detail.value ?? "")}
          />
        </div>

        <div className="assignment-form-grid">
          <div className="assignment-form-group">
            <label>Due date</label>
            <IonInput
              className="assignment-form-input"
              type="date"
              value={formatDateTimeLocal(dueDate).slice(0, 10)}
              onIonChange={(e) => setDueDate(new Date(e.detail.value!))}
            />
          </div>

          <div className="assignment-form-group">
            <label>Study from</label>
            <IonInput
              className="assignment-form-input"
              type="date"
              value={formatDateTimeLocal(startDate).slice(0, 10)}
              onIonChange={(e) => setStartDate(new Date(e.detail.value!))}
            />
          </div>
        </div>

        <div className="assignment-form-group">
          <label>Time estimate hours</label>
          <IonInput
            className="assignment-form-input"
            type="number"
            placeholder="Example: 2"
            value={timeEst}
            onIonInput={(e) => setTimeEst(Number(e.detail.value ?? 0))}
          />
        </div>

        <div className="assignment-form-group">
          <label>Module</label>
          <div className="assignment-choice-grid">
            {subjectChoices.map((subject) => (
              <button
                key={subject.id ?? "none"}
                type="button"
                className={`assignment-choice-button ${
                  selectedSubjectId === subject.id ? "active" : ""
                }`}
                onClick={() => setSelectedSubjectId(subject.id)}
              >
                <span
                  className="assignment-choice-dot"
                  style={{ background: subject.color }}
                />
                {subject.name}
              </button>
            ))}
          </div>
        </div>

        <div className="assignment-form-group">
          <label>Type</label>
          <div className="assignment-choice-grid">
            {typeChoices.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`assignment-choice-button ${
                  testType === option.value ? "active" : ""
                }`}
                onClick={() => setTestType(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="assignment-form-actions">
          <IonButton
            expand="block"
            disabled={!title.trim() || timeEst <= 0}
            onClick={addAssignment}
            className="assignment-form-primary"
          >
            Add assignment
          </IonButton>

          <IonButton
            expand="block"
            fill="outline"
            onClick={() => modal.current?.dismiss()}
            className="assignment-form-secondary"
          >
            Cancel
          </IonButton>
        </div>
      </div>
    </IonModal>
  );
};

export default AddAssignmentModal;