import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton,
  IonInput, IonItem, IonSelect, IonSelectOption, useIonRouter, IonProgressBar,
  IonList} from '@ionic/react';
import './LoginWizard.css';
import { db } from '../db/db';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from "react";
import { useAuth } from '../hooks/useAuth';

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
  const router = useIonRouter();
  const { finishWizard } = useAuth();
  const [status, setStatus] = useState("")

  const [form, setForm] = useState<FormData>({})
  
  const questions = [
    "Average theory studying time",
    "Average practical studying time",
    "Prefered study session time"
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
    <IonPage>
      <IonContent fullscreen>
        <IonProgressBar type="indeterminate"></IonProgressBar>
      </IonContent>
    </IonPage>
  )
}
  const handleConfirm = async () => {

    if (form == undefined || form.avg_practice_time == undefined || form.avg_sleep_hours == undefined ||
        form.avg_theory_time == undefined || form.chronotype == undefined || form.effectiveness_rating == undefined || 
        form.email == undefined || form.preffered_session_time == undefined || form.study_field == undefined ||
        form.username == undefined || form.work_hours_end == undefined || form.work_hours_start == undefined
    ){
      setStatus("Please fill in all required fields")
      return;
    }
    
    setStatus("")
    if (users.length == 0){
      await db.users.add({
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
      })
      .catch((error) => {
        setStatus(`Failed to add: ${error}`);
        return;
      });
    } else {
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
      }).catch((error) => {
        setStatus(`Failed update: ${error}`);
        return;
      });
    }
    finishWizard()
    router.push("/tabs/tab1", "root", "replace");
  };


  return (
    /*<IonPage>
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

        <IonContent className="ion-padding register-content">
          <img src="/lingis/logo.png" alt="Logo" className="register-logo" />*/
          
      <IonPage>
          <IonContent fullscreen>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '20px' }}>
              <img src="/lingis/logo.png" alt="Logo" className="register-logo" />
            </div>

        <div className="status-message">{status}</div>
        <IonList>
        <p className="auth-label">Username</p>

        <IonItem className="auth-item">
          <IonInput
            type="text"
            placeholder="Enter text"
            value={form?.username}
            onIonChange={e => setForm({...form, username: e.detail.value ?? ""})}
          />
        </IonItem>

          <p className="auth-label">Email</p>
          <IonItem className="auth-item">
            <IonInput
              type="email"
              placeholder="email@mail.com"
              value={form?.email}
              onIonChange={e => setForm({...form, email: e.detail.value ?? ""})}
            />
          </IonItem>
          
          <p className="auth-label">Study field</p>

          <IonItem className="auth-item">
            <IonSelect placeholder="STEM..." labelPlacement='stacked'
              onIonChange={e => setForm({...form, study_field: Number(e.detail.value) ?? 0})}
              value={String(form?.study_field)}
              >
              <IonSelectOption value="0">STEM</IonSelectOption>
              <IonSelectOption value="1">Social and humanitarian studies</IonSelectOption>
              <IonSelectOption value="2">Arts and creative studies</IonSelectOption>
              <IonSelectOption value="3">Finance and management</IonSelectOption>
            </IonSelect>
          </IonItem>

          <p className="auth-label">Chronotype</p>

          <IonItem className="auth-item">
            <IonSelect 
              placeholder="Chronotype..." 
              onIonChange={e => setForm({...form, chronotype: e.detail.value ?? 0})}
              value={form?.chronotype}>
              <IonSelectOption value="morning">Morning person</IonSelectOption>
              <IonSelectOption value="noon">Noon person</IonSelectOption>
              <IonSelectOption value="evening">Evening person</IonSelectOption>
            </IonSelect>
          </IonItem>

          <p className="auth-label">Study habits</p>

          <IonItem className="auth-item">
            <IonSelect 
              placeholder="My study habits are..." 
              onIonChange={e => setForm({...form, effectiveness_rating: Number(e.detail.value) ?? 0})}
              value={String(form?.effectiveness_rating)}>
              <IonSelectOption value="0">Terrible</IonSelectOption>
              <IonSelectOption value="1">Not good</IonSelectOption>
              <IonSelectOption value="2">Okay</IonSelectOption>
              <IonSelectOption value="3">Good</IonSelectOption>
              <IonSelectOption value="4">Excellent</IonSelectOption>
            </IonSelect>
          </IonItem>

          <p className="auth-label">Average well rested sleep hours</p>

          <IonItem className="auth-item">
            <IonInput
              type="number"
              placeholder="3-13"
              value={form?.avg_sleep_hours}
              onIonChange={e => {
                const val = e.detail.value ? Math.floor(Number(e.detail.value)) : 0;
                setForm({...form, avg_sleep_hours: val});
              }}
              min={3}
              max={13}
            />
          </IonItem>
    

            {questions.map((q, i) => (
              <div key={i}>
                
                <p className="auth-label">{q}</p>

                <IonItem className="auth-item">
                  <IonSelect
                    placeholder="Select..."
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

              </div>
            ))}

          <p className="auth-label">Working hours start</p>

          <IonItem className="auth-item">
            <IonInput
              type="number"
              placeholder="From"
              value={form?.work_hours_start}
              onIonChange={e => { 
                const val = e.detail.value ? Math.floor(Number(e.detail.value)) : 0;
                setForm({...form, work_hours_start: val})
              }}
              min={0}
              max={form?.work_hours_end}
            />
          </IonItem>    

          <p className="auth-label">Working hours end</p>

          <IonItem className="auth-item">
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
              // style={{ width: '50px', textAlign: 'right', marginLeft: '5px' }}
            />
          </IonItem>

          </IonList>
          <IonButton onClick={handleConfirm} expand='block' className="auth-button">
            Confirm
          </IonButton>
        </IonContent>                
    </IonPage>
  );
};

export default LoginWizard;
