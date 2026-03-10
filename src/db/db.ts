// db.ts
import { Dexie, type EntityTable } from "dexie"

interface Event {
  id: number;
  start: Date;
  end: Date;
  is_free: boolean;
}

const db = new Dexie("FriendsDatabase") as Dexie & {
  events: EntityTable<Event, "id">,
}

// Schema declaration:
db.version(1).stores({
  events: "++id, start, end, is_free", // primary key "id" (for the runtime!)
})

export type { Event }
export { db }
