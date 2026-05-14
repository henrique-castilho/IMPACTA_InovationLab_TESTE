import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconeVisibilidade } from '../componentes/IconeVisibilidade'
import { ToggleTema } from '../componentes/ToggleTema'
import api, { CHAVE_TOKEN, CHAVE_USER_ID } from '../services/api'
import './TelaCadastro.css'

export function TelaCadastro() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = window.localStorage.getItem(CHAVE_TOKEN)
    if (token) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  async function lidarComCadastro(evento) {
    evento.preventDefault()
    setCarregando(true)
    setErro('')

    try {
      const resposta = await api.post('/auth/cadastro', { nome, email, senha })
      
      // Salva o token e o ID retornado para logar automaticamente
      const { token, userId } = resposta.data
      window.localStorage.setItem(CHAVE_TOKEN, token)
      window.localStorage.setItem(CHAVE_USER_ID, userId)
      
      // Redireciona para o dashboard
      navigate('/dashboard')
    } catch (err) {
      // Extrai mensagem de erro especifica (ex: Email ja cadastrado ou Nome muito curto)
      const mensagemErro = err.response?.data?.detalhes 
        ? Object.values(err.response.data.detalhes)[0]
        : err.response?.data?.mensagem || 'Erro ao realizar cadastro.'
      
      setErro(mensagemErro)
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

        <article className="cartao-autenticacao cadastro">
          <h2>Criar Conta</h2>
          <p className="subtitulo">Cadastre-se para comecar a rastrear seu progresso</p>

          {erro && <div className="mensagem-erro-login" style={{ marginBottom: '1rem' }}>{erro}</div>}

          <form onSubmit={lidarComCadastro}>
            <label htmlFor="nome-cadastro">Nome Completo</label>
            <input 
              id="nome-cadastro" 
              type="text" 
              placeholder="Seu nome" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              minLength={3}
              required 
            />

            <label htmlFor="email-cadastro">Email</label>
            <input 
              id="email-cadastro" 
              type="email" 
              placeholder="seu@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />

            <label htmlFor="senha-cadastro">Senha</label>
            <div className="campo-senha">
              <input
                id="senha-cadastro"
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                minLength={6}
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

            <button type="submit" className="botao-primario" disabled={carregando}>
              {carregando ? 'Criando Conta...' : 'Criar Conta'}
            </button>
          </form>

          <div className="divisor">Ou continue com</div>

          <div className="redes-sociais">
            <button type="button" className="botao-social">Google</button>
          </div>

          <p className="rodape-autenticacao">
            Ja tem uma conta? <Link to="/login">Fazer login</Link>
          </p>
        </article>
      </section>
    </main>
  )
}
