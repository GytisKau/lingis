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
  IonToolbar,
} from "@ionic/react";
import { close } from "ionicons/icons";
import { useLiveQuery } from "dexie-react-hooks";

interface AddAssignmentModalProps {
  trigger?: string;
  isOpen?: boolean;
  onDidDismiss?: () => void;
  onAssignmentAdded?: (assignmentId: number) => void;
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

function getDateString(daysOffset = 0) {
  const date = new Date();

  date.setDate(date.getDate() + daysOffset);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  return date.toISOString().slice(0, 10);
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

const AddAssignmentModal: React.FC<AddAssignmentModalProps> = ({
  trigger,
  isOpen,
  onDidDismiss,
  onAssignmentAdded,
}) => {
  const todayDate = getDateString();
  const tomorowDate = getDateString(1);

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(tomorowDate);
  const [startDate, setStartDate] = useState(todayDate);
  const [timeEst, setTimeEst] = useState<number>(1);
  const [testType, setTestType] = useState<number>(-1);
  const [status, setStatus] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null
  );
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
    const freshToday = getDateString();
    const freshTomorow = getDateString(1);

    setStatus("");
    setTitle("");
    setDueDate(freshTomorow);
    setStartDate(freshToday);
    setTimeEst(1);
    setTestType(-1);
    setSelectedSubjectId(null);
  }

  function handleDismiss() {
    clearValues();
    onDidDismiss?.();
  }

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

  async function addAssignment() {
    if (!title.trim() || timeEst <= 0) {
      setStatus("Please add a title and time estimate.");
      return false;
    }

    if (!isCompleteDateString(dueDate)) {
      setStatus("Please choose a valid due date.");
      return false;
    }

    if (!isCompleteDateString(startDate)) {
      setStatus("Please choose a valid study from date.");
      return false;
    }

    if (isDateStringBefore(dueDate, todayDate)) {
      setStatus("Due date cannot be in the past.");
      return false;
    }

    if (isDateStringBefore(startDate, todayDate)) {
      setStatus("Study from date cannot be in the past.");
      return false;
    }

    if (isDateStringAfter(startDate, dueDate)) {
      setStatus("Study from date cannot be after the due date.");
      return false;
    }

    try {
      const newAssignmentId = await db.assignments.add({
        title: title.trim(),
        date: dateStringToLocalDate(dueDate),
        is_done: false,
        start_date: dateStringToLocalDate(startDate),
        est_hours: timeEst * 60,
        assignment_type: testType,
        fk_subject: selectedSubjectId,
      });

      modal.current?.dismiss();
      onAssignmentAdded?.(Number(newAssignmentId));
    } catch (error) {
      setStatus(`Failed to add ${title}: ${error}`);
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
    <IonModal
      ref={modal}
      trigger={trigger}
      isOpen={isOpen}
      onDidDismiss={handleDismiss}
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