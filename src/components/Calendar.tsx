import FullCalendar, { DateSelectData, EventApi } from '@fullcalendar/react'
import themePlugin from '@fullcalendar/react/themes/breezy' // YOUR THEME
import interactionPlugin from '@fullcalendar/react/interaction'
import dayGridPlugin from '@fullcalendar/react/daygrid'
import timeGridPlugin from '@fullcalendar/react/timegrid'

import '@fullcalendar/react/skeleton.css'
import '@fullcalendar/react/themes/breezy/theme.css' // YOUR THEME
import "../theme/emerald.css"

import { FreeTimeEvent, mergeRanges, removeRange } from './event-utils'
import { useState } from 'react'
interface CalendarProps {
  weekendsVisible: boolean;
  editing: boolean;
  adding: boolean;
  handleEvents: (events: EventApi[]) => void;
}

const Calender: React.FC<CalendarProps> = ({ weekendsVisible, editing, adding, handleEvents }) => {
  const [events, setEvents] = useState<FreeTimeEvent[]>([]);

  const handleSelect = (selectInfo: DateSelectData) => {
    setEvents(prev => {
      if (adding)
        return mergeRanges(prev, selectInfo.start, selectInfo.end);
      else
        return removeRange(prev, selectInfo.start, selectInfo.end);
    });

    selectInfo.view.calendar.unselect();
  };


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
      eventsSet={handleEvents}
    />
  )
}

const disableScroll = () => {
  document.body.style.overflow = "hidden";
  document.body.style.touchAction = "none";
};

const enableScroll = () => {
  document.body.style.overflow = "";
  document.body.style.touchAction = "";
};

export default Calender;