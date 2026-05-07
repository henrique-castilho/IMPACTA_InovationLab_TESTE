import { useLayoutEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { CHAVE_TEMA, aplicarTema } from './componentes/ToggleTema'
import { LayoutLogado } from './layouts/LayoutLogado'
import { TelaCadastro } from './telas/TelaCadastro'
import { TelaDashboard } from './telas/TelaDashboard'
import { TelaDisciplinas } from './telas/TelaDisciplinas'
import { TelaEsqueciSenha } from './telas/TelaEsqueciSenha'
import { TelaInsights } from './telas/TelaInsights'
import { TelaLogin } from './telas/TelaLogin'
import { TelaPerfil } from './telas/TelaPerfil'
import { TelaTarefas } from './telas/TelaTarefas'

import { RotaProtegida } from './componentes/RotaProtegida'

function App() {
  useLayoutEffect(() => {
    try {
      const temaSalvo = window.localStorage.getItem(CHAVE_TEMA)
      if (temaSalvo === 'escuro' || temaSalvo === 'claro') {
        aplicarTema(temaSalvo)
      }
    } catch {
      // Ignora erros de armazenamento e mantém o tema padrao.
    }
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<TelaLogin />} />
      <Route path="/cadastro" element={<TelaCadastro />} />
      <Route path="/esqueci-senha" element={<TelaEsqueciSenha />} />
      
      {/* Envolvemos todas as rotas internas na RotaProtegida */}
      <Route 
        element={
          <RotaProtegida>
            <LayoutLogado />
          </RotaProtegida>
        }
      >
        <Route path="/dashboard" element={<TelaDashboard />} />
        <Route path="/disciplinas" element={<TelaDisciplinas />} />
        <Route path="/insights" element={<TelaInsights />} />
        <Route path="/perfil" element={<TelaPerfil />} />
        <Route path="/tarefas" element={<TelaTarefas />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
