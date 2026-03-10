import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../db/db"
import ScheduleSessions from "../utils/ScheduleSessions";
import { useMemo } from "react";

const SessionList: React.FC<{}> = () => {
  const events = useLiveQuery(
    async () => await db.events.toArray(),
    []
  )

  const sessions = useMemo(() => ScheduleSessions(events || [], 120, 30, 15), [events]);
  
  return (
    <>
    <p>{sessions.length}</p>
    <ul>
      {sessions.map((session) => (
        <li key={session.start.getTime()}>
          {session.start.toLocaleString()}, {session.end.toLocaleString()}
        </li>
      ))}
    </ul>
    </>
  )
}

export default SessionList;
