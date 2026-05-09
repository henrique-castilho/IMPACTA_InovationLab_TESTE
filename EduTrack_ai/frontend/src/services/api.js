import axios from 'axios'

export const CHAVE_TOKEN = 'edutrack-token'
export const CHAVE_USER_ID = 'edutrack-user-id'

const api = axios.create({
  baseURL: 'http://localhost:8080',
})

// Interceptador para adicionar o token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = window.localStorage.getItem(CHAVE_TOKEN)
    
    // Se o token existe, adicionamos ao cabeçalho Authorization
    // O backend Spring Boot espera o formato "Bearer <token>"
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (erro) => {
    return Promise.reject(erro)
  }
)

// Interceptador para tratar erros globais (ex: 401 Unauthorized)
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    if (erro.response && erro.response.status === 401) {
      const userId = window.localStorage.getItem(CHAVE_USER_ID)
      window.localStorage.removeItem(CHAVE_TOKEN)
      window.localStorage.removeItem(CHAVE_USER_ID)
      window.localStorage.removeItem(`edutrack.insights_${userId}`)
      window.localStorage.removeItem(`edutrack.insights_resumo_${userId}`)
      window.location.href = '/login'
    }
    return Promise.reject(erro)
  }
)

export default api
