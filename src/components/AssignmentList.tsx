import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  IonList,
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  IonLabel,
  IonNote,
  IonBadge,
  IonText,
  IonButton
} from "@ionic/react";
import { trash, arrowUndo, checkmarkDone, checkmarkDoneOutline } from "ionicons/icons";
import { db } from "../db/db";
import type { Assignment } from "../db/db";
import ScheduleAllAssignments from '../utils/ScheduleSessions';

type AssignmentWithMeta = Assignment & {
  subjectName: string;
  subjectColor: string;
  completedCount: number;
  totalCount: number;
  isDone: boolean;
  isOverdue: boolean;
  isOld: boolean;
};
import "./AssignmentList.css";

type SortMode = "deadline" | "subject-deadline";

const AssignmentList: React.FC = () => {
  const [sortMode, setSortMode] = useState<SortMode>("deadline");
  const [showOldAssignments, setShowOldAssignments] = useState(false);
  const lingisEvents = useLiveQuery( async () => await db.events.toArray())
  const user = useLiveQuery( async () => (await db.users.toArray())[0])
  const [now, setNow] = useState(new Date())

  const assignments = useLiveQuery(async () => {
    const asgns = await db.assignments.toArray();
    const tasks = await db.tasks.toArray();
    const subjects = await db.subjects.toArray();

    return asgns.map((a) => {
      const assignmentTasks = tasks.filter((t) => t.fk_assignment === a.id);
      const completed = assignmentTasks.filter((t) => t.is_done).length;
      const subject = subjects.find((s) => s.id === Number(a.fk_subject));

      const isDone =
      a.is_done //|| (assignmentTasks.length > 0) // && completed === assignmentTasks.length);

      const isOverdue = new Date(a.date).getTime() < new Date().getTime();

      return {
        ...a,
        subjectName: subject?.name ?? "No subject",
        subjectColor: subject?.color ?? "#cccccc",
        completedCount: completed,
        totalCount: assignmentTasks.length,
        isDone,
        isOverdue,
        isOld: isDone || isOverdue
      };
    });
  }, []);
  const timeForAssignments = assignments?.reduce((total, a) => total + a.est_hours, 0) ?? 0

  const doneSessions = useLiveQuery(
  async () => {
    const sessions = await db.sessions.toArray();
    return sessions.filter(s => s.is_done);
  },
  []
) ?? [];

  console.log(doneSessions)

  const completedMinutesByAssignment = useMemo(() => {
  const map = new Map<number, number>();

  doneSessions.forEach((session) => {
    const assignmentId = session.fk_assignment;
    if (!assignmentId) return;

    const start = new Date(session.start).getTime();
    const end = new Date(session.end).getTime();
    const minutes = (end - start) / 1000 / 60;

    map.set(assignmentId, (map.get(assignmentId) ?? 0) + minutes);
  });

  return map;
}, [doneSessions]);

  const recomendedSessions = useMemo(() => {
    if (!lingisEvents || !user || !assignments) return []

    const freeTimes = lingisEvents.filter(e => e.is_free)
    
    return ScheduleAllAssignments(
      assignments,
      freeTimes,
      user
    )

  }, [lingisEvents, timeForAssignments, now, user])
  console.log(recomendedSessions)

  const plannedMinutesByAssignment = useMemo(() => {
  const map = new Map<number, number>();

  recomendedSessions.forEach((session: any) => {
    const assignmentId = session.fk_assignment ?? session.assignmentId;
    if (!assignmentId) return;

    const start = new Date(session.start).getTime();
    const end = new Date(session.end).getTime();
    const minutes = (end - start) / 1000 / 60;

    map.set(assignmentId, (map.get(assignmentId) ?? 0) + minutes);
  });

  doneSessions.forEach((session) => {
    const assignmentId = session.fk_assignment;
    if (!assignmentId) return;

    const start = new Date(session.start).getTime();
    const end = new Date(session.end).getTime();
    const minutes = (end - start) / 1000 / 60;

    map.set(assignmentId, (map.get(assignmentId) ?? 0) + minutes);
  });

  return map;
}, [recomendedSessions, doneSessions]);

  const handleDoneButton = async (assignment: AssignmentWithMeta) => {

  if ((assignment.isDone)  && (assignment.isOverdue)) {
    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + 7);

    await db.assignments.update(assignment.id!, {
      date: newDueDate
    });

    await db.assignments.update(assignment.id!, {
      is_done: false
    });

    return;
  }

  if (assignment.isOverdue) {
    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + 7);

    await db.assignments.update(assignment.id!, {
      date: newDueDate
    });

    return;
  }

  if (assignment.isDone) {
    await db.assignments.update(assignment.id!, {
      is_done: false
    });
    return;
  }

  await db.assignments.update(assignment.id!, {
    is_done: true
  });

  await db.tasks.where("fk_assignment").equals(assignment.id!).modify({
    is_done: true
  });
};

  const deleteAssignment = async (id: number) => {
    await db.tasks.where("fk_assignment").equals(id).delete();
    await db.assignments.delete(id);
  };

  const getTypeClass = (type: number) => {
    if (type === 0) return "exam";
    if (type === 1) return "lab";
    return "other";
  };

  const getTimeLeft = (date: string | Date) => {
    const dueDate = new Date(date).getTime();
    const now = new Date().getTime();
    const diff = dueDate - now;

    if (isNaN(dueDate)) return "No due date";
    if (diff <= 0) return "Overdue";

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} day${days !== 1 ? "s" : ""} left`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""} left`;

    return `${minutes} min left`;
  };

  if (!assignments || assignments.length === 0) {
    return <p className="centered-text">No assignments added yet.</p>;
  }

  const sortAssignments = (list: typeof assignments) => {
    return [...list].sort((a, b) => {
      if (sortMode === "deadline") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }

      const subjectCompare = a.subjectName.localeCompare(b.subjectName);

      if (subjectCompare !== 0) {
        return subjectCompare;
      }

      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  };

  const activeAssignments = sortAssignments(
    assignments.filter((a) => !a.isOld)
  );

  const oldAssignments = sortAssignments(
    assignments.filter((a) => a.isOld)
  );

  const renderAssignment = (
    assignment: typeof assignments[number],
    index: number,
    list: typeof assignments
  ) => {
    const previousAssignment = list[index - 1];

    const showSubjectHeader =
      sortMode === "subject-deadline" &&
      (!previousAssignment ||
        previousAssignment.subjectName !== assignment.subjectName);
        const plannedMinutes = plannedMinutesByAssignment.get(assignment.id!) ?? 0;
        const doesNotHaveEnoughPlannedTime = plannedMinutes < assignment.est_hours;
        const completedMinutes = completedMinutesByAssignment.get(assignment.id!) ?? 0;
        const formatHours = (minutes: number) => {
          return (minutes / 60).toFixed(1);
        };

    return (
      <div key={assignment.id}>
        {showSubjectHeader && (
          <div className="assignment-subject-header">
            <span
              className="assignment-subject-header-dot"
              style={{ backgroundColor: assignment.subjectColor }}
            />
            {assignment.subjectName}
          </div>
        )}

        <IonItemSliding className="assignment-sliding-item">
          <IonItem
            button
            detail={false}
            className={`assignment-card-item ${getTypeClass(
              assignment.assignment_type
            )}`}
            routerLink={`/tabs/tab4/viewassignment/${assignment.id}`}
          >
            <div slot="start" className="subject-color-dot-wrapper">
              <div
                className="subject-color-dot"
                style={{ backgroundColor: assignment.subjectColor }}
              />
            </div>

            <IonLabel>
              <div className="assignment-header">
                <IonText className="assignment-title">
                  {assignment.title}
                </IonText>

                <IonBadge className="task-progress-badge">
                  <IonIcon
                    icon={checkmarkDoneOutline}
                    className="task-progress-icon"
                  />
                  <span>
                    {assignment.completedCount}/{assignment.totalCount}
                  </span>
                </IonBadge>
              </div>

              <div className="assignment-footer">
                <div className="due-date">
                  <small>
                    {assignment.isDone ? "Done" : getTimeLeft(assignment.date)}
                  </small>
                </div>
                <IonNote color={doesNotHaveEnoughPlannedTime ? "danger" : "dark"}>
                  {formatHours(completedMinutes)} / {formatHours(assignment.est_hours)} h
                </IonNote>
              </div>
            </IonLabel>
          </IonItem>

          <IonItemOptions side="end">
            <IonItemOption
              className="delete-option"
              onClick={() => deleteAssignment(assignment.id!)}
            >
              <div className="delete-button">
                <IonIcon icon={trash} />
              </div>
            </IonItemOption>
            <IonItemOption
              className="done-option"
              onClick={() => handleDoneButton(assignment)}
            >
              <div className="done-button">
                <IonIcon icon={assignment.isDone || assignment.isOverdue ? arrowUndo : checkmarkDone} />
              </div>
            </IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
      </div>
    );
  };

  return (
    <>
      <div className="assignment-sort-buttons">
        <IonButton
          size="small"
          fill={sortMode === "deadline" ? "solid" : "outline"}
          onClick={() => setSortMode("deadline")}
        >
          Sort by deadline
        </IonButton>

        <IonButton
          size="small"
          fill={sortMode === "subject-deadline" ? "solid" : "outline"}
          onClick={() => setSortMode("subject-deadline")}
        >
          Sort by subject + deadline
        </IonButton>
      </div>

      <IonList lines="none" className="assignment-list-container">
        {activeAssignments.map((assignment, index) =>
          renderAssignment(assignment, index, activeAssignments)
        )}
      </IonList>

      {oldAssignments.length > 0 && (
        <>
          <IonButton
            expand="block"
            fill="outline"
            onClick={() => setShowOldAssignments((prev) => !prev)}
          >
            {showOldAssignments
              ? "Hide overdue/done"
              : `Show overdue/done (${oldAssignments.length})`}
          </IonButton>

          {showOldAssignments && (
            <IonList lines="none" className="assignment-list-container">
              {oldAssignments.map((assignment, index) =>
                renderAssignment(assignment, index, oldAssignments)
              )}
            </IonList>
          )}
        </>
      )}
    </>
  );
};

export default AssignmentList;