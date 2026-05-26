import { IonButton, IonText } from "@ionic/react"
import { useIonRouter } from "@ionic/react"
import { useState } from "react"
import { useAuth } from "../hooks/useAuth"

const GuestLoginButton: React.FC = () => {
  const router = useIonRouter()
  const { guestLogin, loginError } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleGuestLogin = async () => {
    setLoading(true)
    const success = await guestLogin()
    setLoading(false)

    if (success) {
      router.push("/", "root")
    }
  }

  return (
    <>
      <IonButton
        expand="block"
        fill="clear"
        onClick={handleGuestLogin}
        disabled={loading}
      >
        {loading ? "Please wait..." : "Continue as guest"}
      </IonButton>

      {loginError != null && (
        <IonText color="danger">
          <p>{loginError.message}</p>
        </IonText>
      )}
    </>
  )
}

export default GuestLoginButton