import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonFabList, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonMenu, IonMenuButton, IonModal, IonPage, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import './Tab1.css';
import Calendar from '../components/Calendar';
import { EventApi, EventInput, formatDate } from '@fullcalendar/react'
import { useRef, useState } from 'react';
import { timeOutline, add, remove, pencil, trash } from 'ionicons/icons';
import { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';

const Tab1: React.FC = () => {
  const [weekendsVisible, setWeekendsVisible] = useState(true)
  const [events, setEvents] = useState<EventInput[]>([])

  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(true);

  const handleWeekendsToggle = () => {
    setWeekendsVisible(!weekendsVisible)
  }

  const handleEvents = (events: EventApi[]) => {
    setEvents(events.map(event => event.toPlainObject()))
  }

  const handleEditing = (adding: boolean)=> {
    if(isEditing){
      if(isAdding == adding)
        setIsEditing(false)
      else
        setIsAdding(adding)
    } else {
      setIsEditing(true)
      setIsAdding(adding)
    }
  }


  const modal = useRef<HTMLIonModalElement>(null);

  const openModal = () => {
    setIsEditing(false);
    // Set Free Time events to edit in modal
  };


  const confirm = () => {
    modal.current?.dismiss({}, 'confirm'); // Set first argument to edited draft events
  }

  function onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      // Set new Free Time as draft events from `event.detail.data`
    }
  }

  const updateDraft = (
    id: string,
    field: "start" | "end",
    value: string
  ) => {

    // setDraftEvents(prev =>
    //   prev.map(e =>
    //     e.id === id
    //       ? { ...e, [field]: new Date(value) }
    //       : e
    //   )
    // );

  };

  const deleteDraft = (id: string) => {
    // setDraftEvents(prev => prev.filter(e => e.id !== id));
  };
  
  const addDraft = () => {
    // const now = new Date();
    // setDraftEvents(prev => [
    //   ...prev,
    //   {
    //     id: createEventId(),
    //     start: now,
    //     end: new Date(now.getTime() + 60 * 60 * 1000),
    //     display: "background",
    //     title: "Free Time",
    //     color: "silver",
    //   }
    // ]);
  };

  const formatInput = (date: Date) => new Date(date).toLocaleString().slice(0, 16);

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
              <h2>All Events ({events.length})</h2>
              <ul>
              {events.map((event) => (
                <li key={event.id}>
                  <b>{formatDate(event.start!, {year: 'numeric', month: 'short', day: 'numeric'})}</b>
                  {" "}
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
          <Calendar weekendsVisible={weekendsVisible} handleEvents={handleEvents} editing={isEditing} adding={isAdding}/>
          <IonFab slot="fixed" vertical="bottom" horizontal="end">
            <IonFabButton>
              <IonIcon icon={isEditing ? (isAdding ? add : remove) : pencil}></IonIcon>
            </IonFabButton>
            <IonFabList side="top">
              <IonFabButton id="open-modal" onClick={openModal}>
              {/* <IonFabButton id="open-modal"> */}
                <IonIcon icon={timeOutline}></IonIcon>
              </IonFabButton>
              <IonFabButton onClick={() => handleEditing(true)} color={isEditing && isAdding ? "primary" : undefined}>
                <IonIcon icon={add}></IonIcon>
              </IonFabButton>
              <IonFabButton onClick={() => handleEditing(false)} color={isEditing && !isAdding ? "primary" : undefined}>
                <IonIcon icon={remove}></IonIcon>
              </IonFabButton>
            </IonFabList>
          </IonFab>
          <IonModal ref={modal} trigger="open-modal" onWillDismiss={(event) => onWillDismiss(event)}>
            <IonHeader>
              <IonToolbar>
                <IonButtons slot="start">
                  <IonButton onClick={() => modal.current?.dismiss()}>Cancel</IonButton>
                </IonButtons>
                <IonTitle>Edit Free Time</IonTitle>
                <IonButtons slot="end">
                  <IonButton strong={true} onClick={confirm}>
                    Confirm
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              <IonList>
                {events.map(event => (
                  <IonItem key={event.id}>
                    <IonInput
                      type="datetime-local"
                      value={formatInput(event.start as Date)}
                      onIonChange={e =>
                        updateDraft(
                          event.id!,
                          "start",
                          e.detail.value!
                        )
                      }
                    />

                    <IonInput
                      type="datetime-local"
                      value={formatInput(event.end as Date)}
                      onIonChange={e =>
                        updateDraft(
                          event.id!,
                          "end",
                          e.detail.value!
                        )
                      }
                    />

                    <IonButton
                      fill="clear"
                      color="danger"
                      onClick={() => deleteDraft(event.id!)}
                    >
                      <IonIcon icon={trash} />
                    </IonButton>

                  </IonItem>

                ))}
              </IonList>

              <IonButton expand="block" onClick={addDraft}>
                Add new free time
              </IonButton>
            </IonContent>
          </IonModal>
        </IonContent>
      </IonPage>
    </>
  );
};

export default Tab1;
