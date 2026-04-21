import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonAlert,
  IonButton,
  useIonViewWillLeave,
  useIonViewWillEnter
} from '@ionic/react';
import './Session.css';
import TaskList from '../components/TaskList';
import { useState, useEffect, Dispatch, SetStateAction, useRef } from 'react';
import { RouteComponentProps } from 'react-router';
import QuestionnaireModal from '../forms/QuestionnaireModal';
import { db } from '../db/db';
import BreakTypeSelector from '../components/BreakTypeSelector';
import { getBreakMinutesFromStudy } from '../data/breakSuggestions';

export function Timer({
  studyMinutes,
  breakMinutes,
  mode,
  setMode,
  assignmentId,
  onOpenMentalTest,
  onBreakStarted,
  onGoHome
}: {
  studyMinutes: number;
  breakMinutes: number;
  mode: 'study' | 'break';
  setMode: Dispatch<SetStateAction<'study' | 'break'>>;
  assignmentId: number;
  onOpenMentalTest: () => void;
  onBreakStarted: () => void;
  onGoHome: () => void;
}) {
  const studySeconds = studyMinutes * 60;
  const breakSeconds = breakMinutes * 60;

  const [time, setTime] = useState(studySeconds);
  const [running, setRunning] = useState(true);
  const [showExtendAlert, setShowExtendAlert] = useState(false);
  const [showBreakExtendAlert, setShowBreakExtendAlert] = useState(false);
  const [sessionStart, setSessionStart] = useState<Date | null>(new Date());
  const [sessionSaved, setSessionSaved] = useState(false);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setRunning(false);

          if (mode === 'study') {
            handleStudyFinished();
            return 0;
          } else {
            setShowBreakExtendAlert(true);
            return 0;
          }
        }

        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running, mode, studySeconds, breakSeconds]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const startSession = () => setRunning(true);
  const pauseSession = () => setRunning(false);

  const saveStudySession = async () => {
    if (!sessionStart || sessionSaved) return;

    try {
      await db.sessions.add({
        start: sessionStart,
        end: new Date(),
        is_done: true,
        fk_assignment: assignmentId
      });
      setSessionSaved(true);
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const goToBreak = async () => {
    await saveStudySession();
    onBreakStarted();
    setRunning(true);
    setMode('break');
    setTime(breakSeconds);
  };

  const goToStudy = () => {
    setSessionSaved(false);
    setSessionStart(new Date());
    setRunning(true);
    setMode('study');
    setTime(studySeconds);
  };

  const extendStudy = (minutesToAdd: number) => {
    setSessionStart(new Date());
    setSessionSaved(false);
    setMode('study');
    setTime(minutesToAdd * 60);
    setRunning(true);
    setShowExtendAlert(false);
  };

  const extendBreak = (minutesToAdd: number) => {
    setMode('break');
    setTime(minutesToAdd * 60);
    setRunning(true);
    setShowBreakExtendAlert(false);
  };

  const switchToBreak = async () => {
    await saveStudySession();
    onBreakStarted();
    setRunning(true);
    setMode('break');
    setTime(breakSeconds);
  };

  const switchToStudy = () => {
    setSessionStart(new Date());
    setSessionSaved(false);
    setRunning(true);
    setMode('study');
    setTime(studySeconds);
  };

  const finishAndGoHome = async () => {
    await saveStudySession();
    setRunning(false);
    setTime(studySeconds);
    onGoHome();
  };

  const handleStudyFinished = () => {
    saveStudySession();
    setShowExtendAlert(true);
  };

  useIonViewWillLeave(() => {
    if (mode === 'study' && sessionStart) {
      saveStudySession();
    }

    setRunning(false);
    setMode('study');
    setTime(studySeconds);
    setShowExtendAlert(false);
    setShowBreakExtendAlert(false);
  });

  useIonViewWillEnter(() => {
    setRunning(true);
    setMode('study');
    setTime(studySeconds);
    setSessionStart(new Date());
    setSessionSaved(false);
  });

  return (
    <div>
      <h1 className="timer">
        {String(minutes).padStart(2, '0')}:
        {String(seconds).padStart(2, '0')}
      </h1>

      <div className="timer-buttons">
        {!running ? (
          <IonButton fill="outline" className="timer-button" onClick={startSession}>
            Start
          </IonButton>
        ) : (
          <IonButton fill="outline" className="timer-button" onClick={pauseSession}>
            Pause
          </IonButton>
        )}

        {mode === 'study' ? (
          <IonButton fill="outline" className="timer-button" onClick={switchToBreak}>
            Go to break
          </IonButton>
        ) : (
          <IonButton fill="outline" className="timer-button" onClick={switchToStudy}>
            Go to study
          </IonButton>
        )}

        <IonButton
          fill="outline"
          className="timer-button"
          onClick={finishAndGoHome}
        >
          Finish study
        </IonButton>
      </div>

      <IonAlert
        isOpen={showExtendAlert}
        onDidDismiss={() => setShowExtendAlert(false)}
        header="Study session finished"
        message="Do you want to extend the session?"
        buttons={[
          { text: '+5 min', handler: () => extendStudy(5) },
          { text: '+10 min', handler: () => extendStudy(10) },
          { text: '+15 min', handler: () => extendStudy(15) },
          {
            text: 'No thanks',
            role: 'cancel',
            handler: () => {
              setShowExtendAlert(false);
              goToBreak();
            }
          }
        ]}
      />

      <IonAlert
        isOpen={showBreakExtendAlert}
        onDidDismiss={() => setShowBreakExtendAlert(false)}
        header="Break finished"
        message="What would you like to do?"
        cssClass="break-finished-alert"
        buttons={[
          { text: '+1 min', handler: () => extendBreak(1) },
          { text: '+2 min', handler: () => extendBreak(2) },
          { text: '+3 min', handler: () => extendBreak(3) },
          {
            text: 'Start new session',
            handler: () => {
              setShowBreakExtendAlert(false);
              onGoHome();
            }
          }
        ]}
      />
    </div>
  );
}

interface AssignmentViewProps
  extends RouteComponentProps<{ id: string }, any, { studyMinutes?: number }> {}

const Session: React.FC<AssignmentViewProps> = ({ match, location, history }) => {
  const modal = useRef<HTMLIonModalElement>(null);
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [mentalTestTrigger, setMentalTestTrigger] = useState<string | null>(null);
  const [breakResetKey, setBreakResetKey] = useState(0);

  const id = Number(match.params.id);

  const studyMinutes =
    (location.state as { studyMinutes?: number } | undefined)?.studyMinutes ?? 25;

  const breakMinutes = getBreakMinutesFromStudy(studyMinutes);

  const openMentalTest = () => {
    const triggerId = `mental-test-${Date.now()}`;
    setMentalTestTrigger(triggerId);

    setTimeout(() => {
      const btn = document.getElementById(triggerId) as HTMLButtonElement | null;
      btn?.click();
    }, 0);
  };

  const closeMentalTestTrigger = () => {
    setMentalTestTrigger(null);
  };

  const handleBreakStarted = () => {
    setBreakResetKey((prev) => prev + 1);
  };

  const goHome = () => {
    history.push('/tabs/tab3');
  };

  return (
    <IonPage>
      <IonHeader className="session-header">
        <IonToolbar className="session-toolbar">
          <IonTitle>{mode === 'study' ? 'Study time' : 'Break time'}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding session-page">
        <Timer
          studyMinutes={studyMinutes}
          breakMinutes={breakMinutes}
          mode={mode}
          setMode={setMode}
          assignmentId={id}
          onOpenMentalTest={openMentalTest}
          onBreakStarted={handleBreakStarted}
          onGoHome={goHome}
        />

        {mode === 'break' && (
          <BreakTypeSelector
            breakMinutes={breakMinutes}
            resetKey={breakResetKey}
          />
        )}

        {mentalTestTrigger && (
          <>
            <button
              id={mentalTestTrigger}
              type="button"
              style={{ display: 'none' }}
            />
            <QuestionnaireModal
              modal={modal}
              trigger={mentalTestTrigger}
              key={mentalTestTrigger}
              onClosed={closeMentalTestTrigger}
            />
          </>
        )}

        {mode === 'study' && <TaskList assignmentId={id} view="session" />}
      </IonContent>
    </IonPage>
  );
};

export default Session;