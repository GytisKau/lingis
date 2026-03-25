import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonText,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from '@ionic/react'
import './SessionView.css'
import { useHistory, RouteComponentProps } from 'react-router'
import { db } from '../db/db'
import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import QuestionnaireModal from '../forms/QuestionnaireModal'
import TimerDisplay from '../components/TimerDisplay'

interface AssignmentViewProps extends RouteComponentProps<{ id: string }> {}

const SessionView: React.FC<AssignmentViewProps> = ({ match }) => {
  const history = useHistory()
  const id = Number(match.params.id)

  const assignment = useLiveQuery(() => db.assignments.get(id), [id])

  const preferredMinutes = useLiveQuery(
    () => db.users.get(1).then(user => user?.preffered_session_time),
    []
  )

  const [selectedMinutes, setSelectedMinutes] = useState<number>(25)
  
  useEffect(() => {
    if (preferredMinutes !== undefined) {
      setSelectedMinutes(preferredMinutes)
    }
  }, [preferredMinutes])

  const startSession = () => {
    history.push(`/tabs/tab3/session/${id}`, {
      studyMinutes: selectedMinutes
    })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>View Session: {assignment?.title}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <TimerDisplay minutes={selectedMinutes} />

        <IonSegment
          value={String(selectedMinutes)}
          onIonChange={(e) => setSelectedMinutes(Number(e.detail.value))}
        >
          <IonSegmentButton value="5">
            <IonLabel>5</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="25">
            <IonLabel>25</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="45">
            <IonLabel>45</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="60">
            <IonLabel>60</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="90">
            <IonLabel>90</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <div className="session-buttons">
          <IonButton id="mental-test" color="coral" className="session-button">
            Mental test
          </IonButton>

          <IonButton
            onClick={startSession}
            id="start-session"
            color="coral"
            className="session-button"
          >
            Start session
          </IonButton>

          <QuestionnaireModal trigger="mental-test" />
        </div>
      </IonContent>
    </IonPage>
  )
}

export default SessionView