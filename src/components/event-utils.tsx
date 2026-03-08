import { EventInput } from "@fullcalendar/react";

let eventGuid = 0
let todayStr = new Date().toISOString().replace(/T.*$/, '') // YYYY-MM-DD of today

export interface FreeTimeEvent extends EventInput {
  id: string;
  start: Date;
  end: Date;
}

export const INITIAL_EVENTS = [
  {
    id: createEventId(),
    title: 'Timed event',
    start: todayStr + 'T12:00:00'
  },
  {
    id: createEventId(),
    title: "Free time",
    start: todayStr + 'T10:00:00',
    end: todayStr + 'T16:00:00',
    display: 'background',
    color: "gray"
  }
]

export function mergeRanges(events: FreeTimeEvent[], newStart: Date, newEnd: Date): FreeTimeEvent[] {
  const overlapping: FreeTimeEvent[] = [];
  const nonOverlapping: FreeTimeEvent[] = [];

  for (const event of events) {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    // overlaps OR touches
    const overlapsOrTouches =
      newStart <= eventEnd && newEnd >= eventStart;

    if (overlapsOrTouches) {
      overlapping.push(event);
    } else {
      nonOverlapping.push(event);
    }
  }

  // If no overlaps → just add new
  if (overlapping.length === 0) {
    return [
      ...events,
      {
        id: createEventId(),
        start: newStart,
        end: newEnd,
        display: "background",
        title: "Free Time",
        color: 'silver',
        extendedProps: {isFreeTime: true}
      },
    ];
  }

  // Merge all overlapping/touching
  const mergedStart = new Date(
    Math.min(
      newStart.getTime(),
      ...overlapping.map(e => new Date(e.start).getTime())
    )
  );

  const mergedEnd = new Date(
    Math.max(
      newEnd.getTime(),
      ...overlapping.map(e => new Date(e.end).getTime())
    )
  );

  return [
    ...nonOverlapping,
    {
      id: createEventId(),
      start: mergedStart,
      end: mergedEnd,
      display: "background",
      title: "Free Time",
      color: 'silver',
      extendedProps: {isFreeTime: true}
    },
  ];
}

export function removeRange(events: FreeTimeEvent[], removeStart: Date, removeEnd: Date ): FreeTimeEvent[] {
  const result: FreeTimeEvent[] = [];

  for (const event of events) {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    // Jei nėra persidengimo – paliekam kaip yra
    const noOverlap =
      removeEnd <= eventStart || removeStart >= eventEnd;

    if (noOverlap) {
      result.push(event);
      continue;
    }

    // Jei pažymėtas pilnai uždengia eventą – nieko nepridedam (ištrinamas)
    const fullyCovered =
      removeStart <= eventStart && removeEnd >= eventEnd;

    if (fullyCovered) {
      continue;
    }

    // Jei nukertam pradžią
    if (removeStart <= eventStart && removeEnd < eventEnd) {
      result.push({
        ...event,
        id: createEventId(),
        start: removeEnd,
        end: eventEnd,
      });
      continue;
    }

    // Jei nukertam pabaigą
    if (removeStart > eventStart && removeEnd >= eventEnd) {
      result.push({
        ...event,
        id: createEventId(),
        start: eventStart,
        end: removeStart,
      });
      continue;
    }

    // Jei iškerpam vidurį → padalinam į 2 dalis
    if (removeStart > eventStart && removeEnd < eventEnd) {
      result.push(
        {
          ...event,
          id: createEventId(),
          start: eventStart,
          end: removeStart,
        },
        {
          ...event,
          id: createEventId(),
          start: removeEnd,
          end: eventEnd,
        }
      );
    }
  }

  return result;
}

export function createEventId() {
  return String(eventGuid++)
}