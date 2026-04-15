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
  const router = useIonRouter()

  const { login, loginError, resetPassword, resetPasswordError } = useAuth()
  const [resetMode, setResetMode] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleLogin = async () => {
    setLoading(true)
    const success = await login(email, password)
    setLoading(false)

    if (success) {
      router.push("/", "root")
    }
  }

  const handleReset = async () => {
    setMessage(null)

    const success = await resetPassword(email)

    if (success) {
      setMessage("Password reset email sent")
    }
  }

  return (
    <IonContent className="ion-padding">
      <h2>{resetMode ? "Reset password" : "Login"}</h2>
      <form className='ion-display-flex ion-flex-column' style={{gap: "1em"}}>
        <EmailInput onIonInput={(e, isValid) => setEmail(isValid ? e.detail.value ?? "" : "")}/>

        { !resetMode && (
          <PasswordInput onIonInput={(e, isValid) => setPassword(isValid ? e.detail.value ?? "" : "")}/>
        )}

        {loginError != null && (
          <IonText color="danger">{loginError.message}</IonText>
        )}

        {resetPasswordError != null && (
          <IonText color="danger">{resetPasswordError.message}</IonText>
        )}

        {message && (
          <IonText color="success">{message}</IonText>
        )}

        <IonText
          color="medium"
          style={{ fontSize: "0.9em", cursor: "pointer" }}
          onClick={() => {
            setResetMode(!resetMode)
            setMessage(null)
          }}
        >
          {resetMode ? "Back to login" : "Forgot password?"}
        </IonText>

        <IonButton
          expand="block"
          onClick={resetMode ? handleReset : handleLogin}
          disabled={loading || email == "" || !resetMode && password == "" }
          type="button">
          {loading ? "Please wait..." :
            resetMode ? "Send reset email" : "Login"}
        </IonButton>
      </form>
    </IonContent>
  )
}

export default Login