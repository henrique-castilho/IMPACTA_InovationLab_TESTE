import { useEffect, useMemo, useState } from 'react'
import { Toast } from '../componentes/Toast'
import './TelaDisciplinas.css'

const DISCIPLINAS_INICIAIS = [
  {
    id: 1,
    nome: 'Algoritmos e Programacao',
    professor: 'Prof. Carlos Silva',
    cargaHoraria: 42,
    descricao: 'Fundamentos de logica, estruturas de controle e resolucao de problemas.',
    dataInicio: '2026-02-03',
    dataFim: '2026-06-28',
  },
  {
    id: 2,
    nome: 'Banco de Dados',
    professor: 'Profa. Ana Santos',
    cargaHoraria: 30,
    descricao: 'Modelagem relacional, SQL e normalizacao aplicada ao projeto.',
    dataInicio: '2026-02-05',
    dataFim: '2026-06-25',
  },
  {
    id: 3,
    nome: 'Desenvolvimento Web',
    professor: 'Prof. Ricardo Lima',
    cargaHoraria: 38,
    descricao: 'Interfaces web modernas com foco em experiencia do usuario.',
    dataInicio: '2026-02-10',
    dataFim: '2026-06-30',
  },
  {
    id: 4,
    nome: 'Engenharia de Software',
    professor: 'Profa. Maria Costa',
    cargaHoraria: 48,
    descricao: 'Metodos ageis, requisitos e qualidade de software em equipes.',
    dataInicio: '2026-02-01',
    dataFim: '2026-07-05',
  },
]

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
  const [disciplinas, setDisciplinas] = useState(DISCIPLINAS_INICIAIS)
  const [modalAberto, setModalAberto] = useState(false)
  const [disciplinaEmEdicaoId, setDisciplinaEmEdicaoId] = useState(null)
  const [toast, setToast] = useState({ aberto: false, mensagem: '' })
  const [formulario, setFormulario] = useState({
    nome: '',
    professor: '',
    cargaHoraria: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
  })

  const totalCargaHoraria = useMemo(
    () => disciplinas.reduce((acumulador, item) => acumulador + item.cargaHoraria, 0),
    [disciplinas],
  )

  useEffect(() => {
    if (!toast.aberto) {
      return undefined
    }

    const identificador = window.setTimeout(() => {
      setToast({ aberto: false, mensagem: '' })
    }, 3000)

    return () => window.clearTimeout(identificador)
  }, [toast.aberto])

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
  }

  function fecharModal() {
    setModalAberto(false)
    setDisciplinaEmEdicaoId(null)
  }

  function handleInput(event) {
    const { name, value } = event.target
    setFormulario((atual) => ({
      ...atual,
      [name]: value,
    }))
  }

  function handleSalvarDisciplina(event) {
    event.preventDefault()

    if (
      !formulario.nome ||
      !formulario.professor ||
      !formulario.cargaHoraria ||
      !formulario.descricao ||
      !formulario.dataInicio ||
      !formulario.dataFim
    ) {
      return
    }

    const payload = montarPayloadBackend(formulario)
    if (!payload.cargaHoraria || payload.cargaHoraria <= 0 || payload.dataFim < payload.dataInicio) {
      return
    }

    if (disciplinaEmEdicaoId) {
      setDisciplinas((atual) =>
        atual.map((item) =>
          item.id === disciplinaEmEdicaoId
            ? {
                ...item,
                ...payload,
              }
            : item,
        ),
      )
    } else {
      setDisciplinas((atual) => [
        {
          id: Date.now(),
          ...payload,
        },
        ...atual,
      ])
    }

    fecharModal()
  }

  function handleExcluirDisciplina(id, nome) {
    setDisciplinas((atual) => atual.filter((item) => item.id !== id))
    mostrarToast(`Disciplina "${nome}" excluida com sucesso.`)
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

      <section className="resumo-disciplinas" aria-label="Resumo das disciplinas">
        <article>
          <span>Total de Disciplinas</span>
          <strong>{disciplinas.length}</strong>
        </article>
        <article>
          <span>Carga Horaria Total</span>
          <strong>{totalCargaHoraria}h</strong>
        </article>
      </section>

      <section className="grade-disciplinas" aria-label="Lista de disciplinas em cards">
        {disciplinas.length === 0 ? (
          <article className="vazio-disciplinas" role="status" aria-live="polite">
            <span className="vazio-icone" aria-hidden="true">
              📚
            </span>
            <h3>Você ainda não tem disciplinas. Clique em + para começar</h3>
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

      <Toast aberto={toast.aberto} mensagem={toast.mensagem} />
    </main>
  )
}
