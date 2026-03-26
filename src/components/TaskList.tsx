import React, { useState, useEffect } from 'react';
import {
  IonList,
  IonReorderGroup,
  IonItem,
  IonCheckbox,
  IonInput,
  IonButton,
  IonIcon,
  IonReorder,
  IonChip,
  IonLabel,
} from '@ionic/react';
import { pencil, trash } from 'ionicons/icons';
import { ReorderEndCustomEvent } from '@ionic/core/components';
import { db } from '../db/db';
import type { Task } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';

interface TaskListProps {
  assignmentId: number;
}

const DIFFICULTY_LABELS: Record<number, string> = { 1: '1', 2: '2', 3: '3' };
const DIFFICULTY_COLORS: Record<number, string> = { 1: 'success', 2: 'warning', 3: 'danger' };
const TYPE_LABELS: Record<number, string> = { 0: 'Passive', 1: 'Active', 2: 'Learning' };

const blurActive = () => {
  const element = document.activeElement as HTMLElement | null;
  element?.blur();
};

// ─── Task Form ─────────────────────────────────────────────
interface TaskRowFormProps {
  initial: { title: string; difficulty_rating: number; task_type: number };
  onSave: (title: string, difficulty: number, type: number) => void;
  onCancel: () => void;
  saveLabel?: string;
}

const TaskRowForm: React.FC<TaskRowFormProps> = ({ initial, onSave, onCancel, saveLabel = 'Save' }) => {
  const [title, setTitle] = useState(initial.title);
  const [difficulty, setDifficulty] = useState(initial.difficulty_rating);
  const [type, setType] = useState(initial.task_type);

  const isValid = title.trim() !== '' && difficulty !== -1 && type !== -1;

  return (
    <div className="task-row-editing">
      <IonInput
        value={title}
        placeholder="Task name"
        onIonInput={(e) => setTitle(e.detail.value ?? '')}
        autofocus
      />

      <div className="task-options">
        {[1, 2, 3].map((d) => (
          <IonButton
            key={d}
            size="small"
            fill={difficulty === d ? 'solid' : 'outline'}
            color={difficulty === d ? DIFFICULTY_COLORS[d] : 'medium'}
            onClick={() => setDifficulty(d)}
          >
            {d}
          </IonButton>
        ))}
      </div>

      <div className="task-options">
        {[0, 1, 2].map((v) => (
          <IonButton
            key={v}
            size="small"
            fill={type === v ? 'solid' : 'outline'}
            color={type === v ? 'primary' : 'medium'}
            onClick={() => setType(v)}
          >
            {TYPE_LABELS[v]}
          </IonButton>
        ))}
      </div>

      <IonButton
        expand="block"
        disabled={!isValid}
        onClick={() => { blurActive(); onSave(title.trim(), difficulty, type); }}
      >
        {saveLabel}
      </IonButton>

      <IonButton fill="outline" color="medium" onClick={() => { blurActive(); onCancel(); }}>
        Cancel
      </IonButton>
    </div>
  );
};

// ─── Task Row ─────────────────────────────────────────────
interface TaskRowProps {
  task: Task & { editing: boolean };
  index: number;
  onToggleDone: (id: number, val: boolean) => void;
  onStartEdit: (index: number) => void;
  onSaveEdit: (index: number, title: string, difficulty: number, type: number) => void;
  onCancelEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  index,
  onToggleDone,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete
}) => {

  if (task.editing) {
    return (
      <IonItem lines="none">
        <TaskRowForm
          initial={task}
          onSave={(t, d, ty) => onSaveEdit(index, t, d, ty)}
          onCancel={() => onCancelEdit(index)}
        />
      </IonItem>
    );
  }

  return (
    <IonItem lines="none">

      {/* FAR LEFT */}
      <IonCheckbox
        slot="start"
        checked={task.is_done}
        onIonChange={(e) => onToggleDone(task.id, e.detail.checked)}
      />

      {/* CONTENT */}
      <IonLabel className={task.is_done ? 'task-completed' : ''}>
        {task.title}
        <div className="task-badges">
          <IonChip color={DIFFICULTY_COLORS[task.difficulty_rating]}>
            {DIFFICULTY_LABELS[task.difficulty_rating]}
          </IonChip>
          <IonChip>
            {TYPE_LABELS[task.task_type]}
          </IonChip>
        </div>
      </IonLabel>

      {/* FAR RIGHT */}
      <div slot="end" className="task-actions">
        <IonButton fill="clear" size="small" onClick={() => { blurActive(); onStartEdit(index); }}>
          <IonIcon icon={pencil} />
        </IonButton>

        <IonButton fill="clear" size="small" color="danger" onClick={() => { blurActive(); onDelete(index); }}>
          <IonIcon icon={trash} />
        </IonButton>

        <IonReorder />
      </div>
    </IonItem>
  );
};

// ─── Task List ─────────────────────────────────────────────
const TaskList: React.FC<TaskListProps> = ({ assignmentId }) => {
  const [tasks, setTasks] = useState<(Task & { editing: boolean })[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const dbTasks = useLiveQuery(
    () => db.tasks.where('fk_assignment').equals(assignmentId).toArray(),
    [assignmentId]
  ) ?? [];

  // ✅ FIXED editing state persistence
  useEffect(() => {
    setTasks(prev => {
      const map = new Map(prev.map(t => [t.id, t.editing]));

      return [...dbTasks]
        .sort((a, b) => (a.toggle_order ?? 0) - (b.toggle_order ?? 0))
        .map(t => ({
          ...t,
          editing: map.get(t.id) ?? false
        }));
    });
  }, [dbTasks]);

  // ✅ optimistic toggle
  const handleToggleDone = async (id: number, val: boolean) => {
    blurActive();

    setTasks(prev =>
      prev.map(t => t.id === id ? { ...t, is_done: val } : t)
    );

    await db.tasks.update(id, { is_done: val });
  };

  const handleStartEdit = (index: number) => {
    setTasks(prev => prev.map((t, i) => ({ ...t, editing: i === index })));
  };

  const handleSaveEdit = async (index: number, title: string, difficulty: number, type: number) => {
    blurActive();
    const task = tasks[index];

    await db.tasks.update(task.id, {
      title,
      difficulty_rating: difficulty,
      task_type: type
    });

    setTasks(prev => prev.map((t, i) =>
      i === index ? { ...t, editing: false } : t
    ));
  };

  const handleCancelEdit = (index: number) => {
    setTasks(prev => prev.map((t, i) =>
      i === index ? { ...t, editing: false } : t
    ));
    setIsAdding(false);
  };

  const handleDelete = async (index: number) => {
    blurActive();
    const task = tasks[index];

    if (!window.confirm("Delete task?")) return;

    await db.tasks.delete(task.id);
  };

  const handleReorderEnd = (event: ReorderEndCustomEvent) => {
    blurActive();

    if (tasks.some(t => t.editing)) return;

    const updated = [...tasks];
    const [moved] = updated.splice(event.detail.from, 1);
    updated.splice(event.detail.to, 0, moved);

    updated.forEach((t, i) => {
      t.toggle_order = i;
      db.tasks.update(t.id, { toggle_order: i });
    });

    setTasks(updated);
    event.detail.complete();
  };

  const handleAddSave = async (title: string, difficulty: number, type: number) => {
    const maxOrder = Math.max(-1, ...tasks.map(t => t.toggle_order ?? -1));

    await db.tasks.add({
      title,
      difficulty_rating: difficulty,
      is_done: false,
      task_type: type,
      fk_assignment: assignmentId,
      toggle_order: maxOrder + 1
    });

    setIsAdding(false);
  };

  return (
    <>
      <IonList>
        <IonReorderGroup
          disabled={tasks.some(t => t.editing)}
          onIonReorderEnd={handleReorderEnd}
        >
          {tasks.map((task, index) => (
            <TaskRow
              key={task.id}
              task={task}
              index={index}
              onToggleDone={handleToggleDone}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onDelete={handleDelete}
            />
          ))}
        </IonReorderGroup>
      </IonList>

      {isAdding ? (
        <TaskRowForm
          initial={{ title: '', difficulty_rating: -1, task_type: -1 }}
          onSave={handleAddSave}
          onCancel={() => setIsAdding(false)}
          saveLabel="Add task"
        />
      ) : (
        <IonItem button onClick={() => setIsAdding(true)}>
          <IonLabel>+ Add a task...</IonLabel>
        </IonItem>
      )}
    </>
  );
};

export default TaskList;