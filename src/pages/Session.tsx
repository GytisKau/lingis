import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Session.css';

const Assignments: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Assignments Form</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Assignments Form</IonTitle>
          </IonToolbar>
        </IonHeader>

        <form action="/submit" method="post">
        <label>Name:</label>
        <input type="text" id="name" name="name"/>

      <button type="submit">Submit</button>
    </form>

      </IonContent>
    </IonPage>
  );
};

export default Assignments;
