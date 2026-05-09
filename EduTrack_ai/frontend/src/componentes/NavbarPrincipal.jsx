import { NavLink, useNavigate } from 'react-router-dom'
import { ToggleTema } from './ToggleTema'
import { limparSessao } from '../services/api'
import './NavbarPrincipal.css'

export function NavbarPrincipal({ nomeUsuario }) {
  const navigate = useNavigate()

  function handleSair() {
    limparSessao()
    navigate('/login')
  }

  return (
    <header className="navbar-principal">
      <div className="navbar-logo-area">
        <span className="navbar-logo">ED</span>
        <div>
          <strong>EduTrack AI</strong>
          <small>Bem-vindo, {nomeUsuario}</small>
        </div>
      </div>

      <nav className="navbar-links" aria-label="Navegacao principal">
        <NavLink to="/dashboard" end className={({ isActive }) => (isActive ? 'ativo' : '')}>
          Dashboard
        </NavLink>
        <NavLink to="/disciplinas" className={({ isActive }) => (isActive ? 'ativo' : '')}>
          Disciplinas
        </NavLink>
        <NavLink to="/insights" className={({ isActive }) => (isActive ? 'ativo' : '')}>
          Insights
        </NavLink>
        <NavLink to="/tarefas" className={({ isActive }) => (isActive ? 'ativo' : '')}>
          Tarefas
        </NavLink>
        <NavLink to="/perfil" className={({ isActive }) => (isActive ? 'ativo' : '')}>
          Perfil
        </NavLink>
      </nav>

      <div className="acoes-navbar">
        <ToggleTema className="toggle-navbar" />
        <button type="button" className="botao-sair" onClick={handleSair}>
          Sair
        </button>
      </div>
    </header>
  )
}
