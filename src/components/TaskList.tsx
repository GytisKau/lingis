import React, { useState, useEffect } from 'react';
import {
  IonList, IonReorderGroup, IonItem, IonGrid, IonRow, IonCol,
  IonCheckbox, IonInput, IonText, IonSelect, IonSelectOption,
  IonButton, IonIcon, IonReorder
} from '@ionic/react';
import { pencil, trash } from 'ionicons/icons';
import { ReorderEndCustomEvent } from '@ionic/core/components';
import { db } from '../db/db';
import type { Task } from '../db/db';

interface TaskListProps {
  assignmentId: number;
  dbTasks: any[];
}

const TaskList: React.FC<TaskListProps> = ({ assignmentId, dbTasks }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
  setTasks(
    dbTasks // Fixed from db_tasks
      .sort((a: Task, b: Task) => (a.toggle_order ?? 0) - (b.toggle_order ?? 0)) // Added Task types
      .map((t: Task) => ({ 
        ...t, 
        editing: false 
      })) // Added Task type
  );
}, [dbTasks]);

  const addTask = () => {
    setTasks([...tasks, {
      id: null, title: "", difficulty_rating: -1, is_done: false,
      task_type: -1, fk_assignment: assignmentId,
      toggle_order: tasks.length, editing: true
    }]);
  };

  const updateTask = (index: number, field: string, value: any) => {
    setTasks(tasks.map((t, i) => i === index ? { ...t, [field]: value } : t));
  };

  const isTaskValid = (task: any) => 
    task.title?.trim() !== "" && task.difficulty_rating !== -1 && task.task_type !== -1;

  const finishEditing = async (index: number) => {
    const task = tasks[index];
    const taskData = {
      title: task.title,
      difficulty_rating: task.difficulty_rating,
      is_done: task.is_done,
      task_type: task.task_type,
      fk_assignment: task.fk_assignment,
      toggle_order: task.toggle_order
    };

    if (task.id == null) {
      const newId = await db.tasks.add(taskData);
      tasks[index].id = newId;
    } else {
      await db.tasks.update(task.id, taskData);
    }

    const newTasks = [...tasks];
    newTasks[index].editing = false;
    setTasks(newTasks);
  };

  const deleteTask = async (index: number) => {
    const task = tasks[index];
    if (task.id != null) await db.tasks.delete(task.id);
    const newTasks = tasks.filter((_, i) => i !== index).map((t, i) => {
      const updated = { ...t, toggle_order: i };
      if (updated.id != null) db.tasks.update(updated.id, { toggle_order: i });
      return updated;
    });
    setTasks(newTasks);
  };

  const handleReorderEnd = (event: ReorderEndCustomEvent) => {
    const newTasks = [...tasks];
    const [movedItem] = newTasks.splice(event.detail.from, 1);
    newTasks.splice(event.detail.to, 0, movedItem);
    setTasks(newTasks);
    event.detail.complete();
  };

  const toggleReorder = () => {
    if (!isDisabled) {
      tasks.forEach((task, i) => {
        if (task.id != null) db.tasks.update(task.id, { toggle_order: i });
      });
    }
    setIsDisabled(!isDisabled);
  };

  return (
    <>
      <IonList>
        <IonReorderGroup disabled={isDisabled} onIonReorderEnd={handleReorderEnd}>
          {tasks.map((task, index) => (
            <IonItem key={task.id ?? `new-${index}`}>
              <IonGrid>
                <IonRow className="ion-align-items-center">
                  <IonCol size="1">
                    <IonCheckbox
                      checked={task.is_done}
                      onIonChange={async (e) => {
                        const newVal = e.detail.checked;
                        updateTask(index, "is_done", newVal);
                        if (task.id != null) await db.tasks.update(task.id, { is_done: newVal });
                      }}
                    />
                  </IonCol>
                  <IonCol size="6">
                    {task.editing ? (
                      <IonInput
                        value={task.title}
                        onIonInput={(e) => updateTask(index, "title", e.detail.value)}
                      />
                    ) : (
                      <IonText>{task.title}</IonText>
                    )}
                  </IonCol>
                  <IonCol size="1">
                    <IonSelect
                      value={task.difficulty_rating}
                      onIonChange={(e) => updateTask(index, "difficulty_rating", e.detail.value)}
                    >
                      <IonSelectOption value={0}>1</IonSelectOption>
                      <IonSelectOption value={1}>2</IonSelectOption>
                      <IonSelectOption value={2}>3</IonSelectOption>
                    </IonSelect>
                  </IonCol>
                  <IonCol size="1">
                    <IonSelect
                      value={task.task_type}
                      onIonChange={(e) => updateTask(index, "task_type", e.detail.value)}
                    >
                      <IonSelectOption value="0">Passive</IonSelectOption>
                      <IonSelectOption value="1">Active</IonSelectOption>
                      <IonSelectOption value="2">Testing</IonSelectOption>
                    </IonSelect>
                  </IonCol>
                  <IonCol size="3">
                    {task.editing ? (
                      <IonButton size="small" disabled={!isTaskValid(task)} onClick={() => finishEditing(index)}>Save</IonButton>
                    ) : (
                      <>
                        <IonButton size="small" onClick={() => updateTask(index, 'editing', true)}>
                          <IonIcon icon={pencil} />
                        </IonButton>
                        <IonButton size="small" color="danger" onClick={() => deleteTask(index)}>
                          <IonIcon icon={trash} />
                        </IonButton>
                      </>
                    )}
                  </IonCol>
                </IonRow>
              </IonGrid>
              <IonReorder slot="end" />
            </IonItem>
          ))}
        </IonReorderGroup>
      </IonList>
      <IonButton onClick={toggleReorder}>
        {isDisabled ? "Toggle Reorder" : "Finish Toggle Reorder"}
      </IonButton>
      <IonButton fill="outline" shape="round" onClick={addTask}> + </IonButton>
    </>
  );
};

export default TaskList;