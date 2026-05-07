import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconeVisibilidade } from '../componentes/IconeVisibilidade'
import { ToggleTema } from '../componentes/ToggleTema'
import './TelaLogin.css'

export const CHAVE_TOKEN = 'edutrack-token'

export function TelaLogin() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  async function lidarComLogin(evento) {
    evento.preventDefault()
    setCarregando(true)
    setErro('')

    try {
      const resposta = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      })

      if (!resposta.ok) {
        const dadosErro = await resposta.json().catch(() => ({}))
        
        // Se houver detalhes de validacao (ex: email invalido), mostramos o primeiro erro
        if (dadosErro.detalhes && Object.keys(dadosErro.detalhes).length > 0) {
          const primeiraMensagem = Object.values(dadosErro.detalhes)[0]
          throw new Error(primeiraMensagem)
        }
        
        throw new Error(dadosErro.mensagem || 'Falha na autenticacao. Verifique suas credenciais.')
      }

      const dados = await resposta.json()
      
      // O backend retorna { token: "...", tipo: "Bearer" }
      if (dados.token) {
        window.localStorage.setItem(CHAVE_TOKEN, dados.token)
        navigate('/dashboard')
      } else {
        throw new Error('Token nao recebido do servidor.')
      }
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="pagina-autenticacao">
      <section className="caixa-autenticacao">
        <div className="topo-tema-autenticacao">
          <ToggleTema />
        </div>

        <header className="cabecalho-autenticacao">
          <div className="logo-edutrack" aria-hidden="true">
            <span>🎓</span>
          </div>
          <h1>EduTrack AI</h1>
          <p>Seu assistente educacional personalizado</p>
        </header>

        <article className="cartao-autenticacao">
          <h2>Bem-vindo de volta</h2>
          <p className="subtitulo">Acesse sua conta para continuar</p>

          {erro && <div className="mensagem-erro-login" role="alert">{erro}</div>}

          <form onSubmit={lidarComLogin}>
            <label htmlFor="email-login">Email</label>
            <input
              id="email-login"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="senha-login">Senha</label>
            <div className="campo-senha">
              <input
                id="senha-login"
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <button
                type="button"
                className="botao-olho"
                onClick={() => setMostrarSenha((valorAtual) => !valorAtual)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <IconeVisibilidade visivel={mostrarSenha} />
              </button>
            </div>

            <div className="linha-opcoes">
              <label className="checkbox-opcao" htmlFor="lembrar-login">
                <input id="lembrar-login" type="checkbox" />
                Lembrar de mim
              </label>
              <Link to="/esqueci-senha">Esqueceu a senha?</Link>
            </div>

            <button type="submit" className="botao-primario" disabled={carregando}>
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="divisor">Ou continue com</div>

          <div className="redes-sociais">
            <button type="button" className="botao-social">Google</button>
            <button type="button" className="botao-social">Facebook</button>
          </div>

          <p className="rodape-autenticacao">
            Nao tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
          </p>
        </article>
      </section>
    </main>
  )
}
