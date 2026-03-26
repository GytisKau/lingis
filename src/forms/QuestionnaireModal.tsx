import React, { Suspense, useRef, useState } from "react";
import {
  IonButton, IonItem, IonSelect, IonModal, IonHeader,
  IonToolbar, IonSelectOption, IonButtons, IonTitle,
  IonContent, IonText,
  IonLoading,
  IonSpinner,
  IonRange,
  IonLabel,
  IonList
} from "@ionic/react";
import { db, User } from "../db/db";
import { FeaturesInput, Recommendation } from "../utils/Recommendation";
import { IonModalCustomEvent, OverlayEventDetail } from '@ionic/core/components';

interface FormData {
  motivation: number;
  mentalTiredness: number;
  physicalTiredness: number;
  mentalEnergy: number;
  emotional: number;
  physical: number;
  sleepHours: number;
  created_at: string | null;
}

const INITIAL_DATA: FormData = {
  motivation: -1,
  mentalTiredness: -1,
  physicalTiredness: -1,
  mentalEnergy: -1,
  emotional: -1,
  physical: -1,
  sleepHours: -1,
  created_at: null,
};

const QUESTIONS: { label: string; key: keyof FormData; options: number[] }[] = [
  { label: "Would you like to take longer sessions?", key: "motivation", options: [1, 2, 3, 4, 5] },
  { label: "Mental work in past few hours?", key: "mentalTiredness", options: [1, 2, 3, 4, 5] },
  { label: "Physical work in past few hours?", key: "physicalTiredness", options: [1, 2, 3, 4, 5] },
  { label: "Do you feel mentally energised?", key: "mentalEnergy", options: [1, 2, 3, 4, 5] },
  { label: "How well do you feel emotionally?", key: "emotional", options: [1, 2, 3, 4, 5] },
  { label: "How well do you feel physically?", key: "physical", options: [1, 2, 3, 4, 5] },
  { label: "Hours slept today?", key: "sleepHours", options: Array.from({ length: 14 }, (_, i) => i) },
];

interface Props {
  modal: React.RefObject<HTMLIonModalElement | null>;
  trigger: string;
  onClosed: (result: number) => void;
  user?: User;
}

const QuestionnaireModal: React.FC<Props> = ({ modal, trigger, onClosed, user }) => {
  // const modal = useRef<HTMLIonModalElement>(null);
  const [step, setStep] = useState<"questions" | "result">("questions");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [recommendation, setRecommendation] = useState<number>();

  const isFormValid = Object.values(formData).every((val) => val !== -1);

  if (user == undefined) return

  const handleChange = (field: keyof FormData, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = async () => {
    if (step === "result") return modal.current?.dismiss(recommendation, "done");
    if (!isFormValid || isSaving) return;

    setIsSaving(true);
    const now = new Date();

    try {
      await db.questionnaires.add({
        motivation: formData.motivation,
        mental_tiredness: formData.mentalTiredness,
        physical_tiredness: formData.physicalTiredness,
        mental_energy: formData.mentalEnergy,
        emotional: formData.emotional,
        physical: formData.physical,
        sleep_quality: formData.sleepHours,
        created_at: now,
      });

      const input: FeaturesInput = {
        motivation: formData.motivation,
        mentalTiredness: formData.mentalTiredness,
        physicalTiredness: formData.physicalTiredness,
        mentalEnergy: formData.mentalEnergy,
        emotional: formData.emotional,
        physical: formData.physical,
        sleepHours: formData.sleepHours,
        avgSleep: user.avg_sleep_hours,
        avgTheory_code: user.avg_theory_time,
        avgPractice_code: user.avg_practice_time,
        avgPassive_code: user.avg_passive_time,
        avgActive_code: user.avg_active_time,
        effectiveness: user.effectiveness_rating,
      }
      Recommendation(input, "practice").then(result => {
        setRecommendation(result.minutes);
      })
      setFormData(prev => ({ ...prev, created_at: now.toISOString() }));
      setStep("result");
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = (event: IonModalCustomEvent<OverlayEventDetail>) => {
    setStep("questions");
    setFormData(INITIAL_DATA);
    if(event.detail.role === "done"){
      onClosed(event.detail.data)
    }
  };

  return (
    <IonModal 
      ref={modal} 
      trigger={trigger} 
      onWillDismiss={resetForm}
    >
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            {step === "questions" && (
              <IonButton onClick={() => modal.current?.dismiss()}>Cancel</IonButton>
            )}
          </IonButtons>
          <IonTitle>Questionnaire</IonTitle>
          <IonButtons slot="end">
            <IonButton 
              strong 
              disabled={!isFormValid || isSaving} 
              onClick={handleConfirm}
            >
              {step === "questions" ? "Confirm" : "Got it!"}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {step === "questions" ? (
          QUESTIONS.map((q) => (
            <IonItem key={q.key}>
              <IonSelect
                label={q.label}
                labelPlacement="stacked"
                interface="popover"
                value={formData[q.key]}
                onIonChange={(e) => handleChange(q.key, Number(e.detail.value))}
              >
                {q.options.map((n) => (
                  <IonSelectOption key={n} value={n}>{n}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          ))
        ) : 
          recommendation == undefined ? (
            <>
              <IonText className="ion-text-center">
                <p>
                  Calculating session time
                </p>
                <IonSpinner></IonSpinner>
              </IonText>
            </>
          ) : (
            <IonText className="ion-text-center">
              <p>Recomended session time: {recommendation}</p>
            </IonText>
          )}
      </IonContent>
    </IonModal>
  );
};

export default QuestionnaireModal;