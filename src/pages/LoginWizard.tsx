import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonText, IonModal, 
  IonButtons, IonInput, IonItem, IonRippleEffect, IonLabel, IonSelect, IonSelectOption } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './LoginWizard.css';
import { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { useRef, useState } from 'react';

const LoginWizard: React.FC = () => {
  const [fromHours, setFromHours] = useState<string>("");
  const [toHours, setToHours] = useState<string>("");
  const [sleepHours, setSleepHours] = useState<string>("");
  const questions = [
  "What is your average theory studying time?",
  "What is your average practical studying time?",
  "What is your prefered study session time?",
  "Do you feel mentally energised right now?",
];

  const [confirmData, setConfirmData] = useState<{ timestamp: string; hour: number } | null>(null);

const handleConfirm = () => {
  const now = new Date();

  const data = {
    timestamp: now.toISOString(),
    hour: now.getHours()
  };

  setConfirmData(data);
};

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>LoginWizard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Wizard</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">

        <IonLabel>Name, username ir t.t. db sudėti tik kol kas, paskui jų nereikės kai padarys login page</IonLabel>


        <IonItem>
          <IonLabel>Name</IonLabel>
          <IonInput
            type="text"
            placeholder="name"
            value={sleepHours}
            onIonChange={e => setSleepHours(e.detail.value!)}
            style={{ width: '70px', textAlign: 'right' }} // optional: make the input smaller and right-aligned
          />
        </IonItem>


        <IonItem>
          <IonLabel>Username</IonLabel>
          <IonInput
            type="text"
            placeholder="username"
            value={sleepHours}
            onIonChange={e => setSleepHours(e.detail.value!)}
            style={{ width: '70px', textAlign: 'right' }} // optional: make the input smaller and right-aligned
          />
        </IonItem>

          <IonItem>
            <IonLabel>Email</IonLabel>
            <IonInput
              type="text"
              placeholder="email"
              value={sleepHours}
              onIonChange={e => setSleepHours(e.detail.value!)}
              style={{ width: '70px', textAlign: 'right' }} // optional: make the input smaller and right-aligned
            />
          </IonItem>

          <IonItem>
          <IonSelect label="What is your study field?" placeholder="STEM...">
          <IonSelectOption value="stem">STEM</IonSelectOption>
          <IonSelectOption value="sochum">Social and humanitarian studies</IonSelectOption>
          <IonSelectOption value="arts">Arts and creative studies</IonSelectOption>
          <IonSelectOption value="finance">Finance and management</IonSelectOption>
          </IonSelect>
          </IonItem>


          <IonItem>
          <IonSelect label="What is your chronotype?" placeholder="Chronotype...">
          <IonSelectOption value="morning">Morning person</IonSelectOption>
          <IonSelectOption value="noon">Noon person</IonSelectOption>
          <IonSelectOption value="evening">Evening person</IonSelectOption>
          </IonSelect>
          </IonItem>

          
          <IonItem>
          <IonSelect label="How effective are your current studying habits?" placeholder="Rate...">
          <IonSelectOption value="1">Terrible</IonSelectOption>
          <IonSelectOption value="2">Not good</IonSelectOption>
          <IonSelectOption value="3">Okay</IonSelectOption>
          <IonSelectOption value="4">Good</IonSelectOption>
          <IonSelectOption value="5">Excellent</IonSelectOption>
          </IonSelect>
          </IonItem>

          <IonItem>
          <IonLabel>On average, how many hours of sleep do you need to feel the best (well-rested, etc.)?</IonLabel>
          <IonInput
            type="number"
            placeholder="3-13"
            value={sleepHours}
            onIonChange={e => {
              // Convert to integer
              const val = e.detail.value ? Math.floor(Number(e.detail.value)) : "";
              setSleepHours(val.toString());
            }}
            min={3}
            max={13}
            style={{ width: '60px', textAlign: 'right' }}
          />
        </IonItem>
    

            {questions.map((q, i) => (
            <IonItem key={i}>
              <IonLabel>{q}</IonLabel>
              <IonSelect placeholder="Choose prefered">
                {["10 min","20 min","30 min","60 min","90 min"].map(n => (
                  <IonSelectOption key={n} value={n}>
                    {n}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          ))}

          <IonItem>
            <IonLabel>Your working hours</IonLabel>
              <IonInput
                type="number"
                placeholder="From"
                value={fromHours}
                onIonChange={e => {
                  const val = e.detail.value ? Math.floor(Number(e.detail.value)) : "";
                  setFromHours(val.toString());
                }}
                min={0}
                max={24}
                style={{ width: '50px', textAlign: 'right', marginRight: '5px' }}
              />
              <span style={{ margin: '0 5px' }}>–</span>
              <IonInput
                type="number"
                placeholder="To"
                value={toHours}
                onIonChange={e => {
                  const val = e.detail.value ? Math.floor(Number(e.detail.value)) : "";
                  setToHours(val.toString());
                }}
                min={0}
                max={24}
                style={{ width: '50px', textAlign: 'right', marginLeft: '5px' }}
              />
            </IonItem>

            </IonContent>                
      </IonContent>
    </IonPage>
  );
};

export default LoginWizard;
