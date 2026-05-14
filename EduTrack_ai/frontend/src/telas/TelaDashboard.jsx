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
import api from '../services/api'
import './TelaDashboard.css'

const CORES_GRAFICO = ['#4f46e5', '#0ea5a3', '#f59e0b', '#22c55e', '#7c3aed']
const ITENS_POR_PAGINA_DISCIPLINAS = 6
const ITENS_POR_PAGINA_TAREFAS = 4

function gerarCorPorString(str) {
  if (!str) return '#4f46e5'
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash) % 360
  // Usamos hsl para garantir que a cor seja sempre vibrante, mudando apenas a matiz (hue)
  return `hsl(${h}, 75%, 55%)`
}

function formatarHoras(totalHoras) {
  return `${totalHoras}h`
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
  const [nomeUsuario, setNomeUsuario] = useState('Estudante')
  const [resumo, setResumo] = useState({ totalDisciplinas: 0, tarefasConcluidas: '0/0', tempoEstudo: 0, progressoGeral: 0 })
  const [dadosPizza, setDadosPizza] = useState([])
  const [dadosBarras, setDadosBarras] = useState([])

  const [disciplinasPaginadas, setDisciplinasPaginadas] = useState([])
  const [totalPaginasDisciplinas, setTotalPaginasDisciplinas] = useState(1)
  const [paginaAtualDisciplinas, setPaginaAtualDisciplinas] = useState(1)

  const [tarefasPriorizadasPaginadas, setTarefasPrioritariasPaginadas] = useState([])
  const [totalPaginasTarefas, setTotalPaginasTarefas] = useState(1)
  const [paginaAtualTarefas, setPaginaAtualTarefas] = useState(1)

  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(null)
  
  const [abrirModal, setAbrirModal] = useState(false)
  const [formularioDisciplina, setFormularioDisciplina] = useState({
    nome: '',
    professor: '',
    cargaHoraria: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
  })

  useEffect(() => {
    async function fetchUsuario() {
      try {
        const response = await api.get('/users/me')
        setNomeUsuario(response.data.nome)
      } catch (err) {
        console.error(err)
      }
    }
    fetchUsuario()
  }, [])

  async function carregarDadosDashboard() {
    try {
      const [resResumo, resPizza, resBarras] = await Promise.all([
        api.get('/dashboard/resumo'),
        api.get('/dashboard/graficos/disciplinas'),
        api.get('/dashboard/graficos/tarefas-por-status')
      ])
      
      setResumo({
        totalDisciplinas: resResumo.data.totalDisciplinas || 0,
        tarefasConcluidas: resResumo.data.tarefasConcluidas || '0/0',
        tempoEstudo: resResumo.data.tempoEstudo || 0,
        progressoGeral: resResumo.data.progressoGeral || 0
      })
      
      setDadosPizza((resPizza.data || []).map(d => ({ nome: d.nome, horas: d.cargaHoraria })))
      
      setDadosBarras((resBarras.data || []).map(d => ({
        nome: d.nomeDisciplina,
        total: d.totalTarefas,
        concluidas: d.tarefasConcluidas
      })))
    } catch (err) {
      console.error(err)
    }
  }

  async function carregarDisciplinas() {
    try {
      const response = await api.get(`/dashboard/disciplinas?page=${paginaAtualDisciplinas - 1}&size=${ITENS_POR_PAGINA_DISCIPLINAS}`)
      setDisciplinasPaginadas(response.data.content || [])
      setTotalPaginasDisciplinas(response.data.totalPages === 0 ? 1 : response.data.totalPages)
    } catch (err) {
      console.error(err)
    }
  }

  async function carregarTarefasPrioritarias() {
    try {
      let url = `/dashboard/tarefas-prioritarias?page=${paginaAtualTarefas - 1}&size=${ITENS_POR_PAGINA_TAREFAS}`
      if (disciplinaSelecionada) {
        url += `&disciplinaId=${disciplinaSelecionada.id}`
      }
      const response = await api.get(url)
      setTarefasPrioritariasPaginadas(response.data.content || [])
      setTotalPaginasTarefas(response.data.totalPages === 0 ? 1 : response.data.totalPages)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    carregarDadosDashboard()
  }, [])

  useEffect(() => {
    carregarDisciplinas()
  }, [paginaAtualDisciplinas])

  useEffect(() => {
    carregarTarefasPrioritarias()
  }, [paginaAtualTarefas, disciplinaSelecionada])

  useEffect(() => {
    setPaginaAtualTarefas(1)
  }, [disciplinaSelecionada])

  function handleInput(event) {
    const { name, value } = event.target
    setFormularioDisciplina((atual) => ({ ...atual, [name]: value }))
  }

  async function handleNovaDisciplina(event) {
    event.preventDefault()

    const cargaHorariaNumero = Number(formularioDisciplina.cargaHoraria)
    if (
      !formularioDisciplina.nome ||
      !formularioDisciplina.professor ||
      !cargaHorariaNumero ||
      !formularioDisciplina.descricao ||
      !formularioDisciplina.dataInicio ||
      !formularioDisciplina.dataFim ||
      formularioDisciplina.dataFim < formularioDisciplina.dataInicio
    ) {
      return
    }

    try {
      await api.post('/disciplinas', {
        nome: formularioDisciplina.nome,
        professor: formularioDisciplina.professor,
        cargaHoraria: cargaHorariaNumero,
        descricao: formularioDisciplina.descricao,
        dataInicio: formularioDisciplina.dataInicio,
        dataFim: formularioDisciplina.dataFim,
      })

      setFormularioDisciplina({
        nome: '',
        professor: '',
        cargaHoraria: '',
        descricao: '',
        dataInicio: '',
        dataFim: '',
      })
      setAbrirModal(false)

      carregarDadosDashboard()
      carregarDisciplinas()
      carregarTarefasPrioritarias()
    } catch (err) {
      console.error('Erro ao cadastrar disciplina', err)
    }
  }

  return (
    <main className="dashboard-principal">
      <section className="cabecalho-dashboard">
        <h1>Olá, {nomeUsuario}! 👋</h1>
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
            <strong>{resumo.tarefasConcluidas}</strong>
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
            <strong>{Number(resumo.progressoGeral || 0).toFixed(2).replace('.', ',')}%</strong>
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
                  {dadosPizza.map((entrada) => (
                    <Cell key={entrada.nome} fill={gerarCorPorString(entrada.nome)} />
                  ))}
                </Pie>
                <Tooltip formatter={(valor) => [`${valor}h`, 'Carga Horaria']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="legenda-pizza" aria-label="Legenda do grafico de pizza">
            {dadosPizza.map((item) => (
              <li key={item.nome}>
                <span
                  className="cor-legenda"
                  style={{ backgroundColor: gerarCorPorString(item.nome) }}
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
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 11, fill: 'var(--cor-texto-suave)' }}
                  tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
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
              const progresso = item.porcentagemConclusao || 0
              const progressoExibicao = Number(progresso).toFixed(2).replace('.', ',')

              return (
                <article
                  className={`item-disciplina ${disciplinaSelecionada?.id === item.id ? 'item-disciplina-ativo' : ''}`}
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setDisciplinaSelecionada(item)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setDisciplinaSelecionada(item)
                    }
                  }}
                >
                  <header>
                    <div>
                      <h3>{item.nome}</h3>
                      <p>{item.professor}</p>
                    </div>
                    <span>{progressoExibicao}%</span>
                  </header>

                  <small className="rotulo-progresso-disciplina">Progresso</small>
                  <div className="barra-progresso" aria-label={`Progresso da disciplina ${item.nome}`}>
                    <span style={{ width: `${progresso}%` }} />
                  </div>

                  <footer>
                    <small>
                      {item.tarefas} tarefas
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
              <button type="button" className="botao-mostrar-todas" onClick={() => setDisciplinaSelecionada(null)}>
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
                className={`item-prioritaria ${tarefa.prioridade === 'ATRASADA' ? 'prioridade-atrasada' : tarefa.prioridade === 'ALTA' ? 'prioridade-alta' : tarefa.prioridade === 'MEDIA' ? 'prioridade-media' : tarefa.prioridade === 'BAIXA' ? 'prioridade-baixa' : ''}`}
              >
                <h3>{tarefa.titulo}</h3>
                <p>{tarefa.nomeDisciplina}</p>
                <small>Prioridade: {tarefa.prioridade === 'ALTA' ? 'Alta' : tarefa.prioridade === 'MEDIA' ? 'Média' : tarefa.prioridade === 'BAIXA' ? 'Baixa' : tarefa.prioridade === 'ATRASADA' ? 'Atrasada' : '—'}</small>
                <small>Prazo: {tarefa.prazo}</small>
              </article>
            ))}

            {tarefasPriorizadasPaginadas.length === 0 && (
              <p className="mensagem-vazia-prioritarias">
                Sem tarefas prioritarias para esta disciplina.
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
