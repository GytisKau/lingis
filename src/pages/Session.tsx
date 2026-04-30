import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from '@ionic/react';
import './Session.css';
import TaskList from '../components/TaskList';
import { useState, useRef } from 'react';
import { RouteComponentProps, useHistory } from 'react-router';
import QuestionnaireModal from '../forms/QuestionnaireModal';
import BreakTypeSelector from '../components/BreakTypeSelector';
import { BreakLength, getBreakMinutesFromStudy } from '../data/breakSuggestions';
import { Timer } from '../components/Timer';
import { useTimerContext } from '../context/TimerContext';

interface SessionProps
  extends RouteComponentProps<{ id: string }> {}

const Session: React.FC<SessionProps> = ({ match }) => {
  const [mentalTestTrigger, setMentalTestTrigger] = useState<string | null>(null);
  const [breakResetKey, setBreakResetKey] = useState(0);

  
  const modal = useRef<HTMLIonModalElement>(null);
  const { studyTime, breakTime, mode, switchToBreak, switchToStudy } = useTimerContext();
  const router = useIonRouter();

  const id = Number(match.params.id);

  // const openMentalTest = () => {
  //   const triggerId = `mental-test-${Date.now()}`;
  //   setMentalTestTrigger(triggerId);

  //   setTimeout(() => {
  //     const btn = document.getElementById(triggerId) as HTMLButtonElement | null;
  //     btn?.click();
  //   }, 0);
  // };

  // const closeMentalTestTrigger = () => {
  //   setMentalTestTrigger(null);
  // };

  const handleBreakStarted = () => {
    setBreakResetKey((prev) => prev + 1);
    switchToBreak();
  };

  const handleStudyStarted = () => {
    switchToStudy();
  };

  const goHome = () => {
    router.push('/tabs/tab3');
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
          onSwitchToBreak={handleBreakStarted}
          onSwitchToStudy={handleStudyStarted}
          // onFinish={openMentalTest}
          onFinish={() => {}}
          onGoHome={goHome}
        />

        {mode === 'break' && (
          <BreakTypeSelector
            breakMinutes={(breakTime / 60) as BreakLength}
            resetKey={breakResetKey}
          />
        )}

        {/* {mentalTestTrigger && (
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
        )} */}

        {mode === 'study' && (
          <TaskList assignmentId={id} view="session" />
        )}
      </IonContent>
    </IonPage>
  );
};

export default Session;