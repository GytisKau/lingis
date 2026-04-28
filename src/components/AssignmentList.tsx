import { useEffect, useMemo, useRef, useState } from "react";
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
  IonText
} from "@ionic/react";
import {
  trash,
  arrowUndo,
  checkmarkDone,
  checkmarkDoneOutline
} from "ionicons/icons";
import { db } from "../db/db";
import type { Assignment } from "../db/db";
import ScheduleAllAssignments from "../utils/ScheduleSessions";
import "./AssignmentList.css";

type AssignmentWithMeta = Assignment & {
  subjectName: string;
  subjectColor: string;
  completedCount: number;
  totalCount: number;
  isDone: boolean;
  isOverdue: boolean;
  isOld: boolean;
};

type SortMode = "deadline" | "subject-deadline";

const AssignmentList: React.FC = () => {
  const [sortMode, setSortMode] = useState<SortMode>("deadline");
  const [showOldAssignments, setShowOldAssignments] = useState(false);

  const slidingRefs = useRef<Map<number, HTMLIonItemSlidingElement>>(new Map());

  const lingisEvents = useLiveQuery(async () => await db.events.toArray());
  const user = useLiveQuery(async () => (await db.users.toArray())[0]);
  const [now] = useState(new Date());

  const assignments = useLiveQuery(async () => {
    const asgns = await db.assignments.toArray();
    const tasks = await db.tasks.toArray();
    const subjects = await db.subjects.toArray();

    return asgns.map((assignment) => {
      const assignmentTasks = tasks.filter(
        (task) => task.fk_assignment === assignment.id
      );

      const completed = assignmentTasks.filter((task) => task.is_done).length;
      const subject = subjects.find(
        (subjectItem) => subjectItem.id === Number(assignment.fk_subject)
      );

      const isDone = assignment.is_done;
      const isOverdue =
        new Date(assignment.date).getTime() < new Date().getTime();

      return {
        ...assignment,
        subjectName: subject?.name ?? "",
        subjectColor: subject?.color ?? "",
        completedCount: completed,
        totalCount: assignmentTasks.length,
        isDone,
        isOverdue,
        isOld: isDone || isOverdue
      };
    });
  }, []);

  const timeForAssignments =
    assignments?.reduce(
      (total, assignment) => total + assignment.est_hours,
      0
    ) ?? 0;

  const doneSessions =
    useLiveQuery(
      async () => {
        const sessions = await db.sessions.toArray();
        return sessions.filter((session) => session.is_done);
      },
      []
    ) ?? [];

  const closeAllSlidingItems = () => {
    slidingRefs.current.forEach((slidingItem) => {
      slidingItem.close();
    });
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const clickedInsideSlidingItem = target.closest("ion-item-sliding");

      if (clickedInsideSlidingItem) return;

      closeAllSlidingItems();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, []);

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
    if (!lingisEvents || !user || !assignments) return [];

    const freeTimes = lingisEvents.filter((event) => event.is_free);

    return ScheduleAllAssignments(assignments, freeTimes, user);
  }, [lingisEvents, timeForAssignments, now, user, assignments]);

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
    closeAllSlidingItems();

    if (assignment.isDone && assignment.isOverdue) {
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
    closeAllSlidingItems();

    await db.tasks.where("fk_assignment").equals(id).delete();
    await db.assignments.delete(id);
  };

  const getTypeClass = (type: number) => {
    if (type === 0) return "exam";
    if (type === 1) return "lab";
    if (type === 2) return "other";
    return "unset";
  };

  const getTimeLeft = (date: string | Date) => {
    const dueDate = new Date(date).getTime();
    const currentTime = new Date().getTime();
    const diff = dueDate - currentTime;

    if (isNaN(dueDate)) return "No due date";
    if (diff <= 0) return "Overdue";

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} day${days !== 1 ? "s" : ""} left`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""} left`;

    return `${minutes} min left`;
  };

  const formatHours = (minutes: number) => {
    const hours = minutes / 60;

    if (Number.isInteger(hours)) {
      return `${hours}`;
    }

    return `${Number(hours.toFixed(1))}`;
  };

  if (!assignments || assignments.length === 0) {
    return <p className="centered-text">No assignments added yet.</p>;
  }

  const sortAssignments = (list: typeof assignments) => {
    return [...list].sort((a, b) => {
      if (sortMode === "deadline") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }

      if (!a.subjectName && b.subjectName) return 1;
      if (a.subjectName && !b.subjectName) return -1;

      const subjectCompare = a.subjectName.localeCompare(b.subjectName);

      if (subjectCompare !== 0) {
        return subjectCompare;
      }

      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  };

  const activeAssignments = sortAssignments(
    assignments.filter((assignment) => !assignment.isOld)
  );

  const oldAssignments = sortAssignments(
    assignments.filter((assignment) => assignment.isOld)
  );

  const renderAssignment = (
    assignment: typeof assignments[number],
    index: number,
    list: typeof assignments
  ) => {
    const previousAssignment = list[index - 1];

    const showSubjectHeader =
      sortMode === "subject-deadline" &&
      assignment.subjectName &&
      (!previousAssignment ||
        previousAssignment.subjectName !== assignment.subjectName);

    const plannedMinutes = plannedMinutesByAssignment.get(assignment.id!) ?? 0;
    const completedMinutes =
      completedMinutesByAssignment.get(assignment.id!) ?? 0;

    const doesNotHaveEnoughPlannedTime =
      plannedMinutes < assignment.est_hours;

    return (
      <div key={assignment.id}>
        {showSubjectHeader && (
          <div className="assignment-subject-header">
            {assignment.subjectName}
          </div>
        )}

        <IonItemSliding
          ref={(element) => {
            if (!assignment.id) return;

            if (element) {
              slidingRefs.current.set(assignment.id, element);
            } else {
              slidingRefs.current.delete(assignment.id);
            }
          }}
          className="assignment-sliding-item"
        >
          <IonItem
            button
            detail={false}
            className={`assignment-card-item ${getTypeClass(
              assignment.assignment_type
            )}`}
            routerLink={`/tabs/tab4/viewassignment/${assignment.id}`}
          >
            <IonLabel>
              <div className="assignment-header">
                <div className="assignment-title-stack">
                  <IonText className="assignment-title">
                    {assignment.title}
                  </IonText>
                </div>

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

                <div className="assignment-bottom-chips">
                  <IonNote
                    className={
                      doesNotHaveEnoughPlannedTime
                        ? "assignment-time-note warning"
                        : "assignment-time-note"
                    }
                  >
                    <span className="time-label">Time</span>
                    <span className="time-value">
                      {formatHours(completedMinutes)} /{" "}
                      {formatHours(assignment.est_hours)} h
                    </span>
                  </IonNote>

                  {assignment.subjectName && (
                    <IonNote
                      className="assignment-module-note"
                      style={
                        {
                          "--module-color":
                            assignment.subjectColor || "#c7a8ff"
                        } as React.CSSProperties
                      }
                    >
                      <span className="module-value">
                        {assignment.subjectName}
                      </span>
                    </IonNote>
                  )}
                </div>
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
                <IonIcon
                  icon={
                    assignment.isDone || assignment.isOverdue
                      ? arrowUndo
                      : checkmarkDone
                  }
                />
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
        <button
          type="button"
          className={`assignment-sort-pill ${
            sortMode === "deadline" ? "active" : ""
          }`}
          onClick={() => setSortMode("deadline")}
        >
          Deadline
        </button>

        <button
          type="button"
          className={`assignment-sort-pill ${
            sortMode === "subject-deadline" ? "active" : ""
          }`}
          onClick={() => setSortMode("subject-deadline")}
        >
          Module + deadline
        </button>
      </div>

      <IonList lines="none" className="assignment-list-container">
        {activeAssignments.map((assignment, index) =>
          renderAssignment(assignment, index, activeAssignments)
        )}
      </IonList>

      {oldAssignments.length > 0 && (
        <>
          <button
            type="button"
            className={`assignment-overdue-button ${
              showOldAssignments ? "active" : ""
            }`}
            onClick={() => setShowOldAssignments((prev) => !prev)}
          >
            {showOldAssignments
              ? "Hide overdue/done"
              : `Show overdue/done (${oldAssignments.length})`}
          </button>

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