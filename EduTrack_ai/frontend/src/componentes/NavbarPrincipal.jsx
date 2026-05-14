import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { ToggleTema } from './ToggleTema'
import { limparSessao } from '../services/api'
import './NavbarPrincipal.css'

export function NavbarPrincipal({ nomeUsuario }) {
  const [menuAberto, setMenuAberto] = useState(false)
  const navigate = useNavigate()

  function handleSair() {
    limparSessao()
    navigate('/login')
  }

  const toggleMenu = () => setMenuAberto(!menuAberto)
  const fecharMenu = () => setMenuAberto(false)

  return (
    <header className={`navbar-principal ${menuAberto ? 'menu-aberto' : ''}`}>
      <div className="navbar-topo-mobile">
        <div className="navbar-logo-area">
          <span className="navbar-logo">ED</span>
          <div>
            <strong>EduTrack AI</strong>
            <small>Bem-vindo, {nomeUsuario}</small>
          </div>
        </div>

        <button 
          type="button" 
          className={`botao-hamburger ${menuAberto ? 'ativo' : ''}`} 
          onClick={toggleMenu} 
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuAberto}
        >
          <span className="barra"></span>
          <span className="barra"></span>
          <span className="barra"></span>
        </button>
      </div>

      <div className={`navbar-conteudo-expansivel ${menuAberto ? 'exibindo' : ''}`}>
        <nav className="navbar-links" aria-label="Navegacao principal">
          <NavLink to="/dashboard" end onClick={fecharMenu} className={({ isActive }) => (isActive ? 'ativo' : '')}>
            Dashboard
          </NavLink>
          <NavLink to="/disciplinas" onClick={fecharMenu} className={({ isActive }) => (isActive ? 'ativo' : '')}>
            Disciplinas
          </NavLink>
          <NavLink to="/insights" onClick={fecharMenu} className={({ isActive }) => (isActive ? 'ativo' : '')}>
            Insights
          </NavLink>
          <NavLink to="/tarefas" onClick={fecharMenu} className={({ isActive }) => (isActive ? 'ativo' : '')}>
            Tarefas
          </NavLink>
          <NavLink to="/perfil" onClick={fecharMenu} className={({ isActive }) => (isActive ? 'ativo' : '')}>
            Perfil
          </NavLink>
        </nav>

        <div className="acoes-navbar">
          <ToggleTema className="toggle-navbar" />
          <button type="button" className="botao-sair" onClick={handleSair}>
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
