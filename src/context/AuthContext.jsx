import { createContext, useContext, useEffect, useState } from 'react'
import { login as apiLogin, setToken } from '../api/client.js'

const STORAGE_KEY = 'gti_usuario'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem(STORAGE_KEY)
    return salvo ? JSON.parse(salvo) : null
  })

  useEffect(() => {
    if (usuario) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [usuario])

  async function login(id, senha) {
    const resposta = await apiLogin(id, senha)
    setToken(resposta.token)
    setUsuario({ nome: resposta.nome, cargo: resposta.cargo })
  }

  function logout() {
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
