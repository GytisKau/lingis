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
import { trash, checkmarkDoneOutline } from "ionicons/icons";
import { db } from "../db/db";

const AssignmentList: React.FC = () => {
  const assignments = useLiveQuery(async () => {
    const asgns = await db.assignments.toArray();
    const tasks = await db.tasks.toArray();

    return asgns.map((a) => {
      const assignmentTasks = tasks.filter((t) => t.fk_assignment === a.id);
      const completed = assignmentTasks.filter((t) => t.is_done).length;

      return {
        ...a,
        completedCount: completed,
        totalCount: assignmentTasks.length
      };
    });
  }, []);

  const deleteAssignment = async (id: number) => {
    await db.tasks.where("fk_assignment").equals(id).delete();
    await db.assignments.delete(id);
  };

  const getTypeClass = (type: number) => {
    if (type === 0) return "exam";
    if (type === 1) return "lab";
    return "other";
  };

  const getTimeLeft = (date: string | Date) => {
    const dueDate = new Date(date).getTime();
    const now = new Date().getTime();
    const diff = dueDate - now;

    if (isNaN(dueDate)) return "No due date";
    if (diff <= 0) return "Overdue";

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days} day${days !== 1 ? "s" : ""} left`;
    }

    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""} left`;
    }

    return `${minutes} min left`;
  };

  if (!assignments || assignments.length === 0) {
    return <h3 className="ion-text-center">Add an assignment!</h3>
  }

  return (
    <IonList lines="none">
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

                <IonBadge className="task-progress-badge">
                  <IonIcon icon={checkmarkDoneOutline} className="task-progress-icon" />
                  <span>
                    {assignment.completedCount}/{assignment.totalCount}
                  </span>
                </IonBadge>
              </div>

              <div className="assignment-footer">
                <div className="due-date">
                  <small>{getTimeLeft(assignment.date)}</small>
                </div>

                <IonNote color="dark">{assignment.est_hours / 60}h</IonNote>
              </div>
            </IonLabel>
          </IonItem>

          <IonItemOptions side="end">
            <IonItemOption
              className="delete-option"
              onClick={() => deleteAssignment(assignment.id!)}
            >
              <div className="delete-button">
                <IonIcon icon={trash} />
              </div>
            </IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
      ))}
    </IonList>
  );
};

export default AssignmentList;