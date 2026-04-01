import { useLiveQuery } from "dexie-react-hooks";
import {
  IonList,
  IonItemSliding,
  IonItem,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  IonLabel,
  IonNote,
  IonBadge,
  IonText
} from "@ionic/react";
import { trash, calendarOutline, checkmarkDoneOutline } from "ionicons/icons";
import { db } from "../db/db";

const AssignmentList: React.FC = () => {
  // Fetch assignments and tasks to calculate progress
  const assignments = useLiveQuery(async () => {
    const asgns = await db.assignments.toArray();
    // Fetch all tasks to map completion counts
    const tasks = await db.tasks.toArray();
    
    return asgns.map(a => {
      const assignmentTasks = tasks.filter(t => t.fk_assignment === a.id);
      const completed = assignmentTasks.filter(t => t.is_done).length;
      return {
        ...a,
        completedCount: completed,
        totalCount: assignmentTasks.length
      };
    });
  }, []);

  const deleteAssignment = async (id: number) => {
    if (!window.confirm("Delete this assignment and all tasks?")) return;
    await db.tasks.where("fk_assignment").equals(id).delete();
    await db.assignments.delete(id);
  };

  const getTypeClass = (type: number) => {
    if (type === 0) return "exam";
    if (type === 1) return "lab";
    return "other";
  };

  if (!assignments || assignments.length === 0) {
    return <p className="centered-text">No assignments added yet.</p>;
  }

  return (
    <IonList lines="none" className="assignment-list-container">
      {assignments.map((assignment) => (
        <IonItemSliding key={assignment.id} className="assignment-sliding-item">
          <IonItem
            button
            detail={false}
            className={`assignment-card-item ${getTypeClass(assignment.assignment_type)}`}
            routerLink={`/tabs/tab4/viewassignment/${assignment.id}`}
          >
            <IonLabel>
              <div className="assignment-header">
                <IonText className="assignment-title">{assignment.title}</IonText>
                <IonBadge color="light" className="task-progress-badge">
                  <IonIcon icon={checkmarkDoneOutline} />
                  {assignment.completedCount}/{assignment.totalCount}
                </IonBadge>
              </div>

              <div className="assignment-footer">
                <div className="due-date">
                  <small>Due: {new Date(assignment.date).toLocaleDateString()}</small>
                </div>
                <IonNote color="dark">{assignment.est_hours / 60}h</IonNote>
              </div>
            </IonLabel>
          </IonItem>

          <IonItemOptions side="end">
            <IonItemOption color="danger" onClick={() => deleteAssignment(assignment.id!)}>
              <IonIcon slot="icon-only" icon={trash} />
            </IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
      ))}
    </IonList>
  );
};

export default AssignmentList;