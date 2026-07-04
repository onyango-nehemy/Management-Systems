import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import api from '../utils/api'

const Ctx = createContext(null)

const IDLE_LIMIT_MS = 30 * 60 * 1000 // 30 minutes

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('bcs_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)
  const idleTimerRef = useRef(null)

  // On mount, verify the stored token is still valid
  useEffect(() => {
    const token = localStorage.getItem('bcs_token')
    if (!token) { setLoading(false); return }

    const verify = async () => {
      try {
        const res = await api.get('/auth/me')
        setUser(res.data.user)
      } catch {
        localStorage.removeItem('bcs_token')
        localStorage.removeItem('bcs_user')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token, user } = res.data
    localStorage.setItem('bcs_token', token)
    localStorage.setItem('bcs_user', JSON.stringify(user))
    setUser(user)
    return user
  }

  const logout = useCallback(() => {
    localStorage.removeItem('bcs_token')
    localStorage.removeItem('bcs_user')
    setUser(null)
  }, [])

  // Idle timeout — logs out after 30 minutes of no user activity.Only runs while someone is actually logged in.
  useEffect(() => {
    if (!user) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      return
    }

    const resetTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => {
        logout()
      }, IDLE_LIMIT_MS)
    }

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart']
    activityEvents.forEach(evt => window.addEventListener(evt, resetTimer))

    resetTimer() // start the timer as soon as someone is logged in

    return () => {
      activityEvents.forEach(evt => window.removeEventListener(evt, resetTimer))
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [user, logout])

  const isOwner = user?.role === 'owner'
  const isAdmin = user?.role === 'admin' || isOwner
  const isStaff = user?.role === 'staff'

  return (
    <Ctx.Provider value={{ user, loading, login, logout, isOwner, isAdmin, isStaff }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)