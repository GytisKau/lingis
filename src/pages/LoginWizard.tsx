import {
  IonContent, IonPage, IonButton, IonChip, IonLabel, IonIcon,
  IonInput, IonItem, IonSelect, IonSelectOption,
  useIonRouter
} from '@ionic/react';
import './LoginWizard.css';
import { closeOutline } from "ionicons/icons";
import { db, type Subject } from '../db/db';
import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAuth } from '../hooks/useAuth';

interface FormData {
  email: string;
  username: string;
  avg_theory_time: number;
  avg_practice_time: number;
  avg_passive_time: number;
  avg_active_time: number;
  avg_sleep_hours: number;
  preffered_session_time: number;
  work_hours_start: number;
  work_hours_end: number;
  effectiveness_rating: number;
  study_field: number;
  chronotype: number;
}

const defaultForm: FormData = {
  email: "",
  username: "",
  avg_theory_time: 0,
  avg_practice_time: 0,
  avg_passive_time: 0,
  avg_active_time: 0,
  avg_sleep_hours: 8,
  preffered_session_time: 30,
  work_hours_start: 8,
  work_hours_end: 17,
  effectiveness_rating: 2,
  study_field: 0,
  chronotype: 0,
};

type FieldError = {
  type: keyof FormData;
  error: string;
};

const LoginWizard: React.FC = () => {
  const router = useIonRouter();
  const { user, finishWizard } = useAuth();
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);

  const [subjectInput, setSubjectInput] = useState("");
  const [subjectColor, setSubjectColor] = useState("#8b5cf6");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState<FormData>(defaultForm);
  const [step, setStep] = useState(0);

  const users = useLiveQuery(async () => await db.users.toArray(), []) ?? [];
  const currentUser = users[0];

  const subjects = useLiveQuery(
    async () => {
      if (!currentUser?.id) return [];
      return await db.subjects
        .where("fk_user")
        .equals(currentUser.id)
        .toArray();
    },
    [currentUser?.id]
  ) ?? [];

  useEffect(() => {
  if (users.length > 0) {
    setForm({
      ...defaultForm,
      ...users[0],
      email: users[0].email ?? ""
    });
  }
}, [users]);

  const totalSteps = 4;

  const next = () => setStep(s => Math.min(s + 1, totalSteps - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const saveSubject = async () => {
  const name = subjectInput.trim();

  if (!name) return;

  if (!currentUser?.id) {
    setStatus("Save user first before adding subjects");
    return;
  }

  if (editingSubjectId !== null) {
    await db.subjects.update(editingSubjectId, {
      name,
      color: subjectColor
    });
  } else {
    await db.subjects.add({
      name,
      color: subjectColor,
      fk_user: currentUser.id
    });
  }

  setSubjectInput("");
  setSubjectColor("#8b5cf6");
  setEditingSubjectId(null);
};

  const deleteSubject = async (subjectId: number) => {
    await db.subjects.delete(subjectId);
  };

  const handleConfirm = async () => {
    if (!user?.email) {
      setStatus("Firebase user error");
      return;
    }

    if (form.username.trim() === "") {
      setStatus("Username is required");
      return;
    }

    const userData = {
    ...form,
    email: user.email
  };

    if (users.length === 0) {
      await db.users.add(userData);
    } else {
      await db.users.update(users[0].id!, userData);
    }

    finishWizard();
    router.push("/tabs/tab1", "root", "replace");
  };

  const timeOptions = [
    { label: "<5 min", value: 5 },
    { label: "10 min", value: 10 },
    { label: "20 min", value: 20 },
    { label: "30 min", value: 30 },
    { label: "60 min", value: 60 },
    { label: "90 min", value: 90 },
    { label: ">90 min", value: 90 }
  ];
  
  // TODO: Add proper validation
  // const validateStep = () => {
  //   const errors: FieldError[] = [];

  //   switch (step) {
  //     case 0:
  //       if (form.username.trim() === "")
  //         errors.push({ type: "username", error: "Enter username" });
  //       break;
        
  //     case 1:
  //       if (form.study_field < 0 || form.study_field > 3)
  //         errors.push({ type: "study_field", error: "Select study field" });
        
  //       if (form.chronotype < 0 || form.chronotype > 3)
  //         errors.push({ type: "chronotype", error: "Incorrect chronotype" });

  //       if (form.effectiveness_rating < 0 || form.effectiveness_rating > 4)
  //         errors.push({ type: "effectiveness_rating", error: "Select effectiveness" });

  //       if (form.avg_sleep_hours < 3 || form.avg_sleep_hours > 13)
  //         errors.push({ type: "avg_sleep_hours", error: "3-13 hours required" });
  //       break;

  //     case 2:
  //       if (form.avg_theory_time <= 0)
  //         errors.push({ type: "avg_theory_time", error: "Required" });

  //       if (form.avg_practice_time <= 0)
  //         errors.push({ type: "avg_practice_time", error: "Required" });

  //       if (form.avg_passive_time <= 0)
  //         errors.push({ type: "avg_passive_time", error: "Required" });

  //       if (form.avg_active_time <= 0)
  //         errors.push({ type: "avg_active_time", error: "Required" });

  //       if (form.preffered_session_time <= 0)
  //         errors.push({ type: "preffered_session_time", error: "Required" });
  //       break;

  //     case 3:
  //       if (form.work_hours_end <= form.work_hours_start)
  //         errors.push({ type: "work_hours_end", error: "Must be after start" });
  //       break;
  //   }

  //   return {
  //     isValid: errors.length === 0,
  //     errors
  //   };
  // };

  return (
    <IonPage>
      <IonContent fullscreen className='ion-padding'>

          <div style={{width: "100%"}} className='ion-text-center'>
          <img src="/logo.svg" alt="Logo" className="ion-margin-bottom" width={100} height={100}/>
          </div>

          {status.length > 0 && (
            <div className="status-message">{status}</div>
          )}

            {/* STEP 0 */}
            {step === 0 && (
              <>
                <h2 className='ion-text-center'>Enter Username</h2>
                <p className="auth-label">Username</p>
                <IonItem className="auth-item">
                  <IonInput
                    errorText={"Username required"}
                    type="text"
                    placeholder="Enter username"
                    value={form?.username}
                    onIonChange={e => setForm({ ...form, username: e.detail.value ?? "" })}
                  />
                </IonItem>
              </>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <h2 className='ion-text-center'>Fill all personal info</h2>
                <p className="auth-label">Study field</p>
                <IonItem className="auth-item">
                  <IonSelect
                    interface="popover"
                    interfaceOptions={{ cssClass: "custom-select-popover" }}
                    placeholder="Select..."
                    onIonChange={e => setForm({ ...form, study_field: Number(e.detail.value) })}
                    value={String(form.study_field)}
                  >
                    <IonSelectOption value="0">STEM</IonSelectOption>
                    <IonSelectOption value="1">Social</IonSelectOption>
                    <IonSelectOption value="2">Arts</IonSelectOption>
                    <IonSelectOption value="3">Finance</IonSelectOption>
                  </IonSelect>
                </IonItem>

                <p className="auth-label">Chronotype</p>
                <IonItem className="auth-item">
                  <IonSelect
                    interface="popover"
                    interfaceOptions={{ cssClass: "custom-select-popover" }}
                    placeholder="Select..."
                    onIonChange={e => setForm({ ...form, chronotype: Number(e.detail.value) })}
                    value={String(form.chronotype)}
                  >
                    <IonSelectOption value="0">Morning</IonSelectOption>
                    <IonSelectOption value="1">Noon</IonSelectOption>
                    <IonSelectOption value="2">Evening</IonSelectOption>
                  </IonSelect>
                </IonItem>

                <p className="auth-label">Effectiveness</p>
                <IonItem className="auth-item">
                  <IonSelect
                    interface="popover"
                    interfaceOptions={{cssClass: "custom-select-popover" }}
                    placeholder="Select..."
                    onIonChange={e => setForm({ ...form, effectiveness_rating: Number(e.detail.value) })}
                    value={String(form.effectiveness_rating)}
                    >
                    <IonSelectOption value="0">Terrible</IonSelectOption>
                    <IonSelectOption value="1">Not good</IonSelectOption>
                    <IonSelectOption value="2">Okay</IonSelectOption>
                    <IonSelectOption value="3">Good</IonSelectOption>
                    <IonSelectOption value="4">Excellent</IonSelectOption>
                  </IonSelect>
                </IonItem>

                <p className="auth-label">Sleep hours</p>
                <IonItem className="auth-item">
                  <IonInput
                    type="number"
                    value={form.avg_sleep_hours}
                    onIonChange={e => setForm({ ...form, avg_sleep_hours: Number(e.detail.value) })}
                    min={3}
                    max={13}  
                  />
                </IonItem>

                <p className="auth-label">Semester subjects</p>
              <IonItem className="auth-item" lines="none">
  <div style={{ display: "flex", alignItems: "center", width: "100%", gap: "12px" }}>
    
    <input
      type="color"
      value={subjectColor}
      onChange={(e) => setSubjectColor(e.target.value)}
      style={{
        width: "40px",
        height: "40px",
        border: "none",
        borderRadius: "10px",
        padding: "0",
        background: "none",
        cursor: "pointer"
      }}
    />

    <IonInput
      placeholder="Write a subject..."
      value={subjectInput}
      onIonInput={(e) => setSubjectInput(String(e.detail.value ?? ""))}
      style={{
        flex: 1
      }}
    />

  </div>
</IonItem>

              <IonButton
                expand="block"
                className="purple-button"
                onClick={saveSubject}
              >
                {editingSubjectId !== null ? "Save changes" : "Add subject"}
              </IonButton>

              <div className="subject-chip-container">
                {subjects.map((subject) => (
                  <IonChip
                    key={subject.id}
                    onClick={() => {
                      setEditingSubjectId(subject.id);
                      setSubjectInput(subject.name);
                      setSubjectColor(subject.color);
                    }}
                    style={{
                      "--background": subject.color,
                      "--color": "#ffffff",
                      cursor: "pointer"
                    } as React.CSSProperties}
                  >
                    <IonLabel>{subject.name}</IonLabel>

                    <IonIcon
                      icon={closeOutline}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSubject(subject.id);
                      }}
                    />
                  </IonChip>
                ))}
              </div>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <h2 className='ion-text-center'>Select all study times</h2>
                {["Theory", "Practice", "Passive", "Active", "Session"].map((q, i) => (
                  <div key={i}>
                    <p className="auth-label">{q}</p>
                    <IonItem className="auth-item">
                      <IonSelect
                        interface="popover"
                        interfaceOptions={{ cssClass: "custom-select-popover" }}
                        placeholder="Select..."
                        value={
                          i === 0 ? form.avg_theory_time :
                          i === 1 ? form.avg_practice_time :
                          i === 2 ? form.avg_passive_time :
                          i === 3 ? form.avg_active_time :
                            form.preffered_session_time
                        }
                        onIonChange={e => {
                          const val = e.detail.value;
                          const keys = [
                            "avg_theory_time",
                            "avg_practice_time",
                            "avg_passive_time",
                            "avg_active_time",
                            "preffered_session_time"
                          ];
                          setForm({ ...form, [keys[i]]: Number(val) });
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
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <h2 className='ion-text-center'>Check working hours</h2>
                <p className="auth-label">Work start</p>
                <IonItem className="auth-item">
                  <IonInput
                    type="number"
                    placeholder="From"
                    value={form.work_hours_start}
                    onIonChange={e => setForm({ ...form, work_hours_start: Number(e.detail.value) })}
                  />
                </IonItem>

                <p className="auth-label">Work end</p>
                <IonItem className="auth-item">
                  <IonInput
                    type="number"
                    value={form.work_hours_end}
                    onIonChange={e => setForm({ ...form, work_hours_end: Number(e.detail.value) })}
                  />
                </IonItem>
              </>
            )}
          <div className="button-container">
            {step > 0 && <IonButton onClick={back}>Back</IonButton>}
            {step < totalSteps - 1 && <IonButton onClick={next}>Next</IonButton>}
            {step === totalSteps - 1 && (
              <IonButton onClick={handleConfirm}>Confirm</IonButton>
            )}
          </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginWizard;