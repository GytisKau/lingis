import {
  IonContent,
  IonPage,
  IonIcon,
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
import { close } from 'ionicons/icons';
import { useLiveQuery } from 'dexie-react-hooks';

const MIN_SESSION_MINUTES = 10;

const MAX_DAILY_ADS = 4;
const AD_LIMIT_STORAGE_PREFIX = 'lingis_daily_ads';

type PendingAdAction = 'break' | 'finish' | null;

type DailyAdState = {
  date: string;
  count: number;
};

function getLocalDateKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getStorageKey(userKey: string) {
  return `${AD_LIMIT_STORAGE_PREFIX}_${userKey}`;
}

function readDailyAdState(userKey: string): DailyAdState {
  const today = getLocalDateKey();
  const storageKey = getStorageKey(userKey);

  try {
    const saved = localStorage.getItem(storageKey);

    if (!saved) {
      return {
        date: today,
        count: 0,
      };
    }

    const parsed = JSON.parse(saved) as DailyAdState;

    if (parsed.date !== today) {
      return {
        date: today,
        count: 0,
      };
    }

    return {
      date: parsed.date,
      count: Number(parsed.count) || 0,
    };
  } catch {
    return {
      date: today,
      count: 0,
    };
  }
}

function saveDailyAdState(userKey: string, state: DailyAdState) {
  localStorage.setItem(getStorageKey(userKey), JSON.stringify(state));
}

function getAdUserKey(user: any) {
  return String(
    user?.id ??
    user?.email ??
    user?.username ??
    'local-user'
  );
}

function isPremiumUser(user: any) {
  return Boolean(
    user?.is_premium ||
    user?.isPremium ||
    user?.premium ||
    user?.plan === 'premium' ||
    user?.subscription === 'premium'
  );
}

function reserveDailyAdView(userKey: string, isPremium: boolean) {
  if (isPremium) return false;

  const state = readDailyAdState(userKey);

  if (state.count >= MAX_DAILY_ADS) {
    return false;
  }

  saveDailyAdState(userKey, {
    ...state,
    count: state.count + 1,
  });

  return true;
}

interface SessionProps extends RouteComponentProps<{ id: string }> {}

const Session: React.FC<SessionProps> = ({ match }) => {
  const [breakResetKey, setBreakResetKey] = useState(0);
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [pendingAdAction, setPendingAdAction] = useState<PendingAdAction>(null);

  const modal = useRef<HTMLIonModalElement>(null);
  const router = useIonRouter();

  const users = useLiveQuery(() => db.users.toArray(), []);
  const currentUser = users?.[0];

  const {
    breakTime,
    mode,
    startedAt,
    pause,
    setStudyTime,
    switchToBreak,
    switchToStudy,
    clearActiveSession,
  } = useTimerContext();

  const id = Number(match.params.id);
  const [selectedBreakType, setSelectedBreakType] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [lastBreakId, setLastBreakId] = useState<number | null>(null);

  const saveStudySession = async () => {
    if (startedAt == undefined) {
      console.error('Failed to save session: Session start time is unknown.');
      return;
    }

    const end = new Date();
    const sessionMinutes =
      (end.getTime() - startedAt.getTime()) / 1000 / 60;

    if (sessionMinutes < MIN_SESSION_MINUTES) {
      console.log('Session too short, not saved:', sessionMinutes);
      return;
    }

    try {
      await db.sessions.add({
        start: startedAt,
        end,
        is_done: true,
        fk_assignment: id,
      });
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const shouldShowAdBeforeAction = () => {
    const userKey = getAdUserKey(currentUser);
    const premium = isPremiumUser(currentUser);

    console.log('AD DEBUG:', {
      currentUser,
      userKey,
      premium,
    });

    return reserveDailyAdView(userKey, premium);
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

  const continueToBreak = async () => {
    setBreakResetKey((prev) => prev + 1);
    await saveStudySession();
    switchToBreak();
  };

  const continueToFinish = async () => {
    clearActiveSession();

    if (mode === "study") {
      await saveStudySession();
    }

    if (mode === "break") {
      await saveBreak();
    }

    router.push('/tabs/tab3');
  };

  const runAfterOptionalAd = (action: PendingAdAction) => {
    pause();

    const shouldShowAd = shouldShowAdBeforeAction();

    console.log('AD SHOULD SHOW:', shouldShowAd);

    if (shouldShowAd) {
      setPendingAdAction(action);
      setIsAdOpen(true);
      return;
    }

    if (action === 'break') {
      continueToBreak();
    }

    if (action === 'finish') {
      continueToFinish();
    }
  };

  const handleAdContinue = () => {
    const action = pendingAdAction;

    setIsAdOpen(false);
    setPendingAdAction(null);

    if (action === 'break') {
      continueToBreak();
    }

    if (action === 'finish') {
      continueToFinish();
    }
  };

  const handleSwitchToStudy = async () => {
    pause();

    const savedBreakId = await saveBreak();
    setLastBreakId(savedBreakId);

    modal.current?.present();
  };


  const handleSwitchToBreak = () => {
    runAfterOptionalAd('break');
  };

  const handleFinishStudying = () => {
    runAfterOptionalAd('finish');
  };

  const handleGoStudy = () => {
    modal.current?.present();
  };

  const handleQuestionaireCalculated = (calculatedMinutes: number) => {
    setStudyTime(calculatedMinutes * 60);
  };

  const handleQuestionaireClosed = () => {
    setLastBreakId(null);
    switchToStudy(id);
  };

  return (
    <IonPage>
      <Header
        title={mode === 'study' ? 'Study time' : 'Break time'}
        backButton
        noTimer
      />

      <IonContent className="ion-padding session-page" forceOverscroll={false}>
        <div id="session-controls">
          <Timer
            onSwitchToBreak={handleSwitchToBreak}
            onSwitchToStudy={handleSwitchToStudy}
            onFinishStudying={handleFinishStudying}
            onGoStudy={handleGoStudy}
          />
        </div>

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

      {isAdOpen && (
        <div className="session-ad-overlay">
          <button
            type="button"
            className="session-ad-close"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleAdContinue();
            }}
            aria-label="Close advertisement"
          >
            <IonIcon icon={close} />
          </button>

          <div className="session-ad-card">
            <p className="session-ad-label">Advertisement</p>

            <div className="session-ad-visual">
              <div className="session-ad-sparkle session-ad-sparkle-one" />
              <div className="session-ad-sparkle session-ad-sparkle-two" />
              <div className="session-ad-sparkle session-ad-sparkle-three" />

              <h1>Ad space</h1>
              <p>Your future ad will appear here</p>
            </div>

            <div className="session-ad-text-box">
              <h2>Take a tiny pause</h2>
              <p>
                This space is reserved for non-premium users. Premium users skip ads completely.
              </p>
            </div>
          </div>
        </div>
      )}
    </IonPage>
  );
};

export default Session;