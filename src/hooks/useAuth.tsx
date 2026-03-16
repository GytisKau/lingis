import { createContext, useContext, useState, useEffect } from "react"

interface AuthState {
  loggedIn: boolean
  wizardDone: boolean
  login: () => void
  logout: () => void
  finishWizard: () => void
}

const AuthContext = createContext<AuthState>(null!)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [loggedIn, setLoggedIn] = useState(false)
  const [wizardDone, setWizardDone] = useState(false)

  useEffect(() => {
    setLoggedIn(localStorage.getItem("loggedIn") === "true")
    setWizardDone(localStorage.getItem("wizardDone") === "true")
  }, [])

  const login = () => {
    localStorage.setItem("loggedIn", "true")
    setLoggedIn(true)
  }

  const logout = () => {
    localStorage.clear()
    setLoggedIn(false)
    setWizardDone(false)
  }

  const finishWizard = () => {
    localStorage.setItem("wizardDone", "true")
    setWizardDone(true)
  }

  return (
    <AuthContext.Provider value={{ loggedIn, wizardDone, login, logout, finishWizard }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)