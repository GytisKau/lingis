import React, { useState, useEffect } from "react";
import {
  IonButton,
  IonModal,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonContent,
  IonText,
  IonSpinner
} from "@ionic/react";
import { db } from "../db/db";
import { FeaturesInput, Recommendation } from "../utils/Recommendation";
import "../pages/Tab3.css";
import { useLiveQuery } from "dexie-react-hooks";

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
  { label: "Would you like longer sessions?", key: "motivation", options: [1, 2, 3, 4, 5] },
  { label: "Mental work in past few hours?", key: "mentalTiredness", options: [1, 2, 3, 4, 5] },
  { label: "Physical work in past few hours?", key: "physicalTiredness", options: [1, 2, 3, 4, 5] },
  { label: "Do you feel mentally energised?", key: "mentalEnergy", options: [1, 2, 3, 4, 5] },
  { label: "How well do you feel emotionally?", key: "emotional", options: [1, 2, 3, 4, 5] },
  { label: "How well do you feel physically?", key: "physical", options: [1, 2, 3, 4, 5] },
  { label: "Hours slept today?", key: "sleepHours", options: Array.from({ length: 15 }, (_, i) => i) },
];

interface Props {
  modal: React.RefObject<HTMLIonModalElement | null>;
  trigger?: string;
  onClosed?: () => void;
  onCalculated?: (calculatedMinutes: number) => void;
  breakId?: number | null;
  assignmentId: number;
}

const QuestionnaireModal: React.FC<Props> = ({
  modal,
  trigger,
  onClosed,
  onCalculated,
  breakId = null,
  assignmentId,
}) => {  const [step, setStep] = useState<"questions" | "result">("questions");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [recommendation, setRecommendation] = useState<number>();

  const users = useLiveQuery(() => db.users.toArray())
  const user = users !== undefined ? users[0] : undefined
  const questionnaires = useLiveQuery(() => db.questionnaires.toArray(), []);
  const getInitialSleepHours = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysQuestionnaires = (questionnaires ?? [])
    .filter((q: any) => {
      const date = new Date(q.created_at);
      date.setHours(0, 0, 0, 0);
      return date.getTime() === today.getTime();
    })
    .sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  if (todaysQuestionnaires.length > 0) {
  return Math.round(Number(todaysQuestionnaires[0].sleep_quality));
}

 return Math.round(Number(user?.avg_sleep_hours ?? 7));
};
useEffect(() => {
  if (!user || questionnaires === undefined) return;

  setFormData((prev) => ({
    ...prev,
    sleepHours: getInitialSleepHours(),
  }));
}, [user, questionnaires]);

  const isFormValid = Object.entries(formData)
    .filter(([key]) => key !== "created_at")
    .every(([, val]) => val !== -1);

  const handleChange = (field: keyof FormData, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const getRecommendationType = async (): Promise<"theory" | "practice"> => {
  const PASSIVE_TYPE = 0;
  const ACTIVE_TYPE = 1;
  const TESTING_TYPE = 2;
  const TOPIC_TYPE = -1;

  const allTasks = await db.tasks
    .where("fk_assignment")
    .equals(assignmentId)
    .toArray();

  const sortedTasks = [...allTasks].sort(
    (a, b) => (a.toggle_order ?? 0) - (b.toggle_order ?? 0)
  );

  const childrenByParent = new Map<number, typeof allTasks>();

  for (const task of sortedTasks) {
    if (task.parent_task_id != null) {
      const children = childrenByParent.get(task.parent_task_id) ?? [];
      children.push(task);
      childrenByParent.set(task.parent_task_id, children);
    }
  }

  const isTopicTask = (task: typeof allTasks[number]) =>
    task.task_type === TOPIC_TYPE && task.parent_task_id == null;

  const isDoneForPriority = (task: typeof allTasks[number]) => {
    if (!isTopicTask(task)) return task.is_done;

    const children = childrenByParent.get(task.id) ?? [];

    if (children.length === 0) return task.is_done;

    return children.every((child) => child.is_done);
  };

  const priorityTopLevelTasks = sortedTasks
    .filter((task) => task.parent_task_id == null)
    .filter((task) => !isDoneForPriority(task))
    .slice(0, 3);

  const priorityTasks = priorityTopLevelTasks.flatMap((task) => {
    if (!isTopicTask(task)) return [task];

    return (childrenByParent.get(task.id) ?? []).filter(
      (child) => !child.is_done
    );
  });

  if (priorityTasks.length === 0) {
    return "theory";
  }

  const passiveCount = priorityTasks.filter(
    (task) => task.task_type === PASSIVE_TYPE
  ).length;

  const activeTestingCount = priorityTasks.filter(
    (task) =>
      task.task_type === ACTIVE_TYPE ||
      task.task_type === TESTING_TYPE
  ).length;

  return activeTestingCount > passiveCount ? "practice" : "theory";
};

  const handleConfirm = async () => {
    if (step === "result") {
      modal.current?.dismiss();
      return;
    }

    if (!isFormValid || isSaving || !user) return;

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
        fk_break: breakId,
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
      };

      const recommendationType = await getRecommendationType();
      const result = await Recommendation(input, recommendationType);
      result.minutes && onCalculated?.(result.minutes)
      setRecommendation(result.minutes);
      setStep("result");
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };
  const getInitialFormData = () => ({
    ...INITIAL_DATA,
    sleepHours: getInitialSleepHours(),
  });

  const resetForm = () => {
  setStep("questions");
  setFormData(getInitialFormData());
  setRecommendation(undefined);

  onClosed?.();
};

  return (
    <IonModal
      ref={modal}
      trigger={trigger}
      onWillDismiss={resetForm}
      className="questionnaire-modal"
    >
      <IonHeader className="questionnaire-header">
        <IonToolbar className="questionnaire-toolbar">
          <h2 className="questionnaire-title">Questionnaire</h2>

          <IonButtons slot="end">
            <IonButton
              fill="clear"
              className="close-x"
              onClick={() => modal.current?.dismiss()}
            >
              ✕
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="questionnaire-content">
        {step === "questions" ? (
          <div className="questionnaire-list">
            {QUESTIONS.map((q) => (
              <div key={q.key} className="question-card">
                <p className="question-text">{q.label}</p>

                {q.key === "sleepHours" ? (
                  <div className="sleep-grid">
                    {q.options.map((n) => {
                      const isSelected = formData[q.key] === n;

                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => handleChange(q.key, n)}
                          className={
                            "sleep-option" + (isSelected ? " selected-option" : "")
                          }
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="scale-row">
                    {q.options.map((n) => {
                      const isSelected = formData[q.key] === n;

                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => handleChange(q.key, n)}
                          className={
                            "scale-option" + (isSelected ? " selected-option" : "")
                          }
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            <IonButton
              expand="block"
              className="confirm-button"
              disabled={!isFormValid || isSaving}
              onClick={handleConfirm}
            >
              Confirm
            </IonButton>
          </div>
        ) : recommendation === undefined ? (
          <IonText className="ion-text-center result-text">
            <p>Calculating session time</p>
            <IonSpinner />
          </IonText>
        ) : (
          <div className="result-wrap">
            <IonText className="ion-text-center result-text">
              <p>Recommended session time: {recommendation}</p>
            </IonText>

            <IonButton
              expand="block"
              className="confirm-button"
              onClick={handleConfirm}
            >
              Got it
            </IonButton>
          </div>
        )}
      </IonContent>
    </IonModal>
  );
};

export default QuestionnaireModal;