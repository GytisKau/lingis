import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonAlert, IonButton } from '@ionic/react';
import './Session.css';
import TaskList from '../components/TaskList'
import { useState, useEffect } from "react";
import { RouteComponentProps } from 'react-router';
import QuestionnaireModal from '../forms/QuestionnaireModal';

export function Timer({
  studyMinutes,
  breakMinutes,
  mode,
  setMode
}: {
  studyMinutes: number
  breakMinutes: number
  mode: "study" | "break"
  setMode: React.Dispatch<React.SetStateAction<"study" | "break">>
}) {
  const studySeconds = studyMinutes * 60
  const breakSeconds = breakMinutes * 60

  const [time, setTime] = useState(studySeconds)
  const [running, setRunning] = useState(true)
  const [showExtendAlert, setShowExtendAlert] = useState(false)
  const [showBreakExtendAlert, setShowBreakExtendAlert] = useState(false)
  const [openingMentalTest, setOpeningMentalTest] = useState(false)

  const doMentalTest = () => {
  if (openingMentalTest) return

  setOpeningMentalTest(true)
  setShowBreakExtendAlert(false)

  setTimeout(() => {
    document.getElementById("mental-test")?.click()
    setOpeningMentalTest(false)
  }, 0)
}

  useEffect(() => {
    if (!running) return

    const interval = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
        clearInterval(interval)
        setRunning(false)

        if (mode === "study") {
          setShowExtendAlert(true)
          return 0
        } else {
          setShowBreakExtendAlert(true)
          return 0
        }
      }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [running, mode, studySeconds, breakSeconds])

  const minutes = Math.floor(time / 60)
  const seconds = time % 60

  const startSession = () => {
    setRunning(true)
  }

  const pauseSession = () => {
    setRunning(false)
  }

  const goToBreak = () => {
  setRunning(true)
  setMode("break")
  setTime(breakSeconds)
}

  const extendStudy = (minutes: number) => {
  setMode("study")
  setTime(minutes * 60)
  setRunning(true)
  setShowExtendAlert(false)
}

const goToStudy = () => {
  setRunning(true)
  setMode("study")
  setTime(studySeconds)
}

const extendBreak = (minutes: number) => {
  setMode("break")
  setTime(minutes * 60)
  setRunning(true)
  setShowBreakExtendAlert(false)
}

  const resetCurrentSession = () => {
    setRunning(false)
    setTime(mode === "study" ? studySeconds : breakSeconds)
  }

  const switchToBreak = () => {
    setRunning(false)
    setMode("break")
    setTime(breakSeconds)
  }

  const switchToStudy = () => {
    setRunning(false)
    setMode("study")
    setTime(studySeconds)
  }

  return (
    <div>
      <h2>{mode === "study" ? "Study time" : "Break time"}</h2>

      <h1 className="timer">
        {String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
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

        {mode === "study" ? (
          <IonButton fill="outline" className="timer-button" onClick={switchToBreak}>
            Go to break
          </IonButton>
        ) : (
          <IonButton fill="outline" className="timer-button" onClick={switchToStudy}>
            Go to study
          </IonButton>
        )}
      </div>
      <IonAlert
  isOpen={showExtendAlert}
  onDidDismiss={() => setShowExtendAlert(false)}
  header="Study session finished"
  message="Do you want to extend the session?"
  buttons={[
    {
      text: "+5 min",
      handler: () => extendStudy(5)
    },
    {
      text: "+10 min",
      handler: () => extendStudy(10)
    },
    {
      text: "+15 min",
      handler: () => extendStudy(15)
    },
    {
      text: "No thanks",
      role: "cancel",
      handler: () => {
        setShowExtendAlert(false)
        goToBreak()
      }
    }
  ]}
/>
<IonAlert
  isOpen={showBreakExtendAlert}
  onDidDismiss={() => setShowBreakExtendAlert(false)}
  header="Break finished"
  message="What would you like to do?"
  buttons={[
    {
      text: "+1 min",
      handler: () => extendBreak(1)
    },
    {
      text: "+2 min",
      handler: () => extendBreak(2)
    },
    {
      text: "+3 min",
      handler: () => extendBreak(3)
    },
    {
      text: "Do a mental test",
      handler: () => doMentalTest()
    },
    {
      text: "No thanks",
      role: "cancel",
      handler: () => {
        setShowBreakExtendAlert(false)
        goToStudy()
      }
    }
  ]}
/>
    </div>
  )
}

interface AssignmentViewProps extends RouteComponentProps<{ id: string }> {}

const Session: React.FC<AssignmentViewProps> = ({ match }) => {
  const [mode, setMode] = useState<"study" | "break">("study")
  const id = Number(match.params.id)

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Session</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <Timer studyMinutes={1} breakMinutes={1} mode={mode} setMode={setMode} />

        { mode === "study" && (
          <TaskList assignmentId={id} />
        )}
      </IonContent>
    </IonPage>
  )
}

export default Session