import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonFabList, IonHeader, IonIcon, IonItem, IonLabel, IonMenu, IonMenuButton, IonPage, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import './Tab1.css';
import Calendar from '../components/Calendar';
import { EventInput, formatDate } from '@fullcalendar/react'
import { useEffect, useMemo, useRef, useState } from 'react';
import { add, remove, pencil, trash, addCircleOutline } from 'ionicons/icons';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { LingisEvent, Session} from '../db/db';
import ScheduleSessions, { RecommendedSession } from '../utils/ScheduleSessions';
import FreeTimeModal from '../components/FreeTimeModal';
import { useAuth } from '../hooks/useAuth';
import { FeaturesInput, Recommendation } from '../utils/Recommendation';

const Tab1: React.FC = () => {
  const {logout} = useAuth()
  const fabRef = useRef<HTMLIonFabElement>(null)
  const [now, setNow] = useState(new Date())
  const [weekendsVisible, setWeekendsVisible] = useState(true)
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(true);
  const lingisEvents = useLiveQuery( async () => await db.events.toArray(), [])
  const timeForAssignments = useLiveQuery( async () => {
    const assignments = await db.assignments.toArray()
    return assignments.reduce((total, a) => total + a.est_hours, 0)
  }, [])
  const user = useLiveQuery( async () => { 
    return (await db.users.toArray())[0]
  }, [])

  const sessionTime = user?.preffered_session_time ?? 60
  const work_hours_start = user?.work_hours_start ?? 0
  const work_hours_end = user?.work_hours_end ?? 24

  const breakTime = (sessionTime: number) => {
    if (sessionTime == 5) return 2
    else if (sessionTime == 10) return 3
    else if (sessionTime == 20) return 5
    else if (sessionTime == 30) return 10
    else if (sessionTime == 60) return 10
    else if (sessionTime == 90) return 15
    else if (sessionTime == 120) return 30
    else return 10
  }

  useEffect(() => {
    const timerID = setInterval(() => {
      const now = new Date()
      const hours = now.getHours()
      if (hours >= work_hours_start && hours < work_hours_end) {
        setNow(now)
      }
    }, 60000)
    
    return () => clearInterval(timerID)
  }, [work_hours_start, work_hours_end])

  const recomendedSessions = useMemo(() => {
    if (!lingisEvents) return []

    const freeTimes = lingisEvents.filter(e => e.is_free)
    
    return ScheduleSessions(
      freeTimes,
      timeForAssignments ?? 0, // timeForAssignment
      sessionTime,  // session length
      breakTime(sessionTime),   // break
      work_hours_start,
      work_hours_end
    )

  }, [lingisEvents, timeForAssignments, sessionTime, now, work_hours_start, work_hours_end])

  const calendarEvents = useMemo(() => {

    if (!lingisEvents) return []

    const freeEvents = freeTimesToCalendarEvents(lingisEvents)
    const sessionEvents = isEditing ? [] : recommendedSessionsToCalendarEvents(recomendedSessions)

    return [
      ...freeEvents,
      ...sessionEvents
    ]

  }, [lingisEvents, recomendedSessions, isEditing])

  const handleWeekendsToggle = () => {
    setWeekendsVisible(!weekendsVisible)
  }

  const handleEditing = (adding: boolean)=> {
    if(isEditing){
      if(isAdding == adding)
        setIsEditing(false)
      else
        setIsAdding(adding)
    } else {
      setIsEditing(true)
      setIsAdding(adding)
    }
  }

  const handleFab = () => {
    if (isEditing){
      setIsEditing(false)
      fabRef.current?.close()
    }
  }

  const runModel = async () => {
    const input: FeaturesInput = {
      motivation: 4,
      mentalTiredness: 2,
      physicalTiredness: 3,
      mentalEnergy: 4,
      emotional: 3,
      physical: 3,
      sleepHours: 6,
      avgSleep: 7,
      avgTheory_code: 3,
      avgPractice_code: 4,
      avgPassive_code: 2,
      avgActive_code: 3,
      effectiveness: 4
    }
    console.log(await Recommendation(input, 'practice'))
  }

  return (
    <>
      <IonMenu contentId="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Instructions</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonItem>
            <IonToggle
              checked={weekendsVisible}
              onIonChange={handleWeekendsToggle}
            >Toggle weekends</IonToggle>
          </IonItem>
          <IonButton onClick={logout} color={'primary'} expand='block'>
            Logout
          </IonButton>
          <IonButton onClick={runModel} color={'primary'} expand='block'>
            Run Model
          </IonButton>
           
        </IonContent>
      </IonMenu>
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton>
              </IonMenuButton>
            </IonButtons>
            <IonTitle>Calendar</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Calendar</IonTitle>
            </IonToolbar>
          </IonHeader>
          <Calendar
            weekendsVisible={weekendsVisible}
            events={calendarEvents}
            editing={isEditing}
            adding={isAdding}
            work_hours_start={work_hours_start}
            work_hours_end={work_hours_end}
          />
          <IonFab ref={fabRef} slot="fixed" vertical="bottom" horizontal="end">
            <IonFabButton onClick={handleFab}>
              <IonIcon icon={isEditing ? (isAdding ? add : remove) : pencil}></IonIcon>
            </IonFabButton>
            <IonFabList side="top">
              <IonFabButton id="event-form-modal" onClick={() => setIsEditing(false)}>
                <IonIcon icon={addCircleOutline}></IonIcon>
              </IonFabButton>
              <IonFabButton onClick={() => handleEditing(true)} color={isEditing && isAdding ? "primary" : undefined}>
                <IonIcon icon={add}></IonIcon>
              </IonFabButton>
              <IonFabButton onClick={() => handleEditing(false)} color={isEditing && !isAdding ? "primary" : undefined}>
                <IonIcon icon={remove}></IonIcon>
              </IonFabButton>
            </IonFabList>
          </IonFab>

          <FreeTimeModal trigger="event-form-modal" freeTimes={lingisEvents ?? []}/>
        </IonContent>
      </IonPage>
    </>
  );
};


function recommendedSessionsToCalendarEvents(
  sessions: RecommendedSession[]
): EventInput[] {

  return sessions.map((s, i) => ({
    id: `session-${i}`,
    start: s.start,
    end: s.end,
    title: "Session",
    display: "auto"
  }))

}

function freeTimesToCalendarEvents(
  events: LingisEvent[]
): EventInput[] {

  return events
    .filter(e => e.is_free)
    .map(e => ({
      id: `free-${e.id}`,
      title: "Free Time",
      start: e.start,
      end: e.end,
      display: "background",
      color: "#aaaaaa"
    }))

}

export default Tab1;
