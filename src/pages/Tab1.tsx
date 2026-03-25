import { IonContent, IonFab, IonFabButton, IonFabList, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Tab1.css';
import Calendar from '../components/Calendar';
import { EventInput } from '@fullcalendar/react'
import { useEffect, useMemo, useRef, useState } from 'react';
import { add, remove, pencil, addCircleOutline } from 'ionicons/icons';
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

  const sessions = useMemo(() => {
    if (!lingisEvents) return []

    const freeTimes = lingisEvents.filter(e => e.is_free)
    
    return ScheduleSessions(
      freeTimes,
      timeForAssignments ?? 0,
      sessionTime,
      breakTime(sessionTime),
      work_hours_start,
      work_hours_end
    )

  }, [lingisEvents, timeForAssignments, sessionTime, now, work_hours_start, work_hours_end])

  const calendarEvents = useMemo(() => {

    if (!lingisEvents) return []

    const freeEvents = freeTimesToCalendarEvents(lingisEvents)
    const sessionEvents = isEditing ? [] : sessionsToCalendarEvents(sessions)

    return [
      ...freeEvents,
      ...sessionEvents
    ]

  }, [lingisEvents, sessions, isEditing])

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
      <IonPage>
        <IonHeader>
          <IonToolbar>
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
            weekendsVisible={true}
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