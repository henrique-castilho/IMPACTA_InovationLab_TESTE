import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { ToggleTema } from './ToggleTema'
import { limparSessao } from '../services/api'
import './NavbarPrincipal.css'

export function NavbarPrincipal({ nomeUsuario, fotoUrl }) {
  const [menuAberto, setMenuAberto] = useState(false)
  const navigate = useNavigate()

  function handleSair() {
    limparSessao()
    navigate('/')
  }

  const toggleMenu = () => setMenuAberto(!menuAberto)
  const fecharMenu = () => setMenuAberto(false)

  // Obtém a inicial do nome para o fallback
  const inicial = nomeUsuario ? nomeUsuario.charAt(0).toUpperCase() : 'U'

  return (
    <header className={`navbar-principal ${menuAberto ? 'menu-aberto' : ''}`}>
      <div className="navbar-topo-mobile">
        <div className="navbar-logo-area">
          <div className="navbar-perfil-container">
            {fotoUrl ? (
              <img src={fotoUrl} alt={nomeUsuario} className="navbar-foto-perfil" />
            ) : (
              <span className="navbar-logo">{inicial}</span>
            )}
          </div>
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
