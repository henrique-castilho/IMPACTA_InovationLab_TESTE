import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconeVisibilidade } from '../componentes/IconeVisibilidade'
import { ToggleTema } from '../componentes/ToggleTema'
import './TelaLogin.css'

function autenticarUsuarioMock() {
  return Promise.resolve({ autenticado: true })
}

export function TelaLogin() {
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const navigate = useNavigate()

  async function lidarComLogin(evento) {
    evento.preventDefault()
    await autenticarUsuarioMock()
    navigate('/dashboard')
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

          <form onSubmit={lidarComLogin}>
            <label htmlFor="email-login">Email</label>
            <input id="email-login" type="email" placeholder="seu@email.com" required />

            <label htmlFor="senha-login">Senha</label>
            <div className="campo-senha">
              <input
                id="senha-login"
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="••••••••"
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

            <button type="submit" className="botao-primario">
              Entrar
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
