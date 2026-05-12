import { IonCard, IonCardContent, IonChip } from "@ionic/react";
import { useLiveQuery } from "dexie-react-hooks";
import { Assignment, db } from "../db/db";
import "./AssignmentCard.css";

interface AssignmentCardProps {
  assignment?: Assignment;
  children?: React.ReactNode;
}

const assignmentTypeColors = [
  "#ffecec", // light version of #f4b4b4
  "#eef4ff", // light version of #b8d8ff
  "#f3efff", // light version of #d5c4ff
  "#eafaf1", // light version of #bfe8c8
  "#fff3dc", // light version of #ffe0a8
  "#fff0f8", // light version of #f7c6df
  "#eefaf7", // light version of #c8e7e1
  "#f7f1e8", // light version of #e2d6c2
];

const getAssignmentTypeColor = (typeId?: number | null) => {
  if (typeId == null || typeId < 0) return "#f3efff";

  return assignmentTypeColors[(typeId) % assignmentTypeColors.length];
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

  const assignmentTypes =
    useLiveQuery(() => db.assignment_types.toArray(), []) ?? [];

  if (!assignment) return <p>No Assignment</p>;

  const assignmentType = assignmentTypes.find(
    (type) => type.id === Number(assignment.assignment_type)
  );

  const typeLabel = assignmentType?.name ?? "";
  const typeColor = getAssignmentTypeColor(assignment.assignment_type);

  const subject = subjects.find(
    (s) => s.id === Number(assignment.fk_subject)
  );

  const subjectName = subject?.name?.trim() ?? "";
  const daysLeft = getDaysUntilDue(assignment.date);

  return (
    <IonCard
      className="assignment-preview-card"
      style={
        {
          "--assignment-type-color": typeColor,
        } as React.CSSProperties
      }
    >
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