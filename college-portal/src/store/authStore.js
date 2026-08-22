import { useSyncExternalStore } from 'react'

let state = {
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
}

const listeners = new Set()

const emit = () => {
  listeners.forEach((listener) => listener())
}

const setAuth = (token, user) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))

  state = {
    token,
    user,
  }

  emit()
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')

  state = {
    token: null,
    user: null,
  }

  emit()
}

const subscribe = (listener) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => state

export const useAuthStore = () => {
  const currentState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  )

  return {
    ...currentState,
    isAuthenticated: Boolean(
      currentState.token && currentState.user
    ),
    setAuth,
    logout,
  }
}

export const getAuth = () => state

export { setAuth, logout }