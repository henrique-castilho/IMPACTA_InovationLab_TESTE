import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './TelaDashboard.css'

const CORES_GRAFICO = ['#4f46e5', '#0ea5a3', '#f59e0b', '#22c55e', '#7c3aed']
const ITENS_POR_PAGINA_DISCIPLINAS = 6
const ITENS_POR_PAGINA_TAREFAS = 4
const ORDEM_PRIORIDADE = {
  ALTA: 0,
  MEDIA: 1,
  BAIXA: 2,
}

const DISCIPLINAS_INICIAIS = [
  {
    id: 1,
    nome: 'Algoritmos e Programacao',
    professor: 'Prof. Carlos Silva',
    cargaHoraria: 42,
    descricao: 'Fundamentos de logica, estruturas de controle e resolucao de problemas.',
    dataInicio: '2026-02-03',
    dataFim: '2026-06-28',
    tarefasConcluidas: 12,
    tarefasTotais: 17,
  },
  {
    id: 2,
    nome: 'Banco de Dados',
    professor: 'Profa. Ana Santos',
    cargaHoraria: 30,
    descricao: 'Modelagem relacional, SQL e normalizacao aplicada ao projeto.',
    dataInicio: '2026-02-05',
    dataFim: '2026-06-25',
    tarefasConcluidas: 5,
    tarefasTotais: 10,
  },
  {
    id: 3,
    nome: 'Desenvolvimento Web',
    professor: 'Prof. Ricardo Lima',
    cargaHoraria: 38,
    descricao: 'Interfaces web modernas com foco em experiencia do usuario.',
    dataInicio: '2026-02-10',
    dataFim: '2026-06-30',
    tarefasConcluidas: 11,
    tarefasTotais: 13,
  },
  {
    id: 4,
    nome: 'Engenharia de Software',
    professor: 'Profa. Maria Costa',
    cargaHoraria: 48,
    descricao: 'Metodos ageis, requisitos e qualidade de software em equipes.',
    dataInicio: '2026-02-01',
    dataFim: '2026-07-05',
    tarefasConcluidas: 7,
    tarefasTotais: 15,
  },
  {
    id: 5,
    nome: 'Inteligencia Artificial',
    professor: 'Prof. Roberto Almeida',
    cargaHoraria: 36,
    descricao: 'Introducao a modelos de IA, classificacao e regressao.',
    dataInicio: '2026-02-12',
    dataFim: '2026-07-01',
    tarefasConcluidas: 4,
    tarefasTotais: 9,
  },
  {
    id: 6,
    nome: 'Arquitetura de Computadores',
    professor: 'Profa. Daniela Rocha',
    cargaHoraria: 32,
    descricao: 'Organizacao de hardware, processadores e memoria.',
    dataInicio: '2026-02-08',
    dataFim: '2026-06-29',
    tarefasConcluidas: 6,
    tarefasTotais: 11,
  },
  {
    id: 7,
    nome: 'Seguranca da Informacao',
    professor: 'Prof. Marcos Ferreira',
    cargaHoraria: 28,
    descricao: 'Principios de seguranca, ameacas e boas praticas.',
    dataInicio: '2026-02-14',
    dataFim: '2026-06-27',
    tarefasConcluidas: 3,
    tarefasTotais: 8,
  },
]

const TAREFAS_MOCK = [
  {
    id: 1,
    titulo: 'Entregar projeto de API',
    disciplinaId: 4,
    disciplina: 'Engenharia de Software',
    status: 'PENDENTE',
    diasParaEntrega: 1,
  },
  {
    id: 2,
    titulo: 'Preparar apresentacao de sprint',
    disciplinaId: 4,
    disciplina: 'Engenharia de Software',
    status: 'PENDENTE',
    diasParaEntrega: 0,
  },
  {
    id: 3,
    titulo: 'Lista SQL - Joins e Views',
    disciplinaId: 2,
    disciplina: 'Banco de Dados',
    status: 'PENDENTE',
    diasParaEntrega: 3,
  },
  {
    id: 4,
    titulo: 'Refatorar validacoes do formulario',
    disciplinaId: 3,
    disciplina: 'Desenvolvimento Web',
    status: 'PENDENTE',
    diasParaEntrega: 4,
  },
  {
    id: 5,
    titulo: 'Checkpoint de algoritmos recursivos',
    disciplinaId: 1,
    disciplina: 'Algoritmos e Programacao',
    status: 'PENDENTE',
    diasParaEntrega: 6,
  },
  {
    id: 6,
    titulo: 'Exercicio de classificacao supervisionada',
    disciplinaId: 5,
    disciplina: 'Inteligencia Artificial',
    status: 'PENDENTE',
    diasParaEntrega: 5,
  },
  {
    id: 7,
    titulo: 'Resumo sobre memoria cache',
    disciplinaId: 6,
    disciplina: 'Arquitetura de Computadores',
    status: 'PENDENTE',
    diasParaEntrega: 7,
  },
]

function formatarHoras(totalHoras) {
  return `${totalHoras}h`
}

function criarDataEmDias(dias) {
  const data = new Date()
  data.setHours(0, 0, 0, 0)
  data.setDate(data.getDate() + dias)
  return data
}

function calcularPrioridade(dataEntrega, status) {
  if (status === 'CONCLUIDA') {
    return null
  }

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const diffMs = dataEntrega.getTime() - hoje.getTime()
  const diasParaEntrega = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diasParaEntrega < 2) {
    return 'ALTA'
  }

  if (diasParaEntrega <= 7) {
    return 'MEDIA'
  }

  return 'BAIXA'
}

function formatarPrazo(dataEntrega) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const diffMs = dataEntrega.getTime() - hoje.getTime()
  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (dias <= 0) {
    return 'Hoje'
  }

  if (dias === 1) {
    return 'Amanha'
  }

  return `${dias} dias`
}

function aplicarPaginacaoTemporaria(lista, paginaAtual, itensPorPagina) {
  // Temporario: enquanto o backend paginado nao esta pronto, o recorte e feito no frontend.
  // Quando a API estiver disponivel, este slice sera substituido pela resposta da pagina solicitada.
  const inicio = (paginaAtual - 1) * itensPorPagina
  return lista.slice(inicio, inicio + itensPorPagina)
}

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

export function TelaDashboard() {
  const [disciplinas, setDisciplinas] = useState(DISCIPLINAS_INICIAIS)
  const [abrirModal, setAbrirModal] = useState(false)
  const [disciplinaSelecionadaId, setDisciplinaSelecionadaId] = useState(null)
  const [paginaAtualDisciplinas, setPaginaAtualDisciplinas] = useState(1)
  const [paginaAtualTarefas, setPaginaAtualTarefas] = useState(1)
  const [formularioDisciplina, setFormularioDisciplina] = useState({
    nome: '',
    professor: '',
    cargaHoraria: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
  })

  const resumo = useMemo(() => {
    const totalDisciplinas = disciplinas.length
    const tarefasConcluidas = disciplinas.reduce((soma, item) => soma + item.tarefasConcluidas, 0)
    const tarefasTotais = disciplinas.reduce((soma, item) => soma + item.tarefasTotais, 0)
    const tempoEstudo = disciplinas.reduce((soma, item) => soma + item.cargaHoraria, 0)
    const progressoGeral = tarefasTotais === 0 ? 0 : Math.round((tarefasConcluidas / tarefasTotais) * 100)

    return {
      totalDisciplinas,
      tarefasConcluidas,
      tarefasTotais,
      tempoEstudo,
      progressoGeral,
    }
  }, [disciplinas])

  const dadosPizza = useMemo(
    () =>
      disciplinas.map((item) => ({
        nome: item.nome,
        horas: item.cargaHoraria,
      })),
    [disciplinas],
  )

  const dadosBarras = useMemo(
    () =>
      disciplinas.map((item) => ({
        nome: item.nome,
        total: item.tarefasTotais,
        concluidas: item.tarefasConcluidas,
      })),
    [disciplinas],
  )

  const tarefasPriorizadas = useMemo(() => {
    // Temporario: esta ordenacao e paginacao local simulam os dados da API; quando o backend estiver pronto,
    // a tela vai apenas exibir a ordem e a pagina recebidas pelo servidor.
    return TAREFAS_MOCK.map((tarefa) => {
      const dataEntrega = criarDataEmDias(tarefa.diasParaEntrega)
      const prioridade = calcularPrioridade(dataEntrega, tarefa.status)

      return {
        ...tarefa,
        prioridade,
        prazo: formatarPrazo(dataEntrega),
        prazoDias: tarefa.diasParaEntrega,
      }
    })
      .filter((tarefa) => tarefa.prioridade === 'ALTA' || tarefa.prioridade === 'MEDIA')
      .sort((a, b) => {
        const ordemPrioridade = ORDEM_PRIORIDADE[a.prioridade] - ORDEM_PRIORIDADE[b.prioridade]
        if (ordemPrioridade !== 0) {
          return ordemPrioridade
        }

        return a.prazoDias - b.prazoDias
      })
  }, [])

  const tarefasPriorizadasVisiveis = useMemo(() => {
    if (!disciplinaSelecionadaId) {
      return tarefasPriorizadas
    }

    return tarefasPriorizadas.filter((tarefa) => tarefa.disciplinaId === disciplinaSelecionadaId)
  }, [tarefasPriorizadas, disciplinaSelecionadaId])

  const totalPaginasDisciplinas = useMemo(
    () => Math.max(1, Math.ceil(disciplinas.length / ITENS_POR_PAGINA_DISCIPLINAS)),
    [disciplinas.length],
  )

  const totalPaginasTarefas = useMemo(
    () => Math.max(1, Math.ceil(tarefasPriorizadasVisiveis.length / ITENS_POR_PAGINA_TAREFAS)),
    [tarefasPriorizadasVisiveis.length],
  )

  const disciplinasPaginadas = useMemo(
    // Temporario: simula pagina 1, 2, 3... localmente; depois vira uma chamada como
    // fetch(`/api/disciplinas?page=${paginaAtualDisciplinas}&limit=${ITENS_POR_PAGINA_DISCIPLINAS}`).
    () => aplicarPaginacaoTemporaria(disciplinas, paginaAtualDisciplinas, ITENS_POR_PAGINA_DISCIPLINAS),
    [disciplinas, paginaAtualDisciplinas],
  )

  const tarefasPriorizadasPaginadas = useMemo(
    () =>
      aplicarPaginacaoTemporaria(
        tarefasPriorizadasVisiveis,
        paginaAtualTarefas,
        ITENS_POR_PAGINA_TAREFAS,
      ),
    [tarefasPriorizadasVisiveis, paginaAtualTarefas],
  )

  const disciplinaSelecionada = useMemo(() => {
    if (!disciplinaSelecionadaId) {
      return null
    }

    return disciplinas.find((disciplina) => disciplina.id === disciplinaSelecionadaId) ?? null
  }, [disciplinas, disciplinaSelecionadaId])

  useEffect(() => {
    setPaginaAtualTarefas(1)
  }, [disciplinaSelecionadaId])

  useEffect(() => {
    // Garante pagina valida quando a lista muda (ex.: filtro futuro ou alteracoes nos dados).
    setPaginaAtualDisciplinas((paginaAtual) => Math.min(Math.max(paginaAtual, 1), totalPaginasDisciplinas))
  }, [totalPaginasDisciplinas])

  useEffect(() => {
    if (paginaAtualTarefas > totalPaginasTarefas) {
      setPaginaAtualTarefas(totalPaginasTarefas)
    }
  }, [paginaAtualTarefas, totalPaginasTarefas])

  function handleInput(event) {
    const { name, value } = event.target
    setFormularioDisciplina((atual) => ({ ...atual, [name]: value }))
  }

  function handleNovaDisciplina(event) {
    event.preventDefault()

    const cargaHorariaNumero = Number(formularioDisciplina.cargaHoraria)
    if (
      !formularioDisciplina.nome ||
      !formularioDisciplina.professor ||
      !cargaHorariaNumero ||
      !formularioDisciplina.descricao ||
      !formularioDisciplina.dataInicio ||
      !formularioDisciplina.dataFim
    ) {
      return
    }

    if (formularioDisciplina.dataFim < formularioDisciplina.dataInicio) {
      return
    }

    const novaDisciplina = {
      id: Date.now(),
      nome: formularioDisciplina.nome,
      professor: formularioDisciplina.professor,
      cargaHoraria: cargaHorariaNumero,
      descricao: formularioDisciplina.descricao,
      dataInicio: formularioDisciplina.dataInicio,
      dataFim: formularioDisciplina.dataFim,
      tarefasConcluidas: 0,
      tarefasTotais: 0,
    }

    setDisciplinas((atual) => [...atual, novaDisciplina])
    setFormularioDisciplina({
      nome: '',
      professor: '',
      cargaHoraria: '',
      descricao: '',
      dataInicio: '',
      dataFim: '',
    })
    setAbrirModal(false)
  }

  return (
    <main className="dashboard-principal">
      <section className="cabecalho-dashboard">
        <h1>Ola, Estudante! 👋</h1>
        <p>Aqui esta um resumo em tempo real da sua vida academica.</p>
      </section>

      <section className="grade-cards-resumo">
        <article className="card-resumo card-resumo-disciplinas">
          <span className="card-resumo-icone" aria-hidden="true">
            📚
          </span>
          <div>
            <span>Total de Disciplinas</span>
            <strong>{resumo.totalDisciplinas}</strong>
          </div>
        </article>
        <article className="card-resumo card-resumo-tarefas">
          <span className="card-resumo-icone" aria-hidden="true">
            ✅
          </span>
          <div>
            <span>Tarefas Concluidas</span>
            <strong>
              {resumo.tarefasConcluidas}/{resumo.tarefasTotais}
            </strong>
          </div>
        </article>
        <article className="card-resumo card-resumo-tempo">
          <span className="card-resumo-icone" aria-hidden="true">
            🕒
          </span>
          <div>
            <span>Tempo de Estudo</span>
            <strong>{formatarHoras(resumo.tempoEstudo)}</strong>
          </div>
        </article>
        <article className="card-resumo card-resumo-progresso">
          <span className="card-resumo-icone" aria-hidden="true">
            📈
          </span>
          <div>
            <span>Progresso Geral</span>
            <strong>{resumo.progressoGeral}%</strong>
          </div>
        </article>
      </section>

      <section className="grade-graficos">
        <article className="card-grafico">
          <header>
            <h2>Tempo por Disciplina (horas)</h2>
          </header>
          <div className="area-grafico">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosPizza}
                  dataKey="horas"
                  nameKey="nome"
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={85}
                  label={({ percent }) => `${Math.round(percent * 100)}%`}
                >
                  {dadosPizza.map((entrada, indice) => (
                    <Cell key={entrada.nome} fill={CORES_GRAFICO[indice % CORES_GRAFICO.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(valor) => [`${valor}h`, 'Carga Horaria']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="legenda-pizza" aria-label="Legenda do grafico de pizza">
            {dadosPizza.map((item, indice) => (
              <li key={item.nome}>
                <span
                  className="cor-legenda"
                  style={{ backgroundColor: CORES_GRAFICO[indice % CORES_GRAFICO.length] }}
                  aria-hidden="true"
                />
                <small>{item.nome}</small>
              </li>
            ))}
          </ul>
        </article>

        <article className="card-grafico">
          <header>
            <h2>Status das Tarefas</h2>
          </header>
          <div className="area-grafico">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosBarras} barGap={-22}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--cor-borda)" />
                <XAxis
                  dataKey="nome"
                  tick={{ fontSize: 11, fill: 'var(--cor-texto-suave)' }}
                  axisLine={{ stroke: 'var(--cor-borda)' }}
                  tickLine={{ stroke: 'var(--cor-borda)' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: 'var(--cor-texto-suave)' }}
                  axisLine={{ stroke: 'var(--cor-borda)' }}
                  tickLine={{ stroke: 'var(--cor-borda)' }}
                />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    backgroundColor: 'var(--cor-card)',
                    border: '1px solid var(--cor-borda)',
                    borderRadius: '10px',
                  }}
                  labelStyle={{ color: 'var(--cor-texto)', fontWeight: 700 }}
                  itemStyle={{ color: 'var(--cor-texto-suave)', fontWeight: 600 }}
                  formatter={(valor, nome) => {
                    if (nome === 'Total') {
                      return [<span style={{ color: 'var(--cor-texto)' }}>{valor}</span>, nome]
                    }

                    return [<span style={{ color: '#10b981' }}>{valor}</span>, nome]
                  }}
                />
                <Bar dataKey="total" fill="#d5dde8" name="Total" barSize={28} radius={[6, 6, 0, 0]} />
                <Bar dataKey="concluidas" fill="#10b981" name="Concluidas" barSize={16} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="secao-cursos-tarefas" id="secao-disciplinas">
        <article className="card-disciplinas">
          <div className="topo-lista-disciplinas">
            <h2>Minhas Disciplinas</h2>
            <button type="button" onClick={() => setAbrirModal(true)}>
              + Nova Disciplina
            </button>
          </div>

          <div className="lista-disciplinas">
            {disciplinasPaginadas.map((item) => {
              const progresso =
                item.tarefasTotais === 0
                  ? 0
                  : Math.round((item.tarefasConcluidas / item.tarefasTotais) * 100)

              return (
                <article
                  className={`item-disciplina ${disciplinaSelecionadaId === item.id ? 'item-disciplina-ativo' : ''}`}
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setDisciplinaSelecionadaId(item.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setDisciplinaSelecionadaId(item.id)
                    }
                  }}
                >
                  <header>
                    <div>
                      <h3>{item.nome}</h3>
                      <p>{item.professor}</p>
                    </div>
                    <span>{progresso}%</span>
                  </header>

                  <small className="rotulo-progresso-disciplina">Progresso</small>
                  <div className="barra-progresso" aria-label={`Progresso da disciplina ${item.nome}`}>
                    <span style={{ width: `${progresso}%` }} />
                  </div>

                  <footer>
                    <small>
                      {item.tarefasConcluidas}/{item.tarefasTotais} tarefas
                    </small>
                    <small className="tempo-disciplina">
                      <span aria-hidden="true">🕒</span>
                      {item.cargaHoraria}h
                    </small>
                  </footer>
                </article>
              )
            })}
          </div>

          <div className="paginacao-area">
            <PaginacaoNumerada
              paginaAtual={paginaAtualDisciplinas}
              totalPaginas={totalPaginasDisciplinas}
              onChange={setPaginaAtualDisciplinas}
              ariaLabel="Paginacao de disciplinas"
            />
          </div>
        </article>

        <aside className="card-prioritarias" id="secao-prioritarias">
          <div className="topo-prioritarias">
            <h2>Tarefas Prioritarias</h2>
            {disciplinaSelecionada && (
              <button type="button" className="botao-mostrar-todas" onClick={() => setDisciplinaSelecionadaId(null)}>
                Mostrar todas
              </button>
            )}
          </div>

          {disciplinaSelecionada && (
            <p className="filtro-prioritarias">Filtrando por: {disciplinaSelecionada.nome}</p>
          )}

          <div className="lista-prioritarias">
            {tarefasPriorizadasPaginadas.map((tarefa) => (
              <article
                key={tarefa.id}
                className={`item-prioritaria ${tarefa.prioridade === 'ALTA' ? 'prioridade-alta' : ''}`}
              >
                <h3>{tarefa.titulo}</h3>
                <p>{tarefa.disciplina}</p>
                <small>Prioridade: {tarefa.prioridade === 'ALTA' ? 'Alto' : 'Medio'}</small>
                <small>Prazo: {tarefa.prazo}</small>
              </article>
            ))}

            {tarefasPriorizadasVisiveis.length === 0 && (
              <p className="mensagem-vazia-prioritarias">
                Sem tarefas de prioridade alta ou media para esta disciplina.
              </p>
            )}
          </div>

          <div className="paginacao-area">
            <PaginacaoNumerada
              paginaAtual={paginaAtualTarefas}
              totalPaginas={totalPaginasTarefas}
              onChange={setPaginaAtualTarefas}
              ariaLabel="Paginacao de tarefas prioritarias"
            />
          </div>
        </aside>
      </section>

      {abrirModal && (
        <div className="modal-sobreposicao" role="presentation" onClick={() => setAbrirModal(false)}>
          <article className="modal-disciplina" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h2>Nova Disciplina</h2>
            <form onSubmit={handleNovaDisciplina}>
              <label htmlFor="nome">Nome da disciplina</label>
              <input
                id="nome"
                name="nome"
                value={formularioDisciplina.nome}
                onChange={handleInput}
                placeholder="Ex: Estruturas de Dados"
                required
              />

              <label htmlFor="professor">Professor</label>
              <input
                id="professor"
                name="professor"
                value={formularioDisciplina.professor}
                onChange={handleInput}
                placeholder="Ex: Prof. Joao Martins"
                required
              />

              <label htmlFor="cargaHoraria">Carga horaria (horas)</label>
              <input
                id="cargaHoraria"
                name="cargaHoraria"
                type="number"
                min="1"
                value={formularioDisciplina.cargaHoraria}
                onChange={handleInput}
                placeholder="Ex: 60"
                required
              />

              <label htmlFor="descricao">Descricao</label>
              <input
                id="descricao"
                name="descricao"
                value={formularioDisciplina.descricao}
                onChange={handleInput}
                placeholder="Ex: Conteudo e objetivos da disciplina"
                required
              />

              <label htmlFor="dataInicio">Data de inicio</label>
              <input
                id="dataInicio"
                name="dataInicio"
                type="date"
                value={formularioDisciplina.dataInicio}
                onChange={handleInput}
                required
              />

              <label htmlFor="dataFim">Data de fim</label>
              <input
                id="dataFim"
                name="dataFim"
                type="date"
                value={formularioDisciplina.dataFim}
                onChange={handleInput}
                required
              />

              <div className="acoes-modal">
                <button type="button" className="botao-cancelar" onClick={() => setAbrirModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="botao-salvar">
                  Salvar
                </button>
              </div>
            </form>
          </article>
        </div>
      )}
    </main>
  )
}
