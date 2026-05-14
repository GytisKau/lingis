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
  fk_break?: number | null;
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

interface AssignmentType {
  id: number;
  name: string;
  fk_user: number;
}

interface Session {
  id: number;
  start: Date;
  end: Date;
  is_done: boolean;
  fk_assignment: number;
}

interface Break {
  id: number;
  start: Date;
  end: Date;
  fk_assignment: number;
  break_type: number;
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
  assignment_types: EntityTable<AssignmentType, "id">,
  breaks: EntityTable<Break, "id">,
}

db.version(1).stores({
  users: "++id",
  questionnaires: "++id, fk_user",
  events: "++id",
  assignments: "++id, fk_subject",
  sessions: "++id, fk_assignment",
  tasks: "++id, fk_assignment, parent_task_id",
  subjects: "++id, fk_user",
});

db.version(2).stores({
  users: "++id",
  questionnaires: "++id, fk_user, fk_break",
  events: "++id",
  assignments: "++id, fk_subject, assignment_type",
  assignment_types: "++id, fk_user",
  sessions: "++id, fk_assignment",
  tasks: "++id, fk_assignment, parent_task_id",
  subjects: "++id, fk_user",
  breaks: "++id, fk_assignment, break_type",
});

export type { User, Assignment, LingisEvent, Session, Task, Questionnaire, Subject, AssignmentType, Break}
export { db }
