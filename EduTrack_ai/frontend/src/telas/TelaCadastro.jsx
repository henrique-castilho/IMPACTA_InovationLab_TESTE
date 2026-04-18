import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconeVisibilidade } from '../componentes/IconeVisibilidade'
import { ToggleTema } from '../componentes/ToggleTema'
import './TelaCadastro.css'

export function TelaCadastro() {
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const navigate = useNavigate()

  function lidarComCadastro(evento) {
    evento.preventDefault()
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

        <article className="cartao-autenticacao cadastro">
          <h2>Criar Conta</h2>
          <p className="subtitulo">Cadastre-se para comecar a rastrear seu progresso</p>

          <form onSubmit={lidarComCadastro}>
            <label htmlFor="nome-cadastro">Nome Completo</label>
            <input id="nome-cadastro" type="text" placeholder="Seu nome" required />

            <label htmlFor="email-cadastro">Email</label>
            <input id="email-cadastro" type="email" placeholder="seu@email.com" required />

            <label htmlFor="senha-cadastro">Senha</label>
            <div className="campo-senha">
              <input
                id="senha-cadastro"
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

            <button type="submit" className="botao-primario">
              Criar Conta
            </button>
          </form>

          <div className="divisor">Ou continue com</div>

          <div className="redes-sociais">
            <button type="button" className="botao-social">Google</button>
            <button type="button" className="botao-social">Facebook</button>
          </div>

          <p className="rodape-autenticacao">
            Ja tem uma conta? <Link to="/login">Fazer login</Link>
          </p>
        </article>
      </section>
    </main>
  )
}
