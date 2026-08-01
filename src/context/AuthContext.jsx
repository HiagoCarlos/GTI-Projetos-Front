import { createContext, useContext, useEffect, useState } from 'react'
import { autenticar } from '../api/client'

const TOKEN_KEY = 'gti_token'
const USUARIO_KEY = 'gti_usuario'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem(USUARIO_KEY)
    return salvo ? JSON.parse(salvo) : null
  })

  useEffect(() => {
    if (usuario) {
      localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario))
    } else {
      localStorage.removeItem(USUARIO_KEY)
    }
  }, [usuario])

  async function login(id, senha) {
    const data = await autenticar(id, senha)
    localStorage.setItem(TOKEN_KEY, data.token)
    setUsuario({ nome: data.nome, cargo: data.cargo })
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
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