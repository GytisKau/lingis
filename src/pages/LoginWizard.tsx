import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonText, IonModal, 
  IonButtons, IonInput, IonItem, IonRippleEffect, IonLabel, IonSelect, IonSelectOption } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './LoginWizard.css';
import { db, User } from '../db/db';
import { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
import { useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from "react";

interface FormData{
  email?: string,
  username?: string,
  avg_theory_time?: number,
  avg_practice_time?: number,
  avg_sleep_hours?: number,
  preffered_session_time?: number,
  work_hours_start?: number,
  work_hours_end?: number,
  effectiveness_rating?: number,
  study_field?: number,
  chronotype?: number
}

const LoginWizard: React.FC = () => {
  const [status, setStatus] = useState("")
  const [fromHours, setFromHours] = useState<string>("");
  const [toHours, setToHours] = useState<string>("");
  const [sleepHours, setSleepHours] = useState<string>("");
  const [confirmData, setConfirmData] = useState<{ timestamp: string; hour: number } | null>(null);

  const [form, setForm] = useState<FormData>({})
  
  const questions = [
    "What is your average theory studying time?",
    "What is your average practical studying time?",
    "What is your prefered study session time?"
  ];
  const timeOptions = [
  {label:"<5 min", value:5},
  {label:"10 min", value:10},
  {label:"20 min", value:20},
  {label:"30 min", value:30},
  {label:"60 min", value:60},
  {label:"90 min", value:90},
  {label:">90 min", value:120}
];

  const users = useLiveQuery(
    async () => await db.users.toArray(),
    []
  )

  useEffect(() => {
    if (users && users.length > 0) {
      setForm(users[0]);
    }
  }, [users]);

  if (users == undefined){
    return (
      <p>Loading...</p>
    )
  }

  const handleConfirm = async () => {

    if (form == undefined || form.avg_practice_time == undefined || form.avg_sleep_hours == undefined ||
        form.avg_theory_time == undefined || form.chronotype == undefined || form.effectiveness_rating == undefined || 
        form.email == undefined || form.preffered_session_time == undefined || form.study_field == undefined ||
        form.username == undefined || form.work_hours_end == undefined || form.work_hours_start == undefined
    ){
      setStatus("Please fill in all required fields")
      console.log(form)
      return;
    }
    else{
    setStatus("")
    if (users.length == 0){
      try {
        const id = await db.users.add({
          email: form.email,
          username: form.username,
          avg_theory_time: -1,
          avg_practice_time: -1,
          avg_sleep_hours: -1,
          preffered_session_time: -1,
          work_hours_start: -1,
          work_hours_end: -1,
          effectiveness_rating: -1,
          study_field: -1,
          chronotype: -1
        });
      }
      catch (error) {
        setStatus(`Failed to add: ${error}`);
      }
    }else
      {
      setStatus("Successfully updated!")

      await db.users.update(users[0].id!, {
      email: form.email,
      username: form.username,
      avg_theory_time: form.avg_theory_time,
      avg_practice_time: form.avg_practice_time,
      avg_sleep_hours: form.avg_sleep_hours,
      preffered_session_time: form.preffered_session_time,
      work_hours_start: form.work_hours_start,
      work_hours_end: form.work_hours_end,
      effectiveness_rating: form.effectiveness_rating,
      study_field: form.study_field,
      chronotype: form.chronotype
    });
  }
    }
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
  <p>{status}</p>

        {/* <IonItem>
          <IonLabel>Name</IonLabel>
          <IonInput
            type="text"
            placeholder="name"
            value={sleepHours}
            // onIonChange={e => setSleepHours(e.detail.value!)}
            onIonChange={e => setForm({...form, username: e.detail.value ?? ""})}
            style={{ width: '70px', textAlign: 'right' }} // optional: make the input smaller and right-aligned
          />
        </IonItem> */}


        <IonItem>
          <IonLabel>Username</IonLabel>
          <IonInput
            type="text"
            placeholder="username"
            value={form?.username}
            // onIonChange={e => setSleepHours(e.detail.value!)}
            onIonChange={e => setForm({...form, username: e.detail.value ?? ""})}
            style={{ width: '70px', textAlign: 'right' }} // optional: make the input smaller and right-aligned
          />
        </IonItem>

          <IonItem>
            <IonLabel>Email</IonLabel>
            <IonInput
              type="text"
              placeholder="email"
              value={form?.email}
              // onIonChange={e => setSleepHours(e.detail.value!)}
              onIonChange={e => setForm({...form, email: e.detail.value ?? ""})}
              style={{ width: '70px', textAlign: 'right' }} // optional: make the input smaller and right-aligned
            />
          </IonItem>

          <IonItem>
            <IonSelect label="What is your study field?" placeholder="STEM..."
              onIonChange={e => setForm({...form, study_field: e.detail.value ?? 0})}
              value={form?.study_field}
              >
              <IonSelectOption value="0">STEM</IonSelectOption>
              <IonSelectOption value="1">Social and humanitarian studies</IonSelectOption>
              <IonSelectOption value="2">Arts and creative studies</IonSelectOption>
              <IonSelectOption value="3">Finance and management</IonSelectOption>
            </IonSelect>
          </IonItem>


          <IonItem>
          <IonSelect label="What is your chronotype?" placeholder="Chronotype..."
            onIonChange={e => setForm({...form, chronotype: e.detail.value ?? 0})}
            value={form?.chronotype}>
          <IonSelectOption value="morning">Morning person</IonSelectOption>
          <IonSelectOption value="noon">Noon person</IonSelectOption>
          <IonSelectOption value="evening">Evening person</IonSelectOption>
          </IonSelect>
          </IonItem>

          
          <IonItem>
          <IonSelect label="How effective are your current studying habits?" placeholder="Rate..."
            onIonChange={e => setForm({...form, effectiveness_rating: e.detail.value ?? 0})}
            value={form?.effectiveness_rating}>
          <IonSelectOption value="0">Terrible</IonSelectOption>
          <IonSelectOption value="1">Not good</IonSelectOption>
          <IonSelectOption value="2">Okay</IonSelectOption>
          <IonSelectOption value="3">Good</IonSelectOption>
          <IonSelectOption value="4">Excellent</IonSelectOption>
          </IonSelect>
          </IonItem>

          <IonItem>
          <IonLabel>On average, how many hours of sleep do you need to feel the best (well-rested, etc.)?</IonLabel>
          <IonInput
            type="number"
            placeholder="3-13"
            value={form?.avg_sleep_hours}
            onIonChange={e => {
              // Convert to integer
              const val = e.detail.value ? Math.floor(Number(e.detail.value)) : 0;
              //setSleepHours(val.toString())
              setForm({...form, avg_sleep_hours: val});
            }}
            min={3}
            max={13}
            style={{ width: '60px', textAlign: 'right' }}
          />
        </IonItem>
    

            {questions.map((q, i) => (
              <IonItem key={i}>
                <IonLabel>{q}</IonLabel>
                <IonSelect
                  placeholder="Choose prefered"
                  value={
                    i === 0 ? form.avg_theory_time :
                    i === 1 ? form.avg_practice_time :
                    form.preffered_session_time
                  }
                  onIonChange={e => {
                    const val = e.detail.value;

                    if (i === 0) setForm({...form, avg_theory_time: val});
                    if (i === 1) setForm({...form, avg_practice_time: val});
                    if (i === 2) setForm({...form, preffered_session_time: val});
                  }}
                >
                {timeOptions.map(opt => (
                  <IonSelectOption key={opt.value} value={opt.value}>
                    {opt.label}
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
                value={form?.work_hours_start}
                onIonChange={e => { 
                  const val = e.detail.value ? Math.floor(Number(e.detail.value)) : 0;
                  setForm({...form, work_hours_start: val})
                }}
                //onIonChange={e => setForm({...form, username: e.detail.value ?? ""})}
                min={0}
                max={form?.work_hours_end}
                style={{ width: '50px', textAlign: 'right', marginRight: '5px' }}
              />
              <span style={{ margin: '0 5px' }}>–</span>
              <IonInput
                type="number"
                placeholder="To"
                value={form?.work_hours_end}
                 onIonChange={e => { 
                  const val = e.detail.value ? Math.floor(Number(e.detail.value)) : 24;
                  setForm({...form, work_hours_end: val})
                }}
                min={form?.work_hours_start}
                max={24}
                style={{ width: '50px', textAlign: 'right', marginLeft: '5px' }}
              />
            </IonItem>

            <IonItem>
              <IonButton onClick={handleConfirm}>
                Confirm
              </IonButton>
            </IonItem>
            </IonContent>                
      </IonContent>
    </IonPage>
  );
};

export default LoginWizard;
