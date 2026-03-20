import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonFabList, IonHeader, IonIcon, IonItem, IonLabel, IonMenu, IonMenuButton, IonPage, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import './Tab1.css';
import Calendar from '../components/Calendar';
import { EventInput, formatDate } from '@fullcalendar/react'
import { useEffect, useMemo, useRef, useState } from 'react';
import { add, remove, pencil, trash, addCircleOutline } from 'ionicons/icons';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { LingisEvent, Session} from '../db/db';
import ScheduleSessions from '../utils/ScheduleSessions';
import FreeTimeModal from '../components/FreeTimeModal';
import { useAuth } from '../hooks/useAuth';

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
  const sessionTime = useLiveQuery( async () => {
    const users = await db.users.toArray()
    return users[0].preffered_session_time
  }, [])

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
    var timerID = setInterval(() => setNow(new Date()), 60000);

    return () => clearInterval(timerID);
  });

  const sessions = useMemo(() => {
    if (!lingisEvents) return []

    const freeTimes = lingisEvents.filter(e => e.is_free)
    
    return ScheduleSessions(
      freeTimes,
      timeForAssignments ?? 0, // timeForAssignment
      sessionTime ?? 60,  // session length
      breakTime(sessionTime ?? 60)   // break
    )

  }, [lingisEvents, timeForAssignments, sessionTime, now])

  const calendarEvents = useMemo(() => {

    if (!lingisEvents) return []

    const freeEvents = freeTimesToCalendarEvents(lingisEvents)
    const sessionEvents = isEditing ? [] : sessionsToCalendarEvents(sessions)

    return [
      ...freeEvents,
      ...sessionEvents
    ]

  }, [lingisEvents, sessions, isEditing])

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


function sessionsToCalendarEvents(
  sessions: Session[]
): EventInput[] {

  return sessions.map((s, i) => ({
    id: `session-${i}`,
    start: s.start,
    end: s.end,
    title: "Session",
    display: "auto",
    backgroundColor: s.is_done ? "#8bc34a" : "#2196f3",
    borderColor: s.is_done ? "#8bc34a" : "#2196f3"
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
