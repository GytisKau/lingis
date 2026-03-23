// db.ts
import { Q } from "@fullcalendar/react/chunks/21ba6125";
import { Dexie, type EntityTable } from "dexie"

interface User {
  id: number;
  email: string;
  username: string;
  avg_theory_time: number;
  avg_practice_time: number;
  avg_sleep_hours: number;
  preffered_session_time: number;
  work_hours_start: number;
  work_hours_end: number;
  effectiveness_rating: number;
  study_field: number;
  chronotype: number;
}

interface Questionnaire {
  id: number;
  motivation: number;
  mental_tiredness: number;
  physical_tiredness: number;
  mental_energy: number;
  emotional: number;
  physical: number;
  sleep_quality: number;
  created_at: Date;
  fk_user: number;
}

interface LingisEvent {
  id: number;
  start: Date;
  end: Date;
  is_free: boolean;
}

interface Assignment {
  id: number;
  title: string;
  date: Date;
  start_date: Date;
  est_hours: number;
  assignment_type: number;
  fk_user: number;
  sessions: Session[];
  tasks: Task[];
}

interface Session {
  start: Date;
  end: Date;
  is_done: boolean;
}

interface Task {
  id: number;
  title: string;
  difficulty_rating: number;
  is_done: boolean;
  task_type: number;
  fk_assignment: number;
  toggle_order: number;
}

const db = new Dexie("LingisDatabase") as Dexie & {
  users: EntityTable<User, "id">,
  questionnaires: EntityTable<Questionnaire, "id">,
  events: EntityTable<LingisEvent, "id">,
  assignments: EntityTable<Assignment, "id">,
  // sessions: EntityTable<Session, "id">,
  tasks: EntityTable<Task, "id">,
}

// Schema declaration:
db.version(1).stores({
  users: "++id, email, username, avg_theory_time, avg_practice_time, avg_sleep_hours, preffered_session_time, work_hours_start, work_hours_end, effectiveness_rating, study_field, chronotype",
  questionnaires: "++id, motivation, mental_tiredness, physical_tiredness, mental_energy, emotional, physical, sleep_quality, created_at, fk_user",
  events: "++id, start, end, is_free",
  assignments: "++id, title, date, start_date, est_hours, assignment_type",
  // sessions: "++id, start, end, is_done, fk_assignment",
  tasks: "++id, title, difficulty_rating, is_done, task_type, fk_assignment, toggle_order"
})

// const user_id = await db.users.add({
//   email: "djgytis231@gmail.com",
//   username: "Gytiniumas",
//   avg_practice_time: 100,
//   avg_theory_time: 30,
//   chronotype: 1,
//   effectiveness_rating: 3,
//   preffered_session_time: 45,
//   study_field: 1,
//   work_hours_start: 9 * 60,
//   work_hours_end: 24 * 60,
//   events: [{
//     id: 1,
//     start: new Date(),
//     end: new Date(new Date().getTime() + 60 * 60 * 1000),
//     is_free: true,
//     fk_user: 1
//   }],
//   assignments: [{
//     id: 1,
//     date: new Date(new Date().getTime() + 24 * 360 * 1000),
//     assignment_type: 1,
//     est_hours: 5 * 60,
//     fk_user: 1,
//     sessions: [],
//     tasks: [],
//     title: "Išmokt viską"
//   }]
// })

export type { User, Assignment, LingisEvent, Session, Task, Questionnaire }
export { db }
