import { useCallback, useEffect, useState } from 'react'
import { Toast } from '../componentes/Toast'
import api from '../services/api'
import './TelaDisciplinas.css'


const ITENS_POR_PAGINA_DISCIPLINAS = 6

function montarPaginasVisiveis(totalPaginas, paginaAtual) {
  if (totalPaginas <= 7) {
    return Array.from({ length: totalPaginas }, (_, indice) => indice + 1)
  }

  if (paginaAtual <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPaginas]
  }

  if (paginaAtual >= totalPaginas - 3) {
    return [1, '...', totalPaginas - 4, totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas]
  }

  return [1, '...', paginaAtual - 1, paginaAtual, paginaAtual + 1, '...', totalPaginas]
}

function PaginacaoNumerada({
  paginaAtual,
  totalPaginas,
  onChange,
  ariaLabel,
}) {
  if (totalPaginas <= 1) {
    return null
  }

  const paginasVisiveis = montarPaginasVisiveis(totalPaginas, paginaAtual)

  return (
    <nav className="paginacao" aria-label={ariaLabel}>
      <button
        type="button"
        className="paginacao-botao"
        onClick={() => onChange(paginaAtual - 1)}
        disabled={paginaAtual === 1}
        aria-label="Pagina anterior"
      >
        {'<'}
      </button>

      {paginasVisiveis.map((pagina, indice) => {
        if (pagina === '...') {
          return (
            <span key={`ellipsis-${indice}`} className="paginacao-reticencias" aria-hidden="true">
              ...
            </span>
          )
        }

        const ativa = paginaAtual === pagina
        return (
          <button
            key={pagina}
            type="button"
            className={`paginacao-botao ${ativa ? 'paginacao-botao-ativo' : ''}`}
            onClick={() => onChange(pagina)}
            aria-current={ativa ? 'page' : undefined}
            aria-label={`Ir para pagina ${pagina}`}
          >
            {pagina}
          </button>
        )
      })}

      <button
        type="button"
        className="paginacao-botao"
        onClick={() => onChange(paginaAtual + 1)}
        disabled={paginaAtual === totalPaginas}
        aria-label="Proxima pagina"
      >
        {'>'}
      </button>
    </nav>
  )
}

function montarPayloadBackend(formulario) {
  return {
    nome: formulario.nome.trim(),
    professor: formulario.professor.trim(),
    cargaHoraria: Number(formulario.cargaHoraria),
    descricao: formulario.descricao.trim(),
    dataInicio: formulario.dataInicio,
    dataFim: formulario.dataFim,
  }
}

function formatarData(dataIso) {
  if (!dataIso) {
    return '-'
  }

  const [ano, mes, dia] = dataIso.split('-')
  return `${dia}/${mes}/${ano}`
}

export function TelaDisciplinas() {
  const [disciplinas, setDisciplinas] = useState([])
  const [resumo, setResumo] = useState({ totalDisciplinas: 0, cargaHorariaTotal: 0 })
  const [paginaAtualDisciplinas, setPaginaAtualDisciplinas] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalElementos, setTotalElementos] = useState(0)
  const [termoPesquisa, setTermoPesquisa] = useState('')
  const [termoPesquisaDebounced, setTermoPesquisaDebounced] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [disciplinaEmEdicaoId, setDisciplinaEmEdicaoId] = useState(null)
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false)
  const [disciplinaExclusao, setDisciplinaExclusao] = useState(null)
  const [mensagemErroModal, setMensagemErroModal] = useState('')
  const [toast, setToast] = useState({ aberto: false, mensagem: '' })
  const [formulario, setFormulario] = useState({
    nome: '',
    professor: '',
    cargaHoraria: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
  })

  // Busca o resumo das disciplinas
  const buscarResumo = useCallback(async () => {
    try {
      const resposta = await api.get('/disciplinas/resumo')
      setResumo(resposta.data)
    } catch (err) {
      console.error('Erro ao buscar resumo:', err)
    }
  }, [])

  // Busca a lista de disciplinas paginada e com filtro
  const buscarDisciplinas = useCallback(async (pagina, busca) => {
    setCarregando(true)
    try {
      const resposta = await api.get('/disciplinas', {
        params: {
          page: pagina - 1, // Spring Data usa 0-based index
          size: ITENS_POR_PAGINA_DISCIPLINAS,
          search: busca || undefined,
          sort: 'nome,asc'
        }
      })
      setDisciplinas(resposta.data.content)
      setTotalPaginas(resposta.data.totalPages)
      setTotalElementos(resposta.data.totalElements)
    } catch (err) {
      console.error('Erro ao buscar disciplinas:', err)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    buscarResumo()
  }, [buscarResumo])

  // Efeito de Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setTermoPesquisaDebounced(termoPesquisa)
    }, 500) // 500ms de delay

    return () => clearTimeout(delayDebounceFn)
  }, [termoPesquisa])

  // Volta para página 1 quando o termo de busca efetivo (debounced) muda
  useEffect(() => {
    setPaginaAtualDisciplinas(1)
  }, [termoPesquisaDebounced])

  useEffect(() => {
    buscarDisciplinas(paginaAtualDisciplinas, termoPesquisaDebounced)
  }, [paginaAtualDisciplinas, termoPesquisaDebounced, buscarDisciplinas])

  useEffect(() => {
    if (!toast.aberto) {
      return undefined
    }

    const identificador = window.setTimeout(() => {
      setToast({ aberto: false, mensagem: '' })
    }, 3000)

    return () => window.clearTimeout(identificador)
  }, [toast.aberto])

  // Atualiza apenas o termo imediato, o debounced lida com a requisição e a paginação
  function handlePesquisa(event) {
    setTermoPesquisa(event.target.value)
  }

  function mostrarToast(mensagem) {
    setToast({ aberto: true, mensagem })
  }

  function abrirModalNovaDisciplina() {
    setDisciplinaEmEdicaoId(null)
    setFormulario({
      nome: '',
      professor: '',
      cargaHoraria: '',
      descricao: '',
      dataInicio: '',
      dataFim: '',
    })
    setModalAberto(true)
    setMensagemErroModal('')
  }

  function abrirModalEdicao(id) {
    const disciplina = disciplinas.find((item) => item.id === id)
    if (!disciplina) {
      return
    }

    setDisciplinaEmEdicaoId(id)
    setFormulario({
      nome: disciplina.nome,
      professor: disciplina.professor,
      cargaHoraria: String(disciplina.cargaHoraria),
      descricao: disciplina.descricao ?? '',
      dataInicio: disciplina.dataInicio ?? '',
      dataFim: disciplina.dataFim ?? '',
    })
    setModalAberto(true)
    setMensagemErroModal('')
  }



  function fecharModal() {
    setModalAberto(false)
    setDisciplinaEmEdicaoId(null)
    setMensagemErroModal('')
  }

  function handleInput(event) {
    const { name, value } = event.target
    setFormulario((atual) => ({
      ...atual,
      [name]: value,
    }))
  }

  async function handleSalvarDisciplina(event) {
    event.preventDefault()

    const payload = montarPayloadBackend(formulario)
    
    setMensagemErroModal('')
    
    try {
      if (disciplinaEmEdicaoId) {
        await api.put(`/disciplinas/${disciplinaEmEdicaoId}`, payload)
        mostrarToast('Disciplina atualizada com sucesso!')
      } else {
        await api.post('/disciplinas', payload)
        mostrarToast('Disciplina criada com sucesso!')
      }
      fecharModal()
      buscarDisciplinas(paginaAtualDisciplinas, termoPesquisaDebounced)
      buscarResumo()
    } catch (err) {
      const msg = err.response?.data?.detalhes 
        ? Object.values(err.response.data.detalhes)[0]
        : err.response?.data?.mensagem || 'Erro ao salvar disciplina.'
      setMensagemErroModal(msg)
    }
  }

  function handleExcluirDisciplina(id, nome) {
    setDisciplinaExclusao({ id, nome })
    setModalExclusaoAberto(true)
  }

  async function confirmarExclusao() {
    if (!disciplinaExclusao) return

    try {
      await api.delete(`/disciplinas/${disciplinaExclusao.id}`)
      mostrarToast(`Disciplina "${disciplinaExclusao.nome}" excluida com sucesso.`)
      buscarDisciplinas(paginaAtualDisciplinas, termoPesquisaDebounced)
      buscarResumo()
    } catch (err) {
      console.error('Erro ao excluir:', err)
    } finally {
      setModalExclusaoAberto(false)
      setDisciplinaExclusao(null)
    }
  }

  return (
    <main className="disciplinas-principal">
      <section className="cabecalho-disciplinas">
        <div>
          <h1>Gerenciar Disciplinas</h1>
          <p>Cadastre e organize todas as suas disciplinas</p>
        </div>

        <button type="button" className="botao-nova-disciplina" onClick={abrirModalNovaDisciplina}>
          + Nova Disciplina
        </button>
      </section>

      <section className="pesquisa-disciplinas" aria-label="Pesquisa de disciplinas">
        <label htmlFor="pesquisa-disciplina">
          Pesquisar disciplina
          <input
            id="pesquisa-disciplina"
            type="search"
            placeholder="Digite o nome da disciplina, professor ou descrição"
            value={termoPesquisa}
            onChange={handlePesquisa}
          />
        </label>
        <small>
          {termoPesquisa
            ? `${totalElementos} resultado(s) para "${termoPesquisa}"`
            : `${resumo.totalDisciplinas} disciplina(s) cadastrada(s)`}
        </small>
      </section>

      <section className="resumo-disciplinas" aria-label="Resumo das disciplinas">
        <article>
          <span>Total de Disciplinas</span>
          <strong>{resumo.totalDisciplinas}</strong>
        </article>
        <article>
          <span>Carga Horaria Total</span>
          <strong>{resumo.cargaHorariaTotal}h</strong>
        </article>
      </section>

      <section className="grade-disciplinas" aria-label="Lista de disciplinas em cards">
        {carregando ? (
          <div className="vazio-disciplinas">Carregando disciplinas...</div>
        ) : disciplinas.length === 0 ? (
          <article className="vazio-disciplinas" role="status" aria-live="polite">
            <span className="vazio-icone" aria-hidden="true">
              📚
            </span>
            <h3>
              {termoPesquisa
                ? 'Nenhuma disciplina encontrada para essa pesquisa.'
                : 'Você ainda não tem disciplinas. Clique em + para começar'}
            </h3>
          </article>
        ) : (
          disciplinas.map((disciplina) => (
            <article key={disciplina.id} className="card-disciplina-gestao">
              <header>
                <div>
                  <h2>{disciplina.nome}</h2>
                  <small>{disciplina.professor}</small>
                </div>
                <span className="badge-carga">{disciplina.cargaHoraria}h</span>
              </header>

              <div className="detalhes-disciplina">
                <p>{disciplina.descricao}</p>
                <small>Inicio: {formatarData(disciplina.dataInicio)}</small>
                <small>Fim: {formatarData(disciplina.dataFim)}</small>
              </div>

              <footer>
                <button
                  type="button"
                  className="botao-card editar"
                  onClick={() => abrirModalEdicao(disciplina.id)}
                  aria-label={`Editar disciplina ${disciplina.nome}`}
                  title="Editar disciplina"
                >
                  ✎ Editar
                </button>

                <button
                  type="button"
                  className="botao-card excluir"
                  onClick={() => handleExcluirDisciplina(disciplina.id, disciplina.nome)}
                  aria-label={`Excluir disciplina ${disciplina.nome}`}
                  title="Excluir disciplina"
                >
                  🗑
                </button>
              </footer>
            </article>
          ))
        )}
      </section>

      <div className="paginacao-area">
        <PaginacaoNumerada
          paginaAtual={paginaAtualDisciplinas}
          totalPaginas={totalPaginas}
          onChange={setPaginaAtualDisciplinas}
          ariaLabel="Paginacao de disciplinas"
        />
      </div>

      {modalAberto && (
        <div className="fundo-modal-disciplina" role="presentation" onClick={fecharModal}>
          <section
            className="modal-disciplina"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-disciplina"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="topo-modal-disciplina">
              <h2 id="titulo-modal-disciplina">
                {disciplinaEmEdicaoId ? 'Editar Disciplina' : 'Nova Disciplina'}
              </h2>
              <button
                type="button"
                className="botao-fechar-modal-disciplina"
                onClick={fecharModal}
                aria-label="Fechar modal"
              >
                ×
              </button>
            </header>

            <form className="formulario-disciplina" onSubmit={handleSalvarDisciplina}>
              {mensagemErroModal && (
                <div style={{ 
                  color: 'var(--cor-perigo)', 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                  padding: '10px', 
                  borderRadius: '6px',
                  marginBottom: '15px',
                  fontSize: '0.9rem',
                  border: '1px solid var(--cor-perigo)'
                }}>
                  {mensagemErroModal}
                </div>
              )}
              <label htmlFor="nome">
                Nome *
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="Ex: Engenharia de Software"
                  value={formulario.nome}
                  onChange={handleInput}
                  required
                />
              </label>

              <label htmlFor="professor">
                Professor *
                <input
                  id="professor"
                  name="professor"
                  type="text"
                  placeholder="Ex: Profa. Maria Costa"
                  value={formulario.professor}
                  onChange={handleInput}
                  required
                />
              </label>

              <label htmlFor="cargaHoraria">
                Carga Horaria *
                <input
                  id="cargaHoraria"
                  name="cargaHoraria"
                  type="number"
                  min="1"
                  placeholder="Ex: 60"
                  value={formulario.cargaHoraria}
                  onChange={handleInput}
                  required
                />
              </label>

              <label htmlFor="descricao">
                Descricao *
                <input
                  id="descricao"
                  name="descricao"
                  type="text"
                  placeholder="Ex: Conteudo e objetivos da disciplina"
                  value={formulario.descricao}
                  onChange={handleInput}
                  required
                />
              </label>

              <label htmlFor="dataInicio">
                Data de Inicio *
                <input
                  id="dataInicio"
                  name="dataInicio"
                  type="date"
                  value={formulario.dataInicio}
                  onChange={handleInput}
                  required
                />
              </label>

              <label htmlFor="dataFim">
                Data de Fim *
                <input
                  id="dataFim"
                  name="dataFim"
                  type="date"
                  value={formulario.dataFim}
                  onChange={handleInput}
                  required
                />
              </label>

              <footer className="rodape-modal-disciplina">
                <button type="button" className="botao-cancelar-disciplina" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="botao-salvar-disciplina">
                  {disciplinaEmEdicaoId ? 'Salvar Alteracoes' : 'Criar Disciplina'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {modalExclusaoAberto && (
        <div className="fundo-modal-perfil">
          <div className="modal-perfil">
            <h2>Excluir Disciplina</h2>
            <p>
              Tem certeza que deseja excluir a disciplina <strong>"{disciplinaExclusao?.nome}"</strong>?
              <br /><br />
              <span style={{ color: 'var(--cor-perigo)' }}>
                Aviso: Deletar esta disciplina excluirá permanentemente todas as tarefas associadas a ela.
              </span>
            </p>
            <div className="rodape-modal-perfil">
              <button
                type="button"
                className="botao-modal-cancelar"
                onClick={() => setModalExclusaoAberto(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="botao-modal-confirmar"
                onClick={confirmarExclusao}
              >
                Sim, Excluir Tudo
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast aberto={toast.aberto} mensagem={toast.mensagem} />
    </main>
  )
}
