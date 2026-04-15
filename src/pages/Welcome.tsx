import {
  IonPage,
  IonContent,
  IonButton,
  IonText,
  IonModal
} from "@ionic/react"
import Login from "../components/Login"
import Register from "../components/Register"
import { useAuth } from "../hooks/useAuth"

const Welcome: React.FC = () => {
  const { clearErrors } = useAuth()
  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen>
        <div style={{ textAlign: "center", marginTop: "2em" }}>
          <img src="/logo.png" alt="Logo" className="register-logo" />
          <IonText>
            <h1>Welcome</h1>
            <p>Login or create an account</p>
          </IonText>
          <IonButton id="loginButton" expand="block">Login</IonButton>
          <IonButton id="registerButton" expand="block" fill="outline">Register</IonButton>
        </div>
        <IonModal trigger="loginButton" initialBreakpoint={0.5} breakpoints={[0, 0.5, 0.9]} onIonModalDidDismiss={clearErrors}>
          <Login />
        </IonModal>
        <IonModal trigger="registerButton" initialBreakpoint={0.7} breakpoints={[0, 0.7, 0.9]} onIonModalDidDismiss={clearErrors}>
          <Register/>
        </IonModal>
      </IonContent>
    </IonPage>
  )
}

export default Welcome