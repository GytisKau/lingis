// db.ts
import { Dexie, type EntityTable } from "dexie"

interface User {
  id: number;
  email: string;
  username: string;
  avg_theory_time: number;
  avg_practice_time: number;
  preffered_session_time: number;
  work_hours_start: number; // minutes
  work_hours_end: number; // minutes
  effectiveness_rating: number;
  study_field: number;
  chronotype: number;
}

interface Event {
  id: number;
  start: Date;
  end: Date;
  is_free: boolean;
  fk_user: number;
}

interface Assignment {
  id: number;
  title: string;
  date: Date;
  est_hours: number;
  assignment_type: number;
  fk_user: number;
}

interface Session {
  id?: number;
  start: Date;
  end: Date;
}

const db = new Dexie("LingisDatabase") as Dexie & {
  events: EntityTable<Event, "id">
}

// Schema declaration:
db.version(1).stores({
  events: "++id, start, end, is_free", // primary key "id" (for the runtime!)
})

export type { Event, Session }
export { db }
