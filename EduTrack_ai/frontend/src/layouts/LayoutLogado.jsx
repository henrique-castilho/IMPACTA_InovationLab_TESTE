import { Outlet } from 'react-router-dom'
import { NavbarPrincipal } from '../componentes/NavbarPrincipal'
import './LayoutLogado.css'

export function LayoutLogado() {
  return (
    <div className="layout-logado">
      <div className="layout-conteudo">
        <NavbarPrincipal nomeUsuario="Estudante" />
        <Outlet />
      </div>
    </div>
  )
}
