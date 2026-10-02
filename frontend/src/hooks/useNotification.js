import { useContext } from 'react'
import { NotificationContext } from '../context/contexts'

export default function useNotification() {
  return useContext(NotificationContext)
}
