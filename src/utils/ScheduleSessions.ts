import { LingisEvent, Session } from "../db/db"

function ScheduleSessions(
  freeTimeEvents: LingisEvent[],
  timeForAssignment: number,
  timeForSession: number,
  timeforBreak: number
): Session[] {

  const fullSessionTime = timeForSession + timeforBreak
  const sessionsNeeded = Math.ceil(timeForAssignment / timeForSession)

  let sessionsLeft = sessionsNeeded
  const sessions: Session[] = []

  for (const freeTimeEvent of freeTimeEvents) {

    if (sessionsLeft <= 0) break

    const windowStart = new Date(freeTimeEvent.start)
    const windowEnd = new Date(freeTimeEvent.end)

    let cursor = new Date(windowStart)

    while (sessionsLeft > 0) {

      const sessionEnd =
        new Date(cursor.getTime() + timeForSession * 60000)

      if (sessionEnd > windowEnd) break

      sessions.push({
        start: new Date(cursor),
        end: sessionEnd,
        is_done: false
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

export default ScheduleSessions