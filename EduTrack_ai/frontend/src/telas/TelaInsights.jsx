import { useState } from 'react'
import api, { CHAVE_USER_ID } from '../services/api'
import './TelaInsights.css'

export function TelaInsights() {
  const userId = localStorage.getItem(CHAVE_USER_ID)
  const STORAGE_KEY = `edutrack.insights_${userId}`
  const SUMMARY_KEY = `edutrack.insights_resumo_${userId}`

  const [insights, setInsights] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  })

  const [resumo, setResumo] = useState(() => {
    try {
      const raw = localStorage.getItem(SUMMARY_KEY)
      return raw ? JSON.parse(raw) : { qtdPositivos: 0, qtdAlertas: 0, qtdSugestoes: 0 }
    } catch (e) {
      return { qtdPositivos: 0, qtdAlertas: 0, qtdSugestoes: 0 }
    }
  })

  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleGerarInsights() {
    setGerando(true)
    setErro('')
    try {
      const resposta = await api.post('/insights/generate')
      const { insights: novosInsights, resumo: novoResumo } = resposta.data

      setInsights(novosInsights)
      setResumo(novoResumo)

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(novosInsights))
        localStorage.setItem(SUMMARY_KEY, JSON.stringify(novoResumo))
      } catch (e) {
        // ignore storage errors
      }
    } catch (err) {
      console.error('Erro ao gerar insights:', err)
      const msg = err.response?.data?.mensagem || 'Falha ao conectar com a IA. Tente novamente mais tarde.'
      setErro(msg)
    } finally {
      setGerando(false)
    }
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

      {erro && (
        <div className="alerta-erro" style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--cor-perigo)',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid var(--cor-perigo)',
          textAlign: 'center'
        }}>
          {erro}
        </div>
      )}

      <section className="grade-metricas-insights" aria-label="Resumo dos insights atuais">
        <article className="card-metrica-insight">
          <span>Positivos</span>
          <strong>{resumo.qtdPositivos}</strong>
        </article>
        <article className="card-metrica-insight">
          <span>Alertas</span>
          <strong>{resumo.qtdAlertas}</strong>
        </article>
        <article className="card-metrica-insight">
          <span>Sugestões</span>
          <strong>{resumo.qtdSugestoes}</strong>
        </article>
      </section>

      <section className="lista-insights" aria-label="Lista de insights gerados pela IA">
        {insights.length === 0 ? (
          <article className="card-insight card-insight-vazio">
            <h2>Nenhum insight disponível</h2>
            <p>Ainda não há insights gerados. Clique em <strong>Gerar novos insights</strong> para receber recomendações personalizadas da IA.</p>
          </article>
        ) : (
          insights.map((insight, index) => {
            const nivelCSS = insight.tipo ? insight.tipo.toLowerCase() : 'sugestao'
            return (
              <article key={index} className={`card-insight insight-${nivelCSS}`}>
                <h2>{insight.titulo}</h2>
                <p>{insight.descricao}</p>
              </article>
            )
          })
        )}
      </section>
    </main>
  )
}
