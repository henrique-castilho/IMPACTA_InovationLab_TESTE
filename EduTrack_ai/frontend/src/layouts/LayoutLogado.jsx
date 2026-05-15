import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { NavbarPrincipal } from '../componentes/NavbarPrincipal'
import api from '../services/api'
import './LayoutLogado.css'

export function LayoutLogado() {
  const [usuario, setUsuario] = useState({ nome: 'Estudante', fotoUrl: null })

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const resposta = await api.get('/users/me')
        setUsuario(resposta.data)
      } catch (err) {
        console.error('Erro ao carregar dados do usuário', err)
      }
    }
    carregarUsuario()
  }, [])

  return (
    <div className="layout-logado">
      <div className="layout-conteudo">
        <NavbarPrincipal 
          nomeUsuario={usuario.nome} 
          fotoUrl={usuario.fotoUrl} 
        />
        <Outlet />
      </div>
    </div>
  )
}
