import { IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonMenu, IonMenuButton, IonPage, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import './Tab1.css';
import Calendar from '../components/Calendar';
import { EventApi, formatDate } from '@fullcalendar/react'
import { useState } from 'react';

const Tab1: React.FC = () => {
  const [weekendsVisible, setWeekendsVisible] = useState(true)
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([])

  const handleWeekendsToggle = () => {
    setWeekendsVisible(!weekendsVisible)
    console.log(!weekendsVisible)
  }

  const handleEvents = (events: EventApi[]) => {
    setCurrentEvents(events)
  }

  return (
    <>
      <IonMenu contentId="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Instructions</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonItem>
            <IonLabel>
              <ul>
                <li>Select dates and you will be prompted to create a new event</li>
                <li>Drag, drop, and resize events</li>
                <li>Click an event to delete it</li>
              </ul>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonToggle
              checked={weekendsVisible}
              onIonChange={handleWeekendsToggle}
            >Toggle weekends</IonToggle>
          </IonItem>
          <IonItem>
            <IonLabel>
              <h2>All Events ({currentEvents.length})</h2>
              <ul>
              {currentEvents.map((event) => (
                <li key={event.id}>
                  <b>{formatDate(event.start!, {year: 'numeric', month: 'short', day: 'numeric'})}</b>
                  <i>{event.title}</i>
                </li>
              ))}
            </ul>
            </IonLabel>
          </IonItem>
        </IonContent>
      </IonMenu>
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton>
              </IonMenuButton>
            </IonButtons>
            <IonTitle>Calendar</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Calendar</IonTitle>
            </IonToolbar>
          </IonHeader>
          <Calendar weekendsVisible={weekendsVisible} handleEvents={handleEvents}/>
        </IonContent>
      </IonPage>
    </>
  );
};

export default Tab1;
