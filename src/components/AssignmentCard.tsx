import { useEffect, useState } from "react";
import { IonCard, IonCardContent, IonChip } from "@ionic/react";
import { useLiveQuery } from "dexie-react-hooks";
import { Assignment, db } from "../db/db";
import "./AssignmentCard.css";

interface AssignmentCardProps {
  assignment?: Assignment;
  children?: React.ReactNode;
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

const getTypeClass = (type?: number | null) => {
  if (type === 0) return "exam";
  if (type === 1) return "lab";
  if (type === 2) return "other";
  return "unset";
};

const getTypeLabel = (
  type: number | null | undefined,
  assignmentTypeNames: AssignmentTypeNames
) => {
  if (type === 0) return assignmentTypeNames[0];
  if (type === 1) return assignmentTypeNames[1];
  if (type === 2) return assignmentTypeNames[2];
  return "";
};

const formatDate = (value: Date | string) =>
  new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatEstimatedTime = (minutes: number) => {
  const safeMinutes = Number.isFinite(minutes) ? minutes : 0;
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;

  if (mins === 0) return `${hours}h`;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
};

const getDaysUntilDue = (value: Date | string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(value);
  due.setHours(0, 0, 0, 0);

  const diff = Math.ceil((due.getTime() - today.getTime()) / 86400000);

  if (Number.isNaN(diff)) return "No due date";
  if (diff < 0) {
    const days = Math.abs(diff);
    return `${days} day${days !== 1 ? "s" : ""} overdue`;
  }

  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";

  return `${diff} days left`;
};

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  children,
}) => {
  const subjects = useLiveQuery(() => db.subjects.toArray(), []) ?? [];

  const [assignmentTypeNames, setAssignmentTypeNames] =
    useState<AssignmentTypeNames>(getAssignmentTypeNames);

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

  if (!assignment) return <p>No Assignment</p>;

  const typeClass = getTypeClass(assignment.assignment_type);
  const typeLabel = getTypeLabel(
    assignment.assignment_type,
    assignmentTypeNames
  );

  const subject = subjects.find(
    (s) => s.id === Number(assignment.fk_subject)
  );

  const subjectName = subject?.name?.trim() ?? "";
  const daysLeft = getDaysUntilDue(assignment.date);

  return (
    <IonCard className={`assignment-preview-card ${typeClass}`}>
      <IonCardContent>
        <div className="assignment-preview-header">
          <div className="assignment-preview-main">
            {(subjectName || typeLabel) && (
              <div className="assignment-preview-tags">
                {subjectName && (
                  <span className="assignment-preview-tag">
                    {subjectName}
                  </span>
                )}

                {typeLabel && (
                  <span className="assignment-preview-tag">
                    {typeLabel}
                  </span>
                )}
              </div>
            )}

            <h2 className="assignment-preview-title">{assignment.title}</h2>

            <div className="assignment-preview-info-grid">
              <div className="assignment-preview-info-box">
                <strong>From</strong>
                <span>{formatDate(assignment.start_date)}</span>
              </div>

              <div className="assignment-preview-info-box">
                <strong>Due</strong>
                <span>{formatDate(assignment.date)}</span>
              </div>
            </div>
          </div>

          {children ? (
            <div className="assignment-preview-actions">{children}</div>
          ) : null}
        </div>

        <div className="assignment-preview-footer">
          <IonChip className="assignment-preview-chip due-chip">
            {daysLeft}
          </IonChip>

          <IonChip className="assignment-preview-chip">
            {formatEstimatedTime(assignment.est_hours)} planned
          </IonChip>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default AssignmentCard;