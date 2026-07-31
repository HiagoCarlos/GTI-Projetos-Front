const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const TOKEN_KEY = 'gti_token'

let token = localStorage.getItem(TOKEN_KEY) || null

export function setToken(novoToken) {
  token = novoToken
  if (novoToken) {
    localStorage.setItem(TOKEN_KEY, novoToken)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  })

  if (response.status === 204) {
    return null
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.mensagem || data?.message || 'Erro ao comunicar com a API'
    throw new Error(message)
  }

  return data
}

// ---- Auth ----
export function login(loginUsuario, senha) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ login: loginUsuario, senha })
  })
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