import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, exigir }) {
  const { usuario } = useAuth()

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  if (exigir && !exigir(usuario.cargo)) {
    return <Navigate to="/" replace />
  }

  return children
}