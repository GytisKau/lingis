import { useState, useEffect } from "react";
import { db } from "../db/db";
import {
  IonButton,
  IonItem,
  IonInput,
  IonCardContent,
  IonNote,
} from "@ionic/react";
import { useLiveQuery } from "dexie-react-hooks";

function formatDateTimeLocal(date: Date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
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

interface EditAssignmentFormProps {
  assignmentId: number;
  onSaved: () => void;
}

export default function EditAssignmentForm({
  assignmentId,
  onSaved,
}: EditAssignmentFormProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [timeEst, setTimeEst] = useState<number>(0);
  const [testType, setTestType] = useState<number>(-1);
  const [status, setStatus] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null
  );
  const [assignmentTypeNames, setAssignmentTypeNames] =
    useState<AssignmentTypeNames>(getAssignmentTypeNames);

  const subjects = useLiveQuery(() => db.subjects.toArray(), []) ?? [];

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

  useEffect(() => {
    const loadAssignment = async () => {
      const assignment = await db.assignments.get(assignmentId);

      if (assignment) {
        setTitle(assignment.title);
        setDate(new Date(assignment.date));
        setStartDate(new Date(assignment.start_date));
        setTimeEst(assignment.est_hours);
        setTestType(assignment.assignment_type ?? -1);
        setSelectedSubjectId(assignment.fk_subject ?? null);
      }
    };

    loadAssignment();
  }, [assignmentId]);

  async function updateAssignment() {
    if (!title.trim() || timeEst <= 0 || !date) {
      setStatus("Please add a title and time estimate.");
      return;
    }

    try {
      const success = await db.assignments.update(assignmentId, {
        title: title.trim(),
        date,
        start_date: startDate,
        est_hours: timeEst,
        assignment_type: testType,
        fk_subject: selectedSubjectId,
      });

      if (success) {
        setStatus(`Assignment "${title}" successfully updated.`);
        onSaved();
      } else {
        setStatus("Failed to update assignment.");
      }
    } catch (error) {
      setStatus(`Error updating ${title}: ${error}`);
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
    <IonCardContent className="assignment-edit-content">
      <div className="assignment-edit-panel">
        {status && (
          <IonNote color="danger" className="assignment-edit-status">
            {status}
          </IonNote>
        )}

        <IonItem className="assignment-edit-item" lines="none">
          <IonInput
            className="assignment-edit-input"
            label="Title"
            labelPlacement="stacked"
            type="text"
            placeholder="Assignment title"
            value={title}
            required
            onIonInput={(e) => setTitle(e.detail.value!)}
          />
        </IonItem>

        <IonItem className="assignment-edit-item" lines="none">
          <IonInput
            className="assignment-edit-input"
            label="Due date"
            labelPlacement="stacked"
            type="date"
            required
            value={formatDateTimeLocal(date).slice(0, 10)}
            onIonChange={(e) => setDate(new Date(e.detail.value!))}
          />
        </IonItem>

        <IonItem className="assignment-edit-item" lines="none">
          <IonInput
            className="assignment-edit-input"
            label="Starting date"
            labelPlacement="stacked"
            type="date"
            required
            value={formatDateTimeLocal(startDate).slice(0, 10)}
            onIonChange={(e) => setStartDate(new Date(e.detail.value!))}
          />
        </IonItem>

        <IonItem className="assignment-edit-item" lines="none">
          <IonInput
            className="assignment-edit-input"
            label="Time estimate (hours)"
            labelPlacement="stacked"
            type="number"
            placeholder="Time estimate (hours)"
            value={timeEst / 60}
            onIonInput={(e) => setTimeEst(Number(e.detail.value) * 60)}
          />
        </IonItem>

        <div className="assignment-edit-button-section">
          <p className="assignment-edit-label">Module optional</p>
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

        <div className="assignment-edit-button-section">
          <p className="assignment-edit-label">Assignment type optional</p>
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

        <IonButton
          expand="block"
          className="assignment-edit-save"
          onClick={updateAssignment}
        >
          Save Changes
        </IonButton>
      </div>
    </IonCardContent>
  );
}