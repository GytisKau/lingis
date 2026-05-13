import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  IonContent,
  IonPage,
  IonButton,
  IonModal,
  IonIcon,
  IonProgressBar,
  useIonRouter
} from '@ionic/react';
import { close, add } from 'ionicons/icons';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import './Tab3.css';
import TipsCarousel from '../components/TipsCarousel';
import DailyLearningTip from '../components/DailyLearningTip';
import { useLocation } from 'react-router';
import { Header } from '../components/Header';
import { useTimerContext } from '../context/TimerContext';
import AddAssignmentModal from '../forms/AddAssignmentModal';

type SessionPickerAssignment = {
  id: number;
  title: string;
  date: Date;
  startDate: Date | null;
  type: number;
  subjectName: string;
  subjectColor: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
};

const getAssignmentTypeLabel = (type: number) => {
  if (type === 0) return 'Exam';
  if (type === 1) return 'Lab';
  if (type === 2) return 'Other';
  return '';
};

const getAssignmentTypeClass = (type: number) => {
  if (type === 0) return 'session-pick-card-exam';
  if (type === 1) return 'session-pick-card-lab';
  if (type === 2) return 'session-pick-card-other';
  return 'session-pick-card-unset';
};

const getDaysUntilDue = (dateValue: string | Date) => {
  const today = new Date();
  const dueDate = new Date(dateValue);

  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);
};

const getDueText = (dateValue: string | Date) => {
  const days = getDaysUntilDue(dateValue);

  if (days < 0) {
    return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`;
  }

  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';

  return `Due in ${days} days`;
};

const Tab3: React.FC = () => {
  const pickerModal = useRef<HTMLIonModalElement>(null);
  const location = useLocation<{ openAssignmentPicker?: boolean }>();
  const router = useIonRouter();

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);

  const { startedAt, activeAssignmentId } = useTimerContext();

  const hasActiveSession = Boolean(startedAt && activeAssignmentId);

  const assignments =
    useLiveQuery(async () => {
      const allAssignments = await db.assignments.toArray();
      const allTasks = await db.tasks.toArray();
      const allSubjects = await db.subjects.toArray();

      const today = new Date();
      const todayTime = today.getTime();

      return allAssignments
        .filter((assignment) => {
          const anyAssignment = assignment as any;
          const deadline = new Date(assignment.date);

          return (
            !assignment.is_done &&
            !anyAssignment.is_deleted &&
            !anyAssignment.deleted_at &&
            today <= deadline
          );
        })
        .map((assignment) => {
          const anyAssignment = assignment as any;

          const assignmentTasks = allTasks.filter(
            (task: any) => task.fk_assignment === assignment.id
          );

          const completedTasks = assignmentTasks.filter(
            (task: any) => task.is_done
          ).length;

          const totalTasks = assignmentTasks.length;
          const progress = totalTasks === 0 ? 0 : completedTasks / totalTasks;

          const subject = allSubjects.find(
            (subjectItem: any) =>
              subjectItem.id === Number(anyAssignment.fk_subject)
          );

          return {
            id: assignment.id!,
            title: assignment.title,
            date: new Date(assignment.date),
            startDate: anyAssignment.start_date
              ? new Date(anyAssignment.start_date)
              : null,
            type: anyAssignment.assignment_type ?? -1,
            subjectName: subject?.name ?? '',
            subjectColor: subject?.color ?? '',
            totalTasks,
            completedTasks,
            progress
          } as SessionPickerAssignment;
        })
        .sort((a, b) => {
          const aStart = a.startDate?.getTime() ?? -Infinity;
          const aDeadline = a.date.getTime();

          const bStart = b.startDate?.getTime() ?? -Infinity;
          const bDeadline = b.date.getTime();

          const aExpectedNow = todayTime >= aStart && todayTime <= aDeadline;
          const bExpectedNow = todayTime >= bStart && todayTime <= bDeadline;

          if (aExpectedNow && !bExpectedNow) return -1;
          if (!aExpectedNow && bExpectedNow) return 1;

          return aDeadline - bDeadline;
        });
    }, []) ?? [];

  const username = useLiveQuery(async () => {
    const users = await db.users.toArray();
    return users[0]?.username?.trim() || '';
  }, []) ?? '';

  useEffect(() => {
    if (location.state?.openAssignmentPicker) {
      setTimeout(() => {
        setIsPickerOpen(true);
        window.history.replaceState({}, document.title);
      }, 100);
    }
  }, [location.state]);

  const handleStartButtonClick = () => {
    if (hasActiveSession && activeAssignmentId) {
      router.push(`/tabs/tab3/session/${activeAssignmentId}`);
      return;
    }

    setIsPickerOpen(true);
  };

  const openSessionSetup = (assignmentId: number) => {
    setIsPickerOpen(false);
    router.push(`/tabs/tab3/viewsession/${assignmentId}`);
  };

  const openAddAssignmentModal = () => {
    setIsPickerOpen(false);

    setTimeout(() => {
      setIsAddAssignmentOpen(true);
    }, 150);
  };

  const handleAssignmentAdded = (assignmentId: number) => {
    setIsAddAssignmentOpen(false);
    router.push(`/tabs/tab3/viewsession/${assignmentId}`);
  };

  return (
    <IonPage>
      <Header title={username ? `Hello, ${username}` : 'Hello'} />

      <IonContent className="tab3-page" forceOverscroll={false}>
        <div id="home-tips">
          <DailyLearningTip />

          <TipsCarousel />
        </div>

        <div className="start-session-wrap">
          <IonButton
            id="start-session-button"
            className={`start-session-button ${hasActiveSession ? 'continue-session-button' : ''}`}
            onClick={handleStartButtonClick}
          >
            {hasActiveSession ? 'Continue session' : 'Start session'}
          </IonButton>
        </div>

        <IonModal
          ref={pickerModal}
          isOpen={isPickerOpen}
          onDidDismiss={() => setIsPickerOpen(false)}
          className="session-picker-popover"
        >
          <div className="session-picker-shell">
            <button
              type="button"
              className="session-picker-close"
              onClick={() => setIsPickerOpen(false)}
              aria-label="Close session picker"
            >
              <IonIcon icon={close} />
            </button>

            <h2 className="session-picker-title">Pick an assignment</h2>

            <div id="session-picker-list" className="session-picker-list">
              {assignments.length === 0 && (
                <p className="session-picker-empty">
                  No active assignments yet. Add one to start studying.
                </p>
              )}

              {assignments.map((assignment, index) => {
                const typeLabel = getAssignmentTypeLabel(assignment.type);
                const showProgress =
                  assignment.completedTasks > 0 &&
                  assignment.totalTasks > 0;

                return (
                  <button
                    key={assignment.id}
                    type="button"
                    className={`session-pick-card ${getAssignmentTypeClass(assignment.type)}`}
                    onClick={() => openSessionSetup(assignment.id)}
                  >
                    {index === 0 && (
                      <span className="session-pick-recommended">
                        Recommended
                      </span>
                    )}

                    <div className="session-pick-top">
                      <div>
                        <h3>{assignment.title}</h3>
                        <p>{getDueText(assignment.date)}</p>
                      </div>

                      <span
                        className={`session-due-badge ${
                          getDaysUntilDue(assignment.date) < 0
                            ? 'session-overdue-badge'
                            : ''
                        }`}
                      >
                        {getDaysUntilDue(assignment.date) < 0
                          ? 'Overdue'
                          : `${getDaysUntilDue(assignment.date)}d`}
                      </span>
                    </div>

                    {showProgress && (
                      <div className="session-pick-progress">
                        <IonProgressBar value={assignment.progress} />

                        <div className="session-pick-task-line">
                          <span>
                            {assignment.completedTasks}/{assignment.totalTasks} tasks
                          </span>
                          <span>{Math.round(assignment.progress * 100)}%</span>
                        </div>
                      </div>
                    )}

                    {(typeLabel || assignment.subjectName) && (
                      <div className="session-pick-footer">
                        {typeLabel && (
                          <span className="session-pick-chip">
                            {typeLabel}
                          </span>
                        )}

                        {assignment.subjectName && (
                          <span
                            className="session-pick-chip session-pick-module-chip"
                            style={
                              {
                                '--module-color':
                                  assignment.subjectColor || '#c7a8ff'
                              } as CSSProperties
                            }
                          >
                            {assignment.subjectName}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}

              <IonButton
                id="session-add-assignment-button"
                className="session-add-assignment-button"
                fill="clear"
                onClick={openAddAssignmentModal}
              >
                <IonIcon icon={add} slot="start" />
                Add assignment
              </IonButton>
            </div>
          </div>
        </IonModal>

        <AddAssignmentModal
          isOpen={isAddAssignmentOpen}
          onDidDismiss={() => setIsAddAssignmentOpen(false)}
          onAssignmentAdded={handleAssignmentAdded}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab3;