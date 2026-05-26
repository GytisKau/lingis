import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonPage,
  IonPopover,
  IonSelect,
  IonSelectOption,
  useIonRouter,
} from "@ionic/react";
import {
  arrowBackOutline,
  bookOutline,
  checkmarkOutline,
  helpCircleOutline,
  moonOutline,
  schoolOutline,
  timeOutline,
} from "ionicons/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { useAuth } from "../hooks/useAuth";
import "./LoginWizard.css";

interface WizardForm {
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

type InfoPopoverState = {
  isOpen: boolean;
  event?: Event;
  title: string;
  content: React.ReactNode;
};

const defaultForm: WizardForm = {
  email: "",
  username: "",
  avg_theory_time: 0,
  avg_practice_time: 0,
  avg_passive_time: 0,
  avg_active_time: 0,
  avg_sleep_hours: 8,
  preffered_session_time: 30,
  work_hours_start: 8,
  work_hours_end: 20,
  effectiveness_rating: 2,
  study_field: 0,
  chronotype: 0,
};

const studyFields = [
  { label: "STEM", value: 0 },
  { label: "Social", value: 1 },
  { label: "Arts", value: 2 },
  { label: "Finance", value: 3 },
];

const chronotypes = [
  { label: "Morning", value: 0 },
  { label: "Noon", value: 1 },
  { label: "Evening", value: 2 },
];

const effectivenessOptions = [
  { label: "Terrible", value: 0 },
  { label: "Not good", value: 1 },
  { label: "Okay", value: 2 },
  { label: "Good", value: 3 },
  { label: "Excellent", value: 4 },
];

const sleepOptions = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((value) => ({
  label: `${value}h`,
  value,
}));

const timeOptions = [
  { label: "<5 min", value: 5 },
  { label: "10 min", value: 10 },
  { label: "20 min", value: 20 },
  { label: "30 min", value: 30 },
  { label: "60 min", value: 60 },
  { label: "90 min", value: 90 },
];

const hourOptions = Array.from({ length: 25 }, (_, value) => ({
  label: `${value}:00`,
  value,
}));

const getValidStudyingEndOptions = (start: number) => {
  return hourOptions.filter((option) => option.value > start);
};

interface ChoiceButtonsProps {
  value: number;
  options: { label: string; value: number }[];
  onChange: (value: number) => void;
  compact?: boolean;
}

const ChoiceButtons: React.FC<ChoiceButtonsProps> = ({
  value,
  options,
  onChange,
  compact = false,
}) => (
  <div className={`wizard-choice-grid ${compact ? "compact" : ""}`}>
    {options.map((option) => (
      <button
        key={`${option.label}-${option.value}`}
        type="button"
        className={`wizard-choice-button ${
          value === option.value ? "active" : ""
        }`}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const getFallbackUsername = (email?: string | null) => {
  if (!email) return "Student";

  const name = email.split("@")[0]?.trim();

  if (!name) return "Student";

  return name;
};

const LoginWizard: React.FC = () => {
  const router = useIonRouter();
  const { user, updateAccount, finishWizard } = useAuth();

  const contentRef = useRef<HTMLIonContentElement | null>(null);

  const [form, setForm] = useState<WizardForm>(defaultForm);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState("");

  const [infoPopover, setInfoPopover] = useState<InfoPopoverState>({
    isOpen: false,
    event: undefined,
    title: "",
    content: null,
  });

  const users = useLiveQuery(async () => await db.users.toArray(), []) ?? [];
  const currentUser = users[0];

  const totalSteps = 4;

  useEffect(() => {
    contentRef.current?.scrollToTop(250);
  }, [step]);

  useEffect(() => {
    if (currentUser) {
      setForm({
        ...defaultForm,
        ...currentUser,
        email: currentUser.email ?? user?.email ?? "",
      });
    } else {
      setForm({
        ...defaultForm,
        email: user?.email ?? "",
      });
    }
  }, [currentUser, user?.email]);

  const progressPercent = useMemo(
    () => Math.round(((step + 1) / totalSteps) * 100),
    [step]
  );

  const saveWizardUser = async (shouldValidateUsername: boolean) => {
    if (!user) {
      setStatus("Firebase user error.");
      return false;
    }

    const username = form.username.trim();

    if (shouldValidateUsername && !username) {
      setStatus("Please add a username or use Skip for now.");
      return false;
    }

    if (form.work_hours_end <= form.work_hours_start) {
      setStatus("Studying end must be after studying start.");
      return false;
    }

    const userData = {
      ...form,
      email: user.email ?? "",
      username: username || getFallbackUsername(user.email),
    };

    if (currentUser?.id) {
      await db.users.update(currentUser.id, userData);
    } else {
      await db.users.add(userData);
    }

    if (!user.isAnonymous)
      updateAccount(username)

    return true;
  };

  const finish = async (shouldValidateUsername: boolean) => {
    const saved = await saveWizardUser(shouldValidateUsername);

    if (!saved) return;

    finishWizard();
    router.push("/tabs/tab1", "root", "replace");
  };

  const next = () => {
    setStatus("");
    setStep((currentStep) => Math.min(currentStep + 1, totalSteps - 1));
  };

  const back = () => {
    setStatus("");
    setStep((currentStep) => Math.max(currentStep - 1, 0));
  };

  const skip = () => {
    setStatus("");
    finish(false);
  };

  const handleStudyingStartChange = (value: number) => {
    const nextStart = value;
    const nextEnd =
      form.work_hours_end <= nextStart
        ? Math.min(nextStart + 1, 24)
        : form.work_hours_end;

    setForm({
      ...form,
      work_hours_start: nextStart,
      work_hours_end: nextEnd,
    });
  };

  const openInfoPopover = (
    event: React.MouseEvent<HTMLElement>,
    title: string,
    content: React.ReactNode
  ) => {
    event.stopPropagation();

    setInfoPopover({
      isOpen: true,
      event: event.nativeEvent,
      title,
      content,
    });
  };

  const closeInfoPopover = () => {
    setInfoPopover({
      isOpen: false,
      event: undefined,
      title: "",
      content: null,
    });
  };

  const WizardInfoButton = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      className="wizard-info-button"
      onClick={(event) => openInfoPopover(event, title, children)}
      aria-label={`More information about ${title}`}
    >
      <IonIcon icon={helpCircleOutline} />
    </button>
  );

  return (
    <IonPage>
      <IonContent
        ref={contentRef}
        fullscreen
        forceOverscroll={false}
        className="wizard-page"
      >
        <div className="wizard-shell">
          <section className="wizard-hero">
            <img src="/logo.svg" alt="Logo" className="wizard-logo" />

            <h1>Set up your study space</h1>
            <p>
              A few preferences help Lingis plan better. You can skip this and
              edit everything later in Profile settings.
            </p>
          </section>

          {status && <div className="wizard-status">{status}</div>}

          <section className="wizard-settings-card">
            <div className="wizard-card-heading">
              <div className="wizard-card-icon">
                <IonIcon
                  icon={
                    step === 0
                      ? schoolOutline
                      : step === 1
                        ? moonOutline
                        : step === 2
                          ? timeOutline
                          : bookOutline
                  }
                />
              </div>

              <div className="wizard-heading-text">
                <span>Step {step + 1} of {totalSteps}</span>
                <h2>
                  {step === 0 && "Account"}
                  {step === 1 && "Study profile"}
                  {step === 2 && "Session lengths"}
                  {step === 3 && "Studying hours"}
                </h2>
              </div>

              {step === 1 && (
                <WizardInfoButton title="Study profile">
                  <p>
                    These questions help the planner understand your usual
                    energy and study habits. They do not need to be perfect.
                  </p>

                  <ul>
                    <li>
                      <strong>Study field</strong> gives the app a broad idea of
                      what kind of work you usually do.
                    </li>
                    <li>
                      <strong>Chronotype</strong> helps the app understand when
                      you normally focus best.
                    </li>
                    <li>
                      <strong>Effectiveness</strong> is your own feeling about
                      your current study routine.
                    </li>
                    <li>
                      <strong>Sleep hours</strong> help the planner avoid
                      building a schedule that is too intense.
                    </li>
                  </ul>
                </WizardInfoButton>
              )}

              {step === 2 && (
                <WizardInfoButton title="Session lengths">
                  <p>
                    These times help the planner estimate how long different
                    kinds of study work usually take for you.
                  </p>

                  <ul>
                    <li>
                      <strong>Theory</strong> is learning or understanding new
                      material.
                    </li>
                    <li>
                      <strong>Practice</strong> is applying material through
                      exercises, examples, or tasks.
                    </li>
                    <li>
                      <strong>Passive</strong> is reading, watching, reviewing
                      notes, or looking through slides.
                    </li>
                    <li>
                      <strong>Active</strong> is solving, writing, explaining,
                      or creating from memory.
                    </li>
                    <li>
                      <strong>Session</strong> is your preferred general study
                      block length.
                    </li>
                  </ul>
                </WizardInfoButton>
              )}

              {step === 3 && (
                <WizardInfoButton title="Studying hours">
                  <p>
                    These hours tell the planner when it should usually place
                    your study sessions.
                  </p>

                  <ul>
                    <li>
                      Pick the range when you are normally available to study.
                    </li>
                    <li>
                      The planner will try to schedule sessions inside this
                      range.
                    </li>
                    <li>
                      You can still add more exact free time in the calendar
                      later.
                    </li>
                  </ul>
                </WizardInfoButton>
              )}
            </div>

            <div className="wizard-progress-track">
              <div
                className="wizard-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="wizard-card-body">
              {step === 0 && (
                <>
                  <p className="wizard-modal-label">Username</p>
                  <p className="wizard-field-helper">
                    Pick the name you want shown in your profile.
                  </p>

                  <IonItem className="wizard-input-item">
                    <IonInput
                      type="text"
                      placeholder="Enter username"
                      value={form.username}
                      onIonInput={(e) =>
                        setForm({
                          ...form,
                          username: e.detail.value ?? "",
                        })
                      }
                    />
                  </IonItem>
                </>
              )}

              {step === 1 && (
                <>
                  <p className="wizard-modal-label">Study field</p>
                  <p className="wizard-field-helper">
                    The general area your studies belong to.
                  </p>
                  <ChoiceButtons
                    value={form.study_field}
                    options={studyFields}
                    onChange={(value) =>
                      setForm({ ...form, study_field: value })
                    }
                  />

                  <p className="wizard-modal-label">Chronotype</p>
                  <p className="wizard-field-helper">
                    When you usually feel most focused.
                  </p>
                  <ChoiceButtons
                    value={form.chronotype}
                    options={chronotypes}
                    onChange={(value) =>
                      setForm({ ...form, chronotype: value })
                    }
                  />

                  <p className="wizard-modal-label">Effectiveness</p>
                  <p className="wizard-field-helper">
                    How well your current study habits feel to you.
                  </p>
                  <ChoiceButtons
                    value={form.effectiveness_rating}
                    options={effectivenessOptions}
                    onChange={(value) =>
                      setForm({
                        ...form,
                        effectiveness_rating: value,
                      })
                    }
                  />

                  <p className="wizard-modal-label">Average sleep hours</p>
                  <p className="wizard-field-helper">
                    Your usual sleep amount on a normal day.
                  </p>
                  <ChoiceButtons
                    value={form.avg_sleep_hours}
                    options={sleepOptions}
                    compact
                    onChange={(value) =>
                      setForm({ ...form, avg_sleep_hours: value })
                    }
                  />
                </>
              )}

              {step === 2 && (
                <>
                  {[
                    {
                      label: "Theory",
                      key: "avg_theory_time",
                      helper: "Time for understanding new material.",
                    },
                    {
                      label: "Practice",
                      key: "avg_practice_time",
                      helper: "Time for applying material through tasks.",
                    },
                    {
                      label: "Passive",
                      key: "avg_passive_time",
                      helper:
                        "Reading, watching, reviewing, or going through notes.",
                    },
                    {
                      label: "Active",
                      key: "avg_active_time",
                      helper:
                        "Solving, writing, explaining, or working from memory.",
                    },
                    {
                      label: "Session",
                      key: "preffered_session_time",
                      helper: "Your preferred general study block length.",
                    },
                  ].map((item) => (
                    <div key={item.key}>
                      <p className="wizard-modal-label">{item.label}</p>
                      <p className="wizard-field-helper">{item.helper}</p>

                      <ChoiceButtons
                        value={Number(form[item.key as keyof WizardForm] ?? 0)}
                        options={timeOptions}
                        compact
                        onChange={(value) =>
                          setForm({
                            ...form,
                            [item.key]: value,
                          } as WizardForm)
                        }
                      />
                    </div>
                  ))}
                </>
              )}

              {step === 3 && (
                <>
                  <p className="wizard-modal-label">Studying start</p>
                  <p className="wizard-field-helper">
                    The earliest time you prefer to study.
                  </p>

                  <IonItem className="wizard-input-item wizard-select-item">
                    <IonSelect
                      interface="popover"
                      value={String(form.work_hours_start)}
                      onIonChange={(e) =>
                        handleStudyingStartChange(Number(e.detail.value))
                      }
                    >
                      {hourOptions.slice(0, 24).map((option) => (
                        <IonSelectOption
                          key={`start-${option.value}`}
                          value={String(option.value)}
                        >
                          {option.label}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>

                  <p className="wizard-modal-label">Studying end</p>
                  <p className="wizard-field-helper">
                    The latest time you prefer to study.
                  </p>

                  <IonItem className="wizard-input-item wizard-select-item">
                    <IonSelect
                      interface="popover"
                      value={String(form.work_hours_end)}
                      onIonChange={(e) =>
                        setForm({
                          ...form,
                          work_hours_end: Number(e.detail.value),
                        })
                      }
                    >
                      {getValidStudyingEndOptions(form.work_hours_start).map(
                        (option) => (
                          <IonSelectOption
                            key={`end-${option.value}`}
                            value={String(option.value)}
                          >
                            {option.label}
                          </IonSelectOption>
                        )
                      )}
                    </IonSelect>
                  </IonItem>

                  <p className="wizard-helper-text">
                    This tells the planner when you prefer to study. You can
                    update this in Profile settings later.
                  </p>
                </>
              )}
            </div>
          </section>

          <div className="wizard-actions">
            {step > 0 && (
              <IonButton
                fill="outline"
                className="wizard-secondary-button"
                onClick={back}
              >
                <IonIcon slot="start" icon={arrowBackOutline} />
                Back
              </IonButton>
            )}

            <IonButton
              fill="clear"
              className="wizard-skip-button"
              onClick={skip}
            >
              Skip for now
            </IonButton>

            {step < totalSteps - 1 && (
              <IonButton className="wizard-primary-button" onClick={next}>
                Next
              </IonButton>
            )}

            {step === totalSteps - 1 && (
              <IonButton
                className="wizard-primary-button"
                onClick={() => finish(true)}
              >
                <IonIcon slot="start" icon={checkmarkOutline} />
                Finish
              </IonButton>
            )}
          </div>
        </div>

        <IonPopover
          isOpen={infoPopover.isOpen}
          event={infoPopover.event}
          onDidDismiss={closeInfoPopover}
          className="wizard-info-popover"
          showBackdrop={false}
        >
          <div className="wizard-info-cloud">
            <h3>{infoPopover.title}</h3>
            <div>{infoPopover.content}</div>
          </div>
        </IonPopover>
      </IonContent>
    </IonPage>
  );
};

export default LoginWizard;