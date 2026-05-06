import {
  IonContent,
  IonButton,
  IonText
} from "@ionic/react"
import { useIonRouter } from "@ionic/react"
import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import EmailInput from "./EmailInput"
import PasswordInput, { ChecksValid, PasswordChecks } from "./PasswordInput"

const Register: React.FC = () => {
  const { register, registerError } = useAuth()
  const router = useIonRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState<{value: string, checks?: PasswordChecks}>({value: ""})
  const [confirmPassword, setConfirmPassword] = useState<{value: string, checks?: PasswordChecks}>({value: ""})
  const [localError, setLocalError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setLocalError(null)

    if (password.value !== confirmPassword.value) {
      setLocalError("Passwords do not match")
      return
    }

    setLoading(true)
    const success = await register(email, password.value)
    setLoading(false)

    if (success) {
      router.push("/", "root")
    }
  }

  const renderItem = (ok: boolean, text: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span>{ok ? "✔" : "✖"}</span>
      <IonText color={ok ? "medium" : "danger"}>
        <small>{text}</small>
      </IonText>
    </div>
  );

  return (
    <IonContent className="ion-padding">
      <h2>Register</h2>

      <form
        className="ion-display-flex ion-flex-column"
        style={{ gap: "1em" }}
      >
        <EmailInput
          onIonInput={(e, isValid) => {
            setEmail(isValid ? e.detail.value ?? "" : "")
            setLocalError(null)
          }}
        />

        <div>
          <PasswordInput
            validate
            onValidate={(value, checks) => {
              setPassword({value: ChecksValid(checks) ? value : "", checks})
              setLocalError(null)
            }}
          />

          {password.checks != undefined && ChecksValid(password.checks) == false && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              {renderItem(password.checks.length, "At least 6 characters")}
              {renderItem(password.checks.lowercase, "Lowercase letter")}
              {renderItem(password.checks.uppercase, "Uppercase letter")}
              {renderItem(password.checks.number, "Number")}
              {renderItem(password.checks.symbol, "Symbol")}
            </div>
          )}
        </div>

        <div>
          <PasswordInput
            label="Confirm Password"
            validate
            onValidate={(value, checks) => {
              setConfirmPassword({value: ChecksValid(checks) ? value : "", checks})
              setLocalError(null)
            }}
          />

          {password.checks != undefined && ChecksValid(password.checks) == true && confirmPassword.checks != undefined && ChecksValid(confirmPassword.checks) == false && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              {renderItem(confirmPassword.checks.length, "At least 6 characters")}
              {renderItem(confirmPassword.checks.lowercase, "Lowercase letter")}
              {renderItem(confirmPassword.checks.uppercase, "Uppercase letter")}
              {renderItem(confirmPassword.checks.number, "Number")}
              {renderItem(confirmPassword.checks.symbol, "Symbol")}
            </div>
          )}
          
          {password.value.length > 0 && confirmPassword.value.length > 0 && password.value !== confirmPassword.value && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                {renderItem(password.value == confirmPassword.value, "Passwords must match")}
            </div>
          )}
        </div>


        {registerError != null && (
          <IonText color="danger">{registerError.message}</IonText>
        )}

        {localError && (
          <IonText color="danger">{localError}</IonText>
        )}

        <IonButton expand="block" onClick={handleRegister} 
          disabled={loading || password.value !== confirmPassword.value || localError != null || email == "" || password.value == "" || confirmPassword.value == ""}>
          {loading ? "Creating account..." : "Register"}
        </IonButton>
      </form>
    </IonContent>
  )
}

export default Register