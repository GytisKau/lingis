import FullCalendar, { DateClickData, DateSelectData, EventApi, EventClickData, EventDisplayData } from '@fullcalendar/react'
import themePlugin from '@fullcalendar/react/themes/breezy' // YOUR THEME
import interactionPlugin from '@fullcalendar/react/interaction'
import dayGridPlugin from '@fullcalendar/react/daygrid'
import timeGridPlugin from '@fullcalendar/react/timegrid'
import listPlugin from '@fullcalendar/react/list'
import multimonthPlugin from '@fullcalendar/react/multimonth'

import '@fullcalendar/react/skeleton.css'
import '@fullcalendar/react/themes/breezy/theme.css' // YOUR THEME
// import '@fullcalendar/react/themes/breezy/palettes/emerald.css' // YOUR THEME + PALETTE
import "../theme/emerald.css"

import { INITIAL_EVENTS, createEventId } from './event-utils'

interface CalendarProps {
  weekendsVisible: boolean;
  handleEvents: (events: EventApi[]) => void;
}

const Calender: React.FC<CalendarProps> = ({ weekendsVisible, handleEvents }) => {
  const handleDateSelect = (selectInfo: DateSelectData) => {
    let title = prompt('Please enter a new title for your event')
    let calendarApi = selectInfo.view.calendar

    calendarApi.unselect() // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      })
    }
  }

  const handleEventClick = (clickInfo: EventClickData) => {
    if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      clickInfo.event.remove()
    }
  }

  return (
     <FullCalendar
      plugins={[themePlugin, dayGridPlugin, timeGridPlugin, interactionPlugin]}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      }}
      initialView='dayGridMonth'
      height="100%"
      editable={true}
      selectable={true}
      selectMirror={true}
      dayMaxEvents={true}
      weekends={weekendsVisible}
      initialEvents={INITIAL_EVENTS} // alternatively, use the `events` setting to fetch from a feed
      select={handleDateSelect}
      eventContent={renderEventContent} // custom render function
      eventClick={handleEventClick}
      eventsSet={handleEvents} // called after events are initialized/added/changed/removed
      /* you can update a remote database when these fire:
      eventAdd={function(){}}
      eventChange={function(){}}
      eventRemove={function(){}}
      */
    />
  )
}

function renderEventContent(eventInfo: EventDisplayData) {
  return (
    <>
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
    </>
  )
}

export default Calender;