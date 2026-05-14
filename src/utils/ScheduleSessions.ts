import { filterWorkHours } from "../components/Calendar"
import { Assignment, LingisEvent, User } from "../db/db"

export interface RecommendedSession {
  start: Date,
  end: Date,
  fk_assignment: number;
  type: "study" | "reflection"
}

function breakTime(sessionTime: number) {
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
        plan.sessionsNeeded,
        user,
        allSessions
      )

      if (!session) continue

      allSessions.push({
        ...session,
        fk_assignment: plan.assignment.id,
        type: "study"
      })

      plan.sessionsScheduled++

      availableSlots = consumeSlots(availableSlots, [session], user)
      progress = true
    }
  }

  const reflectionSessions = scheduleReflectionSessions(
    availableSlots,
    allSessions,
    assignments,
    user,
    now
  )

  allSessions.push(...reflectionSessions)

  return sortSessionsByDate(allSessions)
}

function scheduleReflectionSessions(
  availableSlots: LingisEvent[],
  studySessions: RecommendedSession[],
  assignments: Assignment[],
  user: User,
  now: Date
): RecommendedSession[] {

  const reflectionSessions: RecommendedSession[] = []

  for (const studySession of studySessions) {
    if (studySession.type !== "study") continue

    const assignment = assignments.find(
      a => a.id === studySession.fk_assignment
    )

    if (!assignment) continue

    const reflectionMinutes = getReflectionMinutes(studySession)

    const offsets = reflectionOffsetsForSession(
      studySession,
      assignment
    )

    for (const offsetHours of offsets) {
      const targetDate = new Date(
        studySession.end.getTime() + offsetHours * 3600000
      )

      if (targetDate < assignment.start_date) continue
      if (targetDate > assignment.date) continue

      const reflection = findBestReflectionSession(
        availableSlots,
        assignment,
        reflectionMinutes,
        now,
        studySession.end,
        targetDate,
        offsetHours,
        user,
        [...studySessions, ...reflectionSessions]
      )

      if (!reflection) continue

      const fullReflection: RecommendedSession = {
        ...reflection,
        fk_assignment: assignment.id,
        type: "reflection"
      }

      reflectionSessions.push(fullReflection)

      availableSlots = consumeSlots(
        availableSlots,
        [fullReflection],
        user
      )
    }
  }

  return reflectionSessions
}

function getReflectionMinutes(
  studySession: RecommendedSession
): number {
  const studyMinutes = minutesBetween(
    studySession.start,
    studySession.end
  )

  if (studyMinutes <= 30) return 5

  return 10
}

function reflectionToleranceHours(offsetHours: number): number {
  if (offsetHours <= 4) return 2
  if (offsetHours <= 24) return 8
  if (offsetHours <= 72) return 18
  return 36
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString()
}

function hoursBetween(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / 3600000
}

function violatesReflectionSpacing(
  start: Date,
  existingSessions: RecommendedSession[]
): boolean {
  const sameDayReflections = existingSessions.filter(s =>
    s.type === "reflection" &&
    isSameDay(s.start, start)
  )

  // No more than 2 reflection sessions per day
  if (sameDayReflections.length >= 2) {
    return true
  }

  // Reflections must be at least 4 hours apart
  return sameDayReflections.some(s =>
    hoursBetween(s.start, start) < 4
  )
}

function findBestReflectionSession(
  slots: LingisEvent[],
  assignment: Assignment,
  reflectionMinutes: number,
  now: Date,
  studySessionEnd: Date,
  targetDate: Date,
  offsetHours: number,
  user: User,
  existingSessions: RecommendedSession[]
): { start: Date, end: Date } | null {

  let bestSession: { start: Date, end: Date } | null = null
  let bestScore = Infinity

  const preferredHour = preferredChronotypeHour(user.chronotype)

  const tolerance = reflectionToleranceHours(offsetHours)

  const allowedStart = new Date(
    targetDate.getTime() - tolerance * 3600000
  )

  const allowedEnd = new Date(
    targetDate.getTime() + tolerance * 3600000
  )

  for (const slot of slots) {
    const windowStart = new Date(Math.max(
      slot.start.getTime(),
      assignment.start_date.getTime(),
      now.getTime(),
      studySessionEnd.getTime(),
      allowedStart.getTime()
    ))

    const windowEnd = new Date(Math.min(
      slot.end.getTime(),
      assignment.date.getTime(),
      allowedEnd.getTime()
    ))

    if (windowStart >= windowEnd) continue

    let cursor = new Date(windowStart)

    while (true) {
      const sessionEnd = new Date(
        cursor.getTime() + reflectionMinutes * 60000
      )

      if (sessionEnd > windowEnd) break

      if (violatesReflectionSpacing(cursor, existingSessions)) {
        cursor = new Date(cursor.getTime() + 15 * 60000)
        continue
      }

      const hour = hoursFromMidnight(cursor)

      const chronotypeDistance =
        Math.abs(hour - preferredHour)

      const targetDistanceHours =
        Math.abs(cursor.getTime() - targetDate.getTime()) / 3600000

      const sameDaySessions = existingSessions.filter(s =>
        s.start.toDateString() === cursor.toDateString()
      )

      const sameDayPenalty = sameDaySessions.length * 3

      const score =
        targetDistanceHours * 5 +
        chronotypeDistance * 2 +
        sameDayPenalty

      if (score < bestScore) {
        bestScore = score
        bestSession = {
          start: new Date(cursor),
          end: sessionEnd
        }
      }

      cursor = new Date(cursor.getTime() + 15 * 60000)
    }
  }

  return bestSession
}

function reflectionOffsetsForSession(
  studySession: RecommendedSession,
  assignment: Assignment
): number[] {
  const hoursAvailable =
    (assignment.date.getTime() - studySession.end.getTime()) / 3600000

  if (hoursAvailable < 4) return []

  if (hoursAvailable < 24) {
    return [2]
  }

  if (hoursAvailable < 72) {
    return [4, 24]
  }

  if (hoursAvailable < 168) {
    return [4, 24, 72]
  }

  return [4, 24, 72, 168]
}



function findNextSessionForAssignment(
  slots: LingisEvent[],
  assignment: Assignment,
  sessionMinutes: number,
  now: Date,
  sessionsScheduled: number,
  sessionsNeeded: number,
  user: User,
  existingSessions: RecommendedSession[]
): { start: Date, end: Date } | null {

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

  return findBestScoredSession(
    slots,
    assignment,
    sessionMinutes,
    now,
    targetDate,
    user,
    existingSessions
  )
}

function preferredChronotypeHour(chronotype: number): number {
  if (chronotype === 0) return 9   // morning person
  if (chronotype === 1) return 13  // noon person
  if (chronotype === 2) return 18  // evening person
  return 13
}

function hoursFromMidnight(date: Date): number {
  return date.getHours() + date.getMinutes() / 60
}

function findBestScoredSession(
  slots: LingisEvent[],
  assignment: Assignment,
  sessionMinutes: number,
  now: Date,
  targetDate: Date,
  user: User,
  existingSessions: RecommendedSession[]
): { start: Date, end: Date } | null {

  let bestSession: { start: Date, end: Date } | null = null
  let bestScore = Infinity

  const preferredHour = preferredChronotypeHour(user.chronotype)

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

    let cursor = new Date(windowStart)

    while (true) {
      const sessionEnd = new Date(
        cursor.getTime() + sessionMinutes * 60000
      )

      if (sessionEnd > windowEnd) break

      const hour = hoursFromMidnight(cursor)

      const chronotypeDistance =
        Math.abs(hour - preferredHour)

      const targetDayDistance =
        Math.abs(
          startOfDay(cursor).getTime() -
          startOfDay(targetDate).getTime()
        ) / 86400000

      const sameDaySessions = existingSessions.filter(s =>
        s.start.toDateString() === cursor.toDateString()
      )

      let clusterDistance = 0

      if (sameDaySessions.length > 0) {
        clusterDistance = Math.min(
          ...sameDaySessions.map(s =>
            Math.abs(cursor.getTime() - s.start.getTime()) / 3600000
          )
        )
      }

      const score =
        chronotypeDistance * 10 +
        targetDayDistance * 2 +
        clusterDistance * 1

      if (score < bestScore) {
        bestScore = score
        bestSession = {
          start: new Date(cursor),
          end: sessionEnd
        }
      }

      cursor = new Date(cursor.getTime() + 15 * 60000)
    }
  }

  return bestSession
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function sortSessionsByDate(
  sessions: RecommendedSession[]
): RecommendedSession[] {
  return sessions.sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  )
}

function minutesBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / 60000
}

function consumeSlots(
  slots: LingisEvent[],
  sessions: { start: Date, end: Date }[],
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
        const leftSlot = {
          ...slot,
          end: new Date(session.start.getTime() - gap * 60000)
        }

        if (leftSlot.end > leftSlot.start) {
          result.push(leftSlot)
        }
      }

      if (session.end < slot.end) {
        const rightSlot = {
          ...slot,
          start: new Date(session.end.getTime() + gap * 60000)
        }

        if (rightSlot.end > rightSlot.start) {
          result.push(rightSlot)
        }
      }

      return result
    })
  }

  return updated
}

export default ScheduleAllAssignments