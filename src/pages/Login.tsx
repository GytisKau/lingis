import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useAuth } from '../hooks/useAuth';
import { Redirect } from 'react-router';

const Login: React.FC = () => {
  const { loggedIn, login } = useAuth();

  if (loggedIn) {
    return <Redirect to="/" />
  }

  const handleLogin = () => {
    login()
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className='ion-padding'>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Login</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonButton expand='block' onClick={handleLogin}>Login</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Login;
