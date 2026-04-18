import { useState } from 'react'
import './TelaPerfil.css'

const DADOS_INICIAIS = {
  nome: 'Estudante EduTrack',
  email: 'estudante@edutrack.ai',
  senha: '12345678',
}

export function TelaPerfil() {
  const [dados, setDados] = useState(DADOS_INICIAIS)
  const [editando, setEditando] = useState(false)

  function handleCampo(event) {
    const { name, value } = event.target
    setDados((atual) => ({
      ...atual,
      [name]: value,
    }))
  }

  function handleSalvar(event) {
    event.preventDefault()
    setEditando(false)
  }

  function handleCancelar() {
    setDados(DADOS_INICIAIS)
    setEditando(false)
  }

  return (
    <main className="perfil-principal">
      <section className="cabecalho-perfil">
        <h1>Perfil do Usuario</h1>
        <p>Visualize e atualize seus dados de acesso.</p>
      </section>

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
            Senha
            <input
              id="senha-perfil"
              name="senha"
              type={editando ? 'text' : 'password'}
              value={dados.senha}
              onChange={handleCampo}
              readOnly={!editando}
              required
            />
          </label>

          <div className="acoes-perfil">
            {!editando ? (
              <button type="button" className="botao-editar-perfil" onClick={() => setEditando(true)}>
                Editar dados
              </button>
            ) : (
              <>
                <button type="submit" className="botao-salvar-perfil">
                  Salvar alteracoes
                </button>
                <button type="button" className="botao-cancelar-perfil" onClick={handleCancelar}>
                  Cancelar
                </button>
              </>
            )}

            <button type="button" className="botao-excluir-conta">
              Excluir conta
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
