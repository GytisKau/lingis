// db.ts
import { Dexie, type EntityTable } from "dexie"

interface User {
  id: number;
  email: string;
  username: string;
  avg_theory_time: number;
  avg_practice_time: number;
  avg_passive_time: number;
  avg_active_time: number;
  avg_sleep_hours: number;
  preffered_session_time: number;
  work_hours_start: number;
  work_hours_end: number;
  effectiveness_rating: number;
  study_field: number;
  chronotype: number;
}

interface Subject {
  id: number;
  name: string;
  color: string;
  fk_user: number;
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
  is_done: boolean
  date: Date;
  start_date: Date;
  est_hours: number;
  assignment_type: number;
  fk_subject?: number | null;
}

interface Session {
  id: number;
  start: Date;
  end: Date;
  is_done: boolean;
  fk_assignment: number;
}

interface Task {
  id: number;
  title: string;
  difficulty_rating: number;
  is_done: boolean;
  task_type: number;
  fk_assignment: number;
  toggle_order: number;
  parent_task_id: number | null;
}

const db = new Dexie("LingisDatabase") as Dexie & {
  users: EntityTable<User, "id">,
  questionnaires: EntityTable<Questionnaire, "id">,
  events: EntityTable<LingisEvent, "id">,
  assignments: EntityTable<Assignment, "id">,
  sessions: EntityTable<Session, "id">,
  tasks: EntityTable<Task, "id">,
  subjects: EntityTable<Subject, "id">,
}

// Schema declaration:
db.version(1).stores({
  users: "++id",
  questionnaires: "++id, motivation, mental_tiredness, physical_tiredness, mental_energy, emotional, physical, sleep_quality, created_at, fk_user",
  events: "++id, start, end, is_free",
  assignments: "++id, title, date, start_date, est_hours, assignment_type, fk_subject",
  sessions: "++id, start, end, is_done, fk_assignment",
  tasks: "++id, title, difficulty_rating, is_done, task_type, fk_assignment, toggle_order, parent_task_id",
  subjects: '++id, name, color, fk_user'
})

export type { User, Assignment, LingisEvent, Session, Task, Questionnaire, Subject }
export { db }
