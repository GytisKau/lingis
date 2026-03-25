import { filterWorkHours } from "../components/Calendar"
import { Assignment, LingisEvent, User } from "../db/db"

export interface RecommendedSession{
  start: Date,
  end: Date,
  fk_assignment: number;
}

function breakTime(sessionTime: number){
  if (sessionTime == 5) return 2
  else if (sessionTime == 10) return 3
  else if (sessionTime == 20) return 5
  else if (sessionTime == 30) return 10
  else if (sessionTime == 60) return 10
  else if (sessionTime == 90) return 15
  else if (sessionTime == 120) return 30
  else return 10
}

function ScheduleAllAssignments(
  assignments: Assignment[],
  freeTimeEvents: LingisEvent[],
  user: User
): RecommendedSession[] {

  let availableSlots = [...freeTimeEvents]
  const allSessions: RecommendedSession[] = []

  // 1. sort pagal deadline
  const sortedAssignments = [...assignments].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  )

  for (const assignment of sortedAssignments) {
    const availableAssignmentSlots = availableSlots.filter(slot => slot.end.getTime() > assignment.start_date.getTime())
    const sessions = ScheduleSessions(
      availableAssignmentSlots,
      assignment.est_hours,
      user.preffered_session_time,
      breakTime(user.preffered_session_time),
      user.work_hours_start,
      user.work_hours_end
    )

    // PRISKIRIAM assignment
    const sessionsWithAssignment = sessions.map(s => ({
      ...s,
      is_done: false,
      fk_assignment: assignment.id
    }))

    allSessions.push(...sessionsWithAssignment)

    // pašalinam panaudotą laiką
    availableSlots = consumeSlots(availableSlots, sessions, user)
  }

  return allSessions
}



function ScheduleSessions(
  freeTimeEvents: LingisEvent[],
  timeForAssignment: number,
  timeForSession: number,
  timeforBreak: number,
  work_hours_start: number,
  work_hours_end: number
): {start: Date, end: Date}[] {

  const fullSessionTime = timeForSession + timeforBreak
  const sessionsNeeded = Math.ceil(timeForAssignment / timeForSession)

  let sessionsLeft = sessionsNeeded
  const sessions: RecommendedSession[] = []

  const now = new Date()
  now.setSeconds(0, 0)
  freeTimeEvents = freeTimeEvents.filter(e => e.end >= now)

  freeTimeEvents = filterWorkHours(freeTimeEvents, work_hours_start, work_hours_end)

  freeTimeEvents.sort(
    (a,b)=>a.start.getTime()-b.start.getTime()
  )

  for (const freeTimeEvent of freeTimeEvents) {

    if (sessionsLeft <= 0) break

    const windowStart = now > freeTimeEvent.start ? now : new Date(freeTimeEvent.start)
    const windowEnd = new Date(freeTimeEvent.end)

    let cursor = new Date(windowStart)

    while (sessionsLeft > 0) {

      const sessionEnd =
        new Date(cursor.getTime() + timeForSession * 60000)

      if (sessionEnd > windowEnd) break

      sessions.push({
        start: new Date(cursor),
        end: sessionEnd,
        fk_assignment: 1,
      })

      sessionsLeft--

      if (sessionsLeft <= 0) break

      cursor = new Date(
        cursor.getTime() + fullSessionTime * 60000
      )
    }
  }

  return sessions
}

function consumeSlots(
  slots: LingisEvent[],
  sessions: {start: Date, end: Date}[],
  user: User
): LingisEvent[] {

  let updated = [...slots]

  const gap = breakTime(user.preffered_session_time)

  for (const session of sessions) {
    updated = updated.flatMap(slot => {
      if (session.end <= slot.start || session.start >= slot.end) {
        return [slot]
      }

      const result: LingisEvent[] = []

      if (session.start > slot.start) {
        result.push({
          ...slot,
          end: new Date(session.start.getTime() - gap * 60000)
        })
      }

      if (session.end < slot.end) {
        result.push({
          ...slot,
          start: new Date(session.end.getTime() + gap * 60000)
        })
      }

      return result
    })
  }

  return updated
}

export default ScheduleAllAssignments