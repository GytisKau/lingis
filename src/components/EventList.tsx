import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../db/db"

interface EventListProps {
}

const EventList: React.FC<EventListProps> = () => {
  const events = useLiveQuery(
    async () => {
      const events = await db.events.toArray()
      return events
    },
    []
  )

  return (
    <ul>
      {events?.map((event) => (
        <li key={event.id}>
          {event.start.toLocaleString()}, {event.end.toLocaleString()}, {event.is_free}
        </li>
      ))}
    </ul>
  )
}

export default EventList;
