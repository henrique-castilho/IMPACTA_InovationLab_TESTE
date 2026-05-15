import axios from 'axios'

export const CHAVE_TOKEN = 'edutrack-token'
export const CHAVE_USER_ID = 'edutrack-user-id'

// Função auxiliar para buscar o token em qualquer um dos storages
export const obterToken = () => {
  return window.localStorage.getItem(CHAVE_TOKEN) || window.sessionStorage.getItem(CHAVE_TOKEN)
}

// Função auxiliar para buscar o ID do usuário em qualquer um dos storages
export const obterUserId = () => {
  return window.localStorage.getItem(CHAVE_USER_ID) || window.sessionStorage.getItem(CHAVE_USER_ID)
}

// Função para limpar todos os dados de sessão
export const limparSessao = () => {
  const userId = obterUserId()
  const chavesParaLimpar = [
    CHAVE_TOKEN,
    CHAVE_USER_ID,
    `edutrack.insights_${userId}`,
    `edutrack.insights_resumo_${userId}`
  ]
  
  chavesParaLimpar.forEach(chave => {
    window.localStorage.removeItem(chave)
    window.sessionStorage.removeItem(chave)
  })
}

const api = axios.create({
  baseURL: 'http://localhost:8080',
})

// Interceptador para adicionar o token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = obterToken()
    
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
    const isLoginPage = window.location.pathname === '/login'
    const isAuthEndpoint = erro.config?.url?.includes('/auth/login')

    // Só redireciona se não for uma tentativa de login e não estivermos já na página de login
    if (erro.response && erro.response.status === 401 && !isLoginPage && !isAuthEndpoint) {
      limparSessao()
      window.location.href = '/login'
    }
    return Promise.reject(erro)
  }
)

export default api
