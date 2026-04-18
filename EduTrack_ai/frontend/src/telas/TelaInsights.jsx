import './TelaInsights.css'

const INSIGHTS_MOCK = [
  {
    id: 1,
    titulo: 'Picos de estudo proximo a prazos',
    descricao:
      'Você costuma concentrar a entrega de tarefas no último dia." Isso pode indicar um ritmo de estudos mais intenso próximo aos prazos. Tente distribuir melhor suas atividades ao longo do tempo para evitar sobrecarga.',
    nivel: 'positivo',
  },
  {
    id: 2,
    titulo: 'Atencao para prazos curtos',
    descricao:
      'Existem tarefas com prazo menor que 7 e 3 dias . Priorize atividades de Engenharia de Software e Banco de Dados.',
    nivel: 'alerta',
  },
  {
    id: 3,
    titulo: 'Sugestao da IA para proxima sessao',
    descricao:
      'Reserve um tempo para conluir as tarefas dasmatéria X, pois elas estao com prazo proximo e podem exigir mais tempo de estudo.',
    nivel: 'sugestao',
  },
]

export function TelaInsights() {
  return (
    <main className="insights-principal">
      <section className="cabecalho-insights">
        <h1>Insights de Aprendizado</h1>
        <p>Recomendacoes geradas com base no seu progresso academico recente.</p>
      </section>

      <section className="lista-insights" aria-label="Lista de insights gerados pela IA">
        {INSIGHTS_MOCK.map((insight) => (
          <article key={insight.id} className={`card-insight insight-${insight.nivel}`}>
            <h2>{insight.titulo}</h2>
            <p>{insight.descricao}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
