import { Navigate } from 'react-router-dom'
import { CHAVE_TOKEN } from '../services/api'

export function RotaProtegida({ children }) {
  const token = window.localStorage.getItem(CHAVE_TOKEN)

  if (!token) {
    // Se nao houver token, redireciona para o login
    return <Navigate to="/login" replace />
  }

  // Se houver token, renderiza os filhos (o Layout ou a Tela)
  return children
}
