import {
  IonContent,
  IonPage,
  IonProgressBar,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  useIonModal,
} from '@ionic/react';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import './Tab2.css';

import AssignmentCard from '../components/AssignmentCard';
import TaskList from '../components/TaskList';
import { Header } from '../components/Header';

interface AssignmentStats {
  id: number;
  title: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
  daysUntilDue: number;
  type: number;
  date: Date;
}

const Tab2: React.FC = () => {
  const [view, setView] = useState<'overview' | 'assignments' | 'history'>('overview');
  const [stats, setStats] = useState<AssignmentStats[]>([]);
  const [currentAssignment, setCurrentAssignment] = useState<any>();

  const assignments = useLiveQuery(() => db.assignments.toArray(), []);
  const tasks = useLiveQuery(() => db.tasks.toArray(), []);

  useEffect(() => {
    if (!assignments || !tasks) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data: AssignmentStats[] = assignments.map(a => {
      const t = tasks.filter(x => x.fk_assignment === a.id);
      const done = t.filter(x => x.is_done).length;
      const total = t.length;
      const progress = total === 0 ? 0 : done / total;

      const due = new Date(a.date);
      due.setHours(0, 0, 0, 0);

      const days = Math.ceil((due.getTime() - today.getTime()) / 86400000);

      return {
        id: a.id,
        title: a.title,
        totalTasks: total,
        completedTasks: done,
        progress,
        daysUntilDue: days,
        type: a.assignment_type,
        date: a.date,
      };
    });

    setStats(data.sort((a, b) => a.daysUntilDue - b.daysUntilDue));
  }, [assignments, tasks]);

  const active = stats.filter(s => s.progress < 1);
  const completed = stats.filter(s => s.progress === 1);

  const totalTasks = stats.reduce((s, x) => s + x.totalTasks, 0);
  const doneTasks = stats.reduce((s, x) => s + x.completedTasks, 0);
  const overall = totalTasks === 0 ? 0 : doneTasks / totalTasks;

  const urgent = active.filter(s => s.daysUntilDue <= 3 && s.progress < 0.7).length;
  const onTrack = active.filter(s => s.daysUntilDue > 3 && s.progress >= 0.3).length;

  const getTypeClass = (type: number) => {
    if (type === 0) return 'type-exam';
    if (type === 1) return 'type-lab';
    return 'type-other';
  };

  const ModalAssignment = () => {
    return currentAssignment ? (
      <IonContent className="ion-padding">
        <AssignmentCard assignment={currentAssignment} />
        <TaskList assignmentId={currentAssignment.id} readOnly />
      </IonContent>
    ) : null;
  };

  const [presentAssignment] = useIonModal(ModalAssignment);

  const openAssignment = (id: number) => {
    if (!assignments) return;
    const found = assignments.find(a => a.id === id);
    if (!found) return;

    setCurrentAssignment(found);

    presentAssignment({
      initialBreakpoint: 0.5,
      breakpoints: [0, 0.5, 0.75, 1],
    });
  };

  return (
    <IonPage>
      <Header title='Statistics'/>
      <IonContent className="ion-padding" forceOverscroll={false}>

        {/* TABS */}
        <div className="top-tabs">
          {['overview', 'assignments', 'history'].map(v => (
            <button
              key={v}
              className={`tab-btn ${view === v ? 'active' : ''}`}
              onClick={() => setView(v as any)}
            >
              {v === 'assignments' ? 'Active' : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {view === 'overview' && (
          <>
            <div className="overview">
              <h1>{Math.round(overall * 100)}%</h1>
              <p>{doneTasks} / {totalTasks} tasks completed</p>
              <IonProgressBar value={overall} color="medium" />
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

              {active.slice(0, 3).map(a => (
                <div
                  key={a.id}
                  className={`coming-card ${getTypeClass(a.type)}`}
                  onClick={() => openAssignment(a.id)}
                >
                  <div className="coming-left">
                    <h4>{a.title}</h4>
                    <div className="due-date">
                      <span className="due-label">Due: </span>
                      <span className={a.daysUntilDue <= 0 ? 'overdue' : ''}>
                        {a.daysUntilDue <= 0 
                          ? 'Overdue' 
                          : `${a.daysUntilDue} day${a.daysUntilDue !== 1 ? 's' : ''} left`}
                      </span>
                    </div>
                  </div>

                  <div className="coming-right">
                    <div className="progress-text">
                      {Math.round(a.progress * 100)}%
                    </div>
                    <IonProgressBar value={a.progress} color="medium" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ACTIVE */}
        {view === 'assignments' && (
          <div className="list">
            {active.map(a => (
              <IonCard
                key={a.id}
                className={`assignment ${getTypeClass(a.type)}`}
                button
                onClick={() => openAssignment(a.id)}
              >
                <IonCardContent>
                  <div className="row">
                    <h3>{a.title}</h3>
                    <span className="due-date-badge">
                      {a.daysUntilDue <= 0 ? 'Overdue' : `${a.daysUntilDue}d`}
                    </span>
                  </div>

                  <IonProgressBar value={a.progress} color="medium" />

                  <div className="row small">
                    <span>{a.completedTasks}/{a.totalTasks} tasks</span>
                    <span>{Math.round(a.progress * 100)}%</span>
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}

        {/* HISTORY */}
        {view === 'history' && (
          <div className="list">
            {completed.map(a => (
              <IonCard
                key={a.id}
                className={`assignment completed ${getTypeClass(a.type)}`}
                button
                onClick={() => openAssignment(a.id)}
              >
                <IonCardContent>
                  <h3>{a.title}</h3>
                  <div className="history-details">
                    <p>{a.totalTasks} tasks completed</p>
                    {a.date && (
                      <p className="completed-date">
                        Completed: {new Date(a.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}

      </IonContent>
    </IonPage>
  );
};

export default Tab2;