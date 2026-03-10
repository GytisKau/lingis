import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab2.css';
import { AddEventForm } from '../forms/AddEventForm';
import EventList from '../components/EventList';
import SessionList from '../components/SessionList';

const Tab2: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 2</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 2</IonTitle>
          </IonToolbar>
        </IonHeader>
        <h1>Add Event</h1>
        <AddEventForm/>
        <h1>Event List</h1>
        <EventList/>
        <h1>Session List</h1>
        <SessionList/>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
