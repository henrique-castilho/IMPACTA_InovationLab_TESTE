import { useState } from 'react'
import api from '../services/api'
import './ModalFotoPerfil.css'

export function ModalFotoPerfil({ aoFechar, aoSucesso, fotoAtual, nomeUsuario }) {
  const [preview, setPreview] = useState(fotoAtual)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  // Converte arquivo para Base64
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Limite de 2MB para não sobrecarregar o DB
        setErro('A imagem deve ter no máximo 2MB.')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
        setErro('')
      }
      reader.readAsDataURL(file)
    }
  }

  const removerFoto = () => {
    setPreview(null)
    setErro('')
  }

  const salvarFoto = async () => {
    // Se o que está no preview é exatamente o que já temos, apenas fecha
    if (preview === fotoAtual) {
      aoFechar()
      return
    }

    setCarregando(true)
    try {
      // Envia a nova imagem ou vazio para remover
      const resposta = await api.post('/users/me/foto', { fotoUrl: preview || '' })
      aoSucesso(resposta.data.fotoUrl)
      aoFechar()
    } catch (err) {
      setErro('Erro ao salvar a foto. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="fundo-modal-foto" onClick={aoFechar} role="presentation">
      <div className="modal-foto-conteudo" onClick={(e) => e.stopPropagation()}>
        <header className="modal-foto-header">
          <h2>Foto de Perfil</h2>
          <button className="botao-fechar-modal" onClick={aoFechar}>&times;</button>
        </header>

        <div className="modal-foto-corpo">
          <div className="preview-foto-container">
            {preview ? (
              <img src={preview} alt="Preview" className="foto-preview-circular" />
            ) : (
              <div className="foto-preview-placeholder">
                {nomeUsuario?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="botoes-upload-grupo">
            <label className="botao-upload-customizado">
              Escolher Foto
              <input type="file" accept="image/*" onChange={handleFileChange} hidden />
            </label>
            
            {preview && (
              <button type="button" className="botao-remover-foto" onClick={removerFoto}>
                Remover Foto
              </button>
            )}
          </div>
          
          {erro && <p className="erro-upload">{erro}</p>}
          <p className="hint-upload">Formatos suportados: JPG, PNG. Máx 2MB.</p>
        </div>

        <footer className="modal-foto-footer">
          <button className="botao-cancelar" onClick={aoFechar} disabled={carregando}>
            Cancelar
          </button>
          <button className="botao-confirmar" onClick={salvarFoto} disabled={carregando}>
            {carregando ? 'Salvando...' : 'Salvar'}
          </button>
        </footer>
      </div>
    </div>
  )
}
