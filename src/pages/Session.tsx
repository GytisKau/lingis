import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import './Session.css';
import TaskList from '../components/TaskList';
import { useState, useRef } from 'react';
import { RouteComponentProps } from 'react-router';
import QuestionnaireModal from '../forms/QuestionnaireModal';
import BreakTypeSelector from '../components/BreakTypeSelector';
import { getBreakMinutesFromStudy } from '../data/breakSuggestions';
import { Timer } from '../components/Timer';
import { useTimerContext } from '../context/TimerContext';

interface SessionProps
  extends RouteComponentProps<{ id: string }, any, { studyMinutes?: number }> {}

const Session: React.FC<SessionProps> = ({ match, location, history }) => {
  const modal = useRef<HTMLIonModalElement>(null);

  const { mode, switchToBreak, switchToStudy } = useTimerContext();

  const [mentalTestTrigger, setMentalTestTrigger] = useState<string | null>(null);
  const [breakResetKey, setBreakResetKey] = useState(0);

  const id = Number(match.params.id);

  const studyMinutes =
    (location.state as { studyMinutes?: number } | undefined)?.studyMinutes ?? 20;

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
    switchToBreak();
  };

  const handleStudyStarted = () => {
    switchToStudy();
  };

  const goHome = () => {
    history.push('/tabs/tab3');
  };

  return (
    <IonPage>
      <IonHeader className="session-header">
        <IonToolbar className="session-toolbar">
          <IonTitle>
            {mode === 'study' ? 'Study time' : 'Break time'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding session-page">
        <Timer
          studyMinutes={studyMinutes}
          breakMinutes={breakMinutes}
          mode={mode}
          onSwitchToBreak={handleBreakStarted}
          onSwitchToStudy={handleStudyStarted}
          onFinish={openMentalTest}
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

        {mode === 'study' && (
          <TaskList assignmentId={id} view="session" />
        )}
      </IonContent>
    </IonPage>
  );
};

export default Session;