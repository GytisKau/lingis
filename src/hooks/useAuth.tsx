import { createContext, useContext, useState, useEffect } from "react"
import { auth } from "../utils/Firebase" // pasitikrink kelią
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  User
} from "firebase/auth"

interface AuthError {
  type: "email" | "password" | "other";
  message: string
} 

interface AuthState {
  user: User | null
  loggedIn: boolean
  wizardDone: boolean
  loginError: AuthError | null
  login: (email: string, password: string) => Promise<boolean>
  registerError: AuthError | null
  register: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  finishWizard: () => void
  clearErrors: () => void
}

const AuthContext = createContext<AuthState>(null!)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [user, setUser] = useState<User | null>(null)
  const [wizardDone, setWizardDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loginError, setLoginError] = useState<AuthError | null>(null)
  const [registerError, setRegisterError] = useState<AuthError | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    setWizardDone(localStorage.getItem("wizardDone") === "true")

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoginError(null)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      return true
    } catch (err: any) {
      switch (err.code) {
        case "auth/user-not-found":
          setLoginError({type: "email", message: "User not found"})
          break
        case "auth/wrong-password":
          setLoginError({type: "password", message: "Wrong password"})
          break
        case "auth/invalid-email":
          setLoginError({type: "email", message: "Invalid email"})
          break
        case "auth/too-many-requests":
          setLoginError({ type: "other", message: "Too many login attempts. Try again later."})
          break
        default:
          setLoginError({type: "other", message: "Error during login."})
      }
      return false
    }
  }

  const register = async (email: string, password: string): Promise<boolean> => {
    setRegisterError(null)

    try {
      await createUserWithEmailAndPassword(auth, email, password)
      return true
    } catch (err: any) {
      switch (err.code) {
        case "auth/email-already-in-use":
          setRegisterError({ type: "email", message: "Email already in use" })
          break
        case "auth/invalid-email":
          setRegisterError({ type: "email", message: "Invalid email" })
          break
        case "auth/weak-password":
          setRegisterError({ type: "password", message: "Password is too weak (min 6 chars)" })
          break
        default:
          setRegisterError({ type: "other", message: "Error during registration." })
      }
      return false
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  const finishWizard = () => {
    localStorage.setItem("wizardDone", "true")
    setWizardDone(true)
  }

  const clearErrors = () => {
    setLoginError(null)
    setRegisterError(null)
  }

  if (loading) return null // arba loaderis

  return (
    <AuthContext.Provider
      value={{
        user,
        loggedIn: !!user,
        wizardDone,
        loginError,
        login,
        registerError,
        register,
        logout,
        finishWizard,
        clearErrors
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)