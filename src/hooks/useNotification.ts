'use client'
import { useState, useCallback } from 'react'

interface NotificationState {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration: number
}

export function useNotification() {
  const [notifications, setNotifications] = useState<NotificationState[]>([])

  const addNotification = useCallback((
    message: string, 
    type: 'success' | 'error' | 'info' = 'success', 
    duration: number = 3000
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { id, message, type, duration }])
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const showSuccess = useCallback((message: string, duration?: number) => {
    addNotification(message, 'success', duration)
  }, [addNotification])

  const showError = useCallback((message: string, duration?: number) => {
    addNotification(message, 'error', duration)
  }, [addNotification])

  const showInfo = useCallback((message: string, duration?: number) => {
    addNotification(message, 'info', duration)
  }, [addNotification])

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo
  }
}