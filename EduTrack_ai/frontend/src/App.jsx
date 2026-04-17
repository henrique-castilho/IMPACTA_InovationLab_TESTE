import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { LayoutLogado } from './layouts/LayoutLogado'
import { TelaCadastro } from './telas/TelaCadastro'
import { TelaDashboard } from './telas/TelaDashboard'
import { TelaDisciplinas } from './telas/TelaDisciplinas'
import { TelaEsqueciSenha } from './telas/TelaEsqueciSenha'
import { TelaLogin } from './telas/TelaLogin'
import { TelaTarefas } from './telas/TelaTarefas'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<TelaLogin />} />
      <Route path="/cadastro" element={<TelaCadastro />} />
      <Route path="/esqueci-senha" element={<TelaEsqueciSenha />} />
      <Route element={<LayoutLogado />}>
        <Route path="/dashboard" element={<TelaDashboard />} />
        <Route path="/disciplinas" element={<TelaDisciplinas />} />
        <Route path="/tarefas" element={<TelaTarefas />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
