import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonText,
  IonModal, IonButtons, IonButton, IonItem, IonInput, IonLabel, IonSegment, IonSegmentButton, IonCheckbox,
  IonList, IonReorderGroup, IonReorder, IonSelect, IonSelectOption, IonCol, IonRow, IonGrid, IonIcon
 } from '@ionic/react';
import {pencil, trash} from 'ionicons/icons'
 import ExploreContainer from '../components/ExploreContainer';
import AddTaskForm from '../forms/AddTaskForm';
import { OverlayEventDetail, ReorderEndCustomEvent } from '@ionic/core/components';
import './AssignmentView.css';
import { db, Task } from '../db/db';
import { useRef, useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';

interface AssignmentViewProps 
    extends RouteComponentProps<{
    id: string;
  }>{}

interface NewTask{
  title: string;
  difficulty_rating: number;
  is_done: boolean;
  task_type: number;
  fk_assignment: number;
  editing: true;
}


const AssignmentsView: React.FC<AssignmentViewProps> = ({ match }) => {
  const id = Number(match.params.id);
  const assignment = useLiveQuery(
    async () => await db.assignments.get(id),
    [id]
  );
  const [isDisabled, setIsDisabled] = useState(true);

  var db_tasks = useLiveQuery(async () => await db.tasks.where("fk_assignment").equals(id).toArray(), [id]) ?? []
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    setTasks(
      db_tasks
        .sort((a, b) => (a.toggle_order ?? 0) - (b.toggle_order ?? 0)) // optional: initial sort
        .map(t => ({
          id: t.id,
          title: t.title,
          difficulty_rating: t.difficulty_rating,
          is_done: t.is_done,
          task_type: t.task_type,
          fk_assignment: t.fk_assignment,
          toggle_order: t.toggle_order ?? 0,
          editing: false
        }))
    );
  }, [db_tasks]);

  const addTask = () => {
    const nextOrder = tasks.length; // put new task at the end
    setTasks([
      ...tasks,
      {
        id: null,
        title: "",
        difficulty_rating: -1,
        is_done: false,
        task_type: -1,
        fk_assignment: id,
        toggle_order: nextOrder, // <-- assign toggle_order
        editing: true
      }
    ]);
  };

  const updateTask = (index: number, field: string, value: any) => {
    setTasks(
      tasks.map((task, i) =>
        i === index ? { ...task, [field]: value } : task
      )
    );
  };
  const isTaskValid = (task: any) => {
    return (
      task.title?.trim() !== "" &&
      task.difficulty_rating !== -1 &&
      task.task_type !== -1
    );
  };

  const finishEditing = async (index: number) => {
    const task = tasks[index];

    if (task.id == null) {
      // new task → add to DB
      const newId = await db.tasks.add({
        title: task.title,
        difficulty_rating: task.difficulty_rating,
        is_done: task.is_done,
        task_type: task.task_type,
        fk_assignment: task.fk_assignment,
        toggle_order: task.toggle_order
      });

      tasks[index].id = newId;
    } else {
      // existing task → update DB
      await db.tasks.update(task.id, {
        title: task.title,
        difficulty_rating: task.difficulty_rating,
        is_done: task.is_done,
        task_type: task.task_type,
        toggle_order: task.toggle_order
      });
    }

    const newTasks = [...tasks];
    newTasks[index].editing = false;
    setTasks(newTasks);
  };

  const editTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks[index].editing = true;
    setTasks(newTasks);
  };

  const deleteTask = async (index: number) => {
    const task = tasks[index];

    // Delete from DB if it exists
    if (task.id != null) {
      await db.tasks.delete(task.id);
    }

    // Remove from local state
    const newTasks = tasks.filter((_, i) => i !== index);

    // Reassign toggle_order for remaining tasks
    newTasks.forEach((t, i) => {
      t.toggle_order = i;
      if (t.id != null) db.tasks.update(t.id, { toggle_order: i });
    });

    setTasks(newTasks);
  };

  const handleReorderEnd = (event: ReorderEndCustomEvent) => {
  const from = event.detail.from;
  const to = event.detail.to;

  const newTasks = [...tasks];
  const [movedItem] = newTasks.splice(from, 1);
  newTasks.splice(to, 0, movedItem);

  // Only update local state; DO NOT update DB yet
  setTasks(newTasks);

  event.detail.complete();
};

  function toggleReorder() {
  if (!isDisabled) {
    // we are finishing reorder → save toggle_order to DB
    tasks.forEach((task, i) => {
      task.toggle_order = i; // assign new order locally
      if (task.id != null) {
        db.tasks.update(task.id, { toggle_order: i }); // update DB
      }
    });
  }
  setIsDisabled((current) => !current);
}

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Assignment view</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="task-text">
          <p>
          <IonText>{assignment?.title ?? "Loading..."}</IonText>
          </p>
          <IonLabel>
            {assignment
              ? `${new Date(assignment.date).toLocaleDateString()}, estimated time: ${assignment.est_hours / 60} h`
              : "Loading..."}
          </IonLabel>
          <p>
          <IonText> Current tasks: </IonText>
          </p>
          <IonList>
                    <IonReorderGroup disabled={isDisabled} onIonReorderEnd={handleReorderEnd}>
                      {tasks.map((task, index) => (
                        <IonItem key={task.id ?? `new-${index}`}>
                          <IonGrid>
                            <IonRow className="ion-align-items-center">

                              {/* NAME */}
                          <IonCol size="1" className="checkbox-col">
                              <div className="checkbox-wrapper">
                              <IonCheckbox
                                slot="start"
                                checked={task.is_done}
                                onIonChange={async (e) => {
                                  const newVal = e.detail.checked;
                                  updateTask(index, "is_done", newVal);
                                  if (task.id != null) {
                                    await db.tasks.update(task.id, { is_done: newVal });
                                  }
                                }}
                              />
                              </div>
                            </IonCol>

                              <IonCol size="6">
                          {/* NAME */}
                          {task.editing ? (
                            <IonInput 
                              label="Title"
                              labelPlacement="stacked"
                              placeholder="Task name"
                              value={task.title}
                              onIonInput={(e) => updateTask(index, "title", e.detail.value)}
                              //onIonBlur={() => finishEditing(index)}
                            />
                          ) : (
                            <IonText> {task.title}</IonText>
                            
                          )}
                       </IonCol>
                   <IonCol size="1">
                  {/* DIFFICULTY */} 
                  <IonSelect
                    label="Difficulty"
                    labelPlacement="stacked"
                    value={task.difficulty_rating}
                    onIonChange={(e) => updateTask(index, "difficulty_rating", e.detail.value)}
                  >
                    <IonSelectOption value={0}>1</IonSelectOption>
                    <IonSelectOption value={1}>2</IonSelectOption>
                    <IonSelectOption value={2}>3</IonSelectOption>
                  </IonSelect>
                       </IonCol>
                   <IonCol size="1">
                  {/* TYPE */}
                  <IonSelect 
                  label="Type" 
                  labelPlacement="stacked"
                  value={task.task_type}
                  onIonChange={(e) =>
                    updateTask(index, "task_type", e.detail.value)
                  }
                >
                  <IonSelectOption value="0">Passive</IonSelectOption>
                  <IonSelectOption value="1">Active</IonSelectOption>
                  <IonSelectOption value="2">Testing</IonSelectOption>
                </IonSelect>
                </IonCol>
                  <IonCol size="1">
                  {task.editing && (
                    <IonButton size="small"   
                      disabled={!isTaskValid(task)}
                      onClick={() => finishEditing(index)}>
                      Save
                    </IonButton>
                  )}
                </IonCol>
                 <IonCol size="1">
                              {!task.editing && (
                                <IonButton size="small" onClick={() => editTask(index)}>
                                  <IonIcon icon={pencil}></IonIcon>
                                </IonButton>
                              )}
                            </IonCol>
                            <IonCol size="1">
                              {!task.editing && (
                            <IonButton size="small" color="danger" onClick={() => deleteTask(index)}>
                              <IonIcon icon={trash}></IonIcon>
                            </IonButton> )}
                          </IonCol>
                  </IonRow>
                </IonGrid>

                  <IonReorder slot="end"></IonReorder>

                </IonItem>
              ))}
            </IonReorderGroup>
          </IonList>
            <IonButton onClick={toggleReorder}>
              {isDisabled ? "Toggle Reorder" : "Finish Toggle Reorder"}
            </IonButton>
          <IonButton fill="outline" shape="round" id="open-modal" onClick={addTask}> + </IonButton>
        </div>
      
      <IonHeader collapse="condense">
        <IonToolbar>
        </IonToolbar>
      </IonHeader>
      </IonContent>
    </IonPage>
  );
};

export default AssignmentsView
