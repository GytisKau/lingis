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
  IonPopover,
  IonSelect,
  IonSelectOption,
  IonToolbar,
} from "@ionic/react";
import {
  addOutline,
  bookOutline,
  chevronForwardOutline,
  close,
  cubeOutline,
  documentTextOutline,
  helpCircleOutline,
  logOutOutline,
  lockClosedOutline,
  moonOutline,
  notificationsOutline,
  personOutline,
  readerOutline,
  schoolOutline,
  timeOutline,
  trashOutline,
  lockOpenOutline,
} from "ionicons/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type AssignmentType } from "../db/db";
import { useAuth } from "../hooks/useAuth";
import "./Tab5.css";
import { Header } from "../components/Header";
import { useNotificationPermission } from "../hooks/useNotificationPermission";
import { startLingisGuide } from "../components/GuideOverlay";

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

type InfoPopoverState = {
  isOpen: boolean;
  event?: Event;
  title: string;
  content: React.ReactNode;
};


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
  work_hours_end: 20,
  effectiveness_rating: 2,
  study_field: 0,
  chronotype: 0,
};


const defaultAssignmentTypes = ["Exam", "Lab", "Other"];

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

const getValidStudyingEndOptions = (start: number) => {
  return hourOptions.filter((option) => option.value > start);
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
    disabled={onClick === undefined}
  >
    <IonIcon icon={icon} />
    <span className="profile-row-label">{label}</span>
    <span className="profile-row-value">{value && value}</span>
    {onClick === undefined ? (
      <span></span>
    ) : (
      <IonIcon className="profile-row-chevron" icon={chevronForwardOutline} />
    )}
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
  const { user, logout, updateAccount, deleteAccount, resetPassword, resetPasswordError } = useAuth();
  const permission = useNotificationPermission();

  const usernameModal = useRef<HTMLIonModalElement>(null);
  const studyProfileModal = useRef<HTMLIonModalElement>(null);
  const studyTimesModal = useRef<HTMLIonModalElement>(null);
  const workHoursModal = useRef<HTMLIonModalElement>(null);
  const modulesModal = useRef<HTMLIonModalElement>(null);
  const assignmentTypesModal = useRef<HTMLIonModalElement>(null);

  const [form, setForm] = useState<ProfileForm>(defaultForm);
  const [status, setStatus] = useState("");
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);

  const [subjectInput, setSubjectInput] = useState("");
  const [subjectColor, setSubjectColor] = useState("#b899ff");
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);

  const [assignmentTypeInput, setAssignmentTypeInput] = useState("");
  const [editingAssignmentTypeId, setEditingAssignmentTypeId] =
    useState<number | null>(null);

  const [infoPopover, setInfoPopover] = useState<InfoPopoverState>({
    isOpen: false,
    event: undefined,
    title: "",
    content: null,
  });

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

    const assignmentTypes =
  useLiveQuery(
    async () => {
      if (!currentUser?.id) return [];

      return await db.assignment_types
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
      studyingHours: formatHours(form.work_hours_start, form.work_hours_end),
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

    updateAccount(nextForm.username.trim());

    setForm(nextForm);
    setStatus("Saved.");
    return true;
  };

  const clearAssignmentTypeForm = () => {
  setAssignmentTypeInput("");
  setEditingAssignmentTypeId(null);
};

const handleSaveAssignmentType = async () => {
  const name = assignmentTypeInput.trim();

  if (!name) {
    setStatus("Assignment type name is required.");
    return;
  }

  if (!currentUser?.id) {
    const saved = await updateUser({ username: form.username || "User" });
    if (!saved) return;
  }

  const userId = currentUser?.id ?? users[0]?.id;

  if (!userId) {
    setStatus("Save your profile before adding assignment types.");
    return;
  }

  if (editingAssignmentTypeId !== null) {
    await db.assignment_types.update(editingAssignmentTypeId, {
      name,
    });

    setStatus("Assignment type renamed.");
  } else {
    await db.assignment_types.add({
      name,
      fk_user: userId,
    });

    setStatus("Assignment type added.");
  }

  clearAssignmentTypeForm();
};

const handleEditAssignmentType = (assignmentType: AssignmentType) => {
  setEditingAssignmentTypeId(assignmentType.id ?? null);
  setAssignmentTypeInput(assignmentType.name);
};

const handleDeleteAssignmentType = async (assignmentTypeId?: number) => {
  if (assignmentTypeId == null) return;

  const assignmentsUsingType = await db.assignments
    .where("assignment_type")
    .equals(assignmentTypeId)
    .count();

  if (assignmentsUsingType > 0) {
    setStatus("This assignment type is used by existing assignments.");
    return;
  }

  await db.assignment_types.delete(assignmentTypeId);

  if (editingAssignmentTypeId === assignmentTypeId) {
    clearAssignmentTypeForm();
  }

  setStatus("Assignment type deleted.");
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

  const handleSaveWorkHours = async () => {
    if (form.work_hours_end <= form.work_hours_start) {
      setStatus("Studying end must be after studying start.");
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

  const toggleMockPremium = async () => {
    if (currentUser?.id) {
      await db.users.update(currentUser.id, {
        is_premium: !(currentUser as any).is_premium,
      } as any);

      setStatus(
        (currentUser as any).is_premium
          ? "Premium mock turned off. Ads can appear again."
          : "Premium mock turned on. Ads are hidden."
      );

      return;
    }

    const newUser = {
      ...form,
      email: profileEmail,
      username: form.username.trim() || "User",
      is_premium: true,
    };

    await db.users.add(newUser as any);
    setStatus("Premium mock turned on. Ads are hidden.");
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

  const ModalInfoButton = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      className="profile-modal-info-button"
      onClick={(event) => openInfoPopover(event, title, children)}
      aria-label={`More information about ${title}`}
    >
      <IonIcon icon={helpCircleOutline} />
    </button>
  );

  useEffect(() => {
  const createDefaults = async () => {
    if (!currentUser?.id) return;

    const existingCount = await db.assignment_types
      .where("fk_user")
      .equals(currentUser.id)
      .count();

    if (existingCount > 0) return;

    await db.assignment_types.bulkAdd(
      defaultAssignmentTypes.map((name) => ({
        name,
        fk_user: currentUser.id!,
      }))
    );
  };

  createDefaults();
}, [currentUser?.id]);

  return (
    <IonPage>
      <Header title="Profile" />
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
                icon={bookOutline}
                label="Studying hours"
                value={studySummary.studyingHours}
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
              icon={bookOutline}
              label="Preferred studying hours"
              value={studySummary.studyingHours}
              onClick={() => workHoursModal.current?.present()}
            />
          </SettingsCard>

          <div id="profile-modules-types-section">
            <SettingsCard icon={cubeOutline} title="Modules & assignment types">
              <SettingsRow
                icon={bookOutline}
                label="Manage modules"
                value={`${subjects.length} module${
                  subjects.length === 1 ? "" : "s"
                }`}
                onClick={() => modulesModal.current?.present()}
              />

              <SettingsRow
                icon={readerOutline}
                label="Manage assignment types"
                value={`${assignmentTypes.length} type${
                assignmentTypes.length === 1 ? "" : "s"
              }`}
                onClick={() => assignmentTypesModal.current?.present()}
              />
            </SettingsCard>
          </div>

          <SettingsCard icon={notificationsOutline} title="Notifications">
            <SettingsRow
              icon={permission === "granted" ? lockOpenOutline : lockClosedOutline}
              label="Permissions"
              value={permission}
              onClick={
                permission === "default"
                  ? () => Notification.requestPermission()
                  : undefined
              }
            />
          </SettingsCard>

          <div id="profile-guide-section">
            <SettingsCard icon={helpCircleOutline} title="Help & Guide">
              <button
                id="profile-guide-button"
                type="button"
                className="profile-settings-row"
                onClick={startLingisGuide}
              >
                <IonIcon icon={helpCircleOutline} />
                <span className="profile-row-label">Start guide again</span>
                <span className="profile-row-value">Quick tour</span>
                <IonIcon
                  className="profile-row-chevron"
                  icon={chevronForwardOutline}
                />
              </button>
            </SettingsCard>
          </div>

          <section className="premium-mock-section">
            <button
              type="button"
              className={`premium-mock-card ${
                (currentUser as any)?.is_premium ? "active" : ""
              }`}
              onClick={toggleMockPremium}
            >
              <span className="premium-mock-check">
                {(currentUser as any)?.is_premium ? "✓" : ""}
              </span>

              <div className="premium-mock-text">
                <h3>Premium mock</h3>
                <p>
                  {(currentUser as any)?.is_premium
                    ? "Premium is active. Ads are hidden."
                    : "Tap to become premium and hide ads."}
                </p>
              </div>
            </button>
          </section>
        </div>

        {/* USERNAME MODAL */}
        <IonModal ref={usernameModal} className="profile-settings-modal">
          <IonHeader>
            <IonToolbar className="profile-modal-toolbar">
              <h2 className="profile-modal-title">Edit username</h2>
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

        {/* STUDY PROFILE MODAL */}
        <IonModal ref={studyProfileModal} className="profile-settings-modal wide">
          <IonHeader>
            <IonToolbar className="profile-modal-toolbar">
              <h2 className="profile-modal-title">Study profile</h2>
              <IonButtons slot="end">
                <ModalInfoButton title="Study profile">
                  <p>
                    These preferences help the planner understand your normal
                    study rhythm, not just your deadlines.
                  </p>

                  <ul>
                    <li>
                      <strong>Study field</strong> gives the app a rough idea of
                      the kind of work you usually do.
                    </li>
                    <li>
                      <strong>Chronotype</strong> helps match study sessions to
                      the part of the day when you usually focus best.
                    </li>
                    <li>
                      <strong>Effectiveness</strong> is your own feeling about
                      how well your current study habits work.
                    </li>
                    <li>
                      <strong>Sleep hours</strong> help the planner avoid
                      creating a schedule that is too intense.
                    </li>
                  </ul>
                </ModalInfoButton>

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
            <p className="profile-field-helper">
              The general area your studies belong to.
            </p>
            <ChoiceButtons
              value={form.study_field}
              options={studyFields}
              onChange={(value) => setForm({ ...form, study_field: value })}
            />

            <p className="profile-modal-label">Chronotype</p>
            <p className="profile-field-helper">
              When you usually feel most focused.
            </p>
            <ChoiceButtons
              value={form.chronotype}
              options={chronotypes}
              onChange={(value) => setForm({ ...form, chronotype: value })}
            />

            <p className="profile-modal-label">Effectiveness</p>
            <p className="profile-field-helper">
              How well your current study habits feel to you.
            </p>
            <ChoiceButtons
              value={form.effectiveness_rating}
              options={effectivenessOptions}
              onChange={(value) =>
                setForm({ ...form, effectiveness_rating: value })
              }
            />

            <p className="profile-modal-label">Average sleep hours</p>
            <p className="profile-field-helper">
              Your usual sleep amount on a normal day.
            </p>
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
              <h2 className="profile-modal-title">
                Preferred session lengths
              </h2>

              <IonButtons slot="end">
                <ModalInfoButton title="Preferred session lengths">
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
                      tasks, exercises, or examples.
                    </li>
                    <li>
                      <strong>Passive</strong> is lower-intensity studying, like
                      reading, watching, reviewing notes, or looking through
                      slides.
                    </li>
                    <li>
                      <strong>Active</strong> is higher-effort studying, like
                      solving, writing, explaining, or creating from memory.
                    </li>
                    <li>
                      <strong>Session</strong> is your general preferred study
                      block length.
                    </li>
                  </ul>
                </ModalInfoButton>

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
                helper: "Reading, watching, reviewing, or going through notes.",
              },
              {
                label: "Active",
                key: "avg_active_time",
                helper: "Solving, writing, explaining, or working from memory.",
              },
              {
                label: "Session",
                key: "preffered_session_time",
                helper: "Your preferred general study block length.",
              },
            ].map((item) => (
              <div key={item.key}>
                <p className="profile-modal-label">{item.label}</p>
                <p className="profile-field-helper">{item.helper}</p>

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

        {/* STUDYING HOURS MODAL */}
        <IonModal ref={workHoursModal} className="profile-settings-modal">
          <IonHeader>
            <IonToolbar className="profile-modal-toolbar">
              <h2 className="profile-modal-title">Studying hours</h2>

              <IonButtons slot="end">
                <ModalInfoButton title="Preferred studying hours">
                  <p>
                    This tells the planner the time range where study sessions
                    should usually be placed.
                  </p>

                  <ul>
                    <li>
                      Pick the hours when you are usually available and able to
                      focus.
                    </li>
                    <li>
                      The planner will try to schedule work inside this range.
                    </li>
                    <li>
                      More exact availability can still be added through free
                      time in the calendar.
                    </li>
                  </ul>
                </ModalInfoButton>

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
            <p className="profile-modal-label">Studying start</p>
            <p className="profile-field-helper">
              The earliest time you prefer to study.
            </p>

            <IonItem className="profile-input-item profile-select-item">
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

            <p className="profile-modal-label">Studying end</p>
            <p className="profile-field-helper">
              The latest time you prefer to study.
            </p>

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

            <IonButton
              expand="block"
              className="profile-primary-button"
              onClick={handleSaveWorkHours}
            >
              Save studying hours
            </IonButton>
          </div>
        </IonModal>

        {/* MODULES MODAL */}
        <IonModal ref={modulesModal} className="profile-settings-modal">
          <IonHeader>
            <IonToolbar className="profile-modal-toolbar">
              <h2 className="profile-modal-title">Manage modules</h2>

              <IonButtons slot="end">
                <ModalInfoButton title="Modules">
                  <p>
                    Modules are your subjects or courses. They help group
                    assignments and make the planner easier to read.
                  </p>

                  <ul>
                    <li>Add a module for each subject or course.</li>
                    <li>Pick a colour so it is easier to recognize later.</li>
                    <li>Deleting a module only removes the module label.</li>
                  </ul>
                </ModalInfoButton>

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
            <p className="profile-modal-label">Module name</p>
            <p className="profile-field-helper">
              A subject, course, or class you want to group assignments under.
            </p>

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
      <h2 className="profile-modal-title">Manage assignment types</h2>

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

  <div className="profile-modal-content scrollable">
    <p className="profile-modal-label">Assignment type name</p>
    <p className="profile-field-helper">
      Add categories such as exam, lab, project, essay, homework, or quiz.
    </p>

    <IonItem className="profile-input-item">
      <IonInput
        placeholder="Assignment type name"
        value={assignmentTypeInput}
        onIonInput={(e) =>
          setAssignmentTypeInput(String(e.detail.value ?? ""))
        }
      />
    </IonItem>

    <IonButton
      expand="block"
      className="profile-primary-button"
      onClick={handleSaveAssignmentType}
    >
      <IonIcon
        icon={
          editingAssignmentTypeId === null
            ? addOutline
            : documentTextOutline
        }
        slot="start"
      />
      {editingAssignmentTypeId === null
        ? "Add assignment type"
        : "Save assignment type"}
    </IonButton>

    {editingAssignmentTypeId !== null && (
      <IonButton
        expand="block"
        fill="outline"
        className="profile-secondary-button"
        onClick={clearAssignmentTypeForm}
      >
        Cancel editing
      </IonButton>
    )}

    <div className="profile-module-list">
      {assignmentTypes.length === 0 ? (
        <div className="profile-empty-mini">
          <IonIcon icon={readerOutline} />
          <p>No assignment types yet.</p>
        </div>
      ) : (
        assignmentTypes.map((assignmentType) => (
          <div className="profile-module-row" key={assignmentType.id}>
            <button
              type="button"
              className="profile-module-main"
              onClick={() => handleEditAssignmentType(assignmentType)}
            >
              <span>{assignmentType.name}</span>
            </button>

            <button
              type="button"
              className="profile-module-delete"
              onClick={() => handleDeleteAssignmentType(assignmentType.id)}
            >
              <IonIcon icon={trashOutline} />
            </button>
          </div>
        ))
      )}
    </div>
  </div>
</IonModal>

        <IonPopover
          isOpen={infoPopover.isOpen}
          event={infoPopover.event}
          onDidDismiss={closeInfoPopover}
          className="profile-info-popover"
          showBackdrop={false}
        >
          <div className="profile-info-cloud">
            <h3>{infoPopover.title}</h3>
            <div>{infoPopover.content}</div>
          </div>
        </IonPopover>

        <IonAlert
          isOpen={deleteAlertOpen}
          onDidDismiss={() => setDeleteAlertOpen(false)}
          header="Delete account"
          message="This action is permanent. Your account and associated data will be deleted."
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
            },
            {
              text: "Delete",
              role: "destructive",
              handler: () => deleteAccount(),
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab5;