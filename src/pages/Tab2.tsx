import {
  IonContent,
  IonPage,
  IonProgressBar,
  IonGrid,
  IonRow,
  IonCol,
  useIonModal,
  IonList,
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  IonLabel,
  IonNote,
} from "@ionic/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { arrowUndo } from "ionicons/icons";
import { db } from "../db/db";
import "./Tab2.css";

import AssignmentCard from "../components/AssignmentCard";
import TaskList from "../components/TaskList";
import { Header } from "../components/Header";

type StatsView = "overview" | "assignments" | "history";

interface AssignmentStats {
  id: number;
  title: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
  daysUntilDue: number;
  type: number;
  date: Date;
  startDate: Date | null;
  doneAt: Date | null;
  deletedAt: Date | null;
  isDone: boolean;
  isDeleted: boolean;
  subjectName: string;
  subjectColor: string;
}

interface QuestionnairePoint {
  date: Date;
  label: string;
  readiness: number;
  sleepHours: number;
  recommendedMinutes: number | null;
}

type ActiveDateGroup = {
  key: string;
  label: string;
  modules: {
    key: string;
    label: string;
    assignments: AssignmentStats[];
  }[];
};

const SIX_DAYS_IN_MS = 6 * 24 * 60 * 60 * 1000;

const Tab2: React.FC = () => {
  const [view, setView] = useState<StatsView>("overview");
  const [stats, setStats] = useState<AssignmentStats[]>([]);
  const [currentAssignment, setCurrentAssignment] = useState<any>();
  const [showDeletedHistory, setShowDeletedHistory] = useState(false);

  const slidingRefs = useRef<Map<number, HTMLIonItemSlidingElement>>(new Map());

  const assignments = useLiveQuery(() => db.assignments.toArray(), []);
  const tasks = useLiveQuery(() => db.tasks.toArray(), []);
  const subjects = useLiveQuery(() => db.subjects.toArray(), []);
  const sessions = useLiveQuery(() => db.sessions.toArray(), []);
  const questionnaires = useLiveQuery(() => db.questionnaires.toArray(), []);

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

  useEffect(() => {
    if (!assignments || !tasks || !subjects) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data: AssignmentStats[] = assignments.map((assignment: any) => {
      const assignmentTasks = tasks.filter(
        (task: any) => task.fk_assignment === assignment.id
      );

      const completed = assignmentTasks.filter(
        (task: any) => task.is_done
      ).length;
      const total = assignmentTasks.length;
      const progress = total === 0 ? 0 : completed / total;

      const due = new Date(assignment.date);
      due.setHours(0, 0, 0, 0);

      const daysUntilDue = Math.ceil(
        (due.getTime() - today.getTime()) / 86400000
      );

      const subject = subjects.find(
        (subjectItem: any) => subjectItem.id === Number(assignment.fk_subject)
      );

      return {
        id: assignment.id,
        title: assignment.title,
        totalTasks: total,
        completedTasks: completed,
        progress,
        daysUntilDue,
        type: assignment.assignment_type ?? -1,
        date: new Date(assignment.date),
        startDate: assignment.start_date ? new Date(assignment.start_date) : null,
        doneAt: assignment.done_at ? new Date(assignment.done_at) : null,
        deletedAt: assignment.deleted_at ? new Date(assignment.deleted_at) : null,
        isDone: Boolean(assignment.is_done),
        isDeleted: Boolean(assignment.is_deleted || assignment.deleted_at),
        subjectName: subject?.name ?? "",
        subjectColor: subject?.color ?? "",
      };
    });

    setStats(
      data.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    );
  }, [assignments, tasks, subjects]);

  const doneSessions = useMemo(() => {
    return (sessions ?? []).filter((session: any) => session.is_done);
  }, [sessions]);

  const sessionSummary = useMemo(() => {
    if (!doneSessions.length) {
      return {
        thisWeekCount: 0,
        thisWeekMinutes: 0,
        averageMinutes: 0,
        longestMinutes: 0,
      };
    }

    const weekStart = getWeekStart(new Date());

    const durations = doneSessions.map((session: any) => {
      const start = new Date(session.start).getTime();
      const end = new Date(session.end).getTime();
      return Math.max(0, Math.round((end - start) / 60000));
    });

    const thisWeekSessions = doneSessions.filter((session: any) => {
      const start = new Date(session.start);
      return start >= weekStart;
    });

    const thisWeekMinutes = thisWeekSessions.reduce(
      (sum: number, session: any) => {
        const start = new Date(session.start).getTime();
        const end = new Date(session.end).getTime();
        return sum + Math.max(0, Math.round((end - start) / 60000));
      },
      0
    );

    const averageMinutes =
      durations.length > 0
        ? Math.round(
            durations.reduce((sum, value) => sum + value, 0) / durations.length
          )
        : 0;

    const longestMinutes = durations.length > 0 ? Math.max(...durations) : 0;

    return {
      thisWeekCount: thisWeekSessions.length,
      thisWeekMinutes,
      averageMinutes,
      longestMinutes,
    };
  }, [doneSessions]);

  const questionnaireTrend = useMemo<QuestionnairePoint[]>(() => {
    if (!questionnaires?.length) return [];

    const grouped = new Map<
      string,
      {
        date: Date;
        rows: any[];
      }
    >();

    questionnaires.forEach((row: any) => {
      if (!row.created_at) return;

      const date = new Date(row.created_at);
      const key = getDateKey(date);

      if (!grouped.has(key)) {
        grouped.set(key, { date, rows: [] });
      }

      grouped.get(key)!.rows.push(row);
    });

    return Array.from(grouped.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((group) => {
        const rows = group.rows;

        const avg = (field: string) => {
          const values = rows
            .map((row) => Number(row[field]))
            .filter((value) => !Number.isNaN(value));

          if (!values.length) return 0;

          return values.reduce((sum, value) => sum + value, 0) / values.length;
        };

        const sleepHours = avg("sleep_quality");
        const sleepScore = sleepHoursToScore(sleepHours);

        const positiveAvg =
          (avg("motivation") +
            avg("mental_energy") +
            avg("emotional") +
            avg("physical") +
            sleepScore) /
          5;

        const fatigueAvg =
          (avg("mental_tiredness") + avg("physical_tiredness")) / 2;

        const readiness =
          ((positiveAvg - 1) / 4) * 70 + ((5 - fatigueAvg) / 4) * 30;

        const recommendedRaw = rows
          .map((row) => Number(row.recommended_minutes))
          .filter((value) => !Number.isNaN(value));

        const recommendedMinutes =
          recommendedRaw.length > 0
            ? Math.round(
                recommendedRaw.reduce((sum, value) => sum + value, 0) /
                  recommendedRaw.length
              )
            : null;

        return {
          date: group.date,
          label: group.date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          readiness: Math.round(clamp(readiness, 0, 100)),
          sleepHours: Number(sleepHours.toFixed(1)),
          recommendedMinutes,
        };
      });
  }, [questionnaires]);

  const rhythmSummary = useMemo(() => {
    if (!questionnaireTrend.length) {
      return {
        latest: null as QuestionnairePoint | null,
        averageReadiness: 0,
        averageSleep: 0,
        averageRecommendedMinutes: null as number | null,
        bestRecentDay: "",
      };
    }

    const latest = questionnaireTrend[questionnaireTrend.length - 1];

    const averageReadiness = Math.round(
      questionnaireTrend.reduce((sum, point) => sum + point.readiness, 0) /
        questionnaireTrend.length
    );

    const averageSleep = Number(
      (
        questionnaireTrend.reduce((sum, point) => sum + point.sleepHours, 0) /
        questionnaireTrend.length
      ).toFixed(1)
    );

    const recommendedValues = questionnaireTrend
      .map((point) => point.recommendedMinutes)
      .filter((value): value is number => value !== null);

    const averageRecommendedMinutes =
      recommendedValues.length > 0
        ? Math.round(
            recommendedValues.reduce((sum, value) => sum + value, 0) /
              recommendedValues.length
          )
        : null;

    const lastSeven = questionnaireTrend.slice(-7);
    const bestRecent = [...lastSeven].sort(
      (a, b) => b.readiness - a.readiness
    )[0];

    return {
      latest,
      averageReadiness,
      averageSleep,
      averageRecommendedMinutes,
      bestRecentDay: bestRecent
        ? bestRecent.date.toLocaleDateString(undefined, { weekday: "long" })
        : "",
    };
  }, [questionnaireTrend]);

  const active = stats.filter((item) => !item.isDone && !item.isDeleted);
  const completed = stats.filter((item) => item.isDone && !item.isDeleted);
  const deleted = stats.filter((item) => item.isDeleted);

  const allNonDeleted = stats.filter((item) => !item.isDeleted);

  const totalTasks = allNonDeleted.reduce(
    (sum, item) => sum + item.totalTasks,
    0
  );

  const doneTasks = allNonDeleted.reduce(
    (sum, item) => sum + item.completedTasks,
    0
  );

  const overall = totalTasks === 0 ? 0 : doneTasks / totalTasks;

  const isUrgentAssignment = (item: AssignmentStats) => {
    const expected = getExpectedProgress(item.startDate, item.date);
    const behindBy = expected - item.progress;

    return (
      item.daysUntilDue < 0 ||
      (item.daysUntilDue <= 3 && item.progress < 0.8) ||
      behindBy > 0.25
    );
  };

  const isOnTrackAssignment = (item: AssignmentStats) => {
    if (item.daysUntilDue < 0) return false;

    const expected = getExpectedProgress(item.startDate, item.date);
    return item.progress >= expected - 0.1 || item.daysUntilDue > 7;
  };

  const urgent = active.filter(isUrgentAssignment).length;
  const onTrack = active.filter(
    (item) => !isUrgentAssignment(item) && isOnTrackAssignment(item)
  ).length;

  const sortedActive = useMemo(() => {
    return [...active].sort((a, b) => {
      const dateCompare =
        new Date(a.date).getTime() - new Date(b.date).getTime();

      if (dateCompare !== 0) return dateCompare;

      if (!a.subjectName && b.subjectName) return 1;
      if (a.subjectName && !b.subjectName) return -1;

      const subjectCompare = a.subjectName.localeCompare(b.subjectName);
      if (subjectCompare !== 0) return subjectCompare;

      return a.title.localeCompare(b.title);
    });
  }, [active]);

  const nextWeekAssignments = useMemo(() => {
    const nextWeek = sortedActive.filter(
      (item) => item.daysUntilDue >= 0 && item.daysUntilDue <= 7
    );

    return nextWeek.length > 0 ? nextWeek : sortedActive.slice(0, 3);
  }, [sortedActive]);

  const groupedActive = useMemo<ActiveDateGroup[]>(() => {
    const dateGroups = new Map<string, ActiveDateGroup>();

    sortedActive.forEach((item) => {
      const dateKey = getDateKey(item.date);
      const dateLabel = getDueGroupLabel(item);

      if (!dateGroups.has(dateKey)) {
        dateGroups.set(dateKey, {
          key: dateKey,
          label: dateLabel,
          modules: [],
        });
      }

      const dateGroup = dateGroups.get(dateKey)!;
      const moduleKey = item.subjectName || "other";
      const moduleLabel = item.subjectName || "Other";

      let moduleGroup = dateGroup.modules.find(
        (group) => group.key === moduleKey
      );

      if (!moduleGroup) {
        moduleGroup = {
          key: moduleKey,
          label: moduleLabel,
          assignments: [],
        };
        dateGroup.modules.push(moduleGroup);
      }

      moduleGroup.assignments.push(item);
    });

    return Array.from(dateGroups.values());
  }, [sortedActive]);

  const completedHistoryItems = useMemo(() => {
    return [...completed].sort((a, b) => {
      const aDate = getHistoryDate(a).getTime();
      const bDate = getHistoryDate(b).getTime();
      return bDate - aDate;
    });
  }, [completed]);

  const deletedHistoryItems = useMemo(() => {
    return [...deleted].sort((a, b) => {
      const aDate = getHistoryDate(a).getTime();
      const bDate = getHistoryDate(b).getTime();
      return bDate - aDate;
    });
  }, [deleted]);

  const groupedCompletedHistory = useMemo(() => {
    return groupHistoryByMonth(completedHistoryItems);
  }, [completedHistoryItems]);

  const groupedDeletedHistory = useMemo(() => {
    return groupHistoryByMonth(deletedHistoryItems);
  }, [deletedHistoryItems]);

  const getTypeClass = (type: number) => {
    if (type === 0) return "type-exam";
    if (type === 1) return "type-lab";
    if (type === 2) return "type-other";
    return "type-unset";
  };

  const getTypeLabel = (type: number) => {
    if (type === 0) return "Exam";
    if (type === 1) return "Lab";
    if (type === 2) return "Other";
    return "";
  };

  const restoreAssignment = async (assignment: AssignmentStats) => {
    closeAllSlidingItems();

    const dueDate = new Date(assignment.date);
    const now = new Date();

    let restoredDueDate = dueDate;

    if (dueDate.getTime() < now.getTime()) {
      restoredDueDate = new Date(now.getTime() + SIX_DAYS_IN_MS);
    }

    await db.assignments.update(assignment.id, {
      is_done: false,
      is_deleted: false,
      done_at: null,
      deleted_at: null,
      date: restoredDueDate,
    } as any);
  };

  const getDueLabel = (item: AssignmentStats) => {
    if (item.daysUntilDue < 0) return "Overdue";
    if (item.daysUntilDue === 0) return "Due today";
    if (item.daysUntilDue === 1) return "Due tomorrow";
    return `${item.daysUntilDue} days left`;
  };

  const getHistoryLabel = (item: AssignmentStats) => {
    if (item.isDeleted) {
      return `Deleted: ${getHistoryDate(item).toLocaleDateString()}`;
    }

    return `Completed: ${getHistoryDate(item).toLocaleDateString()}`;
  };

  const ModalAssignment = () => {
    return currentAssignment ? (
      <IonContent className="ion-padding stats-modal-content">
        <AssignmentCard assignment={currentAssignment} />
        <TaskList assignmentId={currentAssignment.id} readOnly />
      </IonContent>
    ) : null;
  };

  const [presentAssignment] = useIonModal(ModalAssignment);

  const openAssignment = (id: number) => {
    if (!assignments) return;

    const found = assignments.find((assignment: any) => assignment.id === id);
    if (!found) return;

    setCurrentAssignment(found);

    presentAssignment({
      initialBreakpoint: 0.5,
      breakpoints: [0, 0.5, 0.75, 1],
    });
  };

  const renderModuleChip = (item: AssignmentStats) => {
    if (!item.subjectName) return null;

    return (
      <IonNote
        className="stats-module-note"
        style={
          {
            "--module-color": item.subjectColor || "#c7a8ff",
          } as React.CSSProperties
        }
      >
        <span>{item.subjectName}</span>
      </IonNote>
    );
  };

  const renderTypeChip = (item: AssignmentStats) => {
    const typeLabel = getTypeLabel(item.type);
    if (!typeLabel) return null;

    return <IonNote className="stats-type-note">{typeLabel}</IonNote>;
  };

  const renderChips = (item: AssignmentStats) => (
    <div className="stats-card-footer">
      {renderTypeChip(item)}
      {renderModuleChip(item)}
    </div>
  );

  const renderProgress = (item: AssignmentStats) => (
    <div className="stats-card-progress">
      <IonProgressBar value={item.progress} className="stats-progress-bar" />

      <div className="row small stats-task-line">
        <span>
          {item.completedTasks}/{item.totalTasks} tasks
        </span>
        <span>{Math.round(item.progress * 100)}%</span>
      </div>
    </div>
  );

  const renderAssignmentCard = (
    item: AssignmentStats,
    extraLabel?: string,
    statusPill?: React.ReactNode
  ) => (
    <div
      key={item.id}
      className={`stats-assignment-card ${getTypeClass(item.type)}`}
      onClick={() => openAssignment(item.id)}
    >
      <div className="stats-card-header">
        <div>
          <h3>{item.title}</h3>
          <p>{extraLabel ?? getDueLabel(item)}</p>
        </div>

        {statusPill ?? (
          <span
            className={`due-date-badge ${
              item.daysUntilDue < 0 ? "overdue-badge" : ""
            }`}
          >
            {item.daysUntilDue < 0 ? "Overdue" : `${item.daysUntilDue}d`}
          </span>
        )}
      </div>

      {renderProgress(item)}
      {renderChips(item)}
    </div>
  );

  const renderHistoryCard = (item: AssignmentStats) => (
    <IonItemSliding
      key={`${item.isDeleted ? "deleted" : "done"}-${item.id}`}
      ref={(element) => {
        if (element) {
          slidingRefs.current.set(item.id, element);
        } else {
          slidingRefs.current.delete(item.id);
        }
      }}
      className="stats-sliding-item"
    >
      <IonItem
        button
        detail={false}
        className={`stats-history-item ${getTypeClass(item.type)}`}
        onClick={() => openAssignment(item.id)}
      >
        <IonLabel>
          <div className="stats-card-header">
            <div>
              <h3>{item.title}</h3>
              <p>{getHistoryLabel(item)}</p>
            </div>

            <span
              className={`stats-status-pill ${
                item.isDeleted ? "deleted" : "done"
              }`}
            >
              {item.isDeleted ? "Deleted" : "Done"}
            </span>
          </div>

          {renderProgress(item)}
          {renderChips(item)}
        </IonLabel>
      </IonItem>

      <IonItemOptions side="end">
        <IonItemOption
          className="restore-option"
          onClick={() => restoreAssignment(item)}
        >
          <div className="restore-button">
            <IonIcon icon={arrowUndo} />
          </div>
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );

  return (
    <IonPage>
      <Header title="Statistics" />

      <IonContent className="ion-padding stats-page" forceOverscroll={false}>
        <div className="top-tabs">
          {(["overview", "assignments", "history"] as StatsView[]).map(
            (tabValue) => (
              <button
                key={tabValue}
                className={`tab-btn ${view === tabValue ? "active" : ""}`}
                onClick={() => {
                  closeAllSlidingItems();
                  setView(tabValue);
                }}
              >
                {tabValue === "assignments"
                  ? "Active"
                  : tabValue.charAt(0).toUpperCase() + tabValue.slice(1)}
              </button>
            )
          )}
        </div>

        {view === "overview" && (
          <>
            <div className="overview">
              <h1>{Math.round(overall * 100)}%</h1>
              <p>
                {doneTasks} / {totalTasks} tasks completed
              </p>
              <IonProgressBar value={overall} className="stats-progress-bar" />
            </div>

            <IonGrid className="mini-stats">
              <IonRow>
                <IonCol size="6">
                  <div className="mini-card pastel-blue">
                    <h2>{active.length}</h2>
                    <span>Active</span>
                  </div>
                </IonCol>

                <IonCol size="6">
                  <div className="mini-card pastel-green">
                    <h2>{completed.length}</h2>
                    <span>Completed</span>
                  </div>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol size="6">
                  <div className="mini-card pastel-purple">
                    <h2>{onTrack}</h2>
                    <span>On track</span>
                  </div>
                </IonCol>

                <IonCol size="6">
                  <div className="mini-card pastel-orange">
                    <h2>{urgent}</h2>
                    <span>Urgent</span>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>

            <div className="section">
              <h3>Coming up</h3>

              {nextWeekAssignments.length === 0 && (
                <p className="stats-empty-text">No active assignments.</p>
              )}

              {nextWeekAssignments.map((item) => renderAssignmentCard(item))}
            </div>

            {doneSessions.length > 0 && (
              <div className="section">
                <h3>Study sessions</h3>

                <div className="session-summary-grid">
                  <div className="mini-info-card">
                    <h4>{sessionSummary.thisWeekCount}</h4>
                    <p>This week</p>
                  </div>

                  <div className="mini-info-card">
                    <h4>{formatMinutes(sessionSummary.thisWeekMinutes)}</h4>
                    <p>Total time</p>
                  </div>

                  <div className="mini-info-card">
                    <h4>{formatMinutes(sessionSummary.averageMinutes)}</h4>
                    <p>Average session</p>
                  </div>

                  <div className="mini-info-card">
                    <h4>{formatMinutes(sessionSummary.longestMinutes)}</h4>
                    <p>Longest session</p>
                  </div>
                </div>
              </div>
            )}

            {questionnaireTrend.length > 0 && (
              <div className="section">
                <h3>Daily rhythm</h3>

                <div className="questionnaire-card">
                  <div className="questionnaire-summary-row">
                    <div className="questionnaire-mini-stat">
                      <span>Average readiness</span>
                      <strong>{rhythmSummary.averageReadiness}%</strong>
                    </div>

                    <div className="questionnaire-mini-stat">
                      <span>Average sleep</span>
                      <strong>{rhythmSummary.averageSleep} h</strong>
                    </div>

                    <div className="questionnaire-mini-stat">
                      <span>Best recent day</span>
                      <strong>{rhythmSummary.bestRecentDay || "-"}</strong>
                    </div>

                    <div className="questionnaire-mini-stat">
                      <span>Suggested session</span>
                      <strong>
                        {rhythmSummary.averageRecommendedMinutes != null
                          ? `${rhythmSummary.averageRecommendedMinutes} min`
                          : "-"}
                      </strong>
                    </div>
                  </div>

                  <div className="chart-wrap">
                    <MiniLineChart
                      data={questionnaireTrend.map((point) => ({
                        label: point.label,
                        value: point.readiness,
                      }))}
                    />
                  </div>

                  <div className="chart-caption">
                    Based on {questionnaireTrend.length} questionnaire day
                    {questionnaireTrend.length !== 1 ? "s" : ""}
                    {rhythmSummary.latest
                      ? ` • Latest readiness ${rhythmSummary.latest.readiness}%`
                      : ""}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {view === "assignments" && (
          <div className="list">
            {sortedActive.length === 0 && (
              <p className="stats-empty-text">No active assignments.</p>
            )}

            {groupedActive.map((dateGroup) => (
              <section key={dateGroup.key} className="active-date-group">
                <h3 className="active-date-title">{dateGroup.label}</h3>

                {dateGroup.modules.map((moduleGroup) => (
                  <div key={`${dateGroup.key}-${moduleGroup.key}`}>
                    {moduleGroup.assignments.length > 0 && (
                      <h4 className="active-module-title">
                        {moduleGroup.label}
                      </h4>
                    )}

                    {moduleGroup.assignments.map((item) =>
                      renderAssignmentCard(item)
                    )}
                  </div>
                ))}
              </section>
            ))}
          </div>
        )}

        {view === "history" && (
          <div className="list">
            <button
              type="button"
              className={`history-deleted-button ${
                showDeletedHistory ? "active" : ""
              }`}
              onClick={() => {
                closeAllSlidingItems();
                setShowDeletedHistory((prev) => !prev);
              }}
            >
              {showDeletedHistory
                ? "Hide deleted"
                : `Show deleted (${deleted.length})`}
            </button>

            {showDeletedHistory && (
              <section className="history-major-section">
                <h2 className="history-major-title">Deleted</h2>

                {deletedHistoryItems.length === 0 ? (
                  <p className="stats-empty-text">No deleted assignments.</p>
                ) : (
                  groupedDeletedHistory.map(([groupLabel, groupItems]) => (
                    <section
                      key={`deleted-${groupLabel}`}
                      className="history-group"
                    >
                      <h3 className="history-group-title">{groupLabel}</h3>

                      <IonList lines="none" className="history-list">
                        {groupItems.map((item) => renderHistoryCard(item))}
                      </IonList>
                    </section>
                  ))
                )}
              </section>
            )}

            {showDeletedHistory && completedHistoryItems.length > 0 && (
              <div className="history-separator" />
            )}

            <section className="history-major-section">
              <h2 className="history-major-title">Completed</h2>

              {completedHistoryItems.length === 0 ? (
                <p className="stats-empty-text">No completed assignments yet.</p>
              ) : (
                groupedCompletedHistory.map(([groupLabel, groupItems]) => (
                  <section
                    key={`completed-${groupLabel}`}
                    className="history-group"
                  >
                    <h3 className="history-group-title">{groupLabel}</h3>

                    <IonList lines="none" className="history-list">
                      {groupItems.map((item) => renderHistoryCard(item))}
                    </IonList>
                  </section>
                ))
              )}
            </section>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

function MiniLineChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  if (!data.length) return null;

  const width = 100;
  const height = 42;
  const paddingX = 4;
  const paddingY = 5;

  const max = Math.max(...data.map((item) => item.value), 100);
  const min = Math.min(...data.map((item) => item.value), 0);

  const points = data.map((item, index) => {
    const x =
      data.length === 1
        ? width / 2
        : paddingX + (index / (data.length - 1)) * (width - paddingX * 2);

    const y =
      height -
      paddingY -
      ((item.value - min) / Math.max(max - min, 1)) *
        (height - paddingY * 2);

    return { x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    height - paddingY
  } L ${points[0].x} ${height - paddingY} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="chart-svg"
      preserveAspectRatio="none"
    >
      <path d={areaPath} className="chart-area" />
      <path d={linePath} className="chart-line" />

      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="1.8"
          className="chart-point"
        />
      ))}
    </svg>
  );
}

function getHistoryDate(item: AssignmentStats) {
  return item.deletedAt ?? item.doneAt ?? new Date(item.date);
}

function getMonthYearLabel(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function groupHistoryByMonth(items: AssignmentStats[]) {
  const groups: Record<string, AssignmentStats[]> = {};

  items.forEach((item) => {
    const key = getMonthYearLabel(getHistoryDate(item));

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(item);
  });

  return Object.entries(groups);
}

function getDateKey(date: Date | string) {
  const parsed = new Date(date);
  parsed.setHours(0, 0, 0, 0);
  return parsed.toISOString().slice(0, 10);
}

function getDueGroupLabel(item: AssignmentStats) {
  if (item.daysUntilDue < 0) return "Overdue";
  if (item.daysUntilDue === 0) return "Today";
  if (item.daysUntilDue === 1) return "Tomorrow";

  return new Date(item.date).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getWeekStart(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);

  return start;
}

function sleepHoursToScore(hours: number) {
  if (hours <= 0) return 1;

  const distance = Math.abs(hours - 8);
  return clamp(5 - distance, 1, 5);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function formatMinutes(minutes: number) {
  if (!minutes || minutes <= 0) return "0m";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;

  return `${mins}m`;
}

function getExpectedProgress(startDate: Date | null, dueDate: Date) {
  const now = new Date().getTime();
  const due = new Date(dueDate).getTime();

  if (!startDate) {
    const daysLeft = Math.ceil((due - now) / 86400000);

    if (daysLeft > 7) return 0.2;
    if (daysLeft > 3) return 0.45;
    if (daysLeft > 1) return 0.7;

    return 0.9;
  }

  const start = new Date(startDate).getTime();

  if (due <= start) return 1;

  const total = due - start;
  const elapsed = clamp((now - start) / total, 0, 1);

  return elapsed;
}

export default Tab2;