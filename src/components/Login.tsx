import {
  IonContent,
  IonButton,
  IonText
} from "@ionic/react"
import { useIonRouter } from "@ionic/react"
import { useState } from "react"
import { useAuth } from '../hooks/useAuth';
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";

const Login: React.FC = () => {
  const { login, loginError } = useAuth()
  const router = useIonRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    const success = await login(email, password)
    setLoading(false)

    if (success) {
      router.push("/", "root")
    }
  }

  return (
    <IonContent className="ion-padding">
      <h2>Login</h2>
      <form className='ion-display-flex ion-flex-column' style={{gap: "1em"}}>
        <EmailInput onIonInput={(e, isValid) => setEmail(e.detail.value ?? "")}/>

        <PasswordInput onIonInput={(e, isValid) => setPassword(e.detail.value ?? "")}/>

        {loginError != null && (
          <IonText color="danger">{loginError.message}</IonText>
        )}

        <IonButton expand="block" onClick={handleLogin} disabled={loading || email == "" || password == "" } type="button">
          {loading ? "Logging in..." : "Login"}
        </IonButton>
      </form>
    </IonContent>
  )
}

export default Login