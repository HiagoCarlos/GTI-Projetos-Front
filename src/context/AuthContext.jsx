import { createContext, useContext, useEffect, useState } from 'react'

// Usuários de teste -- enquanto não existe endpoint de autenticação na API,
// o login valida contra essa lista local. Trocar por chamada real
// (ex: POST /api/auth/login) quando o back-end tiver esse endpoint.
const MOCK_USUARIOS = [
  { id: 'diretor', senha: '1234', nome: 'Ana Diretora', cargo: 'DIRETOR' },
  { id: 'vice', senha: '1234', nome: 'Bruno Vice', cargo: 'VICE_DIRETOR' },
  { id: 'coordenador', senha: '1234', nome: 'Carla Coordenadora', cargo: 'COORDENADOR' },
  { id: 'analista', senha: '1234', nome: 'Diego Analista', cargo: 'ANALISTA' }
]

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

  function login(id, senha) {
    const encontrado = MOCK_USUARIOS.find((u) => u.id === id && u.senha === senha)
    if (!encontrado) {
      throw new Error('ID ou senha inválidos')
    }
    setUsuario({ nome: encontrado.nome, cargo: encontrado.cargo })
  }

  function logout() {
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