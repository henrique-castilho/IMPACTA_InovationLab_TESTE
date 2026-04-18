import './Toast.css'

export function Toast({ mensagem, aberto }) {
  if (!aberto) {
    return null
  }

  return (
    <div className="toast-feedback" role="status" aria-live="polite">
      <span className="toast-feedback-icone" aria-hidden="true">
        ✓
      </span>
      <span>{mensagem}</span>
    </div>
  )
}