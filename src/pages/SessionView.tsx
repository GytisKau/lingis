import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from '@ionic/react'
import './SessionView.css'
import { useHistory, RouteComponentProps } from 'react-router'
import { db } from '../db/db'
import { useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import QuestionnaireModal from '../forms/QuestionnaireModal'
import { TimerDisplay } from '../components/TimerDisplay'
import { useTimerContext } from '../context/TimerContext'

interface AssignmentViewProps extends RouteComponentProps<{ id: string }> {}

const SessionView: React.FC<AssignmentViewProps> = ({ match }) => {
  const modal = useRef<HTMLIonModalElement>(null)
  const history = useHistory()
  const id = Number(match.params.id)

  const assignment = useLiveQuery(() => db.assignments.get(id), [id])

  const { studyTime, setStudyTime, switchToStudy } = useTimerContext();

  const startSession = () => {
    switchToStudy()
    history.push(`/tabs/tab3/session/${id}`)
  }

  const handleQuestionaireCalculated = (calculatedMinutes: number) => {
    setStudyTime(calculatedMinutes * 60)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{assignment?.title}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding session-view-page" forceOverscroll={false}>
        <div className="session-view-container">
          <TimerDisplay time={studyTime} />

          <IonSegment
            className="session-segment"
            value={studyTime/60}
            onIonChange={(e) => setStudyTime(Number(e.detail.value) * 60)}
            scrollable={true}
          >
            {[10, 20, 30, 60, 90].map(t => (
              <IonSegmentButton value={t} key={t}>
                <IonLabel>{t}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>

          <div className="session-buttons">
            <IonButton id="mental-test" className="session-button purple-button">
              Mental test
            </IonButton>

            <IonButton
              onClick={startSession}
              id="start-session"
              className="session-button purple-button"
            >
              Start session
            </IonButton>

            <QuestionnaireModal
              modal={modal}
              trigger="mental-test"
              onCalculated={handleQuestionaireCalculated}
            />
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default SessionView