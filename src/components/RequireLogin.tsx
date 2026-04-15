import { Redirect } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

const RequireLogin: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const { loggedIn } = useAuth()

  if (!loggedIn) return <Redirect to="/welcome" />

  return children
}

export default RequireLogin;