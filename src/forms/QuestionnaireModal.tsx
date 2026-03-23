import { useRef, useState } from "react"
import { db } from "../db/db"
import {
  IonButton,
  IonItem,
  IonSelect,
  IonLabel,
  IonModal,
  IonHeader,
  IonToolbar,
  IonSelectOption,
  IonButtons,
  IonTitle,
  IonContent,
  IonText
} from "@ionic/react"
import { OverlayEventDetail } from "@ionic/core/components"

interface QuestionnaireModal {
  trigger: string
}

interface FormData {
  motivation: number
  mentalTiredness: number
  physicalTiredness: number
  mentalEnergy: number
  emotional: number
  physical: number
  sleepHours: number
  created_at: string | null
  fk_user: 1
}

const QuestionnaireModal: React.FC<QuestionnaireModal> = ({ trigger }) => {
  const [step, setStep] = useState<"questions" | "result">("questions")
  const modal = useRef<HTMLIonModalElement>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    motivation: -1,
    mentalTiredness: -1,
    physicalTiredness: -1,
    mentalEnergy: -1,
    emotional: -1,
    physical: -1,
    sleepHours: -1,
    created_at: null,
    fk_user: 1
  })

  const initialFormData: FormData = {
  motivation: -1,
  mentalTiredness: -1,
  physicalTiredness: -1,
  mentalEnergy: -1,
  emotional: -1,
  physical: -1,
  sleepHours: -1,
  created_at: null,
  fk_user: 1
}
  

  const [confirmData, setConfirmData] = useState<{ timestamp: string; hour: number } | null>(null)
  
  const isFormValid = () => {
  return (
    formData.motivation !== -1 &&
    formData.mentalTiredness !== -1 &&
    formData.physicalTiredness !== -1 &&
    formData.mentalEnergy !== -1 &&
    formData.emotional !== -1 &&
    formData.physical !== -1 &&
    formData.sleepHours !== -1
  )
}

  const handleChange = (field: keyof FormData, value: number | string | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }
  
  const handleConfirm = async () => {
  if (step === "result") {
        modal.current?.dismiss()
        return
      }
    if (!isFormValid()) return

    if (isSaving) return
    setIsSaving(true)

    const now = new Date()

    const dataToSave = {
      motivation: formData.motivation,
      mental_tiredness: formData.mentalTiredness,
      physical_tiredness: formData.physicalTiredness,
      mental_energy: formData.mentalEnergy,
      emotional: formData.emotional,
      physical: formData.physical,
      sleep_quality: formData.sleepHours,
      created_at: now.toISOString(),
      fk_user: 1 as const
    }

    try {
      const id = await db.questionnaires.add({
        motivation: formData.motivation,
      mental_tiredness: formData.mentalTiredness,
      physical_tiredness: formData.physicalTiredness,
      mental_energy: formData.mentalEnergy,
      emotional: formData.emotional,
      physical: formData.physical,
      sleep_quality: formData.sleepHours,
      created_at: now,
      fk_user: 1 as const
      })

      setConfirmData({
        timestamp: dataToSave.created_at,
        hour: now.getHours()
      })

      setFormData((prev) => ({
        ...prev,
        created_at: dataToSave.created_at
      }))

      setStep("result")
    } catch (error) {
      console.error("Failed to save questionnaire:", error)
    } finally {
    setIsSaving(false)
  }
  }

  function onWillDismiss(_event: CustomEvent<OverlayEventDetail>) {
  setStep("questions")
  setConfirmData(null)
  setFormData(initialFormData)
}

  return (
    <IonModal
      ref={modal}
      trigger={trigger}
      onWillDismiss={onWillDismiss}
      onDidDismiss={() => setStep("questions")}
    >
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
          {step === "questions" && (
            <IonButton onClick={() => modal.current?.dismiss()}>
              Cancel
            </IonButton>
          )}          
          </IonButtons>

          <IonButtons slot="end">
            <IonButton
              id="questionnaire-confirm"
              strong={true}
              disabled={!isFormValid() || isSaving}
              onClick={handleConfirm}
            >
               {step === "questions" ? "Confirm" : "Got it!"}
            </IonButton>
          </IonButtons>

          <IonTitle>Questionnaire</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {step === "questions" ? (
          <>
            <IonItem>
              <IonLabel>Would you like to take longer sessions?</IonLabel>
              <IonSelect
                placeholder="Rate 1–5"
                value={formData.motivation}
                onIonChange={(e) => handleChange("motivation", Number(e.detail.value))}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <IonSelectOption key={n} value={n}>
                    {n}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel>Have you done a lot of mental work in the past few hours?</IonLabel>
              <IonSelect
                placeholder="Rate 1–5"
                value={formData.mentalTiredness}
                onIonChange={(e) => handleChange("mentalTiredness", Number(e.detail.value))}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <IonSelectOption key={n} value={n}>
                    {n}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel>Have you done a lot of physical work in the past few hours?</IonLabel>
              <IonSelect
                placeholder="Rate 1–5"
                value={formData.physicalTiredness}
                onIonChange={(e) => handleChange("physicalTiredness", Number(e.detail.value))}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <IonSelectOption key={n} value={n}>
                    {n}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel>Do you feel mentally energised right now?</IonLabel>
              <IonSelect
                placeholder="Rate 1–5"
                value={formData.mentalEnergy}
                onIonChange={(e) => handleChange("mentalEnergy", Number(e.detail.value))}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <IonSelectOption key={n} value={n}>
                    {n}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel>How well do you feel emotionally?</IonLabel>
              <IonSelect
                placeholder="Rate 1–5"
                value={formData.emotional}
                onIonChange={(e) => handleChange("emotional", Number(e.detail.value))}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <IonSelectOption key={n} value={n}>
                    {n}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel>How well do you feel physically?</IonLabel>
              <IonSelect
                placeholder="Rate 1–5"
                value={formData.physical}
                onIonChange={(e) => handleChange("physical", Number(e.detail.value))}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <IonSelectOption key={n} value={n}>
                    {n}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel>How many hours did you sleep today?</IonLabel>
              <IonSelect
                placeholder="Pick 0–13"
                value={formData.sleepHours}
                onIonChange={(e) => handleChange("sleepHours", Number(e.detail.value))}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((n) => (
                  <IonSelectOption key={n} value={n}>
                    {n}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          </>
        ) : (
          <IonText className="centered-text">
            {/* {confirmData && <p>Answered at hour: {confirmData.hour}</p>} */}
            
          </IonText>
        )}
      </IonContent>
    </IonModal>
  )
}

export default QuestionnaireModal