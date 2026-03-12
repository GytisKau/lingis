import FullCalendar, { DateSelectData, EventInput } from '@fullcalendar/react'
import themePlugin from '@fullcalendar/react/themes/breezy' // YOUR THEME
import interactionPlugin from '@fullcalendar/react/interaction'
import dayGridPlugin from '@fullcalendar/react/daygrid'
import timeGridPlugin from '@fullcalendar/react/timegrid'

import '@fullcalendar/react/skeleton.css'
import '@fullcalendar/react/themes/breezy/theme.css' // YOUR THEME
import "../theme/emerald.css"

import { db } from "../db/db";

interface Props {
  events: EventInput[]
  weekendsVisible: boolean
  editing: boolean
  adding: boolean
}

const Calendar: React.FC<Props> = ({events, weekendsVisible, editing, adding }) => {
  async function addFreeTime(start: Date, end: Date) {

    const all = await db.events.toArray()

    const free = all.filter(e => e.is_free)

    const current = free.map(e => ({
      id: e.id,
      start: new Date(e.start),
      end: new Date(e.end)
    }))

    const next = normalizeRanges([
      ...current.map(r => ({ start: r.start, end: r.end })),
      { start, end }
    ])

    if (
      rangesEqual(
        current.map(r => ({ start: r.start, end: r.end })),
        next
      )
    ) return

    const { toDelete, toAdd } = diffRanges(current, next)

    await db.transaction("rw", db.events, async () => {

      if (toDelete.length)
        await db.events.bulkDelete(toDelete)

      if (toAdd.length)
        await db.events.bulkAdd(
          toAdd.map(r => ({
            start: r.start,
            end: r.end,
            is_free: true
          }))
        )

    })

  }

  async function removeFreeTime(start: Date, end: Date) {

    const all = await db.events.toArray()

    const free = all.filter(e => e.is_free)

    const current = free.map(e => ({
      id: e.id,
      start: new Date(e.start),
      end: new Date(e.end)
    }))

    const result: { start: Date; end: Date }[] = []

    for (const r of current) {

      if (end <= r.start || start >= r.end) {
        result.push({ start: r.start, end: r.end })
        continue
      }

      if (start > r.start)
        result.push({ start: r.start, end: start })

      if (end < r.end)
        result.push({ start: end, end: r.end })

    }

    const next = normalizeRanges(result)

    if (
      rangesEqual(
        current.map(r => ({ start: r.start, end: r.end })),
        next
      )
    ) return

    const { toDelete, toAdd } = diffRanges(current, next)

    await db.transaction("rw", db.events, async () => {

      if (toDelete.length)
        await db.events.bulkDelete(toDelete)

      if (toAdd.length)
        await db.events.bulkAdd(
          toAdd.map(r => ({
            start: r.start,
            end: r.end,
            is_free: true
          }))
        )

    })

  }

  const handleSelect = async (selectInfo: DateSelectData) => {

    if (!editing) return

    if (adding)
      await addFreeTime(selectInfo.start, selectInfo.end)
    else
      await removeFreeTime(selectInfo.start, selectInfo.end)

    selectInfo.view.calendar.unselect()
  }

  return (
    <FullCalendar
      plugins={[themePlugin, dayGridPlugin, timeGridPlugin, interactionPlugin]}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      }}
      initialView='timeGridWeek'
      height="100%"
      selectAllow={() => {
        disableScroll();
        return true;
      }}
      unselectAuto={false}
      unselect={enableScroll}
      selectable={editing}
      dayMaxEvents={true}
      nowIndicator={true}
      selectLongPressDelay={300}
      selectMinDistance={5}
      firstDay={1}
      weekNumbers={true}
      allDaySlot={false}
      eventTimeFormat={{
        hour: "numeric",
        minute: "2-digit",
        meridiem: false,
        hour12: false,
      }}
      slotHeaderFormat={{
        hour: "numeric",
        minute: "2-digit",
        meridiem: false,
        hour12: false
      }}
      expandRows={false}
      weekends={weekendsVisible}
      events={events}
      select={handleSelect}
    />
  )
}


function rangeKey(r: { start: Date; end: Date }) {
  return `${r.start.getTime()}-${r.end.getTime()}`
}

function diffRanges(
  current: { start: Date; end: Date; id?: number }[],
  next: { start: Date; end: Date }[]
) {

  const currentMap = new Map(
    current.map(r => [rangeKey(r), r])
  )

  const nextMap = new Map(
    next.map(r => [rangeKey(r), r])
  )

  const toDelete: number[] = []
  const toAdd: { start: Date; end: Date }[] = []

  for (const [key, r] of currentMap) {
    if (!nextMap.has(key) && r.id)
      toDelete.push(r.id)
  }

  for (const [key, r] of nextMap) {
    if (!currentMap.has(key))
      toAdd.push(r)
  }

  return { toDelete, toAdd }
}

function rangesEqual(
  a: { start: Date; end: Date }[],
  b: { start: Date; end: Date }[]
) {

  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) {

    if (
      a[i].start.getTime() !== b[i].start.getTime() ||
      a[i].end.getTime() !== b[i].end.getTime()
    ) {
      return false
    }

  }

  return true

}

function normalizeRanges(ranges: { start: Date; end: Date }[]) {

  const sorted = [...ranges].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  )

  const merged: { start: Date; end: Date }[] = []

  for (const r of sorted) {

    const last = merged[merged.length - 1]

    if (!last) {
      merged.push({ ...r })
      continue
    }

    if (r.start.getTime() <= last.end.getTime()) {
      last.end = new Date(Math.max(last.end.getTime(), r.end.getTime()))
    } else {
      merged.push({ ...r })
    }

  }

  return merged
}

const disableScroll = () => {
  document.body.style.overflow = "hidden";
  document.body.style.touchAction = "none";
};

const enableScroll = () => {
  document.body.style.overflow = "";
  document.body.style.touchAction = "";
};

export default Calendar;