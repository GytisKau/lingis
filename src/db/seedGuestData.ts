// src/db/seedGuestData.ts
import { db } from "./db"

const dateAt = (dayOffset: number, hour: number, minute = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + dayOffset)
  date.setHours(hour, minute, 0, 0)
  return date
}

const addHours = (date: Date, hours: number) => {
  const copy = new Date(date)
  copy.setHours(copy.getHours() + hours)
  return copy
}

export const seedGuestDatabaseOnce = async (firebaseUid: string) => {
  const seedKey = `guestSeeded:${firebaseUid}`

  if (localStorage.getItem(seedKey) === "true") {
    return
  }

  const existingUsers = await db.users.count()

  if (existingUsers > 0) {
    localStorage.setItem(seedKey, "true")
    return
  }

  await db.transaction(
    "rw",
    [
    db.users,
    db.subjects,
    db.assignment_types,
    db.assignments,
    db.tasks,
    db.sessions,
    db.breaks,
    db.questionnaires,
    db.events],
    async () => {
      const userId = await db.users.add({
        email: "guest@lingis.local",
        username: "Guest",
        avg_theory_time: 30,
        avg_practice_time: 60,
        avg_passive_time: 90,
        avg_active_time: 60,
        avg_sleep_hours: 8,
        preffered_session_time: 60,
        work_hours_start: 9,
        work_hours_end: 22,
        effectiveness_rating: 7,
        study_field: 1,
        chronotype: 2,
      })

      const mathSubjectId = await db.subjects.add({
        name: "Matematika",
        color: "#64748b",
        fk_user: userId,
      })

      const programmingSubjectId = await db.subjects.add({
        name: "Programavimas",
        color: "#475569",
        fk_user: userId,
      })

      const physicsSubjectId = await db.subjects.add({
        name: "Fizika",
        color: "#334155",
        fk_user: userId,
      })

      const theoryTypeId = await db.assignment_types.add({
        name: "Teorija",
        fk_user: userId,
      })

      const practiceTypeId = await db.assignment_types.add({
        name: "Praktika",
        fk_user: userId,
      })

      const projectTypeId = await db.assignment_types.add({
        name: "Projektas",
        fk_user: userId,
      })

      const mathAssignmentId = await db.assignments.add({
        title: "Peržiūrėti diskrečiosios matematikos konspektą",
        is_done: false,
        date: dateAt(2, 23, 59),
        start_date: dateAt(0, 17),
        est_hours: 2 * 60,
        assignment_type: theoryTypeId,
        fk_subject: mathSubjectId,
      })

      const programmingAssignmentId = await db.assignments.add({
        title: "Užbaigti React komponentų laboratorinį darbą",
        is_done: false,
        date: dateAt(5, 23, 59),
        start_date: dateAt(1, 16),
        est_hours: 4 * 60,
        assignment_type: projectTypeId,
        fk_subject: programmingSubjectId,
      })

      const physicsAssignmentId = await db.assignments.add({
        title: "Išspręsti mechanikos uždavinius",
        is_done: false,
        date: dateAt(3, 23, 59),
        start_date: dateAt(1, 11),
        est_hours: 3 * 60,
        assignment_type: practiceTypeId,
        fk_subject: physicsSubjectId,
      })

      const doneAssignmentId = await db.assignments.add({
        title: "Perskaityti paskaitos skaidres",
        is_done: true,
        date: dateAt(-1, 23, 59),
        start_date: dateAt(-2, 14),
        est_hours: 1 * 60,
        assignment_type: theoryTypeId,
        fk_subject: mathSubjectId,
      })

      const mathMainTaskId = await db.tasks.add({
        title: "Pakartoti pagrindines sąvokas",
        difficulty_rating: 2,
        is_done: false,
        task_type: 1,
        fk_assignment: mathAssignmentId,
        toggle_order: 1,
        parent_task_id: null,
      })

      await db.tasks.bulkAdd([
        {
          title: "Peržiūrėti apibrėžimus",
          difficulty_rating: 1,
          is_done: false,
          task_type: 1,
          fk_assignment: mathAssignmentId,
          toggle_order: 2,
          parent_task_id: mathMainTaskId,
        },
        {
          title: "Išspręsti 5 pavyzdinius uždavinius",
          difficulty_rating: 3,
          is_done: false,
          task_type: 2,
          fk_assignment: mathAssignmentId,
          toggle_order: 3,
          parent_task_id: mathMainTaskId,
        },
        {
          title: "Sukurti užduočių sąrašo komponentą",
          difficulty_rating: 3,
          is_done: false,
          task_type: 2,
          fk_assignment: programmingAssignmentId,
          toggle_order: 1,
          parent_task_id: null,
        },
        {
          title: "Patikrinti Dexie duomenų išsaugojimą",
          difficulty_rating: 3,
          is_done: false,
          task_type: 2,
          fk_assignment: programmingAssignmentId,
          toggle_order: 2,
          parent_task_id: null,
        },
        {
          title: "Pakartoti Niutono dėsnius",
          difficulty_rating: 2,
          is_done: false,
          task_type: 1,
          fk_assignment: physicsAssignmentId,
          toggle_order: 1,
          parent_task_id: null,
        },
        {
          title: "Sutvarkyti paskaitos užrašus",
          difficulty_rating: 1,
          is_done: true,
          task_type: 1,
          fk_assignment: doneAssignmentId,
          toggle_order: 1,
          parent_task_id: null,
        },
      ])

      await db.sessions.bulkAdd([
        {
          start: dateAt(-1, 17),
          end: dateAt(-1, 19),
          is_done: true,
          fk_assignment: mathAssignmentId,
        },
        {
          start: dateAt(-2, 16),
          end: dateAt(-2, 18),
          is_done: true,
          fk_assignment: programmingAssignmentId,
        },
        {
          start: dateAt(-2, 11),
          end: dateAt(-2, 13),
          is_done: true,
          fk_assignment: physicsAssignmentId,
        },
        {
          start: dateAt(-3, 14),
          end: dateAt(-3, 15),
          is_done: true,
          fk_assignment: doneAssignmentId,
        },
      ])

      const breakId = await db.breaks.add({
        start: dateAt(-1, 18),
        end: dateAt(-1, 18, 15),
        fk_assignment: mathAssignmentId,
        break_type: 1,
      })

      await db.questionnaires.bulkAdd([
        {
          motivation: 7,
          mental_tiredness: 4,
          physical_tiredness: 3,
          mental_energy: 6,
          emotional: 7,
          physical: 6,
          sleep_quality: 8,
          created_at: dateAt(-1, 9),
          fk_user: userId,
          fk_break: null,
        },
        {
          motivation: 6,
          mental_tiredness: 5,
          physical_tiredness: 4,
          mental_energy: 5,
          emotional: 6,
          physical: 6,
          sleep_quality: 7,
          created_at: dateAt(-1, 18, 15),
          fk_user: userId,
          fk_break: breakId,
        },
      ])

      await db.events.bulkAdd([
        {
          start: dateAt(0, 9),
          end: dateAt(0, 12),
          is_free: true,
        },
        {
          start: dateAt(0, 13),
          end: dateAt(0, 16),
          is_free: true,
        },
        {
          start: dateAt(1, 10),
          end: dateAt(1, 12),
          is_free: true,
        },
        {
          start: dateAt(1, 15),
          end: dateAt(1, 19),
          is_free: true,
        },
        {
          start: dateAt(2, 9),
          end: dateAt(2, 12),
          is_free: true,
        },
        {
          start: dateAt(2, 13),
          end: dateAt(2, 16),
          is_free: true,
        },
        {
          start: dateAt(3, 10),
          end: dateAt(3, 12),
          is_free: true,
        },
        {
          start: dateAt(3, 15),
          end: dateAt(3, 19),
          is_free: true,
        },
      ])
    }
  )

  localStorage.setItem(seedKey, "true")
}