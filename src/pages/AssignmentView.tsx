import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonText,
  IonModal, IonButtons, IonButton, IonItem, IonInput, IonLabel, IonSegment, IonSegmentButton, IonCheckbox,
  IonList, IonReorderGroup, IonReorder, IonSelect, IonSelectOption, IonCol, IonRow, IonGrid
 } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import { OverlayEventDetail, ReorderEndCustomEvent } from '@ionic/core/components';
import './AssignmentView.css';
import { useRef, useState } from 'react';
import { RouteComponentProps } from 'react-router';

interface AssignmentViewProps 
    extends RouteComponentProps<{
    id: string;
  }>{}


const AssignmentsView: React.FC = () => {
  const [isDisabled, setIsDisabled] = useState(true);
  const [tasks, setTasks] = useState([
  { name: "Task 1", difficulty: 2, type: "P", editing: false },
  { name: "Task 2", difficulty: 3, type: "A", editing: false },
  { name: "Task 3", difficulty: 1, type: "T", editing: false }
]);

  const addTask = () => {
    setTasks([
      ...tasks,
      { name: "", difficulty: 1, type: "A", editing: true }
    ]);
  };

  const updateTask = (index: number, field: string, value: any) => {
    setTasks(prev => prev.map((task, i) => i === index ? { ...task, [field]: value } : task));
  };

const finishEditing = (index: number) => {
  const newTasks = [...tasks];
  newTasks[index].editing = false;
  setTasks(newTasks);
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
          <IonText> Assignment 1 </IonText>
          <IonText> March 1st, 2026 </IonText>     
          </p>   
          <IonText> Current tasks: </IonText>
          <IonList>
                    <IonReorderGroup disabled={isDisabled} onIonReorderEnd={handleReorderEnd}>
                      {tasks.map((task, index) => (
                        <IonItem key={index}>
                  <IonGrid>
                            <IonRow className="ion-align-items-center">

                              {/* NAME */}
                              <IonCol size="6">
                          {/* NAME */}
                          {task.editing ? (
                            <IonInput 
                              label="Title"
                              labelPlacement="stacked"
                              placeholder="Task name"
                              value={task.name}
                              onIonInput={(e) => updateTask(index, "name", e.detail.value)}
                              onIonBlur={() => finishEditing(index)}
                            />
                          ) : (
                            <IonCheckbox labelPlacement="end"> {task.name}</IonCheckbox>
                          )}
                       </IonCol>
                   <IonCol size="3">
                  {/* DIFFICULTY */} 
                  <IonSelect
                    label="Difficulty"
                    labelPlacement="stacked"
                    value={task.difficulty}
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
                  value={task.type}
                  onIonChange={(e) =>
                    updateTask(index, "type", e.detail.value)
                  }
                >
                  <IonSelectOption value="P">Passive</IonSelectOption>
                  <IonSelectOption value="A">Active</IonSelectOption>
                  <IonSelectOption value="T">Testing</IonSelectOption>
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
