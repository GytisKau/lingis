import React, { useEffect, useMemo, useState } from 'react';
import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonCheckbox,
  IonChip,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonReorder,
  IonReorderGroup,
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

const isTopicTask = (task: Task) => task.task_type === -1 && task.parent_task_id == null;
const isChildTask = (task: Task) => task.parent_task_id != null;

// ─── Single Task Form ──────────────────────────────────────
interface TaskRowFormProps {
  initial: { title: string; difficulty_rating: number; task_type: number; parent_task_id?: number | null };
  onSave: (title: string, difficulty: number, type: number) => void;
  onCancel: () => void;
  saveLabel?: string;
}

const TaskRowForm: React.FC<TaskRowFormProps> = ({
  initial,
  onSave,
  onCancel,
  saveLabel = 'Save',
}) => {
  const [title, setTitle] = useState(initial.title);
  const [difficulty, setDifficulty] = useState(initial.difficulty_rating);
  const [type, setType] = useState(initial.task_type);

  const isTopic = initial.task_type === -1 && initial.parent_task_id == null;
  const isChild = initial.parent_task_id != null;

  const isValid = isTopic
    ? title.trim() !== ''
    : isChild
      ? title.trim() !== '' && difficulty !== -1
      : title.trim() !== '' && difficulty !== -1 && type !== -1;

  const handleSave = () => {
    blurActive();

    if (isTopic) {
      onSave(title.trim(), -1, -1);
      return;
    }

    if (isChild) {
      onSave(title.trim(), difficulty, initial.task_type);
      return;
    }

    onSave(title.trim(), difficulty, type);
  };

  return (
    <div className="task-row-editing">
      <IonInput
        value={title}
        placeholder={isTopic ? 'Topic name' : 'Task name'}
        onIonInput={(e) => setTitle(e.detail.value ?? '')}
        autofocus
      />

      {!isTopic && (
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
      )}

      {!isTopic && !isChild && (
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
      )}

      {!isTopic && isChild && (
        <div className="task-options">
          <IonChip>{TYPE_LABELS[initial.task_type]}</IonChip>
        </div>
      )}

      <IonButton expand="block" disabled={!isValid} onClick={handleSave}>
        {saveLabel}
      </IonButton>

      <IonButton
        fill="outline"
        color="medium"
        onClick={() => {
          blurActive();
          onCancel();
        }}
      >
        Cancel
      </IonButton>
    </div>
  );
};

// ─── Topic Group Edit Form ─────────────────────────────────
interface TopicGroupEditorProps {
  topic: Task;
  children: Task[];
  onSave: (topicTitle: string, childUpdates: { id: number; title: string; difficulty_rating: number }[]) => void;
  onCancel: () => void;
}

const TopicGroupEditor: React.FC<TopicGroupEditorProps> = ({
  topic,
  children,
  onSave,
  onCancel,
}) => {
  const sortedChildren = useMemo(
    () => [...children].sort((a, b) => (a.toggle_order ?? 0) - (b.toggle_order ?? 0)),
    [children]
  );

  const [topicTitle, setTopicTitle] = useState(topic.title);
  const [childState, setChildState] = useState(
    sortedChildren.map((child) => ({
      id: child.id,
      title: child.title,
      difficulty_rating: child.difficulty_rating === -1 ? 1 : child.difficulty_rating,
      task_type: child.task_type,
    }))
  );

  const isValid =
    topicTitle.trim() !== '' &&
    childState.every((child) => child.title.trim() !== '' && child.difficulty_rating !== -1);

  const updateChild = (id: number, patch: Partial<{ title: string; difficulty_rating: number }>) => {
    setChildState((prev) =>
      prev.map((child) => (child.id === id ? { ...child, ...patch } : child))
    );
  };

  return (
    <div>
      <IonItem lines="none">
        <div className="task-row-editing" style={{ width: '100%' }}>
          <IonInput
            value={topicTitle}
            placeholder="Topic name"
            onIonInput={(e) => setTopicTitle(e.detail.value ?? '')}
            autofocus
          />
          <div className="task-options">
            <IonChip>Topic</IonChip>
          </div>
        </div>
      </IonItem>

      <div style={{ paddingLeft: '16px' }}>
        {childState.map((child) => (
          <IonItem lines="none" key={child.id}>
            <div className="task-row-editing" style={{ width: '100%' }}>
              <IonInput
                value={child.title}
                placeholder="Task name"
                onIonInput={(e) => updateChild(child.id, { title: e.detail.value ?? '' })}
              />

              <div className="task-options">
                {[1, 2, 3].map((d) => (
                  <IonButton
                    key={d}
                    size="small"
                    fill={child.difficulty_rating === d ? 'solid' : 'outline'}
                    color={child.difficulty_rating === d ? DIFFICULTY_COLORS[d] : 'medium'}
                    onClick={() => updateChild(child.id, { difficulty_rating: d })}
                  >
                    {d}
                  </IonButton>
                ))}
              </div>

              <div className="task-options">
                <IonChip>{TYPE_LABELS[child.task_type]}</IonChip>
              </div>
            </div>
          </IonItem>
        ))}
      </div>

      <div style={{ padding: '0 8px 8px 8px' }}>
        <IonButton
          expand="block"
          disabled={!isValid}
          onClick={() =>
            onSave(
              topicTitle.trim(),
              childState.map((child) => ({
                id: child.id,
                title: child.title.trim(),
                difficulty_rating: child.difficulty_rating,
              }))
            )
          }
        >
          Save topic
        </IonButton>

        <IonButton expand="block" fill="outline" color="medium" onClick={onCancel}>
          Cancel
        </IonButton>
      </div>
    </div>
  );
};

// ─── Task Row ──────────────────────────────────────────────
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
  const topic = isTopicTask(task);

  if (editing) {
    return (
      <IonItem lines="none">
        <TaskRowForm
          initial={task}
          onSave={(t, d, ty) => onSaveEdit(task.id, t, d, ty)}
          onCancel={() => onCancelEdit(task.id)}
          saveLabel={topic ? 'Save topic' : 'Save'}
        />
      </IonItem>
    );
  }

  return (
    <IonItem lines="none">
      <IonCheckbox
      slot="start"
      checked={task.is_done}
      onClick={(e) => e.stopPropagation()}
      onIonChange={(e) => {
        e.stopPropagation();
        onToggleDone(task.id, e.detail.checked);
      }}
    />

      <IonLabel className={task.is_done ? 'task-completed' : ''}>
        {task.title}

        <div className="task-badges">
          {topic ? (
            <IonChip>Topic</IonChip>
          ) : (
            <>
              {task.difficulty_rating !== -1 && (
                <IonChip color={DIFFICULTY_COLORS[task.difficulty_rating]}>
                  {DIFFICULTY_LABELS[task.difficulty_rating]}
                </IonChip>
              )}
              <IonChip>{TYPE_LABELS[task.task_type]}</IonChip>
            </>
          )}
        </div>
      </IonLabel>

      {(showActions || showReorder) && (
        <div slot="end" className="task-actions">
          {showActions && (
            <>
              <IonButton
                fill="clear"
                size="small"
                onClick={() => {
                  blurActive();
                  onStartEdit(task.id);
                }}
              >
                <IonIcon icon={pencil} />
              </IonButton>

              <IonButton
                fill="clear"
                size="small"
                color="danger"
                onClick={() => {
                  blurActive();
                  onDelete(task.id);
                }}
              >
                <IonIcon icon={trash} />
              </IonButton>
            </>
          )}

          {showReorder && <IonReorder />}
        </div>
      )}
    </IonItem>
  );
};

// ─── Task List ─────────────────────────────────────────────
const TaskList: React.FC<TaskListProps> = ({ assignmentId }) => {
  const [editingIds, setEditingIds] = useState<Set<number>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const dbTasks =
    useLiveQuery(
      () => db.tasks.where('fk_assignment').equals(assignmentId).toArray(),
      [assignmentId]
    ) ?? [];

  const tasks = useMemo(
    () => [...dbTasks].sort((a, b) => (a.toggle_order ?? 0) - (b.toggle_order ?? 0)),
    [dbTasks]
  );

  const taskMap = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);

  const topLevelTasks = useMemo(
    () => tasks.filter((t) => t.parent_task_id == null),
    [tasks]
  );

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
      map.set(
        key,
        [...value].sort((a, b) => (a.toggle_order ?? 0) - (b.toggle_order ?? 0))
      );
    }

    return map;
  }, [tasks]);

  useEffect(() => {
    setEditingIds((prev) => {
      const next = new Set<number>();
      for (const id of prev) {
        if (taskMap.has(id)) next.add(id);
      }
      return next;
    });
  }, [taskMap]);

  const handleToggleDone = async (id: number, val: boolean) => {
    blurActive();

    const task = taskMap.get(id);
    if (!task) return;

    if (isTopicTask(task)) {
      const children = childrenByParent.get(id) ?? [];

      await db.transaction('rw', db.tasks, async () => {
        await db.tasks.update(id, { is_done: val });

        for (const child of children) {
          await db.tasks.update(child.id, { is_done: val });
        }
      });

      return;
    }

    await db.tasks.update(id, { is_done: val });

    if (task.parent_task_id != null) {
      const siblings = childrenByParent.get(task.parent_task_id) ?? [];
      const allDone = siblings.every((sibling) =>
        sibling.id === id ? val : sibling.is_done
      );

      await db.tasks.update(task.parent_task_id, { is_done: allDone });
    }
  };

  const handleStartEdit = (id: number) => {
    const task = taskMap.get(id);
    if (!task) return;

    if (isTopicTask(task)) {
      const children = childrenByParent.get(id) ?? [];
      setEditingIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        children.forEach((child) => next.add(child.id));
        return next;
      });

      setExpandedTopics((prev) => {
        const value = `topic-${id}`;
        return prev.includes(value) ? prev : [...prev, value];
      });

      return;
    }

    setEditingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleSaveEdit = async (
    id: number,
    title: string,
    difficulty: number,
    type: number
  ) => {
    blurActive();

    const task = taskMap.get(id);
    if (!task) return;

    await db.tasks.update(id, {
      title,
      difficulty_rating: isTopicTask(task) ? -1 : difficulty,
      task_type: isTopicTask(task) ? -1 : type,
    });

    setEditingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleSaveTopicGroup = async (
    topicId: number,
    topicTitle: string,
    childUpdates: { id: number; title: string; difficulty_rating: number }[]
  ) => {
    blurActive();

    await db.transaction('rw', db.tasks, async () => {
      await db.tasks.update(topicId, {
        title: topicTitle,
        difficulty_rating: -1,
        task_type: -1,
      });

      for (const child of childUpdates) {
        await db.tasks.update(child.id, {
          title: child.title,
          difficulty_rating: child.difficulty_rating,
        });
      }
    });

    setEditingIds((prev) => {
      const next = new Set(prev);
      next.delete(topicId);
      childUpdates.forEach((child) => next.delete(child.id));
      return next;
    });
  };

  const handleCancelEdit = (id: number) => {
    const task = taskMap.get(id);

    if (task && isTopicTask(task)) {
      const children = childrenByParent.get(id) ?? [];
      setEditingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        children.forEach((child) => next.delete(child.id));
        return next;
      });
    } else {
      setEditingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }

    setIsAdding(false);
  };

  const handleDelete = async (id: number) => {
    blurActive();

    const task = taskMap.get(id);
    if (!task) return;

    await db.transaction('rw', db.tasks, async () => {
      if (isTopicTask(task)) {
        await db.tasks.where('parent_task_id').equals(id).delete();
      }
      await db.tasks.delete(id);
    });

    setEditingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      const children = childrenByParent.get(id) ?? [];
      children.forEach((child) => next.delete(child.id));
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
      for (let i = 0; i < reordered.length; i++) {
        await db.tasks.update(reordered[i].id, { toggle_order: i });
      }
    });

    event.detail.complete();
  };

  const handleAddSave = async (title: string, difficulty: number, type: number) => {
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

    setIsAdding(false);
  };

  const handleAddTopic = async () => {
    blurActive();

    const maxOrder = Math.max(-1, ...topLevelTasks.map((t) => t.toggle_order ?? -1));
    const baseOrder = maxOrder + 1;

    const topicId = await db.tasks.add({
      title: 'New topic',
      difficulty_rating: -1,
      is_done: false,
      task_type: -1,
      fk_assignment: assignmentId,
      toggle_order: baseOrder,
      parent_task_id: null,
    });

    setEditingIds((prev) => {
      const next = new Set(prev);
      next.add(topicId);
      return next;
    });

    setExpandedTopics((prev) => {
      const value = `topic-${topicId}`;
      return prev.includes(value) ? prev : [...prev, value];
    });
  };

  const createDefaultSubtasksForTopic = async (topicId: number) => {
    const existingChildren = childrenByParent.get(topicId) ?? [];
    if (existingChildren.length > 0) return;

    await db.tasks.bulkAdd([
      {
        title: 'P',
        difficulty_rating: 1,
        is_done: false,
        task_type: 0,
        fk_assignment: assignmentId,
        toggle_order: 0,
        parent_task_id: topicId,
      },
      {
        title: 'A',
        difficulty_rating: 1,
        is_done: false,
        task_type: 1,
        fk_assignment: assignmentId,
        toggle_order: 1,
        parent_task_id: topicId,
      },
      {
        title: 'T',
        difficulty_rating: 1,
        is_done: false,
        task_type: 2,
        fk_assignment: assignmentId,
        toggle_order: 2,
        parent_task_id: topicId,
      },
    ]);
  };

  const handleSaveNewTopic = async (
    topicId: number,
    title: string
  ) => {
    blurActive();

    await db.transaction('rw', db.tasks, async () => {
      await db.tasks.update(topicId, {
        title,
        difficulty_rating: -1,
        task_type: -1,
      });
    });

    await createDefaultSubtasksForTopic(topicId);

    setEditingIds((prev) => {
      const next = new Set(prev);
      next.delete(topicId);
      return next;
    });
  };

  const renderTopicBlock = (topic: Task) => {
    const children = childrenByParent.get(topic.id) ?? [];
    const topicEditing = editingIds.has(topic.id);
    const childEditing = children.some((child) => editingIds.has(child.id));
    const groupEditing = topicEditing || childEditing;
    const accordionValue = `topic-${topic.id}`;

    if (groupEditing) {
      if (children.length === 0) {
        return (
          <div key={topic.id}>
            <IonItem lines="none">
              <TaskRowForm
                initial={topic}
                onSave={(title) => handleSaveNewTopic(topic.id, title)}
                onCancel={() => handleCancelEdit(topic.id)}
                saveLabel="Save topic"
              />
            </IonItem>
          </div>
        );
      }

      return (
        <div key={topic.id}>
          <TopicGroupEditor
            topic={topic}
            children={children}
            onSave={(topicTitle, childUpdates) =>
              handleSaveTopicGroup(topic.id, topicTitle, childUpdates)
            }
            onCancel={() => handleCancelEdit(topic.id)}
          />
        </div>
      );
    }

    return (
      <IonAccordionGroup
        key={topic.id}
        multiple
        value={expandedTopics}
        onIonChange={(e) => {
          const value = e.detail.value;
          if (Array.isArray(value)) {
            setExpandedTopics(value);
          } else if (typeof value === 'string') {
            setExpandedTopics([value]);
          } else {
            setExpandedTopics([]);
          }
        }}
      >
        <IonAccordion value={accordionValue}>
          <IonItem slot="header" lines="none">
            <IonCheckbox
              slot="start"
              checked={topic.is_done}
              onClick={(e) => e.stopPropagation()}
              onIonChange={(e) => {
                e.stopPropagation();
                handleToggleDone(topic.id, e.detail.checked);
              }}
            />

            <IonLabel className={topic.is_done ? 'task-completed' : ''}>
              {topic.title}
              <div className="task-badges">
                <IonChip>Topic</IonChip>
              </div>
            </IonLabel>

            <div slot="end" className="task-actions">
              <IonButton
                fill="clear"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  blurActive();
                  handleStartEdit(topic.id);
                }}
              >
                <IonIcon icon={pencil} />
              </IonButton>

              <IonButton
                fill="clear"
                size="small"
                color="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  blurActive();
                  handleDelete(topic.id);
                }}
              >
                <IonIcon icon={trash} />
              </IonButton>

              <IonReorder />
            </div>
          </IonItem>

          <div slot="content" style={{ paddingLeft: '16px' }}>
            {children.map((child) => (
              <TaskRow
                key={child.id}
                task={child}
                editing={false}
                showActions={false}
                onToggleDone={handleToggleDone}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </IonAccordion>
      </IonAccordionGroup>
    );
  };

  return (
    <>
      <IonList>
        <IonReorderGroup disabled={editingIds.size > 0} onIonReorderEnd={handleReorderEnd}>
          {topLevelTasks.map((task) =>
            isTopicTask(task) ? (
              renderTopicBlock(task)
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

      {isAdding ? (
        <TaskRowForm
          initial={{ title: '', difficulty_rating: -1, task_type: -1, parent_task_id: null }}
          onSave={handleAddSave}
          onCancel={() => setIsAdding(false)}
          saveLabel="Add task"
        />
      ) : (
        <div style={{ display: 'flex', gap: '8px', padding: '12px' }}>
          <IonButton
            style={{ flex: 1 }}
            onClick={() => {
              blurActive();
              setIsAdding(true);
            }}
          >
            + Task
          </IonButton>

          <IonButton
            style={{ flex: 1 }}
            fill="outline"
            onClick={() => {
              blurActive();
              handleAddTopic();
            }}
          >
            + Topic
          </IonButton>
        </div>
      )}
    </>
  );
};

export default TaskList;