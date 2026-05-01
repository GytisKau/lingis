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
import { RouteComponentProps } from 'react-router';
import QuestionnaireModal from '../forms/QuestionnaireModal';
import BreakTypeSelector from '../components/BreakTypeSelector';
import { BreakLength } from '../data/breakSuggestions';
import { Timer } from '../components/Timer';
import { useTimerContext } from '../context/TimerContext';

interface SessionProps extends RouteComponentProps<{ id: string }> {}

const Session: React.FC<SessionProps> = ({ match }) => {
  const [breakResetKey, setBreakResetKey] = useState(0);
  
  const modal = useRef<HTMLIonModalElement>(null);
  const router = useIonRouter()
  const { breakTime, mode, setStudyTime, switchToBreak, switchToStudy } = useTimerContext();

  const id = Number(match.params.id);

  const handleBreakStarted = () => {
    setBreakResetKey((prev) => prev + 1);
    switchToBreak();
  };

  const handleStudyStarted = () => {
    switchToStudy();
  };

  const handleFinishStudying = () => {
    router.push('/tabs/tab3');
  }

  const handleGoStudy = () => {
    modal.current?.present()
  };

  const handleQuestionaireCalculated = (calculatedMinutes: number) => {
    setStudyTime(calculatedMinutes * 60)
  }

  const handleQuestionaireClosed = () => {
    switchToStudy()
  }

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
          onFinishStudying={handleFinishStudying}
          onGoStudy={handleGoStudy}
        />

        {mode === 'break' && (
          <BreakTypeSelector
            breakMinutes={(breakTime / 60) as BreakLength}
            resetKey={breakResetKey}
          />
        )}

        <QuestionnaireModal 
          modal={modal}
          onCalculated={handleQuestionaireCalculated}
          onClosed={handleQuestionaireClosed}
        />

        {mode === 'study' && (
          <TaskList assignmentId={id} view="session" />
        )}
      </IonContent>
    </IonPage>
  );
};

export default Session;