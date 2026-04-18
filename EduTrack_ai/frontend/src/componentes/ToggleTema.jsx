import { useEffect, useMemo, useState } from 'react'
import './ToggleTema.css'

export const CHAVE_TEMA = 'edutrack-tema'

export function obterTemaSalvo() {
  try {
    const valor = window.localStorage.getItem(CHAVE_TEMA)
    return valor === 'escuro' || valor === 'claro' ? valor : null
  } catch {
    return null
  }
}

export function aplicarTema(tema) {
  const modoEscuro = tema === 'escuro'
  document.body.classList.toggle('dark-mode', modoEscuro)
}

function lerTemaAtual() {
  if (typeof document === 'undefined') {
    return 'claro'
  }

  return document.body.classList.contains('dark-mode') ? 'escuro' : 'claro'
}

export function ToggleTema({ className = '' }) {
  const [temaAtual, setTemaAtual] = useState(() => lerTemaAtual())

  const modoEscuroAtivo = useMemo(() => temaAtual === 'escuro', [temaAtual])

  useEffect(() => {
    function sincronizarTema() {
      setTemaAtual(lerTemaAtual())
    }

    function handleStorage(evento) {
      if (evento.key === CHAVE_TEMA) {
        sincronizarTema()
      }
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('edutrack-tema-alterado', sincronizarTema)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('edutrack-tema-alterado', sincronizarTema)
    }
  }, [])

  function definirTema(tema) {
    setTemaAtual(tema)
    aplicarTema(tema)

    try {
      window.localStorage.setItem(CHAVE_TEMA, tema)
    } catch {
      // Ignora erros de armazenamento para manter o toggle funcional.
    }

    window.dispatchEvent(new Event('edutrack-tema-alterado'))
  }

  return (
    <div className={`toggle-tema ${className}`.trim()} role="group" aria-label="Alternar tema">
      <button
        type="button"
        className={`botao-tema ${!modoEscuroAtivo ? 'ativo' : ''}`}
        onClick={() => definirTema('claro')}
        aria-pressed={!modoEscuroAtivo}
        title="Tema claro"
      >
        <span aria-hidden="true">☀️</span>
      </button>
      <button
        type="button"
        className={`botao-tema ${modoEscuroAtivo ? 'ativo' : ''}`}
        onClick={() => definirTema('escuro')}
        aria-pressed={modoEscuroAtivo}
        title="Tema escuro"
      >
        <span aria-hidden="true">🌙</span>
      </button>
    </div>
  )
}
