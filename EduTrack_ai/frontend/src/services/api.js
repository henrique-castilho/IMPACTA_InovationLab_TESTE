import axios from 'axios'

export const CHAVE_TOKEN = 'edutrack-token'

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
      // Se o token expirou ou é inválido, podemos limpar o localStorage
      // e redirecionar para o login (opcional, dependendo do fluxo desejado)
      window.localStorage.removeItem(CHAVE_TOKEN)
      // window.location.href = '/login'
    }
    return Promise.reject(erro)
  }
)

export default api
