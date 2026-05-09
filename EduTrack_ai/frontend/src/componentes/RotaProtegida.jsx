import { Navigate, useLocation } from 'react-router-dom'
import { obterToken } from '../services/api'

export function RotaProtegida({ children }) {
  const location = useLocation()
  const token = obterToken()

  if (!token) {
    // Se nao houver token, redireciona para o login
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Se houver token, renderiza os filhos (o Layout ou a Tela)
  return children
}
