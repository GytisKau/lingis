import {
  IonContent,
  IonButton,
  IonText
} from "@ionic/react"
import { useIonRouter } from "@ionic/react"
import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import EmailInput from "./EmailInput"
import PasswordInput from "./PasswordInput"

const Register: React.FC = () => {
  const { register, registerError } = useAuth()
  const router = useIonRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setLocalError(null)

    // ✅ check if passwords match
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match")
      return
    }

    setLoading(true)
    const success = await register(email, password)
    setLoading(false)

    if (success) {
      router.push("/", "root")
    }
  }

  return (
    <IonContent className="ion-padding">
      <h2>Register</h2>

      <form
        className="ion-display-flex ion-flex-column"
        style={{ gap: "1em" }}
      >
        <EmailInput
          onIonInput={(e, isValid) => {
            setEmail(e.detail.value ?? "")
            setLocalError(null)
          }}
        />

        <PasswordInput
          onIonInput={(e, isValid) => {
            setPassword(e.detail.value ?? "")
            setLocalError(null)
          }}
        />

        <PasswordInput
          label="Confirm Password"
          onIonInput={(e, isValid) => {
            setConfirmPassword(e.detail.value ?? "")
            setLocalError(null)
          }}
        />

        {registerError != null && (
          <IonText color="danger">{registerError.message}</IonText>
        )}

        {localError && (
          <IonText color="danger">{localError}</IonText>
        )}

        <IonButton expand="block" onClick={handleRegister} disabled={loading || password !== confirmPassword || localError != null || email == "" || password == "" || confirmPassword == ""}>
          {loading ? "Creating account..." : "Register"}
        </IonButton>
      </form>
    </IonContent>
  )
}

export default Register