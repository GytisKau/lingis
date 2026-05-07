import { useState, useEffect } from "react";
import { db } from "../db/db";
import {
  IonButton,
  IonInput,
  IonText,
} from "@ionic/react";
import { useLiveQuery } from "dexie-react-hooks";

interface EditAssignmentFormProps {
  assignmentId: number;
  onSaved: () => void;
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

function getTodayDateString() {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
}

function dateToInputString(date: Date | string | undefined | null) {
  if (!date) return getTodayDateString();

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return getTodayDateString();
  }

  parsed.setMinutes(parsed.getMinutes() - parsed.getTimezoneOffset());
  return parsed.toISOString().slice(0, 10);
}

function isCompleteDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function dateStringToLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isDateStringBefore(value: string, compareTo: string) {
  if (!isCompleteDateString(value) || !isCompleteDateString(compareTo)) {
    return false;
  }

  return dateStringToLocalDate(value) < dateStringToLocalDate(compareTo);
}

function isDateStringAfter(value: string, compareTo: string) {
  if (!isCompleteDateString(value) || !isCompleteDateString(compareTo)) {
    return false;
  }

  return dateStringToLocalDate(value) > dateStringToLocalDate(compareTo);
}

export default function EditAssignmentForm({
  assignmentId,
  onSaved,
}: EditAssignmentFormProps) {
  const todayDate = getTodayDateString();

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(todayDate);
  const [startDate, setStartDate] = useState(todayDate);
  const [timeEst, setTimeEst] = useState<number>(0);
  const [testType, setTestType] = useState<number>(-1);
  const [status, setStatus] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
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
        setTitle(assignment.title ?? "");
        setDueDate(dateToInputString(assignment.date));
        setStartDate(dateToInputString(assignment.start_date));
        setTimeEst((assignment.est_hours ?? 0) / 60);
        setTestType(assignment.assignment_type ?? -1);
        setSelectedSubjectId(assignment.fk_subject ?? null);
      }
    };

    loadAssignment();
  }, [assignmentId]);

  function handleDueDateChange(value?: string | null) {
    const nextValue = value ?? "";
    setDueDate(nextValue);

    if (!nextValue) {
      setStatus("Please choose a due date.");
      return;
    }

    if (!isCompleteDateString(nextValue)) {
      setStatus("");
      return;
    }

    if (isDateStringBefore(nextValue, todayDate)) {
      setStatus("Due date cannot be in the past.");
      return;
    }

    if (
      isCompleteDateString(startDate) &&
      isDateStringAfter(startDate, nextValue)
    ) {
      setStartDate(nextValue);
    }

    setStatus("");
  }

  function handleStartDateChange(value?: string | null) {
    const nextValue = value ?? "";
    setStartDate(nextValue);

    if (!nextValue) {
      setStatus("Please choose a study from date.");
      return;
    }

    if (!isCompleteDateString(nextValue)) {
      setStatus("");
      return;
    }

    if (isDateStringBefore(nextValue, todayDate)) {
      setStatus("Study from date cannot be in the past.");
      return;
    }

    if (isCompleteDateString(dueDate) && isDateStringAfter(nextValue, dueDate)) {
      setStatus("Study from date cannot be after the due date.");
      return;
    }

    setStatus("");
  }

  async function updateAssignment() {
    if (!title.trim() || timeEst <= 0) {
      setStatus("Please add a title and time estimate.");
      return;
    }

    if (!isCompleteDateString(dueDate)) {
      setStatus("Please choose a valid due date.");
      return;
    }

    if (!isCompleteDateString(startDate)) {
      setStatus("Please choose a valid study from date.");
      return;
    }

    if (isDateStringBefore(dueDate, todayDate)) {
      setStatus("Due date cannot be in the past.");
      return;
    }

    if (isDateStringBefore(startDate, todayDate)) {
      setStatus("Study from date cannot be in the past.");
      return;
    }

    if (isDateStringAfter(startDate, dueDate)) {
      setStatus("Study from date cannot be after the due date.");
      return;
    }

    try {
      const success = await db.assignments.update(assignmentId, {
        title: title.trim(),
        date: dateStringToLocalDate(dueDate),
        start_date: dateStringToLocalDate(startDate),
        est_hours: timeEst * 60,
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

  const typeChoices = [
    { value: -1, label: "No type" },
    { value: 0, label: assignmentTypeNames[0] },
    { value: 1, label: assignmentTypeNames[1] },
    { value: 2, label: assignmentTypeNames[2] },
  ];

  const formHasInvalidDates =
    !isCompleteDateString(dueDate) ||
    !isCompleteDateString(startDate) ||
    isDateStringBefore(dueDate, todayDate) ||
    isDateStringBefore(startDate, todayDate) ||
    isDateStringAfter(startDate, dueDate);

  return (
    <div className="assignment-edit-content">
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
            min={todayDate}
            value={dueDate}
            onIonInput={(e) => handleDueDateChange(e.detail.value)}
            onIonChange={(e) => handleDueDateChange(e.detail.value)}
          />
        </div>

        <div className="assignment-form-group">
          <label>Study from</label>
          <IonInput
            className="assignment-form-input"
            type="date"
            min={todayDate}
            max={isCompleteDateString(dueDate) ? dueDate : undefined}
            value={startDate}
            onIonInput={(e) => handleStartDateChange(e.detail.value)}
            onIonChange={(e) => handleStartDateChange(e.detail.value)}
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

        {subjects.length === 0 ? (
          <div className="assignment-empty-modules">
            Add modules in Profile.
          </div>
        ) : (
          <div className="assignment-choice-grid">
            <button
              type="button"
              className={`assignment-choice-button ${
                selectedSubjectId === null ? "active" : ""
              }`}
              onClick={() => setSelectedSubjectId(null)}
            >
              <span
                className="assignment-choice-dot"
                style={{ background: "#e6d8ff" }}
              />
              Other
            </button>

            {subjects.map((subject) => (
              <button
                key={subject.id ?? subject.name}
                type="button"
                className={`assignment-choice-button ${
                  selectedSubjectId === subject.id ? "active" : ""
                }`}
                onClick={() => setSelectedSubjectId(subject.id ?? null)}
              >
                <span
                  className="assignment-choice-dot"
                  style={{ background: subject.color }}
                />
                {subject.name}
              </button>
            ))}
          </div>
        )}
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
          disabled={!title.trim() || timeEst <= 0 || formHasInvalidDates}
          onClick={updateAssignment}
          className="assignment-form-primary"
        >
          Save changes
        </IonButton>
      </div>
    </div>
  );
}