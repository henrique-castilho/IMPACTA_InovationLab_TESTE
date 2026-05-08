import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconeVisibilidade } from '../componentes/IconeVisibilidade'
import api from '../services/api'
import './TelaEsqueciSenha.css'

export function TelaEsqueciSenha() {
  const [etapa, setEtapa] = useState(1)
  const [email, setEmail] = useState('')
  const [codigoVerificacao, setCodigoVerificacao] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')
  const [mensagemErro, setMensagemErro] = useState('')
  const [carregando, setCarregando] = useState(false)
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

  async function enviarCodigo(evento) {
    if (evento) evento.preventDefault()
    setCarregando(true)
    setMensagemErro('')

    try {
      const resposta = await api.post('/auth/esqueci-senha', { email })
      // Como nao usamos SendGrid, o backend retorna o codigo no JSON
      const codigo = resposta.data.codigo || resposta.data // Dependendo de como o Map e retornado
      
      alert(`[TESTE] Seu codigo de verificacao e: ${codigo}`)
      setCodigoVerificacao('')
      setEtapa(2)
    } catch (err) {
      const msg = err.response?.data?.mensagem || 'Erro ao enviar codigo. Verifique o email.'
      setMensagemErro(msg)
    } finally {
      setCarregando(false)
    }
  }

  async function verificarCodigo(evento) {
    evento.preventDefault()
    setCarregando(true)
    setMensagemErro('')

    try {
      await api.post('/auth/verificar-codigo', { 
        email, 
        codigo: codigoVerificacao 
      })
      setEtapa(3)
    } catch (err) {
      const msg = err.response?.data?.mensagem || 'Codigo invalido ou expirado.'
      setMensagemErro(msg)
    } finally {
      setCarregando(false)
    }
  }

  async function redefinirSenha(evento) {
    evento.preventDefault()

    if (novaSenha !== confirmarNovaSenha) {
      setMensagemErro('As senhas nao conferem. Digite a mesma senha nos dois campos.')
      return
    }

    setCarregando(true)
    setMensagemErro('')

    try {
      await api.post('/auth/reseta-senha', {
        email,
        codigo: codigoVerificacao,
        novaSenha,
        confirmarSenha: confirmarNovaSenha
      })
      setEtapa(4)
    } catch (err) {
      const msg = err.response?.data?.detalhes 
        ? Object.values(err.response.data.detalhes)[0]
        : err.response?.data?.mensagem || 'Erro ao redefinir senha.'
      setMensagemErro(msg)
    } finally {
      setCarregando(false)
    }
  }

  function renderizarEtapa() {
    if (etapa === 1) {
      return (
        <form key="etapa-1" onSubmit={enviarCodigo} className="form-etapa">
          <h2>Recuperar Senha</h2>
          <p>Digite o email associado a sua conta para receber um codigo de verificacao.</p>

          {mensagemErro && <p className="mensagem-erro-login" style={{ marginBottom: '1rem' }}>{mensagemErro}</p>}

          <label htmlFor="email-recuperacao">Email</label>
          <input
            id="email-recuperacao"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            required
          />

          <button type="submit" className="botao-primario" disabled={carregando}>
            {carregando ? 'Enviando...' : 'Enviar Codigo'}
          </button>
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
          <p>Digite o codigo de 6 digitos enviado para {email}.</p>

          {mensagemErro && <p className="mensagem-erro-login" style={{ marginBottom: '1rem' }}>{mensagemErro}</p>}

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

          <button type="submit" className="botao-primario" disabled={carregando}>
            {carregando ? 'Verificando...' : 'Verificar Codigo'}
          </button>
          <button type="button" className="link-acao" onClick={enviarCodigo} disabled={carregando}>
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

          {mensagemErro && <p className="mensagem-erro-login" style={{ marginBottom: '1rem' }}>{mensagemErro}</p>}

          <label htmlFor="nova-senha">Nova Senha</label>
          <div className="campo-senha-recuperacao">
            <input
              id="nova-senha"
              type={mostrarNovaSenha ? 'text' : 'password'}
              placeholder="••••••"
              value={novaSenha}
              onChange={(evento) => setNovaSenha(evento.target.value)}
              required
              minLength={6}
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
              onChange={(evento) => setConfirmarNovaSenha(evento.target.value)}
              required
              minLength={6}
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

          <button type="submit" className="botao-primario" disabled={carregando}>
            {carregando ? 'Redefinindo...' : 'Definir Nova Senha'}
          </button>
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
