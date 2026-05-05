import { useMemo, useState } from 'react'
import './TelaInsights.css'

const POOL_INSIGHTS_MOCK = [
  {
    id: 1,
    titulo: 'Picos de estudo proximo aos prazos',
    descricao:
      'Você costuma concentrar a entrega de tarefas no ultimo dia. Isso pode indicar um ritmo de estudos mais intenso perto dos prazos. Tente distribuir melhor suas atividades ao longo do tempo para evitar sobrecarga.',
    nivel: 'positivo',
  },
  {
    id: 2,
    titulo: 'Atencao para prazos curtos',
    descricao:
      'Existem tarefas com prazo menor que 7 dias e outras com prazo menor que 3 dias. Priorize as atividades de Engenharia de Software e Banco de Dados.',
    nivel: 'alerta',
  },
  {
    id: 3,
    titulo: 'Sugestao da IA para a proxima sessao',
    descricao:
      'Reserve um tempo para concluir as tarefas da disciplina com maior volume pendente. Isso ajuda a manter a evolução sem acumular entregas no final da semana.',
    nivel: 'sugestao',
  },
  {
    id: 4,
    titulo: 'Bom ritmo em disciplinas de maior carga',
    descricao:
      'Você esta mantendo consistencia nas disciplinas mais extensas. Esse padrao é positivo para reduzir atrasos e distribuir melhor o estudo ao longo da semana.',
    nivel: 'positivo',
  },
  {
    id: 5,
    titulo: 'Risco de atraso em tarefas prioritarias',
    descricao:
      'Algumas tarefas com prioridade alta ainda nao foram concluidas. Vale revisar o que vence primeiro para evitar acumulo de pendencias.',
    nivel: 'alerta',
  },
  {
    id: 6,
    titulo: 'Foco recomendado pela IA',
    descricao:
      'A melhor estrategia agora é concentrar energia em duas disciplinas por vez. Assim você reduz troca de contexto e avanca mais rapido nas entregas.',
    nivel: 'sugestao',
  },
  {
    id: 7,
    titulo: 'Sequencia positiva de tarefas concluidas',
    descricao:
      'Nas ultimas atividades houve boa taxa de conclusao antes do prazo. Esse comportamento merece ser mantido porque melhora o progresso geral.',
    nivel: 'positivo',
  },
  {
    id: 8,
    titulo: 'Prazo apertado em atividades da semana',
    descricao:
      'Duas tarefas importantes estao com prazo curto e exigem atencao imediata. Reorganize a agenda para encaixar um bloco de estudo dedicado.',
    nivel: 'alerta',
  },
  {
    id: 9,
    titulo: 'Sugestao para aumentar foco',
    descricao:
      'Separe uma janela curta e sem interrupcoes para resolver as tarefas mais simples primeiro. Isso costuma destravar o restante da rotina.',
    nivel: 'sugestao',
  },
  {
    id: 10,
    titulo: 'Progresso consistente em tarefas curtas',
    descricao:
      'Você tem entregado tarefas com prazo curto (até 2 dias) dentro do prazo. Manter esse padrão é excelente para evitar atrasos acumulativos.',
    nivel: 'positivo',
  },
  {
    id: 11,
    titulo: 'Desequilibrio na distribuicao entre disciplinas',
    descricao:
      'Você esta dedicando mais tempo a poucas disciplinas enquanto outras ficam em segundo plano. Considere equilibrar melhor suas horas de estudo.',
    nivel: 'alerta',
  },
]

function gerarInsightsAleatorios() {
  // Embaralhar o pool de insights (Fisher-Yates shuffle)
  const shuffled = [...POOL_INSIGHTS_MOCK].sort(() => Math.random() - 0.5)
  // Escolher entre 3 e 5 insights
  const quantidade = Math.floor(Math.random() * 3) + 3
  return shuffled.slice(0, quantidade)
}

function contarPorNivel(insights, nivel) {
  return insights.filter((insight) => insight.nivel === nivel).length
}

const STORAGE_KEY = 'edutrack.insights'

export function TelaInsights() {
  const [insights, setInsights] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  })
  const [gerando, setGerando] = useState(false)

  const metricas = useMemo(
    () => ({
      positivos: contarPorNivel(insights, 'positivo'),
      alertas: contarPorNivel(insights, 'alerta'),
      sugestoes: contarPorNivel(insights, 'sugestao'),
    }),
    [insights],
  )

  function handleGerarInsights() {
    setGerando(true)

    window.setTimeout(() => {
      const novos = gerarInsightsAleatorios()
      setInsights(novos)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(novos))
      } catch (e) {
        // ignore storage errors
      }
      setGerando(false)
    }, 400)
  }

  return (
    <main className="insights-principal">
      <section className="cabecalho-insights">
        <div className="cabecalho-insights-texto">
          <h1>Insights de Aprendizado</h1>
          <p>Recomendacoes geradas com base no seu progresso academico recente.</p>
        </div>

        <button type="button" className="botao-gerar-insights" onClick={handleGerarInsights} disabled={gerando}>
          {gerando ? 'Gerando insights...' : 'Gerar novos insights'}
        </button>
      </section>

      <section className="grade-metricas-insights" aria-label="Resumo dos insights atuais">
        <article className="card-metrica-insight">
          <span>Positivos</span>
          <strong>{metricas.positivos}</strong>
        </article>
        <article className="card-metrica-insight">
          <span>Alertas</span>
          <strong>{metricas.alertas}</strong>
        </article>
        <article className="card-metrica-insight">
          <span>Sugestões</span>
          <strong>{metricas.sugestoes}</strong>
        </article>
      </section>

      <section className="lista-insights" aria-label="Lista de insights gerados pela IA">
        {insights.length === 0 ? (
          <article className="card-insight card-insight-vazio">
            <h2>Nenhum insight disponível</h2>
            <p>Ainda não há insights gerados. Clique em <strong>Gerar novos insights</strong> para receber recomendações personalizadas.</p>
          </article>
        ) : (
          insights.map((insight) => (
            <article key={insight.id} className={`card-insight insight-${insight.nivel}`}>
              <h2>{insight.titulo}</h2>
              <p>{insight.descricao}</p>
            </article>
          ))
        )}
      </section>
    </main>
  )
}
