import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonChip,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonReorder,
  IonReorderGroup,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonModal,
  IonProgressBar,
} from '@ionic/react';
import { pencil, trash, close, chevronForward, add, chevronBack } from 'ionicons/icons';
import { ReorderEndCustomEvent } from '@ionic/core/components';
import { db } from '../db/db';
import type { Task } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';

interface TaskListProps {
  assignmentId: number;
}

const DIFFICULTY_LABELS: Record<number, string> = { 1: '1', 2: '2', 3: '3' };
const DIFFICULTY_COLORS: Record<number, string> = { 1: 'success', 2: 'warning', 3: 'danger' };
const TYPE_LABELS: Record<number, string> = { 0: 'Passive', 1: 'Active', 2: 'Testing' };

const blurActive = () => {
  const element = document.activeElement as HTMLElement | null;
  element?.blur();
};

const isTopicTask = (task: Task) => task.task_type === -1 && task.parent_task_id == null;

// ─── Modern Checkbox Component ─────────────────────────────────────────────
interface ModernCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  onClick?: (e: React.MouseEvent) => void;
  slot?: string;
}

const ModernCheckbox: React.FC<ModernCheckboxProps> = ({ checked, onChange, onClick, slot }) => (
  <div
    slot={slot}
    className="modern-checkbox"
    onClick={(e) => {
      if (onClick) onClick(e as any);
      e.stopPropagation();
    }}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

// ─── Add Task Modal Form ──────────────────────────────────────────
interface AddTaskModalProps {
  isOpen: boolean;
  onSave: (title: string, difficulty: number, type: number) => void;
  onCancel: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState(-1);
  const [type, setType] = useState(-1);
  const modalRef = useRef<HTMLIonModalElement>(null);

  const isValid = title.trim() !== '' && difficulty !== -1 && type !== -1;

  const handleSave = () => {
    blurActive();
    onSave(title.trim(), difficulty, type);
    setTitle('');
    setDifficulty(-1);
    setType(-1);
    modalRef.current?.dismiss();
  };

  const handleCancel = () => {
    blurActive();
    onCancel();
    setTitle('');
    setDifficulty(-1);
    setType(-1);
    modalRef.current?.dismiss();
  };

  return (
    <IonModal ref={modalRef} isOpen={isOpen} onDidDismiss={onCancel} className="add-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Task</h2>
          <IonButton fill="clear" onClick={handleCancel} className="close-btn">
            <IonIcon icon={close} />
          </IonButton>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Task Name</label>
            <IonInput
              className="form-input"
              value={title}
              placeholder="Enter task name"
              onIonInput={(e) => setTitle(e.detail.value ?? '')}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Difficulty</label>
            <div className="button-group">
              {[1, 2, 3].map((d) => (
                <button
                  key={d}
                  className={`custom-button ${difficulty === d ? 'active' : ''}`}
                  onClick={() => setDifficulty(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Type</label>
            <div className="button-group">
              {[0, 1, 2].map((v) => (
                <button
                  key={v}
                  className={`custom-button ${type === v ? 'active' : ''}`}
                  onClick={() => setType(v)}
                >
                  {TYPE_LABELS[v]}
                </button>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <IonButton
              expand="block"
              fill="solid"
              disabled={!isValid}
              onClick={handleSave}
              className="add-btn"
              style={{ '--background': '#491B6D' } as React.CSSProperties}
            >
              Add Task
            </IonButton>
            <IonButton
              expand="block"
              fill="outline"
              onClick={handleCancel}
              className="cancel-btn"
              style={{ '--border-color': '#491B6D', '--color': '#491B6D' } as React.CSSProperties}
            >
              Cancel
            </IonButton>
          </div>
        </div>
      </div>
    </IonModal>
  );
};

// ─── Add Topic Modal Form ─────────────────────────────────────────────
interface AddTopicModalProps {
  isOpen: boolean;
  onSave: (title: string) => void;
  onCancel: () => void;
}

const AddTopicModal: React.FC<AddTopicModalProps> = ({ isOpen, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const modalRef = useRef<HTMLIonModalElement>(null);
  const isValid = title.trim() !== '';

  const handleSave = () => {
    blurActive();
    onSave(title.trim());
    setTitle('');
    modalRef.current?.dismiss();
  };

  const handleCancel = () => {
    blurActive();
    onCancel();
    setTitle('');
    modalRef.current?.dismiss();
  };

  return (
    <IonModal ref={modalRef} isOpen={isOpen} onDidDismiss={onCancel} className="add-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Topic</h2>
          <IonButton fill="clear" onClick={handleCancel} className="close-btn">
            <IonIcon icon={close} />
          </IonButton>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Topic Name</label>
            <IonInput
              className="form-input"
              value={title}
              placeholder="Enter topic name"
              onIonInput={(e) => setTitle(e.detail.value ?? '')}
              autoFocus
            />
          </div>

          <div className="form-actions">
            <IonButton
              expand="block"
              fill="solid"
              disabled={!isValid}
              onClick={handleSave}
              className="add-btn"
              style={{ '--background': '#491B6D' } as React.CSSProperties}
            >
              Create Topic
            </IonButton>
            <IonButton
              expand="block"
              fill="outline"
              onClick={handleCancel}
              className="cancel-btn"
              style={{ '--border-color': '#491B6D', '--color': '#491B6D' } as React.CSSProperties}
            >
              Cancel
            </IonButton>
          </div>
        </div>
      </div>
    </IonModal>
  );
};

// ─── Task Row (with inline editing) ──────────────────────────────────────────────
interface TaskRowProps {
  task: Task;
  editing: boolean;
  showReorder?: boolean;
  showActions?: boolean;
  onToggleDone: (id: number, val: boolean) => void;
  onStartEdit: (id: number) => void;
  onSaveEdit: (id: number, title: string, difficulty: number, type: number) => void;
  onCancelEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  editing,
  showReorder = false,
  showActions = true,
  onToggleDone,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}) => {
  const slidingRef = useRef<HTMLIonItemSlidingElement>(null);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDifficulty, setEditDifficulty] = useState(task.difficulty_rating);
  const [editType, setEditType] = useState(task.task_type);

  useEffect(() => {
    if (!slidingRef.current) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (slidingRef.current?.contains(target)) return;

      const modal = target.closest('ion-modal');
      if (modal) return;

      slidingRef.current?.close();
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, []);

  const handleSave = () => {
    blurActive();
    onSaveEdit(task.id, editTitle, editDifficulty, editType);
  };

  const handleCancel = () => {
    blurActive();
    setEditTitle(task.title);
    setEditDifficulty(task.difficulty_rating);
    setEditType(task.task_type);
    onCancelEdit(task.id);
  };

  if (editing) {
    return (
      <div className="task-list-item task-item-editing">
        <div className="edit-form-row">
          <div className="edit-input-group">
            <label>Task Name</label>
            <IonInput
              className="edit-input"
              value={editTitle}
              placeholder="Enter task name"
              onIonInput={(e) => setEditTitle(e.detail.value ?? '')}
              autoFocus
            />
          </div>

          <div className="edit-input-group">
            <label>Difficulty</label>
            <div className="difficulty-buttons">
              {[1, 2, 3].map((d) => (
                <button
                  key={d}
                  className={`custom-button ${editDifficulty === d ? 'active' : ''}`}
                  onClick={() => setEditDifficulty(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="edit-input-group">
            <label>Type</label>
            <div className="type-buttons">
              {[0, 1, 2].map((v) => (
                <button
                  key={v}
                  className={`custom-button ${editType === v ? 'active' : ''}`}
                  onClick={() => setEditType(v)}
                >
                  {TYPE_LABELS[v]}
                </button>
              ))}
            </div>
          </div>

          <div className="edit-button-group">
            <IonButton size="small" fill="outline" onClick={handleCancel} style={{ '--border-color': '#491B6D', '--color': '#491B6D', '--border-radius': '10px' } as React.CSSProperties}>
              Cancel
            </IonButton>
            <IonButton size="small" fill="solid" onClick={handleSave} style={{ '--background': '#491B6D', '--border-radius': '10px' } as React.CSSProperties}>
              Save
            </IonButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <IonItemSliding ref={slidingRef} className="task-list-item">
      <IonItem lines="none" className="task-item-content">
        <ModernCheckbox
          slot="start"
          checked={task.is_done}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onChange={(checked) => onToggleDone(task.id, checked)}
        />
        <IonLabel className={task.is_done ? 'task-completed' : ''}>
          {task.title}
          <div className="task-badges">
            {task.difficulty_rating !== -1 && (
              <IonChip color={DIFFICULTY_COLORS[task.difficulty_rating]}>
                {DIFFICULTY_LABELS[task.difficulty_rating]}
              </IonChip>
            )}
            <IonChip>{TYPE_LABELS[task.task_type]}</IonChip>
          </div>
        </IonLabel>
        {showReorder && <IonReorder slot="end" />}
      </IonItem>
      {showActions && (
        <IonItemOptions side="end">
          <IonItemOption
            onClick={() => {
              blurActive();
              onStartEdit(task.id);
            }}
            style={{ '--background': 'transparent' } as React.CSSProperties}
          >
            <IonIcon icon={pencil} style={{ color: '#491B6D', fontSize: '22px' }} />
          </IonItemOption>
          <IonItemOption
            onClick={() => {
              blurActive();
              onDelete(task.id);
            }}
            style={{ '--background': 'transparent' } as React.CSSProperties}
          >
            <IonIcon icon={trash} style={{ color: '#491B6D', fontSize: '22px' }} />
          </IonItemOption>
        </IonItemOptions>
      )}
    </IonItemSliding>
  );
};

// ─── Topic Row (with swipe working properly) ─────────────────────────────────
interface SubtaskEditState {
  id: number;
  title: string;
  difficulty_rating: number;
  task_type: number;
  isNew?: boolean;
}

interface TopicRowProps {
  topic: Task;
  children: Task[];
  expandedTopics: string[];
  editing: boolean;
  onToggleDone: (id: number, val: boolean) => void;
  onStartEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onExpandChange: (value: string[]) => void;
  onSaveTopicGroup: (topicId: number, topicTitle: string, childUpdates: { id: number; title: string; difficulty_rating: number }[], newChildren: SubtaskEditState[]) => void;
  onCancelEdit: (id: number) => void;
  onReorderChildren: (topicId: number, children: Task[]) => void;
}

const TopicRow: React.FC<TopicRowProps> = ({
  topic,
  children,
  expandedTopics,
  editing,
  onToggleDone,
  onStartEdit,
  onDelete,
  onExpandChange,
  onSaveTopicGroup,
  onCancelEdit,
  onReorderChildren,
}) => {
  const slidingRef = useRef<HTMLIonItemSlidingElement>(null);
  const accordionValue = `topic-${topic.id}`;
  const [editTitle, setEditTitle] = useState(topic.title);
  const [childState, setChildState] = useState<SubtaskEditState[]>(
    children.map((child) => ({
      id: child.id,
      title: child.title,
      difficulty_rating: child.difficulty_rating === -1 ? 1 : child.difficulty_rating,
      task_type: child.task_type,
    }))
  );

  const isExpanded = expandedTopics.includes(accordionValue);

  useEffect(() => {
    if (!slidingRef.current) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (slidingRef.current?.contains(target)) return;
      const modal = target.closest('ion-modal');
      if (modal) return;
      slidingRef.current?.close();
    };

    document.addEventListener('click', handleClickOutside, true);
    return () => document.removeEventListener('click', handleClickOutside, true);
  }, []);

  const handleSave = () => {
    blurActive();
    const existingChildren = childState.filter((c) => !c.isNew);
    const newChildren = childState.filter((c) => c.isNew);
    onSaveTopicGroup(
      topic.id,
      editTitle,
      existingChildren.map((child) => ({
        id: child.id,
        title: child.title,
        difficulty_rating: child.difficulty_rating,
      })),
      newChildren
    );
  };

  const handleCancel = () => {
    blurActive();
    setEditTitle(topic.title);
    setChildState(
      children.map((child) => ({
        id: child.id,
        title: child.title,
        difficulty_rating: child.difficulty_rating === -1 ? 1 : child.difficulty_rating,
        task_type: child.task_type,
      }))
    );
    onCancelEdit(topic.id);
  };

  const updateChild = (id: number, patch: Partial<Omit<SubtaskEditState, 'id'>>) => {
    setChildState((prev) =>
      prev.map((child) => (child.id === id ? { ...child, ...patch } : child))
    );
  };

  const addNewSubtask = () => {
    const newId = Math.min(...childState.map((c) => c.id), 0) - 1;
    setChildState((prev) => [
      ...prev,
      { id: newId, title: '', difficulty_rating: 1, task_type: 0, isNew: true },
    ]);
  };

  const deleteChild = (id: number) => {
    setChildState((prev) => prev.filter((child) => child.id !== id));
  };

  const handleChildReorderEnd = async (event: ReorderEndCustomEvent) => {
    blurActive();
    event.stopPropagation();
    const reordered = [...children];
    const [moved] = reordered.splice(event.detail.from, 1);
    reordered.splice(event.detail.to, 0, moved);
    onReorderChildren(topic.id, reordered);
    event.detail.complete();
  };

  if (editing) {
    return (
      <div className="topic-list-item task-item-editing">
        <div className="edit-form-row">
          <div className="edit-input-group">
            <label>Topic Name</label>
            <IonInput
              className="edit-input"
              value={editTitle}
              placeholder="Topic name"
              onIonInput={(e) => setEditTitle(e.detail.value ?? '')}
              autoFocus
            />
          </div>

          <div className="edit-input-group">
            <label>Subtasks</label>
            {childState.length > 0 ? (
              childState.map((child) => (
                <div key={child.id} className="subtask-edit-item">
                  <div className="subtask-edit-content">
                    <IonInput
                      className="edit-input"
                      value={child.title}
                      placeholder="Task name"
                      onIonInput={(e) => updateChild(child.id, { title: e.detail.value ?? '' })}
                    />
                    <div className="difficulty-buttons">
                      {[1, 2, 3].map((d) => (
                        <button
                          key={d}
                          className={`custom-button ${child.difficulty_rating === d ? 'active' : ''}`}
                          onClick={() => updateChild(child.id, { difficulty_rating: d })}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  {child.isNew && (
                    <>
                      <div className="type-buttons">
                        {[0, 1, 2].map((v) => (
                          <button
                            key={v}
                            className={`custom-button ${child.task_type === v ? 'active' : ''}`}
                            onClick={() => updateChild(child.id, { task_type: v })}
                          >
                            {TYPE_LABELS[v]}
                          </button>
                        ))}
                      </div>
                      <IonButton
                        size="small"
                        fill="outline"
                        onClick={() => deleteChild(child.id)}
                        className="delete-subtask-btn"
                        style={{ '--border-color': '#491B6D', '--color': '#491B6D' } as React.CSSProperties}
                      >
                        Remove
                      </IonButton>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: '#999', fontSize: '12px' }}>No subtasks yet</p>
            )}
          </div>

          <IonButton
            expand="block"
            fill="outline"
            onClick={addNewSubtask}
            className="add-subtask-btn"
            style={{ '--border-color': '#491B6D', '--color': '#491B6D' } as React.CSSProperties}
          >
            <IonIcon icon={add} slot="start" />
            Add Subtask
          </IonButton>

          <div className="edit-button-group">
            <IonButton size="small" fill="outline" onClick={handleCancel} style={{ '--border-color': '#491B6D', '--color': '#491B6D', '--border-radius': '10px' } as React.CSSProperties}>
              Cancel
            </IonButton>
            <IonButton size="small" fill="solid" onClick={handleSave} style={{ '--background': '#491B6D', '--border-radius': '10px' } as React.CSSProperties}>
              Save
            </IonButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="topic-sliding-wrapper">
      <IonItemSliding ref={slidingRef} className="topic-list-item">
        <IonItem 
          lines="none" 
          className="topic-item-content"
          button
          onClick={() => {
            if (isExpanded) {
              onExpandChange(expandedTopics.filter(v => v !== accordionValue));
            } else {
              onExpandChange([...expandedTopics, accordionValue]);
            }
          }}
        >
          <ModernCheckbox
            slot="start"
            checked={topic.is_done}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onChange={(checked) => {
              onToggleDone(topic.id, checked);
            }}
          />

          <IonLabel className={topic.is_done ? 'task-completed' : ''}>
            {topic.title}
            <div className="task-badges">
              <IonChip className="topic-badge">Topic</IonChip>
            </div>
          </IonLabel>

          <IonIcon 
            slot="end" 
            icon={isExpanded ? chevronBack : chevronForward} 
            style={{ color: '#491B6D', fontSize: '22px', marginRight: '12px' }}
          />
          <IonReorder slot="end" />
        </IonItem>

        <IonItemOptions side="end">
          <IonItemOption
            onClick={() => {
              blurActive();
              onStartEdit(topic.id);
            }}
            style={{ '--background': 'transparent' } as React.CSSProperties}
          >
            <IonIcon icon={pencil} style={{ color: '#491B6D', fontSize: '22px' }} />
          </IonItemOption>
          <IonItemOption
            onClick={() => {
              blurActive();
              onDelete(topic.id);
            }}
            style={{ '--background': 'transparent' } as React.CSSProperties}
          >
            <IonIcon icon={trash} style={{ color: '#491B6D', fontSize: '22px' }} />
          </IonItemOption>
        </IonItemOptions>
      </IonItemSliding>

      {isExpanded && (
        <div className="topic-expanded-content">
          <div className="child-reorder-group">
            <IonReorderGroup disabled={false} onIonReorderEnd={handleChildReorderEnd}>
              {children.map((child) => (
                <IonItemSliding key={child.id} className="child-task-sliding">
                  <IonItem lines="none" className="child-task-item">
                    <ModernCheckbox
                      slot="start"
                      checked={child.is_done}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(checked) => onToggleDone(child.id, checked)}
                    />
                    <IonLabel className={child.is_done ? 'task-completed' : ''}>
                      {child.title}
                      <div className="task-badges">
                        <IonChip color={DIFFICULTY_COLORS[child.difficulty_rating]}>
                          {DIFFICULTY_LABELS[child.difficulty_rating]}
                        </IonChip>
                        <IonChip>{TYPE_LABELS[child.task_type]}</IonChip>
                      </div>
                    </IonLabel>
                    <IonReorder slot="end" />
                  </IonItem>
                </IonItemSliding>
              ))}
            </IonReorderGroup>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Task List Component ─────────────────────────────────────────────
const TaskList: React.FC<TaskListProps> = ({ assignmentId }) => {
  const [editingIds, setEditingIds] = useState<Set<number>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingTopic, setIsAddingTopic] = useState(false);

  const dbTasks = useLiveQuery(() => db.tasks.where('fk_assignment').equals(assignmentId).toArray(), [assignmentId]) ?? [];

  const tasks = useMemo(() => [...dbTasks].sort((a, b) => (a.toggle_order ?? 0) - (b.toggle_order ?? 0)), [dbTasks]);
  const taskMap = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);
  const topLevelTasks = useMemo(() => tasks.filter((t) => t.parent_task_id == null), [tasks]);

  const childrenByParent = useMemo(() => {
    const map = new Map<number, Task[]>();
    for (const task of tasks) {
      if (task.parent_task_id != null) {
        const existing = map.get(task.parent_task_id) ?? [];
        existing.push(task);
        map.set(task.parent_task_id, existing);
      }
    }
    for (const [key, value] of map.entries()) {
      map.set(key, [...value].sort((a, b) => (a.toggle_order ?? 0) - (b.toggle_order ?? 0)));
    }
    return map;
  }, [tasks]);

  // Calculate progress including subtasks
  const progressStats = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    let passiveCount = 0;
    let activeCount = 0;
    let testingCount = 0;

    for (const task of tasks) {
      if (!isTopicTask(task)) {
        totalTasks++;
        if (task.is_done) completedTasks++;
        
        if (task.task_type === 0) passiveCount++;
        else if (task.task_type === 1) activeCount++;
        else if (task.task_type === 2) testingCount++;
      }
    }

    const progress = totalTasks === 0 ? 0 : completedTasks / totalTasks;

    return {
      totalTasks,
      completedTasks,
      progress,
      passiveCount,
      activeCount,
      testingCount,
    };
  }, [tasks]);

  useEffect(() => {
    setEditingIds((prev) => {
      const next = new Set<number>();
      for (const id of prev) if (taskMap.has(id)) next.add(id);
      return next;
    });
  }, [taskMap]);

  useEffect(() => {
    const content = document.querySelector('ion-content');
    if (content) {
      const handleScroll = () => {
        const openSlides = document.querySelectorAll('ion-item-sliding');
        openSlides.forEach((slide) => {
          if ((slide as any).close) (slide as any).close();
        });
      };
      content.addEventListener('scroll', handleScroll);
      return () => content.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleToggleDone = async (id: number, val: boolean) => {
    blurActive();
    const task = taskMap.get(id);
    if (!task) return;
    if (isTopicTask(task)) {
      const children = childrenByParent.get(id) ?? [];
      await db.transaction('rw', db.tasks, async () => {
        await db.tasks.update(id, { is_done: val });
        for (const child of children) await db.tasks.update(child.id, { is_done: val });
      });
      return;
    }
    await db.tasks.update(id, { is_done: val });
    if (task.parent_task_id != null) {
      const siblings = childrenByParent.get(task.parent_task_id) ?? [];
      const allDone = siblings.every((sibling) => (sibling.id === id ? val : sibling.is_done));
      await db.tasks.update(task.parent_task_id, { is_done: allDone });
    }
  };

  const handleStartEdit = (id: number) => {
    const task = taskMap.get(id);
    if (!task) return;
    if (isTopicTask(task)) {
      setEditingIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      return;
    }
    setEditingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleSaveEdit = async (id: number, title: string, difficulty: number, type: number) => {
    blurActive();
    await db.tasks.update(id, { title, difficulty_rating: difficulty, task_type: type });
    setEditingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleSaveTopicGroup = async (
    topicId: number,
    topicTitle: string,
    childUpdates: { id: number; title: string; difficulty_rating: number }[],
    newChildren: SubtaskEditState[]
  ) => {
    blurActive();
    await db.transaction('rw', db.tasks, async () => {
      await db.tasks.update(topicId, { title: topicTitle, difficulty_rating: -1, task_type: -1 });
      for (const child of childUpdates) {
        await db.tasks.update(child.id, { title: child.title, difficulty_rating: child.difficulty_rating });
      }
      for (let i = 0; i < newChildren.length; i++) {
        await db.tasks.add({
          title: newChildren[i].title,
          difficulty_rating: newChildren[i].difficulty_rating,
          is_done: false,
          task_type: newChildren[i].task_type,
          fk_assignment: assignmentId,
          toggle_order: i,
          parent_task_id: topicId,
        });
      }
    });
    setEditingIds((prev) => {
      const next = new Set(prev);
      next.delete(topicId);
      return next;
    });
  };

  const handleCancelEdit = (id: number) => {
    setEditingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDelete = async (id: number) => {
    blurActive();
    const task = taskMap.get(id);
    if (!task) return;
    await db.transaction('rw', db.tasks, async () => {
      if (isTopicTask(task)) await db.tasks.where('parent_task_id').equals(id).delete();
      await db.tasks.delete(id);
    });
    setEditingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleReorderEnd = async (event: ReorderEndCustomEvent) => {
    blurActive();
    if (editingIds.size > 0) {
      event.detail.complete();
      return;
    }
    const reordered = [...topLevelTasks];
    const [moved] = reordered.splice(event.detail.from, 1);
    reordered.splice(event.detail.to, 0, moved);
    await db.transaction('rw', db.tasks, async () => {
      for (let i = 0; i < reordered.length; i++) await db.tasks.update(reordered[i].id, { toggle_order: i });
    });
    event.detail.complete();
  };

  const handleReorderChildren = async (topicId: number, children: Task[]) => {
    blurActive();
    await db.transaction('rw', db.tasks, async () => {
      for (let i = 0; i < children.length; i++) {
        await db.tasks.update(children[i].id, { toggle_order: i });
      }
    });
  };

  const handleAddTask = async (title: string, difficulty: number, type: number) => {
    const maxOrder = Math.max(-1, ...topLevelTasks.map((t) => t.toggle_order ?? -1));
    await db.tasks.add({
      title,
      difficulty_rating: difficulty,
      is_done: false,
      task_type: type,
      fk_assignment: assignmentId,
      toggle_order: maxOrder + 1,
      parent_task_id: null,
    });
    setIsAddingTask(false);
  };

  const handleAddTopic = async (title: string) => {
    const maxOrder = Math.max(-1, ...topLevelTasks.map((t) => t.toggle_order ?? -1));
    const topicId = await db.tasks.add({
      title,
      difficulty_rating: -1,
      is_done: false,
      task_type: -1,
      fk_assignment: assignmentId,
      toggle_order: maxOrder + 1,
      parent_task_id: null,
    });
    await db.tasks.bulkAdd([
      {
        title: 'Passive',
        difficulty_rating: 1,
        is_done: false,
        task_type: 0,
        fk_assignment: assignmentId,
        toggle_order: 0,
        parent_task_id: topicId,
      },
      {
        title: 'Active',
        difficulty_rating: 1,
        is_done: false,
        task_type: 1,
        fk_assignment: assignmentId,
        toggle_order: 1,
        parent_task_id: topicId,
      },
      {
        title: 'Testing',
        difficulty_rating: 1,
        is_done: false,
        task_type: 2,
        fk_assignment: assignmentId,
        toggle_order: 2,
        parent_task_id: topicId,
      },
    ]);
    setIsAddingTopic(false);
  };

  return (
    <>
      {/* PROGRESS BAR SECTION */}
      <div className="task-progress-section">
        <div className="progress-header">
          <span className="progress-percentage">
            {Math.round(progressStats.progress * 100)}%
          </span>
          <span className="progress-text">
            {progressStats.completedTasks} / {progressStats.totalTasks} tasks completed
          </span>
        </div>
        <IonProgressBar value={progressStats.progress} color="medium" className="task-progress-bar" />

        {/* Type Distribution Bar */}
        <div className="task-type-distribution">
          <div className="type-bar-container">
            {progressStats.totalTasks > 0 ? (
              <>
                <div 
                  className="type-bar passive-bar" 
                  style={{ width: `${(progressStats.passiveCount / progressStats.totalTasks) * 100}%` }}
                  title={`Passive: ${progressStats.passiveCount}`}
                />
                <div 
                  className="type-bar active-bar" 
                  style={{ width: `${(progressStats.activeCount / progressStats.totalTasks) * 100}%` }}
                  title={`Active: ${progressStats.activeCount}`}
                />
                <div 
                  className="type-bar testing-bar" 
                  style={{ width: `${(progressStats.testingCount / progressStats.totalTasks) * 100}%` }}
                  title={`Testing: ${progressStats.testingCount}`}
                />
              </>
            ) : (
              <div className="type-bar-empty">No tasks</div>
            )}
          </div>
          <div className="type-labels">
            <span className="type-label passive">P: {progressStats.passiveCount}</span>
            <span className="type-label active">A: {progressStats.activeCount}</span>
            <span className="type-label testing">T: {progressStats.testingCount}</span>
          </div>
        </div>
      </div>

      <IonList className="task-list-container">
        <IonReorderGroup disabled={editingIds.size > 0} onIonReorderEnd={handleReorderEnd}>
          {topLevelTasks.map((task) =>
            isTopicTask(task) ? (
              <TopicRow
                key={task.id}
                topic={task}
                children={childrenByParent.get(task.id) ?? []}
                expandedTopics={expandedTopics}
                editing={editingIds.has(task.id)}
                onToggleDone={handleToggleDone}
                onStartEdit={handleStartEdit}
                onDelete={handleDelete}
                onExpandChange={setExpandedTopics}
                onSaveTopicGroup={handleSaveTopicGroup}
                onCancelEdit={handleCancelEdit}
                onReorderChildren={handleReorderChildren}
              />
            ) : (
              <TaskRow
                key={task.id}
                task={task}
                editing={editingIds.has(task.id)}
                showReorder
                onToggleDone={handleToggleDone}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onDelete={handleDelete}
              />
            )
          )}
        </IonReorderGroup>
      </IonList>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddingTask}
        onSave={handleAddTask}
        onCancel={() => setIsAddingTask(false)}
      />

      {/* Add Topic Modal */}
      <AddTopicModal
        isOpen={isAddingTopic}
        onSave={handleAddTopic}
        onCancel={() => setIsAddingTopic(false)}
      />

      {/* Buttons for adding Task or Topic */}
      <div className="task-list-actions">
        <IonButton
          expand="block"
          onClick={() => {
            blurActive();
            setIsAddingTask(true);
          }}
          className="add-task-btn"
          style={{ '--background': '#491B6D', '--border-radius': '10px' } as React.CSSProperties}
        >
          + Task
        </IonButton>
        <IonButton
          expand="block"
          fill="outline"
          onClick={() => {
            blurActive();
            setIsAddingTopic(true);
          }}
          className="add-topic-btn"
          style={{ '--border-color': '#491B6D', '--color': '#491B6D', '--border-radius': '10px' } as React.CSSProperties}
        >
          + Topic
        </IonButton>
      </div>
    </>
  );
};

export default TaskList;