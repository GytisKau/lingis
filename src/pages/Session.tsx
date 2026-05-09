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
import { db } from '../db/db';
import { Header } from '../components/Header';

const MIN_SESSION_MINUTES = 1;

interface SessionProps extends RouteComponentProps<{ id: string }> {}

const Session: React.FC<SessionProps> = ({ match }) => {
  const [breakResetKey, setBreakResetKey] = useState(0);
  
  const modal = useRef<HTMLIonModalElement>(null);
  const router = useIonRouter()
  const { breakTime, mode, startedAt, pause, setStudyTime, switchToBreak, switchToStudy } = useTimerContext();

  const id = Number(match.params.id);

  const saveStudySession = async () => {
    if(startedAt == undefined){
      console.error("Failed to save session: Session start time is unknown.");
      return;
    }
    const end = new Date();
    const sessionMinutes =
      (end.getTime() - startedAt.getTime()) / 1000 / 60;

    if (sessionMinutes < MIN_SESSION_MINUTES) {
      console.log("Session too short, not saved:", sessionMinutes);
      return;
    }

    try {
      await db.sessions.add({
        start: startedAt,
        end,
        is_done: true,
        fk_assignment: id
      });
    } catch (error) {
      console.error("Failed to save session:", error);
    }
  };

  const handleSwitchToBreak = () => {
    setBreakResetKey((prev) => prev + 1);
    saveStudySession()
    switchToBreak();
  };

  const handleSwitchToStudy = () => {
    pause()
    modal.current?.present()
  };

  const handleFinishStudying = () => {
    pause()
    saveStudySession()
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
      <Header title={mode === 'study' ? 'Study time' : 'Break time'} backButton noTimer></Header>

      <IonContent className="ion-padding session-page" forceOverscroll={false}>
        <Timer
          onSwitchToBreak={handleSwitchToBreak}
          onSwitchToStudy={handleSwitchToStudy}
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