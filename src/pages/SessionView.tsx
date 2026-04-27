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
import { useState, useEffect, useRef } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import QuestionnaireModal from '../forms/QuestionnaireModal'
import TimerDisplay from '../components/TimerDisplay'

interface AssignmentViewProps extends RouteComponentProps<{ id: string }> {}

const SessionView: React.FC<AssignmentViewProps> = ({ match }) => {
  const modal = useRef<HTMLIonModalElement>(null)
  const history = useHistory()
  const id = Number(match.params.id)

  const assignment = useLiveQuery(() => db.assignments.get(id), [id])

  const users = useLiveQuery(() => db.users.toArray())
  const user = users !== undefined ? users[0] : undefined
  const preferredMinutes = user?.preffered_session_time;

  const [selectedMinutes, setSelectedMinutes] = useState<number>(25);
  const [userChangedMinutes, setUserChangedMinutes] = useState(false);

  useEffect(() => {
    if (!userChangedMinutes && preferredMinutes !== undefined) {
      const chosenMinutes = preferredMinutes === 120 ? 90 : preferredMinutes;
      setSelectedMinutes(chosenMinutes);
    }
  }, [preferredMinutes, userChangedMinutes]);

  const startSession = () => {
    history.push(`/tabs/tab3/session/${id}`, {
      studyMinutes: selectedMinutes
    })
  }

  const handleClose = (result: number) => {
    console.log(result)
    setSelectedMinutes(result)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{assignment?.title}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding session-view-page">
        <div className="session-view-container">
          <TimerDisplay minutes={selectedMinutes} />

          <IonSegment
          className="session-segment"
          value={String(selectedMinutes)}
          onIonChange={(e) => {
            setUserChangedMinutes(true);
            setSelectedMinutes(Number(e.detail.value));
          }}
          scrollable={true}
        >
            <IonSegmentButton value="10">
              <IonLabel>10</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="20">
              <IonLabel>20</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="30">
              <IonLabel>30</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="60">
              <IonLabel>60</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="90">
              <IonLabel>90</IonLabel>
            </IonSegmentButton>
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
              user={user}
              onClosed={handleClose}
            />
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default SessionView