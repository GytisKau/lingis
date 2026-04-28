import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonInput,
  IonIcon,
} from "@ionic/react";

import { useEffect, useMemo, useRef, useState } from "react";
import { LingisEvent } from "../db/db";
import { updateEdited } from "./Calendar";
import { close, trash } from "ionicons/icons";

interface Props {
  trigger: string;
  freeTimes: LingisEvent[];
}

interface EditableFreeTime {
  start: string;
  end: string;
}

function formatDateTimeLocal(date: Date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function roundToNextQuarter(date: Date) {
  const d = new Date(date);
  const minutes = d.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;

  d.setMinutes(roundedMinutes);
  d.setSeconds(0);
  d.setMilliseconds(0);

  return d;
}

function createDefaultFreeTime(): EditableFreeTime {
  const start = roundToNextQuarter(new Date());
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  return {
    start: formatDateTimeLocal(start),
    end: formatDateTimeLocal(end),
  };
}

function isFutureFreeTime(event: LingisEvent) {
  return new Date(event.end).getTime() > new Date().getTime();
}

function sortFreeTimes(list: EditableFreeTime[]) {
  return [...list].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );
}

function validateFreeTime(range: EditableFreeTime) {
  const start = new Date(range.start);
  const end = new Date(range.end);
  const now = new Date();

  if (!range.start || !range.end) {
    return "Choose both a start and end time.";
  }

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Choose a valid date and time.";
  }

  if (end <= start) {
    return "End time must be after start time.";
  }

  if (end <= now) {
    return "Free time cannot be fully in the past.";
  }

  return "";
}

const FreeTimeModal: React.FC<Props> = ({ trigger, freeTimes }) => {
  const modalRef = useRef<HTMLIonModalElement>(null);

  const [draft, setDraft] = useState<EditableFreeTime[]>([]);
  const [newFreeTime, setNewFreeTime] = useState<EditableFreeTime>(
    createDefaultFreeTime()
  );
  const [error, setError] = useState("");

  const futureFreeTimes = useMemo(() => {
    return freeTimes
      .filter(isFutureFreeTime)
      .map((event) => ({
        start: formatDateTimeLocal(new Date(event.start)),
        end: formatDateTimeLocal(new Date(event.end)),
      }));
  }, [freeTimes]);

  useEffect(() => {
    setDraft(sortFreeTimes(futureFreeTimes));
  }, [futureFreeTimes]);

  const saveDraft = async (nextDraft: EditableFreeTime[]) => {
    const cleaned = nextDraft.filter(
      (event) => new Date(event.end).getTime() > new Date().getTime()
    );

    const invalid = cleaned.find((event) => validateFreeTime(event));

    if (invalid) {
      setError(validateFreeTime(invalid));
      return;
    }

    setError("");

    await updateEdited(
      cleaned.map((event) => ({
        start: new Date(event.start),
        end: new Date(event.end),
      }))
    );
  };

  const addFreeTime = async () => {
    const validationError = validateFreeTime(newFreeTime);

    if (validationError) {
      setError(validationError);
      return;
    }

    const nextDraft = sortFreeTimes([...draft, newFreeTime]);

    setDraft(nextDraft);
    setNewFreeTime(createDefaultFreeTime());
    setError("");

    await saveDraft(nextDraft);
  };

  const updateExistingFreeTime = async (
    index: number,
    patch: Partial<EditableFreeTime>
  ) => {
    const nextDraft = draft.map((event, i) =>
      i === index ? { ...event, ...patch } : event
    );

    setDraft(nextDraft);

    const changedEvent = nextDraft[index];
    const validationError = validateFreeTime(changedEvent);

    if (validationError) {
      setError(validationError);
      return;
    }

    await saveDraft(nextDraft);
  };

  const removeFreeTime = async (index: number) => {
    const nextDraft = draft.filter((_, i) => i !== index);

    setDraft(nextDraft);
    setError("");

    await saveDraft(nextDraft);
  };

  const closeModal = () => {
    setError("");
    modalRef.current?.dismiss();
  };

  const resetModal = () => {
    setDraft(sortFreeTimes(futureFreeTimes));
    setNewFreeTime(createDefaultFreeTime());
    setError("");
  };

  return (
    <IonModal
      ref={modalRef}
      trigger={trigger}
      className="free-time-picker-modal"
      onWillPresent={resetModal}
    >
      <IonHeader className="free-time-header">
        <IonToolbar className="free-time-toolbar">
          <IonTitle className="free-time-title">Edit free time</IonTitle>

          <IonButtons slot="end">
            <IonButton className="close-x" onClick={closeModal}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="free-time-content">
        <div className="free-time-panel">
          <section className="free-time-add-section">
            <h3>Add free time</h3>
            <p>Pick a start and end time. It saves when you add it.</p>

            <div className="free-time-fields">
              <label>
                <span>Start</span>
                <IonInput
                  className="free-time-input"
                  type="datetime-local"
                  value={newFreeTime.start}
                  onIonInput={(event) =>
                    setNewFreeTime((prev) => ({
                      ...prev,
                      start: String(event.detail.value ?? ""),
                    }))
                  }
                />
              </label>

              <label>
                <span>End</span>
                <IonInput
                  className="free-time-input"
                  type="datetime-local"
                  value={newFreeTime.end}
                  onIonInput={(event) =>
                    setNewFreeTime((prev) => ({
                      ...prev,
                      end: String(event.detail.value ?? ""),
                    }))
                  }
                />
              </label>
            </div>

            {error && <p className="free-time-error">{error}</p>}

            <IonButton
              expand="block"
              className="free-time-add-button"
              onClick={addFreeTime}
            >
              Add free time
            </IonButton>
          </section>

          <section className="free-time-list-section">
            <div className="free-time-list-header">
              <h3>Upcoming free time</h3>
              <span>{draft.length}</span>
            </div>

            {draft.length === 0 ? (
              <div className="free-time-empty">
                <h4>No upcoming free time</h4>
                <p>Add a time above to make space for study sessions.</p>
              </div>
            ) : (
              <div className="free-time-list">
                {draft.map((event, index) => (
                  <div
                    className="free-time-item"
                    key={`${event.start}-${event.end}-${index}`}
                  >
                    <div className="free-time-fields">
                      <label>
                        <span>Start</span>
                        <IonInput
                          className="free-time-input"
                          type="datetime-local"
                          value={event.start}
                          onIonChange={(inputEvent) =>
                            updateExistingFreeTime(index, {
                              start: String(inputEvent.detail.value ?? ""),
                            })
                          }
                        />
                      </label>

                      <label>
                        <span>End</span>
                        <IonInput
                          className="free-time-input"
                          type="datetime-local"
                          value={event.end}
                          onIonChange={(inputEvent) =>
                            updateExistingFreeTime(index, {
                              end: String(inputEvent.detail.value ?? ""),
                            })
                          }
                        />
                      </label>
                    </div>

                    <button
                      className="free-time-delete-button"
                      onClick={() => removeFreeTime(index)}
                    >
                      <IonIcon icon={trash} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default FreeTimeModal;