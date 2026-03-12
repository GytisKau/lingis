import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonFabList, IonHeader, IonIcon, IonItem, IonLabel, IonMenu, IonMenuButton, IonPage, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import './Tab1.css';
import Calendar from '../components/Calendar';
import { EventInput, formatDate } from '@fullcalendar/react'
import { useMemo, useRef, useState } from 'react';
import { add, remove, pencil, trash } from 'ionicons/icons';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { LingisEvent, Session } from '../db/db';
import ScheduleSessions from '../utils/ScheduleSessions';

const Tab1: React.FC = () => {
  const [weekendsVisible, setWeekendsVisible] = useState(true)
  const lingisEvents = useLiveQuery( async () => await db.events.toArray(), [])
  
  const sessions = useMemo(() => {
    if (!lingisEvents) return []

    const freeTimes = lingisEvents.filter(e => e.is_free)

    return ScheduleSessions(
      freeTimes,
      16 * 60, // timeForAssignment
      60,  // session length
      15    // break
    )

  }, [lingisEvents])

  const calendarEvents = useMemo(() => {

    if (!lingisEvents) return []

    const freeEvents = freeTimesToCalendarEvents(lingisEvents)
    const sessionEvents = sessionsToCalendarEvents(sessions)

    return [
      ...freeEvents,
      ...sessionEvents
    ]

  }, [lingisEvents, sessions])

  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(true);

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


  const modal = useRef<HTMLIonModalElement>(null);


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
            <IonLabel>
              <ul>
                <li>Select dates and you will be prompted to create a new event</li>
                <li>Drag, drop, and resize events</li>
                <li>Click an event to delete it</li>
              </ul>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonToggle
              checked={weekendsVisible}
              onIonChange={handleWeekendsToggle}
            >Toggle weekends</IonToggle>
          </IonItem>
          <IonItem>
            <IonLabel>
              <h2>All Events ({calendarEvents.length})</h2>
              <ul>
              {calendarEvents.map((event) => (
                <li key={event.id}>
                  <b>{formatDate(event.start!, {year:'numeric', month:'short', day:'numeric'})}</b>
                  {" "}
                  <i>{event.title ?? "Free Time"}</i>
                </li>
              ))}
              </ul>
            </IonLabel>
          </IonItem>
          <IonButton onClick={() => db.events.where("id").above(0).delete()} color={'danger'} expand='block'>
            Remove all Free Time
            <IonIcon slot="end" icon={trash}></IonIcon>
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
          <IonFab slot="fixed" vertical="bottom" horizontal="end">
            <IonFabButton>
              <IonIcon icon={isEditing ? (isAdding ? add : remove) : pencil}></IonIcon>
            </IonFabButton>
            <IonFabList side="top">
              <IonFabButton onClick={() => handleEditing(true)} color={isEditing && isAdding ? "primary" : undefined}>
                <IonIcon icon={add}></IonIcon>
              </IonFabButton>
              <IonFabButton onClick={() => handleEditing(false)} color={isEditing && !isAdding ? "primary" : undefined}>
                <IonIcon icon={remove}></IonIcon>
              </IonFabButton>
            </IonFabList>
          </IonFab>
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
      start: e.start,
      end: e.end,
      display: "background",
      backgroundColor: "#aaaaaa"
    }))

}

export default Tab1;
