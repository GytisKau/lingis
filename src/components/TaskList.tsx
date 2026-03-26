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
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
};

// ─── Task Form ─────────────────────────────────────────────────────────────
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
    <div className="tab4-page task-row task-row-editing">
      <IonInput
        value={title}
        placeholder="Task name"
        onIonInput={(e) => setTitle(e.detail.value ?? '')}
        autofocus
      />

      {/* Difficulty */}
      <div className="task-options">
        <label>Difficulty</label>
        <div className="task-options-buttons">
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
      </div>

      {/* Type */}
      <div className="task-options">
        <label>Type</label>
        <div className="task-options-buttons">
          {[{ v: 0, l: 'Passive' }, { v: 1, l: 'Active' }, { v: 2, l: 'Learning' }].map(({ v, l }) => (
            <IonButton
              key={v}
              size="small"
              fill={type === v ? 'solid' : 'outline'}
              color={type === v ? 'primary' : 'medium'}
              onClick={() => setType(v)}
            >
              {l}
            </IonButton>
          ))}
        </div>
      </div>

      {/* Save / Cancel */}
      <div className="task-form-actions">
        <IonButton
          size="small"
          expand="block"
          disabled={!isValid}
          onClick={() => { blurActive(); onSave(title.trim(), difficulty, type); }}
        >
          {saveLabel}
        </IonButton>
        <IonButton size="small" fill="outline" color="medium" onClick={() => { blurActive(); onCancel(); }}>
          Cancel
        </IonButton>
      </div>
    </div>
  );
};

// ─── Single Task Row ───────────────────────────────────────────────────────
interface TaskRowProps {
  task: Task & { editing: boolean };
  index: number;
  onToggleDone: (id: number, val: boolean) => void;
  onStartEdit: (index: number) => void;
  onSaveEdit: (index: number, title: string, difficulty: number, type: number) => void;
  onCancelEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const TaskRow: React.FC<TaskRowProps> = ({ task, index, onToggleDone, onStartEdit, onSaveEdit, onCancelEdit, onDelete }) => {
  if (task.editing) {
    return (
      <IonItem lines="none" className="tab4-page task-row">
        <TaskRowForm
          initial={{ title: task.title, difficulty_rating: task.difficulty_rating, task_type: task.task_type }}
          onSave={(t, d, ty) => onSaveEdit(index, t, d, ty)}
          onCancel={() => onCancelEdit(index)}
          saveLabel="Save"
        />
        <IonReorder slot="end" />
      </IonItem>
    );
  }

  return (
    <IonItem lines="none" className="tab4-page task-row">
      <IonCheckbox
        slot="start"
        checked={task.is_done}
        onIonChange={(e) => onToggleDone(task.id, e.detail.checked)}
      />

      <IonLabel className={task.is_done ? 'task-completed' : ''}>
        {task.title}
        <div className="task-badges">
          {task.difficulty_rating !== -1 && (
            <IonChip color={DIFFICULTY_COLORS[task.difficulty_rating] ?? 'medium'} className="task-difficulty-chip">
              {DIFFICULTY_LABELS[task.difficulty_rating]}
            </IonChip>
          )}
          {task.task_type !== -1 && (
            <IonChip className="task-type-chip">
              {TYPE_LABELS[task.task_type]}
            </IonChip>
          )}
        </div>
      </IonLabel>

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

// ─── Task List ─────────────────────────────────────────────────────────────
const TaskList: React.FC<TaskListProps> = ({ assignmentId }) => {
  const [tasks, setTasks] = useState<(Task & { editing: boolean })[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const dbTasks = useLiveQuery(() => db.tasks.where('fk_assignment').equals(assignmentId).toArray(), [assignmentId]) ?? [];

  useEffect(() => {
    setTasks([...dbTasks].sort((a, b) => (a.toggle_order ?? 0) - (b.toggle_order ?? 0)).map((t) => ({ ...t, editing: false })));
  }, [dbTasks]);

  const handleToggleDone = async (id: number, val: boolean) => { blurActive(); await db.tasks.update(id, { is_done: val }); };
  const handleStartEdit = (index: number) => { setTasks(prev => prev.map((t, i) => ({ ...t, editing: i === index }))); };
  const handleSaveEdit = async (index: number, title: string, difficulty: number, type: number) => {
    blurActive();
    const task = tasks[index];
    const data = { title, difficulty_rating: difficulty, task_type: type };
    if (task.id == null) {
      const newId = await db.tasks.add({ ...data, is_done: false, fk_assignment: assignmentId, toggle_order: tasks.length });
      setTasks(prev => prev.map((t, i) => i === index ? { ...t, ...data, id: newId as number, editing: false } : t));
    } else {
      await db.tasks.update(task.id, data);
      setTasks(prev => prev.map((t, i) => i === index ? { ...t, ...data, editing: false } : t));
    }
  };
  const handleCancelEdit = (index: number) => {
    const task = tasks[index];
    if (!task.id) setTasks(prev => prev.filter((_, i) => i !== index));
    else setTasks(prev => prev.map((t, i) => i === index ? { ...t, editing: false } : t));
    setIsAdding(false);
  };
  const handleDelete = async (index: number) => {
    blurActive();
    const task = tasks[index];
    if (task.id != null) await db.tasks.delete(task.id);
    const updated = tasks.filter((_, i) => i !== index).map((t, i) => ({ ...t, toggle_order: i }));
    updated.forEach(t => { if (t.id != null) db.tasks.update(t.id, { toggle_order: t.toggle_order }); });
    setTasks(updated);
  };
  const handleReorderEnd = (event: ReorderEndCustomEvent) => {
    blurActive();
    const updated = [...tasks];
    const [moved] = updated.splice(event.detail.from, 1);
    updated.splice(event.detail.to, 0, moved);
    updated.forEach((t, i) => { t.toggle_order = i; if (t.id != null) db.tasks.update(t.id, { toggle_order: i }); });
    setTasks(updated);
    event.detail.complete();
  };
  const handleAddSave = async (title: string, difficulty: number, type: number) => {
    blurActive();
    await db.tasks.add({ title, difficulty_rating: difficulty, is_done: false, task_type: type, fk_assignment: assignmentId, toggle_order: tasks.length });
    setIsAdding(false);
  };

  return (
    <>
      <IonList>
        <IonReorderGroup disabled={false} onIonReorderEnd={handleReorderEnd}>
          {tasks.map((task, index) => (
            <TaskRow key={task.id ?? `new-${index}`} task={task} index={index}
              onToggleDone={handleToggleDone} onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit} onCancelEdit={handleCancelEdit} onDelete={handleDelete} />
          ))}
        </IonReorderGroup>
      </IonList>

      {/* Inline add */}
      {isAdding ? (
        <TaskRowForm initial={{ title: '', difficulty_rating: -1, task_type: -1 }} onSave={handleAddSave} onCancel={() => setIsAdding(false)} saveLabel="Add task" />
      ) : (
        <IonItem button detail={false} className="tab4-page add-task-placeholder" onClick={() => setIsAdding(true)}>
          <IonLabel>+ Add a task...</IonLabel>
        </IonItem>
      )}
    </>
  );
};

export default TaskList;