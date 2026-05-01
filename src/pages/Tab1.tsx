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
import { Header } from '../components/Header';

const getAssignmentTypeColor = (type?: number | null) => {
  if (type === 0) return "#ffcfcf"; // exam
  if (type === 1) return "#d6e6ff"; // lab
  if (type === 2) return "#d4f5df"; // other
  return "#e6d8ff"; // unset / no type
};

const getAssignmentBorderColor = (type?: number | null) => {
  if (type === 0) return "#ff9f9f";
  if (type === 1) return "#9fc4ff";
  if (type === 2) return "#9be8b5";
  return "#c7a8ff";
};

const getAssignmentTextColor = () => {
  return "#491B6D";
};

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
      const backgroundColor = getAssignmentTypeColor(assignment?.assignment_type);

      return {
        id: `doneSession-${s.id}`,
        start: s.start,
        end: s.end,
        title: assignment ? `Done: ${assignment.title}` : "Done session",
        color: backgroundColor,
        backgroundColor,
        borderColor: getAssignmentBorderColor(assignment?.assignment_type),
        textColor: getAssignmentTextColor(),
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
              <TaskList assignmentId={currentAssignment.id} readOnly />
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

      const startTime = currentSession.start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const endtime = currentSession.end.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

    return (
      <IonContent className="ion-padding">
        <div className="session-preview-time">
          <IonLabel>
            {startDay == endDay ?
              `${startDay} ${startTime} - ${endtime}`
              :
              `${startDay} ${startTime} - ${endDay} ${endtime}` 
            }
          </IonLabel>
        </div>
        <AssignmentCard assignment={currentAssignment}/>
        <TaskList assignmentId={currentAssignment.id} readOnly />
      </IonContent>
    );
  };

  const [presentAssignment] = useIonModal(ModalAssignment);
  const [presentSession] = useIonModal(ModalSession);

  const handleAssignmentSelect = (id: number) => {
    if (assignments == undefined) return;

    const foundAssignment = assignments.find((a) => a.id == id);

    if (!foundAssignment) {
      console.warn("No assignment found for selected calendar event:", id);
      return;
    }

    setCurrentAssignment(foundAssignment);
    setCurrentSession(undefined);

    setTimeout(() => {
      presentAssignment({
        initialBreakpoint: 0.5,
        breakpoints: [0, 0.25, 0.5, 0.75, 1],
      });
    }, 0);
  }
  
  const handleSessionSelect = (start: Date, end: Date, assignment_id: number) => {
    if (assignments == undefined) return;

    const foundAssignment = assignments.find((a) => a.id == assignment_id);

    if (!foundAssignment) {
      console.warn("No assignment found for selected session:", assignment_id);
      return;
    }

    const foundSession = recomendedSessions.find(
      (s) =>
        s.start.getTime() == start.getTime() &&
        s.end.getTime() == end.getTime() &&
        s.fk_assignment == assignment_id
    );

    const sessionToOpen =
      foundSession ??
      ({
        start,
        end,
        fk_assignment: assignment_id,
      } as RecommendedSession);

    setCurrentAssignment(foundAssignment);
    setCurrentSession(sessionToOpen);

    setTimeout(() => {
      presentSession({
        initialBreakpoint: 0.5,
        breakpoints: [0, 0.25, 0.5, 0.75, 1],
      });
    }, 0);
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
      <IonPage>
        <Header title='Calendar'/>
        <IonContent forceOverscroll={false}>
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

  return sessions.map((s, i) => {
    const assignment = assignments.filter(a => a.id == s.fk_assignment)[0]
    const backgroundColor = getAssignmentTypeColor(assignment?.assignment_type)

    return {
      id: `recommendedSession-${i}`,
      start: s.start,
      end: s.end,
      title: assignment.title,
      color: backgroundColor,
      backgroundColor,
      borderColor: getAssignmentBorderColor(assignment?.assignment_type),
      textColor: getAssignmentTextColor(),
      extendedProps: {type: "recommendedSession", fk_assignment: s.fk_assignment}
    }
  })

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

  return assignemnt.map((s, i) => {
    const backgroundColor = getAssignmentTypeColor(s.assignment_type)

    return {
      id: `assignment-${s.id}`,
      start: s.date,
      allDay: true,
      title: s.title,
      color: backgroundColor,
      backgroundColor,
      borderColor: getAssignmentBorderColor(s.assignment_type),
      textColor: getAssignmentTextColor(),
      extendedProps: {type: "assignment", dbid: s.id}
    }
  })

}

export default Tab1;