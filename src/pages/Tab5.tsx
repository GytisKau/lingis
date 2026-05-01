import {
  IonAlert,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonModal,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  addOutline,
  bookOutline,
  briefcaseOutline,
  chevronForwardOutline,
  close,
  cubeOutline,
  documentTextOutline,
  eyeOffOutline,
  eyeOutline,
  logOutOutline,
  lockClosedOutline,
  mailOutline,
  moonOutline,
  notificationsOutline,
  personOutline,
  readerOutline,
  schoolOutline,
  timeOutline,
  trashOutline,
} from "ionicons/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { useAuth } from "../hooks/useAuth";
import "./Tab5.css";

interface ProfileForm {
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

type AssignmentTypeNames = {
  0: string;
  1: string;
  2: string;
};

const ASSIGNMENT_TYPE_NAMES_KEY = "assignmentTypeNames";

const defaultForm: ProfileForm = {
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

const defaultAssignmentTypeNames: AssignmentTypeNames = {
  0: "Exam",
  1: "Lab",
  2: "Other",
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

const hourOptions = Array.from({ length: 25 }, (_, value) => ({
  label: `${value}:00`,
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

const getAssignmentTypeNames = (): AssignmentTypeNames => {
  try {
    const saved = localStorage.getItem(ASSIGNMENT_TYPE_NAMES_KEY);
    if (!saved) return defaultAssignmentTypeNames;

    return {
      ...defaultAssignmentTypeNames,
      ...JSON.parse(saved),
    };
  } catch {
    return defaultAssignmentTypeNames;
  }
};

const labelFor = (
  value: number | undefined,
  options: { label: string; value: number }[]
) => {
  const found = options.find((option) => option.value === value);
  return found?.label ?? "Not set";
};

const formatMinutes = (value: number | undefined) => {
  if (!value || value <= 0) return "Not set";
  return `${value} min`;
};

const formatHours = (start?: number, end?: number) => {
  if (start == null || end == null) return "Not set";
  return `${start}:00 - ${end}:00`;
};

const getInitials = (username?: string, email?: string) => {
  const source = username?.trim() || email?.trim() || "User";
  const parts = source.split(/[.\s@_-]+/).filter(Boolean);

  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

interface SettingsCardProps {
  icon: string;
  title: string;
  children: React.ReactNode;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  icon,
  title,
  children,
}) => (
  <section className="profile-settings-card">
    <div className="profile-card-heading">
      <div className="profile-card-icon">
        <IonIcon icon={icon} />
      </div>
      <h2>{title}</h2>
    </div>

    <div className="profile-card-body">{children}</div>
  </section>
);

interface SettingsRowProps {
  icon: string;
  label: string;
  value?: string;
  danger?: boolean;
  muted?: boolean;
  onClick?: () => void;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  label,
  value,
  danger = false,
  muted = false,
  onClick,
}) => (
  <button
    type="button"
    className={`profile-settings-row ${danger ? "danger" : ""} ${
      muted ? "muted" : ""
    }`}
    onClick={onClick}
  >
    <IonIcon icon={icon} />
    <span className="profile-row-label">{label}</span>
    {value && <span className="profile-row-value">{value}</span>}
    <IonIcon className="profile-row-chevron" icon={chevronForwardOutline} />
  </button>
);

interface SummaryTileProps {
  icon: string;
  label: string;
  value: string;
}

const SummaryTile: React.FC<SummaryTileProps> = ({ icon, label, value }) => (
  <div className="profile-summary-tile">
    <IonIcon icon={icon} />
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

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
  <div className={`profile-choice-grid ${compact ? "compact" : ""}`}>
    {options.map((option) => (
      <button
        key={`${option.label}-${option.value}`}
        type="button"
        className={`profile-choice-button ${
          value === option.value ? "active" : ""
        }`}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const Tab5: React.FC = () => {
  const { user, logout, resetPassword, resetPasswordError } = useAuth();

  const usernameModal = useRef<HTMLIonModalElement>(null);
  const changeEmailModal = useRef<HTMLIonModalElement>(null);
  const studyProfileModal = useRef<HTMLIonModalElement>(null);
  const studyTimesModal = useRef<HTMLIonModalElement>(null);
  const workHoursModal = useRef<HTMLIonModalElement>(null);
  const modulesModal = useRef<HTMLIonModalElement>(null);
  const assignmentTypesModal = useRef<HTMLIonModalElement>(null);

  const [form, setForm] = useState<ProfileForm>(defaultForm);
  const [status, setStatus] = useState("");
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  const [subjectInput, setSubjectInput] = useState("");
  const [subjectColor, setSubjectColor] = useState("#b899ff");
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);

  const [assignmentTypeNames, setAssignmentTypeNames] =
    useState<AssignmentTypeNames>(getAssignmentTypeNames);

  const users = useLiveQuery(async () => await db.users.toArray(), []) ?? [];
  const currentUser = users[0];

  const subjects =
    useLiveQuery(
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

  useEffect(() => {
    if (!status) return;

    const timer = setTimeout(() => {
      setStatus("");
    }, 20000);

    return () => clearTimeout(timer);
  }, [status]);

  const profileEmail = form.email || user?.email || "";
  const profileName = form.username || "Not set yet";

  const studySummary = useMemo(
    () => ({
      field: labelFor(form.study_field, studyFields),
      chronotype: labelFor(form.chronotype, chronotypes),
      session: formatMinutes(form.preffered_session_time),
      workHours: formatHours(form.work_hours_start, form.work_hours_end),
    }),
    [form]
  );

  const updateUser = async (patch: Partial<ProfileForm>) => {
    const nextForm = {
      ...form,
      ...patch,
      email: profileEmail,
    };

    if (!nextForm.username.trim()) {
      setStatus("Username is required.");
      return false;
    }

    if (currentUser?.id) {
      await db.users.update(currentUser.id, nextForm);
    } else {
      await db.users.add(nextForm);
    }

    setForm(nextForm);
    setStatus("Saved.");
    return true;
  };

  const handleSaveUsername = async () => {
    const saved = await updateUser({ username: form.username.trim() });
    if (saved) usernameModal.current?.dismiss();
  };

  const handleSaveStudyProfile = async () => {
    const saved = await updateUser({
      study_field: form.study_field,
      chronotype: form.chronotype,
      effectiveness_rating: form.effectiveness_rating,
      avg_sleep_hours: form.avg_sleep_hours,
    });

    if (saved) studyProfileModal.current?.dismiss();
  };

  const handleSaveStudyTimes = async () => {
    const saved = await updateUser({
      avg_theory_time: form.avg_theory_time,
      avg_practice_time: form.avg_practice_time,
      avg_passive_time: form.avg_passive_time,
      avg_active_time: form.avg_active_time,
      preffered_session_time: form.preffered_session_time,
    });

    if (saved) studyTimesModal.current?.dismiss();
  };

  const handleSaveWorkHours = async () => {
    if (form.work_hours_end <= form.work_hours_start) {
      setStatus("Work end must be after work start.");
      return;
    }

    const saved = await updateUser({
      work_hours_start: form.work_hours_start,
      work_hours_end: form.work_hours_end,
    });

    if (saved) workHoursModal.current?.dismiss();
  };

  const handlePasswordReset = async () => {
    if (!profileEmail) {
      setStatus("No email found for this account.");
      return;
    }

    const success = await resetPassword(profileEmail);

    if (success) {
      setStatus("Password reset email sent.");
    } else {
      setStatus(resetPasswordError?.message ?? "Could not send reset email.");
    }
  };

  const handleChangeEmailPlaceholder = () => {
    if (!newEmail.trim()) {
      setStatus("Enter a new email first.");
      return;
    }

    if (!emailPassword.trim()) {
      setStatus("Enter your current password first.");
      return;
    }

    setStatus(
      "Email change is not connected yet. It needs password confirmation and email verification."
    );
    changeEmailModal.current?.dismiss();
    setNewEmail("");
    setEmailPassword("");
    setShowEmailPassword(false);
  };

  const clearSubjectForm = () => {
    setSubjectInput("");
    setSubjectColor("#b899ff");
    setEditingSubjectId(null);
  };

  const handleSaveSubject = async () => {
    const name = subjectInput.trim();

    if (!name) {
      setStatus("Module name is required.");
      return;
    }

    if (!currentUser?.id) {
      const saved = await updateUser({ username: form.username || "User" });
      if (!saved) return;
    }

    const userId = currentUser?.id ?? users[0]?.id;

    if (!userId) {
      setStatus("Save your profile before adding modules.");
      return;
    }

    if (editingSubjectId !== null) {
      await db.subjects.update(editingSubjectId, {
        name,
        color: subjectColor,
      });
      setStatus("Module renamed.");
    } else {
      await db.subjects.add({
        name,
        color: subjectColor,
        fk_user: userId,
      });
      setStatus("Module added.");
    }

    clearSubjectForm();
  };

  const handleEditSubject = (subject: any) => {
    setEditingSubjectId(subject.id ?? null);
    setSubjectInput(subject.name);
    setSubjectColor(subject.color);
  };

  const handleDeleteSubject = async (subjectId?: number) => {
    if (subjectId == null) return;

    await db.subjects.delete(subjectId);

    if (editingSubjectId === subjectId) clearSubjectForm();
    setStatus("Module deleted.");
  };

  const handleSaveAssignmentTypeNames = () => {
    const cleaned: AssignmentTypeNames = {
      0: assignmentTypeNames[0].trim() || defaultAssignmentTypeNames[0],
      1: assignmentTypeNames[1].trim() || defaultAssignmentTypeNames[1],
      2: assignmentTypeNames[2].trim() || defaultAssignmentTypeNames[2],
    };

    localStorage.setItem(ASSIGNMENT_TYPE_NAMES_KEY, JSON.stringify(cleaned));
    setAssignmentTypeNames(cleaned);

    window.dispatchEvent(new Event("assignmentTypeNamesChanged"));

    setStatus("Assignment type names saved.");
    assignmentTypesModal.current?.dismiss();
  };

  const handleResetAssignmentTypeNames = () => {
    localStorage.removeItem(ASSIGNMENT_TYPE_NAMES_KEY);
    setAssignmentTypeNames(defaultAssignmentTypeNames);
    window.dispatchEvent(new Event("assignmentTypeNamesChanged"));
    setStatus("Assignment type names reset.");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Assignments</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="profile-page" forceOverscroll={false}>
        <div className="profile-shell">
          <section className="profile-hero">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                {getInitials(profileName, profileEmail)}
              </div>
            </div>

            <h1>{profileName}</h1>
            <p>{profileEmail || "No email found"}</p>
          </section>

          {status && <div className="profile-status">{status}</div>}

          <SettingsCard icon={personOutline} title="Account">
            <SettingsRow
              icon={personOutline}
              label="Username"
              value={profileName}
              onClick={() => usernameModal.current?.present()}
            />

            <SettingsRow
              icon={mailOutline}
              label="Change email"
              value="Requires verification"
              onClick={() => changeEmailModal.current?.present()}
            />

            <SettingsRow
              icon={lockClosedOutline}
              label="Change password"
              value="Send reset email"
              onClick={handlePasswordReset}
            />

            <SettingsRow
              icon={logOutOutline}
              label="Log out"
              onClick={logout}
            />

            <SettingsRow
              icon={trashOutline}
              label="Delete account"
              danger
              onClick={() => setDeleteAlertOpen(true)}
            />
          </SettingsCard>

          <SettingsCard icon={schoolOutline} title="Study preferences">
            <div className="profile-summary-grid">
              <SummaryTile
                icon={schoolOutline}
                label="Study field"
                value={studySummary.field}
              />
              <SummaryTile
                icon={moonOutline}
                label="Chronotype"
                value={studySummary.chronotype}
              />
              <SummaryTile
                icon={timeOutline}
                label="Session"
                value={studySummary.session}
              />
              <SummaryTile
                icon={briefcaseOutline}
                label="Work hours"
                value={studySummary.workHours}
              />
            </div>

            <SettingsRow
              icon={schoolOutline}
              label="Personal study profile"
              value="Field, chronotype, sleep"
              onClick={() => studyProfileModal.current?.present()}
            />

            <SettingsRow
              icon={timeOutline}
              label="Preferred session lengths"
              value="Theory, practice, passive, active"
              onClick={() => studyTimesModal.current?.present()}
            />

            <SettingsRow
              icon={briefcaseOutline}
              label="Preferred work hours"
              value={studySummary.workHours}
              onClick={() => workHoursModal.current?.present()}
            />
          </SettingsCard>

          <SettingsCard icon={cubeOutline} title="Modules & assignment types">
            <SettingsRow
              icon={bookOutline}
              label="Manage modules"
              value={`${subjects.length} module${subjects.length === 1 ? "" : "s"}`}
              onClick={() => modulesModal.current?.present()}
            />

            <SettingsRow
              icon={readerOutline}
              label="Assignment type names"
              value={`${assignmentTypeNames[0]}, ${assignmentTypeNames[1]}, ${assignmentTypeNames[2]}`}
              onClick={() => assignmentTypesModal.current?.present()}
            />
          </SettingsCard>

          <SettingsCard icon={notificationsOutline} title="Notifications & alarms">
            <div className="profile-empty-state">
              <div className="profile-empty-icon">
                <IonIcon icon={notificationsOutline} />
              </div>
              <h3>Coming soon</h3>
              <p>Notification settings will be available here.</p>
            </div>
          </SettingsCard>
        </div>

        {/* USERNAME MODAL */}
        <IonModal ref={usernameModal} className="profile-settings-modal">
          <IonHeader>
            <IonToolbar className="profile-modal-toolbar">
              <IonTitle className="profile-modal-title">Edit username</IonTitle>
              <IonButtons slot="end">
                <IonButton
                  fill="clear"
                  className="profile-modal-close"
                  onClick={() => usernameModal.current?.dismiss()}
                >
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <div className="profile-modal-content">
            <p className="profile-modal-label">Username</p>
            <IonItem className="profile-input-item">
              <IonInput
                value={form.username}
                placeholder="Enter username"
                onIonInput={(e) =>
                  setForm({ ...form, username: e.detail.value ?? "" })
                }
              />
            </IonItem>

            <IonButton
              expand="block"
              className="profile-primary-button"
              onClick={handleSaveUsername}
            >
              Save username
            </IonButton>
          </div>
        </IonModal>

        {/* CHANGE EMAIL MODAL */}
        <IonModal ref={changeEmailModal} className="profile-settings-modal">
          <IonHeader>
            <IonToolbar className="profile-modal-toolbar">
              <IonTitle className="profile-modal-title">Change email</IonTitle>
              <IonButtons slot="end">
                <IonButton
                  fill="clear"
                  className="profile-modal-close"
                  onClick={() => changeEmailModal.current?.dismiss()}
                >
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <div className="profile-modal-content">
            <p className="profile-modal-helper-text">
              Changing email needs password confirmation and email verification.
              This screen is ready, but the Firebase logic still needs to be
              connected.
            </p>

            <p className="profile-modal-label">New email</p>
            <IonItem className="profile-input-item">
              <IonInput
                type="email"
                value={newEmail}
                placeholder="new@email.com"
                onIonInput={(e) => setNewEmail(e.detail.value ?? "")}
              />
            </IonItem>

            <p className="profile-modal-label">Current password</p>
            <IonItem className="profile-input-item password-item">
              <IonInput
                type={showEmailPassword ? "text" : "password"}
                value={emailPassword}
                placeholder="Enter password"
                onIonInput={(e) => setEmailPassword(e.detail.value ?? "")}
              />
              <IonButton
                fill="clear"
                className="show-password-button"
                onClick={() => setShowEmailPassword((prev) => !prev)}
              >
                <IonIcon icon={showEmailPassword ? eyeOffOutline : eyeOutline} />
              </IonButton>
            </IonItem>

            <IonButton
              expand="block"
              className="profile-primary-button"
              onClick={handleChangeEmailPlaceholder}
            >
              Continue
            </IonButton>
          </div>
        </IonModal>

        {/* STUDY PROFILE MODAL */}
        <IonModal ref={studyProfileModal} className="profile-settings-modal wide">
          <IonHeader>
            <IonToolbar className="profile-modal-toolbar">
              <IonTitle className="profile-modal-title">
                Study profile
              </IonTitle>
              <IonButtons slot="end">
                <IonButton
                  fill="clear"
                  className="profile-modal-close"
                  onClick={() => studyProfileModal.current?.dismiss()}
                >
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <div className="profile-modal-content scrollable">
            <p className="profile-modal-label">Study field</p>
            <ChoiceButtons
              value={form.study_field}
              options={studyFields}
              onChange={(value) => setForm({ ...form, study_field: value })}
            />

            <p className="profile-modal-label">Chronotype</p>
            <ChoiceButtons
              value={form.chronotype}
              options={chronotypes}
              onChange={(value) => setForm({ ...form, chronotype: value })}
            />

            <p className="profile-modal-label">Effectiveness</p>
            <ChoiceButtons
              value={form.effectiveness_rating}
              options={effectivenessOptions}
              onChange={(value) =>
                setForm({ ...form, effectiveness_rating: value })
              }
            />

            <p className="profile-modal-label">Average sleep hours</p>
            <ChoiceButtons
              value={form.avg_sleep_hours}
              options={sleepOptions}
              compact
              onChange={(value) => setForm({ ...form, avg_sleep_hours: value })}
            />

            <IonButton
              expand="block"
              className="profile-primary-button"
              onClick={handleSaveStudyProfile}
            >
              Save study profile
            </IonButton>
          </div>
        </IonModal>

        {/* STUDY TIMES MODAL */}
        <IonModal ref={studyTimesModal} className="profile-settings-modal wide">
          <IonHeader>
            <IonToolbar className="profile-modal-toolbar">
              <IonTitle className="profile-modal-title">
                Preferred session lengths
              </IonTitle>
              <IonButtons slot="end">
                <IonButton
                  fill="clear"
                  className="profile-modal-close"
                  onClick={() => studyTimesModal.current?.dismiss()}
                >
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <div className="profile-modal-content scrollable">
            {[
              { label: "Theory", key: "avg_theory_time" },
              { label: "Practice", key: "avg_practice_time" },
              { label: "Passive", key: "avg_passive_time" },
              { label: "Active", key: "avg_active_time" },
              { label: "Session", key: "preffered_session_time" },
            ].map((item) => (
              <div key={item.key}>
                <p className="profile-modal-label">{item.label}</p>
                <ChoiceButtons
                  value={Number(form[item.key as keyof ProfileForm] ?? 0)}
                  options={timeOptions}
                  compact
                  onChange={(value) =>
                    setForm({
                      ...form,
                      [item.key]: value,
                    } as ProfileForm)
                  }
                />
              </div>
            ))}

            <IonButton
              expand="block"
              className="profile-primary-button"
              onClick={handleSaveStudyTimes}
            >
              Save session lengths
            </IonButton>
          </div>
        </IonModal>

        {/* WORK HOURS MODAL */}
        <IonModal ref={workHoursModal} className="profile-settings-modal">
          <IonHeader>
            <IonToolbar className="profile-modal-toolbar">
              <IonTitle className="profile-modal-title">Work hours</IonTitle>
              <IonButtons slot="end">
                <IonButton
                  fill="clear"
                  className="profile-modal-close"
                  onClick={() => workHoursModal.current?.dismiss()}
                >
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <div className="profile-modal-content">
            <p className="profile-modal-label">Work start</p>
            <IonItem className="profile-input-item profile-select-item">
              <IonSelect
                interface="popover"
                value={String(form.work_hours_start)}
                onIonChange={(e) =>
                  setForm({
                    ...form,
                    work_hours_start: Number(e.detail.value),
                  })
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

            <p className="profile-modal-label">Work end</p>
            <IonItem className="profile-input-item profile-select-item">
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
                {hourOptions.slice(1, 25).map((option) => (
                  <IonSelectOption
                    key={`end-${option.value}`}
                    value={String(option.value)}
                  >
                    {option.label}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonButton
              expand="block"
              className="profile-primary-button"
              onClick={handleSaveWorkHours}
            >
              Save work hours
            </IonButton>
          </div>
        </IonModal>

        {/* MODULES MODAL */}
        <IonModal ref={modulesModal} className="profile-settings-modal">
          <IonHeader>
            <IonToolbar className="profile-modal-toolbar">
              <IonTitle className="profile-modal-title">Manage modules</IonTitle>
              <IonButtons slot="end">
                <IonButton
                  fill="clear"
                  className="profile-modal-close"
                  onClick={() => modulesModal.current?.dismiss()}
                >
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <div className="profile-modal-content scrollable">
            <div className="profile-module-editor">
              <input
                type="color"
                className="profile-color-input"
                value={subjectColor}
                onChange={(e) => setSubjectColor(e.target.value)}
              />

              <IonItem className="profile-input-item profile-module-input">
                <IonInput
                  placeholder="Module name"
                  value={subjectInput}
                  onIonInput={(e) =>
                    setSubjectInput(String(e.detail.value ?? ""))
                  }
                />
              </IonItem>
            </div>

            <IonButton
              expand="block"
              className="profile-primary-button"
              onClick={handleSaveSubject}
            >
              <IonIcon
                icon={editingSubjectId === null ? addOutline : documentTextOutline}
                slot="start"
              />
              {editingSubjectId === null ? "Add module" : "Save module"}
            </IonButton>

            {editingSubjectId !== null && (
              <IonButton
                expand="block"
                fill="outline"
                className="profile-secondary-button"
                onClick={clearSubjectForm}
              >
                Cancel editing
              </IonButton>
            )}

            <div className="profile-module-list">
              {subjects.length === 0 ? (
                <div className="profile-empty-mini">
                  <IonIcon icon={bookOutline} />
                  <p>No modules yet.</p>
                </div>
              ) : (
                subjects.map((subject: any) => (
                  <div className="profile-module-row" key={subject.id}>
                    <button
                      type="button"
                      className="profile-module-main"
                      onClick={() => handleEditSubject(subject)}
                    >
                      <span
                        className="profile-module-dot"
                        style={{ background: subject.color }}
                      />
                      <span>{subject.name}</span>
                    </button>

                    <button
                      type="button"
                      className="profile-module-delete"
                      onClick={() => handleDeleteSubject(subject.id)}
                    >
                      <IonIcon icon={trashOutline} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </IonModal>

        {/* ASSIGNMENT TYPES MODAL */}
        <IonModal ref={assignmentTypesModal} className="profile-settings-modal">
          <IonHeader>
            <IonToolbar className="profile-modal-toolbar">
              <IonTitle className="profile-modal-title">
                Assignment type names
              </IonTitle>
              <IonButtons slot="end">
                <IonButton
                  fill="clear"
                  className="profile-modal-close"
                  onClick={() => assignmentTypesModal.current?.dismiss()}
                >
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <div className="profile-modal-content">
            {[0, 1, 2].map((type) => (
              <div key={type}>
                <p className="profile-modal-label">Type {type + 1} name</p>
                <IonItem className="profile-input-item">
                  <IonInput
                    value={assignmentTypeNames[type as 0 | 1 | 2]}
                    placeholder={defaultAssignmentTypeNames[type as 0 | 1 | 2]}
                    onIonInput={(e) =>
                      setAssignmentTypeNames({
                        ...assignmentTypeNames,
                        [type]: e.detail.value ?? "",
                      } as AssignmentTypeNames)
                    }
                  />
                </IonItem>
              </div>
            ))}

            <IonButton
              expand="block"
              className="profile-primary-button"
              onClick={handleSaveAssignmentTypeNames}
            >
              Save type names
            </IonButton>

            <IonButton
              expand="block"
              fill="outline"
              className="profile-secondary-button"
              onClick={handleResetAssignmentTypeNames}
            >
              Reset to Exam / Lab / Other
            </IonButton>
          </div>
        </IonModal>

        <IonAlert
          isOpen={deleteAlertOpen}
          onDidDismiss={() => setDeleteAlertOpen(false)}
          header="Delete account"
          message="The delete account button is prepared visually, but full deletion still needs Firebase account deletion and local data cleanup. It is not connected yet."
          buttons={[
            {
              text: "Close",
              role: "cancel",
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab5;