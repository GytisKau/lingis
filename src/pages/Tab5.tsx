import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';
import { useAuth } from '../hooks/useAuth';
import './Tab5.css';

const Tab5: React.FC = () => {
  const { logout } = useAuth();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className='ion-padding'>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Profile Preferences</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <IonButton 
          routerLink='/loginwizard' 
          expand='block'
        >
          Wizard Preferences
        </IonButton>
        
        <IonButton 
          onClick={logout} 
          expand='block'
          className="logout-button"
        >
          Logout
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Tab5;