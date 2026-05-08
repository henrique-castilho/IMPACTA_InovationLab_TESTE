import { useCallback, useEffect, useMemo, useState } from 'react'
import { Toast } from '../componentes/Toast'
import api from '../services/api'
import './TelaTarefas.css'

const ITENS_POR_PAGINA_TAREFAS = 6

// Mapeamentos de label para exibição amigável
const LABEL_STATUS = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDA: 'Concluida',
}

const LABEL_PRIORIDADE = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAIXA: 'Baixa',
}

function inicioDoDia(data = new Date()) {
  const novaData = new Date(data)
  novaData.setHours(0, 0, 0, 0)
  return novaData
}

function formatarData(dataIso) {
  if (!dataIso) return '-'
  const [ano, mes, dia] = String(dataIso).split('-')
  return `${dia}/${mes}/${ano}`
}

function montarPaginasVisiveis(totalPaginas, paginaAtual) {
  if (totalPaginas <= 7) {
    return Array.from({ length: totalPaginas }, (_, i) => i + 1)
  }
  if (paginaAtual <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPaginas]
  }
  if (paginaAtual >= totalPaginas - 3) {
    return [1, '...', totalPaginas - 4, totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas]
  }
  return [1, '...', paginaAtual - 1, paginaAtual, paginaAtual + 1, '...', totalPaginas]
}

function PaginacaoNumerada({ paginaAtual, totalPaginas, onChange, ariaLabel }) {
  if (totalPaginas <= 1) return null

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

export function TelaTarefas() {
  // ─── Estado principal ────────────────────────────────────────────────────────
  const [tarefas, setTarefas] = useState([])
  const [disciplinas, setDisciplinas] = useState([])
  const [carregando, setCarregando] = useState(false)

  // ─── Paginação e filtros ─────────────────────────────────────────────────────
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [statusFiltro, setStatusFiltro] = useState('TODOS')
  const [disciplinaFiltro, setDisciplinaFiltro] = useState('')

  // ─── Estatísticas do topo ────────────────────────────────────────────────────
  const [stats, setStats] = useState({ totalPendentes: 0, totalEmAndamento: 0, totalConcluidas: 0 })

  // ─── Modal de criação/edição ─────────────────────────────────────────────────
  const [modalAberto, setModalAberto] = useState(false)
  const [tarefaEmEdicaoId, setTarefaEmEdicaoId] = useState(null)
  const [mensagemErroModal, setMensagemErroModal] = useState('')
  const [formulario, setFormulario] = useState({
    titulo: '',
    descricao: '',
    dataEntrega: '',
    status: 'PENDENTE',
    disciplinaId: '',
  })

  // ─── Modal de exclusão ───────────────────────────────────────────────────────
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false)
  const [tarefaExclusao, setTarefaExclusao] = useState(null)

  // ─── Toast ───────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ aberto: false, mensagem: '' })

  // ─── Enriquece tarefas com flag "atrasada" para exibição da tag no card ───────
  const tarefasEnriquecidas = useMemo(() => {
    const hoje = inicioDoDia()
    return tarefas.map((tarefa) => {
      const entrega = inicioDoDia(new Date(`${tarefa.dataEntrega}T00:00:00`))
      const atrasada = tarefa.status !== 'CONCLUIDA' && entrega < hoje
      return { ...tarefa, atrasada }
    })
  }, [tarefas])

  // ─── Busca disciplinas para popular o select do filtro e do modal ─────────────
  const buscarDisciplinas = useCallback(async () => {
    try {
      const resposta = await api.get('/disciplinas', { params: { page: 0, size: 100 } })
      const lista = resposta.data.content ?? []
      lista.sort((a, b) => a.nome.localeCompare(b.nome))
      setDisciplinas(lista)
    } catch (err) {
      console.error('Erro ao buscar disciplinas:', err)
    }
  }, [])

  // ─── Busca tarefas paginadas da API ─────────────────────────────────────────
  const buscarTarefas = useCallback(async (pagina, statusAtual, disciplinaAtual) => {
    setCarregando(true)
    try {
      const atrasadas = statusAtual === 'ATRASADAS'
      const statusParaApi = atrasadas || statusAtual === 'TODOS' ? undefined : statusAtual

      const resposta = await api.get('/tarefas', {
        params: {
          page: pagina - 1,
          size: ITENS_POR_PAGINA_TAREFAS,
          status: statusParaApi,
          atrasadas: atrasadas || undefined,
          disciplinaId: disciplinaAtual || undefined,
        },
      })
      setTarefas(resposta.data.content ?? [])
      setTotalPaginas(resposta.data.totalPages ?? 1)
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err)
    } finally {
      setCarregando(false)
    }
  }, [])

  // ─── Busca estatísticas do topo ─────────────────────────────────────────────
  const buscarStats = useCallback(async () => {
    try {
      const resposta = await api.get('/tarefas/estatisticas')
      setStats(resposta.data)
    } catch (err) {
      console.error('Erro ao buscar estatisticas:', err)
    }
  }, [])

  // ─── Efeitos ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    buscarDisciplinas()
    buscarStats()
  }, [buscarDisciplinas, buscarStats])

  useEffect(() => {
    buscarTarefas(paginaAtual, statusFiltro, disciplinaFiltro)
  }, [paginaAtual, statusFiltro, disciplinaFiltro, buscarTarefas])

  // Volta para página 1 ao mudar filtros
  useEffect(() => {
    setPaginaAtual(1)
  }, [statusFiltro, disciplinaFiltro])

  // Auto-fechar toast
  useEffect(() => {
    if (!toast.aberto) return undefined
    const id = window.setTimeout(() => setToast({ aberto: false, mensagem: '' }), 3000)
    return () => window.clearTimeout(id)
  }, [toast.aberto])

  // ─── Utilitários ─────────────────────────────────────────────────────────────
  function mostrarToast(mensagem) {
    setToast({ aberto: true, mensagem })
  }

  function recarregar() {
    buscarTarefas(paginaAtual, statusFiltro, disciplinaFiltro)
    buscarStats()
  }

  // ─── Modal de criação/edição ─────────────────────────────────────────────────
  function abrirModalNovaTarefa() {
    setTarefaEmEdicaoId(null)
    setMensagemErroModal('')
    setFormulario({ titulo: '', descricao: '', dataEntrega: '', status: 'PENDENTE', disciplinaId: '' })
    setModalAberto(true)
  }

  function abrirModalEdicao(tarefa) {
    setTarefaEmEdicaoId(tarefa.id)
    setMensagemErroModal('')
    setFormulario({
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      dataEntrega: tarefa.dataEntrega ?? '',
      status: tarefa.status,
      disciplinaId: String(tarefa.disciplinaId),
    })
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setTarefaEmEdicaoId(null)
    setMensagemErroModal('')
  }

  function handleInputFormulario(event) {
    const { name, value } = event.target
    setFormulario((atual) => ({ ...atual, [name]: value }))
  }

  async function handleSalvarTarefa(event) {
    event.preventDefault()
    setMensagemErroModal('')

    const payload = {
      titulo: formulario.titulo,
      descricao: formulario.descricao,
      dataEntrega: formulario.dataEntrega,
      status: formulario.status,
      disciplinaId: Number(formulario.disciplinaId),
    }

    try {
      if (tarefaEmEdicaoId) {
        await api.put(`/tarefas/${tarefaEmEdicaoId}`, payload)
        mostrarToast('Tarefa atualizada com sucesso!')
      } else {
        await api.post('/tarefas', payload)
        mostrarToast('Tarefa criada com sucesso!')
      }
      fecharModal()
      recarregar()
    } catch (err) {
      const msg = err.response?.data?.detalhes
        ? Object.values(err.response.data.detalhes)[0]
        : err.response?.data?.mensagem || 'Erro ao salvar tarefa.'
      setMensagemErroModal(msg)
    }
  }

  // ─── Modal de exclusão ───────────────────────────────────────────────────────
  function handleExcluirTarefa(tarefa) {
    setTarefaExclusao(tarefa)
    setModalExclusaoAberto(true)
  }

  async function confirmarExclusao() {
    if (!tarefaExclusao) return
    try {
      await api.delete(`/tarefas/${tarefaExclusao.id}`)
      mostrarToast(`Tarefa "${tarefaExclusao.titulo}" excluida com sucesso.`)
      recarregar()
    } catch (err) {
      console.error('Erro ao excluir:', err)
    } finally {
      setModalExclusaoAberto(false)
      setTarefaExclusao(null)
    }
  }

  // ─── Renderização ─────────────────────────────────────────────────────────────
  return (
    <main className="tarefas-principal">
      {/* Cabeçalho */}
      <section className="cabecalho-tarefas">
        <div>
          <h1>Gerenciar Tarefas</h1>
          <p>Organize e acompanhe suas atividades academicas</p>
        </div>
        <button type="button" className="botao-nova-tarefa" onClick={abrirModalNovaTarefa}>
          + Nova Tarefa
        </button>
      </section>

      {/* Filtros */}
      <section className="painel-filtros" aria-label="Filtros de tarefas">
        <h2>Filtros</h2>
        <div className="linha-filtros">
          <label>
            Disciplina
            <select value={disciplinaFiltro} onChange={(e) => setDisciplinaFiltro(e.target.value)}>
              <option value="">Todas as Disciplinas</option>
              {disciplinas.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
              <option value="TODOS">Todos os Status</option>
              <option value="ATRASADAS">Atrasadas</option>
              <option value="PENDENTE">Pendente</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="CONCLUIDA">Concluida</option>
            </select>
          </label>
        </div>
      </section>

      {/* Cards de estatísticas */}
      <section className="cards-status" aria-label="Resumo de status das tarefas">
        <article className="card-status card-status-pendente">
          <header>
            <span>Pendentes</span>
            <i className="icone-status" aria-hidden="true">○</i>
          </header>
          <strong>{stats.totalPendentes}</strong>
        </article>

        <article className="card-status card-status-andamento">
          <header>
            <span>Em Andamento</span>
            <i className="icone-status" aria-hidden="true">◔</i>
          </header>
          <strong>{stats.totalEmAndamento}</strong>
        </article>

        <article className="card-status card-status-concluida">
          <header>
            <span>Concluidas</span>
            <i className="icone-status" aria-hidden="true">✓</i>
          </header>
          <strong>{stats.totalConcluidas}</strong>
        </article>
      </section>

      {/* Lista de tarefas */}
      <section className="lista-tarefas" aria-label="Lista detalhada de tarefas">
        {carregando ? (
          <article className="vazio-tarefas" role="status">
            <span className="vazio-icone" aria-hidden="true">⏳</span>
            <h3>Carregando tarefas...</h3>
          </article>
        ) : tarefasEnriquecidas.length === 0 ? (
          <article className="vazio-tarefas" role="status" aria-live="polite">
            <span className="vazio-icone" aria-hidden="true">✅</span>
            <h3>Nenhuma tarefa encontrada. Clique em + para comecar</h3>
          </article>
        ) : (
          tarefasEnriquecidas.map((tarefa) => (
            <article key={tarefa.id} className="card-tarefa">
              <div className="conteudo-tarefa">
                <div className="linha-principal-tarefa">
                  <h3 className={tarefa.status === 'CONCLUIDA' ? 'texto-concluido' : ''}>
                    {tarefa.titulo}
                  </h3>
                </div>

                <div className="linha-tags-tarefa">
                  <span className="tag-disciplina">{tarefa.nomeDisciplina}</span>
                  <span className={`tag-status tag-status-${tarefa.status.toLowerCase()}`}>
                    {LABEL_STATUS[tarefa.status]}
                  </span>
                  {tarefa.atrasada && (
                    <>
                      <span className="tag-prioridade tag-prioridade-alta">Atrasada</span>
                      <span className="tag-prioridade tag-prioridade-alta">Prioridade Alta</span>
                    </>
                  )}
                  {!tarefa.atrasada && tarefa.prioridade && (
                    <span className={`tag-prioridade tag-prioridade-${tarefa.prioridade.toLowerCase()}`}>
                      Prioridade {LABEL_PRIORIDADE[tarefa.prioridade]}
                    </span>
                  )}
                </div>

                <p className={tarefa.status === 'CONCLUIDA' ? 'texto-concluido' : ''}>{tarefa.descricao}</p>

                <footer>
                  <small>📅 {formatarData(tarefa.dataEntrega)}</small>
                </footer>
              </div>

              <div className="acoes-tarefa">
                <button
                  type="button"
                  className="botao-acao editar"
                  onClick={() => abrirModalEdicao(tarefa)}
                  aria-label={`Editar tarefa ${tarefa.titulo}`}
                  title="Editar tarefa"
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="botao-acao excluir"
                  onClick={() => handleExcluirTarefa(tarefa)}
                  aria-label={`Excluir tarefa ${tarefa.titulo}`}
                  title="Excluir tarefa"
                >
                  🗑
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      {/* Paginação */}
      <div className="paginacao-area">
        <PaginacaoNumerada
          paginaAtual={paginaAtual}
          totalPaginas={totalPaginas}
          onChange={setPaginaAtual}
          ariaLabel="Paginacao de tarefas"
        />
      </div>

      {/* Modal de criar/editar tarefa */}
      {modalAberto && (
        <div className="fundo-modal" role="presentation" onClick={fecharModal}>
          <section
            className="modal-tarefa"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-tarefa"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="topo-modal">
              <h2 id="titulo-modal-tarefa">{tarefaEmEdicaoId ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
              <button type="button" className="botao-fechar-modal" onClick={fecharModal} aria-label="Fechar modal">
                ×
              </button>
            </header>

            <form className="formulario-tarefa" onSubmit={handleSalvarTarefa}>
              {mensagemErroModal && (
                <div style={{
                  color: 'var(--cor-perigo)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  padding: '10px',
                  borderRadius: '6px',
                  marginBottom: '10px',
                  fontSize: '0.9rem',
                  border: '1px solid var(--cor-perigo)',
                }}>
                  {mensagemErroModal}
                </div>
              )}

              <label htmlFor="disciplinaId">
                Disciplina *
                <select
                  id="disciplinaId"
                  name="disciplinaId"
                  value={formulario.disciplinaId}
                  onChange={handleInputFormulario}
                  required
                >
                  <option value="">Selecione uma disciplina</option>
                  {disciplinas.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="titulo">
                Titulo *
                <input
                  id="titulo"
                  name="titulo"
                  type="text"
                  placeholder="Ex: Estudar algoritmos de ordenacao"
                  value={formulario.titulo}
                  onChange={handleInputFormulario}
                  required
                />
              </label>

              <label htmlFor="descricao">
                Descricao *
                <textarea
                  id="descricao"
                  name="descricao"
                  rows="3"
                  placeholder="Detalhes sobre a tarefa"
                  value={formulario.descricao}
                  onChange={handleInputFormulario}
                  required
                />
              </label>

              <div className="grade-dupla-modal">
                <label htmlFor="dataEntrega">
                  Data de Entrega *
                  <input
                    id="dataEntrega"
                    name="dataEntrega"
                    type="date"
                    value={formulario.dataEntrega}
                    onChange={handleInputFormulario}
                    required
                  />
                </label>

                <label htmlFor="status">
                  Status *
                  <select id="status" name="status" value={formulario.status} onChange={handleInputFormulario}>
                    <option value="PENDENTE">Pendente</option>
                    <option value="EM_ANDAMENTO">Em Andamento</option>
                    <option value="CONCLUIDA">Concluida</option>
                  </select>
                </label>
              </div>

              <footer className="rodape-modal">
                <button type="button" className="botao-secundario" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="botao-primario-modal">
                  {tarefaEmEdicaoId ? 'Salvar Alteracoes' : 'Criar Tarefa'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {modalExclusaoAberto && (
        <div className="fundo-modal-perfil">
          <div className="modal-perfil">
            <h2>Excluir Tarefa</h2>
            <p>
              Tem certeza que deseja excluir a tarefa <strong>"{tarefaExclusao?.titulo}"</strong>?
              <br /><br />
              <span style={{ color: 'var(--cor-perigo)' }}>
                Esta ação não poderá ser desfeita.
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
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast aberto={toast.aberto} mensagem={toast.mensagem} />
    </main>
  )
}
