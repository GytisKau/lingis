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

  const sessionMinutes = user.preffered_session_time
  //const breakMinutes = breakTime(sessionMinutes)

  let availableSlots = filterWorkHours(
    [...freeTimeEvents],
    user.work_hours_start,
    user.work_hours_end
  ).sort((a, b) => a.start.getTime() - b.start.getTime())

  const now = new Date()
  now.setSeconds(0, 0)

  availableSlots = availableSlots.filter(slot => slot.end > now)

  const plans = assignments
    .filter(a => !a.is_done)
    .map(a => ({
      assignment: a,
      sessionsNeeded: Math.ceil(a.est_hours / sessionMinutes),
      sessionsScheduled: 0
    }))
    .sort((a, b) => a.assignment.date.getTime() - b.assignment.date.getTime())
  
  
  const allSessions: RecommendedSession[] = []

  let progress = true

  while (progress) {
    progress = false

    for (const plan of plans) {
      if (plan.sessionsScheduled >= plan.sessionsNeeded) continue

      const remainingMinutes =
        plan.assignment.est_hours -
        plan.sessionsScheduled * sessionMinutes

      const currentSessionMinutes = Math.min(
        sessionMinutes,
        remainingMinutes
      )

      const session = findNextSessionForAssignment(
        availableSlots,
        plan.assignment,
        currentSessionMinutes,
        now,
        plan.sessionsScheduled,
        plan.sessionsNeeded
      )

      if (!session) continue

      allSessions.push({
        ...session,
        fk_assignment: plan.assignment.id
      })

      plan.sessionsScheduled++

      availableSlots = consumeSlots(availableSlots, [session], user)
      progress = true
    }
  }

  return sortSessionsByDate(allSessions)
}

function findNextSessionForAssignment(
  slots: LingisEvent[],
  assignment: Assignment,
  sessionMinutes: number,
  now: Date,
  sessionsScheduled: number,
  sessionsNeeded: number
): { start: Date, end: Date } | null {

  const possibleSessions = countPossibleSessions(
    slots,
    assignment,
    sessionMinutes,
    now
  )

  const hasLotsOfExtraTime = possibleSessions >= sessionsNeeded * 2

  if (!hasLotsOfExtraTime) {
    return findEarliestSession(
      slots,
      assignment,
      sessionMinutes,
      now
    )
  }

  const assignmentStart = new Date(Math.max(
    assignment.start_date.getTime(),
    now.getTime()
  ))

  const assignmentEnd = assignment.date

  const targetTime =
    sessionsNeeded <= 1
      ? assignmentStart.getTime()
      : assignmentStart.getTime() +
        (assignmentEnd.getTime() - assignmentStart.getTime()) *
        (sessionsScheduled / (sessionsNeeded - 1))

  const targetDate = new Date(targetTime)

  const session = findSessionAfterTarget(
    slots,
    assignment,
    sessionMinutes,
    now,
    targetDate
  )

  if (session) return session

  return findEarliestSession(
    slots,
    assignment,
    sessionMinutes,
    now
  )
}
// function findNextSessionForAssignment(
//   slots: LingisEvent[],
//   assignment: Assignment,
//   sessionMinutes: number,
//   now: Date,
//   sessionsScheduled: number,
//   sessionsNeeded: number
// ): { start: Date, end: Date } | null {

//   return findEarliestSession(
//     slots,
//     assignment,
//     sessionMinutes,
//     now
//   )
// }
function countPossibleSessions(
  slots: LingisEvent[],
  assignment: Assignment,
  sessionMinutes: number,
  now: Date
): number {

  const gap = breakTime(sessionMinutes)
  const fullSessionTime = sessionMinutes + gap

  let count = 0

  for (const slot of slots) {
    const windowStart = new Date(Math.max(
      slot.start.getTime(),
      assignment.start_date.getTime(),
      now.getTime()
    ))

    const windowEnd = new Date(Math.min(
      slot.end.getTime(),
      assignment.date.getTime()
    ))

    const availableMinutes =
      (windowEnd.getTime() - windowStart.getTime()) / 60000

    if (availableMinutes < sessionMinutes) continue

    count += Math.floor(
      (availableMinutes + gap) / fullSessionTime
    )
  }

  return count
}

function sortSessionsByDate(
  sessions: RecommendedSession[]
): RecommendedSession[] {
  return sessions.sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  )
}

function findSessionAfterTarget(
  slots: LingisEvent[],
  assignment: Assignment,
  sessionMinutes: number,
  now: Date,
  targetDate: Date
): { start: Date, end: Date } | null {

  for (const slot of slots) {
    const windowStart = new Date(Math.max(
      slot.start.getTime(),
      assignment.start_date.getTime(),
      now.getTime(),
      targetDate.getTime()
    ))

    const windowEnd = new Date(Math.min(
      slot.end.getTime(),
      assignment.date.getTime()
    ))

    const sessionEnd = new Date(
      windowStart.getTime() + sessionMinutes * 60000
    )

    if (sessionEnd <= windowEnd) {
      return {
        start: windowStart,
        end: sessionEnd
      }
    }
  }

  return null
}

function findEarliestSession(
  slots: LingisEvent[],
  assignment: Assignment,
  sessionMinutes: number,
  now: Date
): { start: Date, end: Date } | null {

  for (const slot of slots) {
    const windowStart = new Date(Math.max(
      slot.start.getTime(),
      assignment.start_date.getTime(),
      now.getTime()
    ))

    const windowEnd = new Date(Math.min(
      slot.end.getTime(),
      assignment.date.getTime()
    ))

    const sessionEnd = new Date(
      windowStart.getTime() + sessionMinutes * 60000
    )

    if (sessionEnd <= windowEnd) {
      return {
        start: windowStart,
        end: sessionEnd
      }
    }
  }

  return null
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