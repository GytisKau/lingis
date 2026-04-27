import { createContext, useContext, useState, useEffect } from "react"
import { analytics, auth } from "../utils/Firebase" // pasitikrink kelią
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  User,
  sendPasswordResetEmail 
} from "firebase/auth"
import { logEvent, setUserId } from "firebase/analytics";

interface AuthError {
  type: "email" | "password" | "other";
  message: string
} 

interface AuthState {
  user: User | null
  loggedIn: boolean
  wizardDone: boolean
  loginError: AuthError | null
  registerError: AuthError | null
  resetPasswordError: AuthError | null
  resetPassword: (email: string) => Promise<boolean>
  login: (email: string, password: string) => Promise<boolean>
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
  const [resetPasswordError, setResetPasswordError] = useState<AuthError | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
      
      if (firebaseUser) {
        setUserId(analytics, firebaseUser.uid)
      } else {
        setUserId(analytics, null)
      }

      logEvent(analytics, firebaseUser ? "auth_session_start" : "auth_session_end", {
        user_id: firebaseUser?.uid || null
      })
    })


    setWizardDone(localStorage.getItem("wizardDone") === "true")

    return () => unsubscribe()
  }, [])

  const resetPassword = async (email: string): Promise<boolean> => {
    setResetPasswordError(null)

    try {
      await sendPasswordResetEmail(auth, email)

      logEvent(analytics, "password_reset_sent", {
        email
      })

      return true
    } catch (err: any) {
      logEvent(analytics, "password_reset_error", {
        error_code: err.code
      })

      switch (err.code) {
        case "auth/user-not-found":
          setResetPasswordError({ type: "email", message: "User not found" })
          break
        case "auth/invalid-email":
          setResetPasswordError({ type: "email", message: "Invalid email" })
          break
        default:
          setResetPasswordError({ type: "other", message: "Failed to send reset email" })
      }
      return false
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoginError(null)

    try {
      const res = await signInWithEmailAndPassword(auth, email, password)

      logEvent(analytics, "login", {
        method: "email"
      })

      return true
    } catch (err: any) {
      logEvent(analytics, "login_error", {
        method: "email",
        error_code: err.code
      })

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
      const res = await createUserWithEmailAndPassword(auth, email, password)

      logEvent(analytics, "sign_up", {
        method: "email"
      })

      return true
    } catch (err: any) {
      logEvent(analytics, "sign_up_error", {
        method: "email",
        error_code: err.code
      })

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
    if (user) {
      logEvent(analytics, "logout", {
        user_id: user.uid
      })
    }

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
        registerError,
        resetPasswordError,
        resetPassword,
        login,
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