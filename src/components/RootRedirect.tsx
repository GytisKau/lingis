import { Redirect } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

const RootRedirect: React.FC = () => {
  const { loggedIn, wizardDone } = useAuth()

  if (!loggedIn) {
    return <Redirect to="/welcome" />
  }

  if (!wizardDone) {
    return <Redirect to="/loginwizard" />
  }

  return <Redirect to="/tabs/tab1" />
}

export default RootRedirect