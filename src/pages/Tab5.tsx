import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';
import { useAuth } from '../hooks/useAuth';
import './Tab5.css';
import { FeaturesInput, Recommendation } from '../utils/Recommendation';

const Tab5: React.FC = () => {
  const { logout } = useAuth();

  const testRecommendation = async () => {
    const input: FeaturesInput = {
      motivation: 4,
      mentalTiredness: 2,
      physicalTiredness: 3,
      mentalEnergy: 4,
      emotional: 3,
      physical: 3,
      sleepHours: 6,
      avgSleep: 7,
      avgTheory_code: 3,
      avgPractice_code: 4,
      avgPassive_code: 2,
      avgActive_code: 3,
      effectiveness: 4
    }
    console.log(await Recommendation(input, 'practice'))
  }

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

        <IonButton 
          onClick={testRecommendation} 
          expand='block'
          color="warning"
        >
          Test Model
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Tab5;