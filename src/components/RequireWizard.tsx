import { Redirect } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

const RequireWizard: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const { wizardDone } = useAuth()

  if (!wizardDone) return <Redirect to="/loginwizard" />

  return children
}

export default RequireWizard;