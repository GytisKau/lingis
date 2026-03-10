import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, 
  IonRouterOutlet, IonModal, IonButtons, IonItem, IonInput, IonLabel, IonSegment, IonSegmentButton, IonRippleEffect} from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import { OverlayEventDetail } from '@ionic/core/components';
import './Tab3.css';
import { useRef, useState } from 'react';

const Tab3: React.FC = () => {
  const modal = useRef<HTMLIonModalElement>(null);
  const input = useRef<HTMLIonInputElement>(null);

  const [message, setMessage] = useState(
    'This modal example uses triggers to automatically open a modal when the button is clicked.'
  );

  function confirm() {
    modal.current?.dismiss(input.current?.value, 'confirm');
  }

  function onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      setMessage(`Hello, ${event.detail.data}!`);
    }
  }
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 3</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 3</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonButton id ="assignment-picker" color="coral" className="start-session-button">Start session</IonButton>
        <IonModal ref={modal} trigger="assignment-picker" onWillDismiss={(event) => onWillDismiss(event)}>
                  <IonHeader>
                    <IonToolbar>
                      <IonButtons slot="start">
                        <IonButton onClick={() => modal.current?.dismiss()}>Cancel</IonButton>
                      </IonButtons>
                      <IonTitle>Pick the assignment</IonTitle>
                      <IonButtons slot="end">

                      </IonButtons>
                    </IonToolbar>
                  </IonHeader>
                  <IonContent className="ion-padding">
                    {[...Array(5)].map((_, i) => (
                    <IonItem key={i}>
                      <IonButton routerLink="/viewsession" size="large" fill="clear" onClick={() => modal.current?.dismiss()}>
                        Egzaminas {i}
                      </IonButton>
                      <IonRippleEffect />
                    </IonItem>
                  ))}
                  </IonContent>
                </IonModal>
        <ExploreContainer name="Tab 3 page" />
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
