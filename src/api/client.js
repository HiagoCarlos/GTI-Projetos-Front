const BASE_URL = import.meta.env.VITE_API_URL || 'https://registroprojetos-api.onrender.com/api'
const TOKEN_KEY = 'gti_token'
const USUARIO_KEY = 'gti_usuario'

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY)

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  })

  if (response.status === 401 && !path.startsWith('/auth')) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USUARIO_KEY)
    window.location.href = '/login'
    return null
  }

  if (response.status === 204) {
    return null
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
  const message =
    data?.mensagem ||
    data?.message ||
    (data && typeof data === 'object' ? Object.values(data)[0] : null) ||
    'Erro ao comunicar com a API'
  throw new Error(message)
}
  return data
}

// ---- Autenticação ----
export function autenticar(login, senha) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ login, senha }) })
}

// ---- Projetos ----
export function listarProjetos(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  ).toString()
  return request(`/projetos${query ? `?${query}` : ''}`)
}

export function buscarProjeto(id) {
  return request(`/projetos/${id}`)
}

export function criarProjeto(payload) {
  return request('/projetos', { method: 'POST', body: JSON.stringify(payload) })
}

export function atualizarProjeto(id, payload) {
  return request(`/projetos/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function excluirProjeto(id) {
  return request(`/projetos/${id}`, { method: 'DELETE' })
}

// ---- Responsáveis ----
export function listarResponsaveis() {
  return request('/responsaveis')
}

export function criarResponsavel(payload) {
  return request('/responsaveis', { method: 'POST', body: JSON.stringify(payload) })
}

export function atualizarResponsavel(id, payload) {
  return request(`/responsaveis/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function excluirResponsavel(id) {
  return request(`/responsaveis/${id}`, { method: 'DELETE' })
}

// ---- Dashboard ----
export function buscarDashboard() {
  return request('/dashboard')
}
