import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconeVisibilidade } from '../componentes/IconeVisibilidade'
import './TelaEsqueciSenha.css'

export function TelaEsqueciSenha() {
  const [etapa, setEtapa] = useState(1)
  const [email, setEmail] = useState('')
  const [codigoVerificacao, setCodigoVerificacao] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')
  const [mensagemErroSenha, setMensagemErroSenha] = useState('')
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false)
  const [mostrarConfirmacaoSenha, setMostrarConfirmacaoSenha] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (etapa !== 4) {
      return undefined
    }

    const temporizador = window.setTimeout(() => {
      navigate('/login')
    }, 3000)

    return () => window.clearTimeout(temporizador)
  }, [etapa, navigate])

  function enviarCodigo(evento) {
    evento.preventDefault()
    setCodigoVerificacao('')
    setEtapa(2)
  }

  function verificarCodigo(evento) {
    evento.preventDefault()
    setEtapa(3)
  }

  function redefinirSenha(evento) {
    evento.preventDefault()

    if (novaSenha !== confirmarNovaSenha) {
      setMensagemErroSenha('As senhas nao conferem. Digite a mesma senha nos dois campos.')
      return
    }

    setMensagemErroSenha('')
    setEtapa(4)
  }

  function renderizarEtapa() {
    if (etapa === 1) {
      return (
        <form key="etapa-1" onSubmit={enviarCodigo} className="form-etapa">
          <h2>Recuperar Senha</h2>
          <p>Digite o email associado a sua conta para receber um codigo de verificacao.</p>

          <label htmlFor="email-recuperacao">Email</label>
          <input
            id="email-recuperacao"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            required
          />

          <button type="submit" className="botao-primario">Enviar Codigo</button>
          <Link to="/login" className="botao-secundario">Cancelar</Link>
        </form>
      )
    }

    if (etapa === 2) {
      return (
        <form key="etapa-2" onSubmit={verificarCodigo} className="form-etapa">
          <div className="topo-etapa">
            <h2>Verificar Codigo</h2>
            <button type="button" className="botao-voltar" onClick={() => setEtapa(1)}>
              Voltar
            </button>
          </div>
          <p>Digite o codigo de 6 digitos enviado para {email || 'seu email'}.</p>

          <label htmlFor="codigo-verificacao">Codigo de Verificacao</label>
          <input
            id="codigo-verificacao"
            type="text"
            placeholder="000000"
            value={codigoVerificacao}
            onChange={(evento) => {
              const apenasNumeros = evento.target.value.replace(/\D/g, '')
              setCodigoVerificacao(apenasNumeros)
            }}
            maxLength={6}
            pattern="[0-9]{6}"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
          />

          <button type="submit" className="botao-primario">Verificar Codigo</button>
          <button type="button" className="link-acao" onClick={() => setEtapa(2)}>
            Reenviar codigo
          </button>
        </form>
      )
    }

    if (etapa === 3) {
      return (
        <form key="etapa-3" onSubmit={redefinirSenha} className="form-etapa">
          <div className="topo-etapa">
            <h2>Definir Nova Senha</h2>
            <button type="button" className="botao-voltar" onClick={() => setEtapa(2)}>
              Voltar
            </button>
          </div>
          <p>Defina uma nova senha para sua conta.</p>

          <label htmlFor="nova-senha">Nova Senha</label>
          <div className="campo-senha-recuperacao">
            <input
              id="nova-senha"
              type={mostrarNovaSenha ? 'text' : 'password'}
              placeholder="••••••"
              value={novaSenha}
              onChange={(evento) => {
                setNovaSenha(evento.target.value)
                if (mensagemErroSenha) {
                  setMensagemErroSenha('')
                }
              }}
              required
            />
            <button
              type="button"
              className="botao-olho"
              onClick={() => setMostrarNovaSenha((valorAtual) => !valorAtual)}
              aria-label={mostrarNovaSenha ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <IconeVisibilidade visivel={mostrarNovaSenha} />
            </button>
          </div>

          <label htmlFor="confirmar-senha">Confirmar Nova Senha</label>
          <div className="campo-senha-recuperacao">
            <input
              id="confirmar-senha"
              type={mostrarConfirmacaoSenha ? 'text' : 'password'}
              placeholder="••••••"
              value={confirmarNovaSenha}
              onChange={(evento) => {
                setConfirmarNovaSenha(evento.target.value)
                if (mensagemErroSenha) {
                  setMensagemErroSenha('')
                }
              }}
              required
            />
            <button
              type="button"
              className="botao-olho"
              onClick={() => setMostrarConfirmacaoSenha((valorAtual) => !valorAtual)}
              aria-label={mostrarConfirmacaoSenha ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <IconeVisibilidade visivel={mostrarConfirmacaoSenha} />
            </button>
          </div>

          {mensagemErroSenha && (
            <p className="mensagem-erro" role="alert">{mensagemErroSenha}</p>
          )}

          <button type="submit" className="botao-primario">Definir Nova Senha</button>
        </form>
      )
    }

    return (
      <section className="etapa-sucesso" aria-live="polite">
        <div className="icone-sucesso">✓</div>
        <h2>Senha Alterada!</h2>
        <p>Sua senha foi alterada com sucesso. Voce sera redirecionado para o login.</p>
        <small>Redirecionando...</small>
      </section>
    )
  }

  return (
    <main className="pagina-autenticacao">
      <section className="caixa-recuperacao">{renderizarEtapa()}</section>
    </main>
  )
}
