import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { CHAVE_TOKEN, CHAVE_USER_ID } from '../services/api'
import './TelaPerfil.css'

export function TelaPerfil() {
  const [dados, setDados] = useState({ nome: '', email: '', senha: '' })
  const [dadosOriginais, setDadosOriginais] = useState({ nome: '', email: '', senha: '' })
  const [editando, setEditando] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  
  // Estados para controle dos Modais
  const [exibirModalExclusao, setExibirModalExclusao] = useState(false)
  const [exibirModalSucesso, setExibirModalSucesso] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState('')
  const [excluindo, setExcluindo] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    buscarDadosPerfil()
  }, [])

  async function buscarDadosPerfil() {
    try {
      setCarregando(true)
      const resposta = await api.get('/users/me')
      const usuario = {
        nome: resposta.data.nome,
        email: resposta.data.email,
        senha: '',
      }
      setDados(usuario)
      setDadosOriginais(usuario)
    } catch (err) {
      setErro('Nao foi possivel carregar os dados do perfil.')
    } finally {
      setCarregando(false)
    }
  }

  function handleCampo(event) {
    const { name, value } = event.target
    setDados((atual) => ({
      ...atual,
      [name]: value,
    }))
  }

  async function handleSalvar(event) {
    event.preventDefault()
    setSalvando(true)
    setErro('')

    try {
      const payload = {
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha || null,
      }

      const resposta = await api.put('/users/me', payload)
      
      if (resposta.data.relogin) {
        setMensagemSucesso('Perfil atualizado! Por seguranca, faca login novamente com seus novos dados.')
        setExibirModalSucesso(true)
        return
      }

      const usuarioAtualizado = {
        nome: resposta.data.usuario.nome,
        email: resposta.data.usuario.email,
        senha: '',
      }
      setDados(usuarioAtualizado)
      setDadosOriginais(usuarioAtualizado)
      setEditando(false)
      setMensagemSucesso('Perfil atualizado com sucesso!')
      setExibirModalSucesso(true)
    } catch (err) {
      // Tratamento de erro ajustado para capturar detalhes especificos (ex: tamanho do nome)
      const mensagemErro = err.response?.data?.detalhes 
        ? Object.values(err.response.data.detalhes)[0]
        : err.response?.data?.mensagem || 'Erro ao atualizar perfil.'
      
      setErro(mensagemErro)
    } finally {
      setSalvando(false)
    }
  }

  function handleCancelar() {
    setDados(dadosOriginais)
    setEditando(false)
    setErro('')
  }

  function fecharModalSucesso() {
    setExibirModalSucesso(false)
    // Se a mensagem contem "login novamente", desloga o usuario
    if (mensagemSucesso.includes('login novamente')) {
      const userId = window.localStorage.getItem(CHAVE_USER_ID)
      window.localStorage.removeItem(CHAVE_TOKEN)
      window.localStorage.removeItem(CHAVE_USER_ID)
      window.localStorage.removeItem(`edutrack.insights_${userId}`)
      window.localStorage.removeItem(`edutrack.insights_resumo_${userId}`)
      navigate('/login')
    }
  }

  async function confirmarExclusao() {
    try {
      setExcluindo(true)
      await api.delete('/users/me')
      const userId = window.localStorage.getItem(CHAVE_USER_ID)
      window.localStorage.removeItem(CHAVE_TOKEN)
      window.localStorage.removeItem(CHAVE_USER_ID)
      window.localStorage.removeItem(`edutrack.insights_${userId}`)
      window.localStorage.removeItem(`edutrack.insights_resumo_${userId}`)
      navigate('/cadastro')
    } catch (err) {
      setExibirModalExclusao(false)
      setErro('Erro ao excluir conta. Tente novamente.')
    } finally {
      setExcluindo(false)
    }
  }

  if (carregando) {
    return (
      <main className="perfil-principal">
        <p>Carregando seus dados...</p>
      </main>
    )
  }

  return (
    <main className="perfil-principal">
      <section className="cabecalho-perfil">
        <h1>Perfil do Usuario</h1>
        <p>Visualize e atualize seus dados de acesso.</p>
      </section>

      {erro && <div className="mensagem-erro-login" style={{ marginBottom: '1rem' }}>{erro}</div>}

      <section className="card-perfil">
        <form className="formulario-perfil" onSubmit={handleSalvar}>
          <label htmlFor="nome-perfil">
            Nome
            <input
              id="nome-perfil"
              name="nome"
              type="text"
              value={dados.nome}
              onChange={handleCampo}
              readOnly={!editando}
              minLength={3}
              required
            />
          </label>

          <label htmlFor="email-perfil">
            E-mail
            <input
              id="email-perfil"
              name="email"
              type="email"
              value={dados.email}
              onChange={handleCampo}
              readOnly={!editando}
              required
            />
          </label>

          <label htmlFor="senha-perfil">
            Senha {editando && <small>(deixe em branco para manter a atual)</small>}
            <input
              id="senha-perfil"
              name="senha"
              type={editando ? 'text' : 'password'}
              value={editando ? dados.senha : '********'}
              onChange={handleCampo}
              placeholder={editando ? 'Nova senha (opcional)' : ''}
              readOnly={!editando}
            />
          </label>

          <div className="acoes-perfil">
            {!editando ? (
              <button type="button" className="botao-editar-perfil" onClick={() => setEditando(true)}>
                Editar dados
              </button>
            ) : (
              <>
                <button type="submit" className="botao-salvar-perfil" disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar alteracoes'}
                </button>
                <button type="button" className="botao-cancelar-perfil" onClick={handleCancelar} disabled={salvando}>
                  Cancelar
                </button>
              </>
            )}

            <button 
              type="button" 
              className="botao-excluir-conta" 
              onClick={() => setExibirModalExclusao(true)}
              disabled={editando || salvando}
            >
              Excluir conta
            </button>
          </div>
        </form>
      </section>

      {/* Modal de Exclusao */}
      {exibirModalExclusao && (
        <div className="fundo-modal-perfil" role="presentation">
          <article className="modal-perfil" role="dialog" aria-modal="true">
            <h2>Excluir Conta?</h2>
            <p>
              Tem certeza que deseja sair? Esta acao e irreversivel e todos os seus 
              dados (disciplinas e tarefas) serao apagados para sempre.
            </p>
            <div className="rodape-modal-perfil">
              <button 
                type="button" 
                className="botao-modal-cancelar" 
                onClick={() => setExibirModalExclusao(false)}
                disabled={excluindo}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="botao-modal-confirmar" 
                onClick={confirmarExclusao}
                disabled={excluindo}
              >
                {excluindo ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </article>
        </div>
      )}

      {/* Modal de Sucesso/Aviso */}
      {exibirModalSucesso && (
        <div className="fundo-modal-perfil" role="presentation">
          <article className="modal-perfil" role="dialog" aria-modal="true">
            <h2>Aviso</h2>
            <p>{mensagemSucesso}</p>
            <button 
              type="button" 
              className="botao-primario" 
              style={{ width: '100%' }}
              onClick={fecharModalSucesso}
            >
              Entendi
            </button>
          </article>
        </div>
      )}
    </main>
  )
}
