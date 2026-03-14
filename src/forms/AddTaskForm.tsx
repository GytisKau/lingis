import { useEffect, useState } from "react"
import { db } from "../db/db"
import { useLiveQuery } from 'dexie-react-hooks';
import { IonButton, IonItem, IonInput, IonList, IonSegment, IonSegmentButton, IonLabel, IonSelect, IonSelectOption,
  IonReorderGroup, IonRow, IonCol, IonGrid, IonReorder, IonCheckbox, IonText,
  ReorderEndCustomEvent} from "@ionic/react"
  

interface AddTaskFormProps {
  assignment_id: number;
}

function formatDateTimeLocal(date: Date) {
  const d = new Date(date) // copy
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

//   tasks: "++id, title, difficulty_rating, is_done, task_type"


const AddTaskForm: React.FC<AddTaskFormProps> = ({ assignment_id }) => {
  const [isDisabled, setIsDisabled] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  const db_tasks = useLiveQuery(() => {
    return db.tasks.where("fk_assignment").equals(assignment_id).toArray()
  }, [assignment_id]) ?? [];

  const tasks = db_tasks.map(task => ({ ...task, editing: false }));
  
  const updateTask = async (taskId: number, field: string, value: any) => {
  await db.tasks.update(taskId, {
    [field]: value
  });
};

    function handleReorderEnd(event: ReorderEndCustomEvent) {
      // The `from` and `to` properties contain the index of the item
      // when the drag started and ended, respectively
      console.log('Dragged from index', event.detail.from, 'to', event.detail.to);
  
      // Finish the reorder and position the item in the DOM based on
      // where the gesture ended. This method can also be called directly
      // by the reorder group.
      event.detail.complete();
    }
  
    function toggleReorder() {
      setIsDisabled((current) => !current);
    }

  const [title, setTitle] = useState("")
  const [difficultyRating, setDifficultyRating] = useState<number>(0)
  const [isDone, setIsDone] = useState<boolean>(false)
  const [taskType, setTaskType] = useState<number>(0)
  const [status, setStatus] = useState("")

  async function addTask() {
    if (!title || !taskType) {
      setStatus("Please fill all required fields")
      return
    }

    try {
  const id = await db.tasks.add({
    title,
    difficulty_rating: difficultyRating,
    is_done: false,
    task_type: taskType,
    fk_assignment: assignment_id
  });

  setStatus(`Task ${title} successfully added. Got id ${id}`);
  setTitle("");
  setDifficultyRating(0);
  setTaskType(0);
  setIsDone(false);
} catch (error) {
  setStatus(`Failed to add ${title}: ${error}`);
}
  }

  return (
  <>
    <p>{status}</p>
          <IonText> Current tasks: </IonText>
            {tasks?.length === 0 && <p> No tasks added yet.</p>}
            <IonList>
                  <IonReorderGroup disabled={isDisabled} onIonReorderEnd={handleReorderEnd}>
                    {tasks.map((task, index) => (
                      <IonItem key={index}>
                <IonGrid>
                          <IonRow className="ion-align-items-center">

                            {/* NAME */}
                            <IonCol size="6">
                        {/* NAME */}
                        {editingId === task.id ? (
                         <IonInput 
                        label="Title"
                        labelPlacement="stacked"
                        placeholder="Task name"
                        value={task.title}
                        onIonInput={(e) => updateTask(task.id, "title", e.detail.value)}
                        //onIonBlur={(s) => finishEditing(index)}
                        />
                        ) : (
                    <IonCheckbox
                      checked={task.is_done === true}
                      onIonChange={(e) =>
                        updateTask(task.id, "is_done", e.detail.checked ? true : false)
                      }
                    >
                      {task.title}
                    </IonCheckbox>                       
                   )}
                      </IonCol>
                  <IonCol size="3">
                {/* DIFFICULTY */} 
                <IonSelect
                  label="Difficulty"
                  labelPlacement="stacked"
                  value={task.difficulty_rating}
                  onIonChange={(e) => updateTask(index, "difficulty", e.detail.value)}
                >
                  <IonSelectOption value={1}>1</IonSelectOption>
                  <IonSelectOption value={2}>2</IonSelectOption>
                  <IonSelectOption value={3}>3</IonSelectOption>
                </IonSelect>
                      </IonCol>
                  <IonCol size="3">
                {/* TYPE */}
                <IonSelect 
                label="Type" 
                labelPlacement="stacked"
                value={task.task_type}
                onIonChange={(e) =>
                  updateTask(index, "type", e.detail.value)
                }
              >
                <IonSelectOption value="0">Passive</IonSelectOption>
                <IonSelectOption value="1">Active</IonSelectOption>
                <IonSelectOption value="2">Testing</IonSelectOption>
              </IonSelect>
              </IonCol>

                </IonRow>
              </IonGrid>

                <IonReorder slot="end"></IonReorder>

              </IonItem>
            ))}
          </IonReorderGroup>
        </IonList>
              <IonButton onClick={toggleReorder}>Toggle Reorder</IonButton>
              <IonButton fill="outline" shape="round" onClick={addTask}> + </IonButton>
  </>
)
}

export default AddTaskForm