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

const MIN_SESSION_MINUTES = 5;

interface SessionProps extends RouteComponentProps<{ id: string }> {} 

const Session: React.FC<SessionProps> = ({ match }) => {
  const [breakResetKey, setBreakResetKey] = useState(0);
  
  const modal = useRef<HTMLIonModalElement>(null);
  const router = useIonRouter()
  const { breakTime, mode, startedAt, pause, setStudyTime, switchToBreak, switchToStudy } = useTimerContext();

  const id = Number(match.params.id);
  const [selectedBreakType, setSelectedBreakType] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [lastBreakId, setLastBreakId] = useState<number | null>(null);

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

  const saveBreak = async () => {
  if (startedAt === undefined) {
    console.error("Failed to save break: Break start time is unknown.");
    return null;
  }

  const end = new Date();

  try {
    const breakId = await db.breaks.add({
      start: startedAt,
      end,
      fk_assignment: id,
      break_type: selectedBreakType,
    });

    return Number(breakId);
  } catch (error) {
    console.error("Failed to save break:", error);
    return null;
  }
};

  const handleSwitchToBreak = async () => {
    setBreakResetKey((prev) => prev + 1);
    await saveStudySession();
    switchToBreak();
  };

  const handleSwitchToStudy = async () => {
  pause();

  const savedBreakId = await saveBreak();
  setLastBreakId(savedBreakId);

  modal.current?.present();
};

  const handleFinishStudying = async () => {
    pause();

    if (mode === "study") {
      await saveStudySession();
    }

    if (mode === "break") {
      await saveBreak();
    }

    router.push("/tabs/tab3");
  };

  const handleGoStudy = () => {
    modal.current?.present()
  };

  const handleQuestionaireCalculated = (calculatedMinutes: number) => {
    setStudyTime(calculatedMinutes * 60)
  }

  const handleQuestionaireClosed = () => {
    setLastBreakId(null);
    switchToStudy();
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
            value={selectedBreakType}
            onChange={setSelectedBreakType}
          />
        )}

        <QuestionnaireModal 
          modal={modal}
          onCalculated={handleQuestionaireCalculated}
          onClosed={handleQuestionaireClosed}
          breakId={lastBreakId}
        />

        {mode === 'study' && (
          <TaskList assignmentId={id} view="session" />
        )}
      </IonContent>
    </IonPage>
  );
};

export default Session;