import { useMemo, useState } from 'react'
import './TelaTarefas.css'

const DISCIPLINAS_MOCK = [
  { id: 1, nome: 'Algoritmos e Programacao' },
  { id: 2, nome: 'Banco de Dados' },
  { id: 3, nome: 'Desenvolvimento Web' },
  { id: 4, nome: 'Engenharia de Software' },
]

const TAREFAS_INICIAIS = [
  {
    id: 101,
    titulo: 'Estudar algoritmos de ordenacao',
    descricao: 'Aplicar Quick Sort e Merge Sort',
    dataEntrega: '2026-04-14',
    status: 'PENDENTE',
    disciplinaId: 1,
  },
  {
    id: 102,
    titulo: 'Implementar arvore binaria',
    descricao: 'Criar estrutura de dados em Python',
    dataEntrega: '2026-04-19',
    status: 'EM_ANDAMENTO',
    disciplinaId: 1,
  },
  {
    id: 103,
    titulo: 'Criar modelo ER',
    descricao: 'Modelagem entidade-relacionamento do sistema',
    dataEntrega: '2026-04-09',
    status: 'CONCLUIDA',
    disciplinaId: 2,
  },
]

const ORDEM_PRIORIDADE = {
  ALTA: 0,
  MEDIA: 1,
  BAIXA: 2,
  SEM_PRIORIDADE: 3,
}

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

function calcularPrioridade(dataEntrega, status) {
  if (status === 'CONCLUIDA') {
    return null
  }

  const hoje = inicioDoDia()
  const entrega = inicioDoDia(new Date(`${dataEntrega}T00:00:00`))
  const diffMs = entrega.getTime() - hoje.getTime()
  const diasParaEntrega = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diasParaEntrega < 2) {
    return 'ALTA'
  }

  if (diasParaEntrega <= 7) {
    return 'MEDIA'
  }

  return 'BAIXA'
}

function formatarData(dataIso) {
  if (!dataIso) {
    return '-'
  }

  const [ano, mes, dia] = dataIso.split('-')
  return `${dia}/${mes}/${ano}`
}

function montarPayloadBackend(formulario) {
  return {
    titulo: formulario.titulo,
    descricao: formulario.descricao,
    dataEntrega: formulario.dataEntrega,
    status: formulario.status,
    disciplinaId: Number(formulario.disciplinaId),
  }
}

export function TelaTarefas() {
  const [tarefas, setTarefas] = useState(TAREFAS_INICIAIS)
  const [statusFiltro, setStatusFiltro] = useState('TODOS')
  const [disciplinaFiltro, setDisciplinaFiltro] = useState('TODAS')
  const [modalAberto, setModalAberto] = useState(false)
  const [tarefaEmEdicaoId, setTarefaEmEdicaoId] = useState(null)
  const [formulario, setFormulario] = useState({
    titulo: '',
    descricao: '',
    dataEntrega: '',
    status: 'PENDENTE',
    disciplinaId: '',
  })

  const tarefasEnriquecidas = useMemo(() => {
    return tarefas.map((tarefa) => {
      const prioridade = calcularPrioridade(tarefa.dataEntrega, tarefa.status)
      const disciplina = DISCIPLINAS_MOCK.find((item) => item.id === tarefa.disciplinaId)

      return {
        ...tarefa,
        prioridade,
        disciplinaNome: disciplina?.nome ?? 'Disciplina desconhecida',
      }
    })
  }, [tarefas])

  const contadores = useMemo(() => {
    const pendentes = tarefasEnriquecidas.filter((item) => item.status === 'PENDENTE').length
    const emAndamento = tarefasEnriquecidas.filter((item) => item.status === 'EM_ANDAMENTO').length
    const concluidas = tarefasEnriquecidas.filter((item) => item.status === 'CONCLUIDA').length

    return { pendentes, emAndamento, concluidas }
  }, [tarefasEnriquecidas])

  const tarefasFiltradas = useMemo(() => {
    return tarefasEnriquecidas
      .filter((tarefa) => (statusFiltro === 'TODOS' ? true : tarefa.status === statusFiltro))
      .filter((tarefa) => (disciplinaFiltro === 'TODAS' ? true : tarefa.disciplinaId === Number(disciplinaFiltro)))
      .sort((a, b) => {
        const prioridadeA = a.prioridade ?? 'SEM_PRIORIDADE'
        const prioridadeB = b.prioridade ?? 'SEM_PRIORIDADE'
        const ordem = ORDEM_PRIORIDADE[prioridadeA] - ORDEM_PRIORIDADE[prioridadeB]

        if (ordem !== 0) {
          return ordem
        }

        return new Date(a.dataEntrega).getTime() - new Date(b.dataEntrega).getTime()
      })
  }, [tarefasEnriquecidas, statusFiltro, disciplinaFiltro])

  function abrirModalNovaTarefa() {
    setTarefaEmEdicaoId(null)
    setFormulario({
      titulo: '',
      descricao: '',
      dataEntrega: '',
      status: 'PENDENTE',
      disciplinaId: '',
    })
    setModalAberto(true)
  }

  function abrirModalEdicao(tarefaId) {
    const tarefa = tarefas.find((item) => item.id === tarefaId)
    if (!tarefa) {
      return
    }

    setTarefaEmEdicaoId(tarefaId)
    setFormulario({
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      dataEntrega: tarefa.dataEntrega,
      status: tarefa.status,
      disciplinaId: String(tarefa.disciplinaId),
    })
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setTarefaEmEdicaoId(null)
  }

  function handleInputFormulario(event) {
    const { name, value } = event.target
    setFormulario((atual) => ({
      ...atual,
      [name]: value,
    }))
  }

  function handleSalvarTarefa(event) {
    event.preventDefault()

    if (!formulario.titulo || !formulario.descricao || !formulario.dataEntrega || !formulario.disciplinaId) {
      return
    }

    const payload = montarPayloadBackend(formulario)

    if (tarefaEmEdicaoId) {
      setTarefas((atual) =>
        atual.map((item) =>
          item.id === tarefaEmEdicaoId
            ? {
                ...item,
                ...payload,
              }
            : item,
        ),
      )
    } else {
      setTarefas((atual) => [
        {
          id: Date.now(),
          ...payload,
        },
        ...atual,
      ])
    }

    fecharModal()
  }

  function handleExcluirTarefa(id) {
    setTarefas((atual) => atual.filter((item) => item.id !== id))
  }

  return (
    <main className="tarefas-principal">
      <section className="cabecalho-tarefas">
        <div>
          <h1>Gerenciar Tarefas</h1>
          <p>Organize e acompanhe suas atividades academicas</p>
        </div>
        <button type="button" className="botao-nova-tarefa" onClick={abrirModalNovaTarefa}>
          + Nova Tarefa
        </button>
      </section>

      <section className="painel-filtros" aria-label="Filtros de tarefas">
        <h2>Filtros</h2>
        <div className="linha-filtros">
          <label>
            Disciplina
            <select value={disciplinaFiltro} onChange={(event) => setDisciplinaFiltro(event.target.value)}>
              <option value="TODAS">Todas as Disciplinas</option>
              {DISCIPLINAS_MOCK.map((disciplina) => (
                <option key={disciplina.id} value={disciplina.id}>
                  {disciplina.nome}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select value={statusFiltro} onChange={(event) => setStatusFiltro(event.target.value)}>
              <option value="TODOS">Todos os Status</option>
              <option value="PENDENTE">Pendente</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="CONCLUIDA">Concluida</option>
            </select>
          </label>
        </div>
      </section>

      <section className="cards-status" aria-label="Resumo de status das tarefas">
        <article className="card-status card-status-pendente">
          <header>
            <span>Pendentes</span>
            <i className="icone-status" aria-hidden="true">
              ○
            </i>
          </header>
          <strong>{contadores.pendentes}</strong>
        </article>

        <article className="card-status card-status-andamento">
          <header>
            <span>Em Andamento</span>
            <i className="icone-status" aria-hidden="true">
              ◔
            </i>
          </header>
          <strong>{contadores.emAndamento}</strong>
        </article>

        <article className="card-status card-status-concluida">
          <header>
            <span>Concluidas</span>
            <i className="icone-status" aria-hidden="true">
              ✓
            </i>
          </header>
          <strong>{contadores.concluidas}</strong>
        </article>
      </section>

      <section className="lista-tarefas" aria-label="Lista detalhada de tarefas">
        {tarefasFiltradas.length === 0 ? (
          <article className="vazio-tarefas">
            <h3>Nenhuma tarefa encontrada</h3>
            <p>Altere os filtros ou crie uma nova tarefa.</p>
          </article>
        ) : (
          tarefasFiltradas.map((tarefa) => (
            <article key={tarefa.id} className="card-tarefa">
              <div className="conteudo-tarefa">
                <div className="linha-principal-tarefa">
                  <h3 className={tarefa.status === 'CONCLUIDA' ? 'texto-concluido' : ''}>{tarefa.titulo}</h3>
                </div>

                <div className="linha-tags-tarefa">
                  <span className="tag-disciplina">{tarefa.disciplinaNome}</span>
                  <span className={`tag-status tag-status-${tarefa.status.toLowerCase()}`}>
                    {LABEL_STATUS[tarefa.status]}
                  </span>
                  {tarefa.prioridade && (
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
                  onClick={() => abrirModalEdicao(tarefa.id)}
                  aria-label={`Editar tarefa ${tarefa.titulo}`}
                  title="Editar tarefa"
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="botao-acao excluir"
                  onClick={() => handleExcluirTarefa(tarefa.id)}
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

      {modalAberto && (
        <div className="fundo-modal" role="presentation" onClick={fecharModal}>
          <section
            className="modal-tarefa"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-tarefa"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="topo-modal">
              <h2 id="titulo-modal-tarefa">{tarefaEmEdicaoId ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
              <button type="button" className="botao-fechar-modal" onClick={fecharModal} aria-label="Fechar modal">
                ×
              </button>
            </header>

            <form className="formulario-tarefa" onSubmit={handleSalvarTarefa}>
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
                  {DISCIPLINAS_MOCK.map((disciplina) => (
                    <option key={disciplina.id} value={disciplina.id}>
                      {disciplina.nome}
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
    </main>
  )
}
