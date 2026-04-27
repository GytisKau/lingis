import { IonContent, IonFab, IonFabButton, IonFabList, IonHeader, IonIcon, IonLabel, IonPage, IonSpinner, IonTitle, IonToolbar, useIonModal } from '@ionic/react';
import './Tab1.css';
import Calendar from '../components/Calendar';
import { EventInput } from '@fullcalendar/react'
import { useEffect, useMemo, useRef, useState } from 'react';
import { add, remove, pencil, addCircleOutline } from 'ionicons/icons';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Assignment, LingisEvent } from '../db/db';
import { RecommendedSession } from '../utils/ScheduleSessions';
import FreeTimeModal from '../components/FreeTimeModal';
import AssignmentCard from '../components/AssignmentCard';
import TaskList from '../components/TaskList';
import ScheduleAllAssignments from '../utils/ScheduleSessions';

const Tab1: React.FC = () => {
  const fabRef = useRef<HTMLIonFabElement>(null)
  const [now, setNow] = useState(new Date())
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(true);

  const [currentAssignment, setCurrentAssignment] = useState<Assignment>();
  const [currentSession, setCurrentSession] = useState<RecommendedSession>();
  
  const lingisEvents = useLiveQuery( async () => await db.events.toArray())
  const assignments = useLiveQuery( async () => await db.assignments.toArray())
  const user = useLiveQuery( async () => (await db.users.toArray())[0])
  const doneSessions = useLiveQuery(async () => await db.sessions.toArray());
  
  const timeForAssignments = assignments?.reduce((total, a) => total + a.est_hours, 0) ?? 0

  useEffect(() => {
    if (!user) return

    const timerID = setInterval(() => {
      const now = new Date()
      const hours = now.getHours()
      if (hours >= user.work_hours_start && hours < user.work_hours_end) {
        setNow(now)
      }
    }, 60000)
    
    return () => clearInterval(timerID)
  }, [user])

  const recomendedSessions = useMemo(() => {
    if (!lingisEvents || !user || !assignments) return []

    const freeTimes = lingisEvents.filter(e => e.is_free)
    
    return ScheduleAllAssignments(
      assignments,
      freeTimes,
      user
    )

  }, [lingisEvents, timeForAssignments, now, user])

  const calendarEvents = useMemo(() => {

    const freeEvents = freeTimesToCalendarEvents(lingisEvents ?? [])
    const sessionEvents = isEditing ? [] : recomendedSessionsToCalendarEvents(recomendedSessions, assignments ?? [])
    const assignmentEvents = assignmentsToCalendarEvents(assignments ?? [])
    const doneSessionEvents = doneSessionsToCalendarEvents(doneSessions ?? [], assignments ?? [])

    return [
      ...freeEvents,
      ...sessionEvents,
      ...doneSessionEvents,
      ...assignmentEvents
    ]

  }, [lingisEvents, recomendedSessions, assignments,  doneSessions, isEditing])

  function doneSessionsToCalendarEvents(
  sessions: any[],
  assignments: Assignment[]
): EventInput[] {
  return sessions
    .filter((s) => s.is_done)
    .map((s) => {
      const assignment = assignments.find((a) => a.id === s.fk_assignment);

      return {
        id: `doneSession-${s.id}`,
        start: s.start,
        end: s.end,
        title: assignment ? `Done: ${assignment.title}` : "Done session",
        color: "#4caf50",
        extendedProps: {
          type: "doneSession",
          fk_assignment: s.fk_assignment
        }
      };
    });
}

  const ModalAssignment = () => {
    return (
      <>
          {currentAssignment != undefined ? 
            <IonContent className="ion-padding">
              <AssignmentCard assignment={currentAssignment}/>
              <TaskList assignmentId={currentAssignment.id}/>
            </IonContent>
            :
            <IonContent className='ion-padding ion-text-center'>
              <IonSpinner name="dots" style={{width: "5em", height: "5em", margin: "auto"}}></IonSpinner>
            </IonContent>
          }
      </>
    );
  };

  const ModalSession = () => {
    if(!currentSession || !currentAssignment){
      return  (
        <IonContent className='ion-padding ion-text-center'>
          <IonSpinner name="dots" style={{width: "5em", height: "5em", margin: "auto"}}></IonSpinner>
        </IonContent>
      )
    }

    const startDay = currentSession.start.toLocaleDateString()
    const endDay = currentSession.end.toLocaleDateString()
    const startTime = currentSession.start.toLocaleTimeString().substring(0, 5)
    const endtime = currentSession.end.toLocaleTimeString().substring(0, 5)
    return (
      <IonContent className="ion-padding">
        <IonLabel>
          {startDay == endDay ?
            `${startDay} ${startTime} - ${endtime}`
            :
            `${startDay} ${startTime} - ${endDay} ${endtime}` 
          }
        </IonLabel>
        <AssignmentCard assignment={currentAssignment}/>
        <TaskList assignmentId={currentAssignment.id}/>
      </IonContent>
    );
  };

  const [presentAssignment] = useIonModal(ModalAssignment);
  const [presentSession] = useIonModal(ModalSession);

  const handleAssignmentSelect = (id: number) => {
    if (assignments == undefined) return
    setCurrentAssignment(assignments.filter(a => a.id == id)[0])
    presentAssignment({initialBreakpoint: 0.5, breakpoints: [0, 0.25, 0.5, 0.75, 1]});
  }
  
  const handleSessionSelect = (start: Date, end: Date, assignment_id: number) => {
    if (assignments == undefined) return
    setCurrentAssignment(assignments.filter(a => a.id == assignment_id)[0])
    setCurrentSession(recomendedSessions.filter(s => s.start.getTime() == start.getTime() && s.end.getTime() == end.getTime())[0])
    presentSession({initialBreakpoint: 0.5, breakpoints: [0, 0.25, 0.5, 0.75, 1]});
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
      <IonPage id="main-content">
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
            work_hours_start={user?.work_hours_start ?? 0}
            work_hours_end={user?.work_hours_end ?? 24}
            onSelectAssignment={handleAssignmentSelect}
            onSelectSession={handleSessionSelect}
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


function recomendedSessionsToCalendarEvents(
  sessions: RecommendedSession[],
  assignments: Assignment[]
): EventInput[] {

  return sessions.map((s, i) => ({
    id: `recommendedSession-${i}`,
    start: s.start,
    end: s.end,
    title: assignments.filter(a => a.id == s.fk_assignment)[0].title,
    color:  "#2196f3",
    extendedProps: {type: "recommendedSession", fk_assignment: s.fk_assignment}
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
      color: "#aaaaaa",
      extendedProps: {type: "freetime"}
    }))

}

function assignmentsToCalendarEvents(
  assignemnt: Assignment[]
): EventInput[] {

  return assignemnt.map((s, i) => ({
    id: `assignment-${s.id}`,
    start: s.date,
    allDay: true,
    title: s.title,
    color: "#7104ff",
    extendedProps: {type: "assignment", dbid: s.id}
  }))

}

export default Tab1;