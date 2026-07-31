import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Terminal, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../components/ToastContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [entrando, setEntrando] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setEntrando(true)
    try {
      login(usuario, senha)
      navigate('/', { replace: true })
    } catch (err) {
      push(err.message, 'error')
    } finally {
      setEntrando(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="login-icon">
        <Terminal size={22} />
      </div>

      <form className="corner-frame login-card" onSubmit={handleSubmit}>
        <h1 className="login-title">GTI Portal</h1>
        <p className="login-subtitle">Gestão de Projetos e Iniciativas</p>

        <div className="field">
          <input
            placeholder="ID do Usuário"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
        </div>

        <div className="field">
          <input
            type="password"
            placeholder="Senha de Acesso"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <button className="btn btn-primary login-submit" type="submit" disabled={entrando}>
          {entrando ? 'Entrando...' : 'Autenticar'} <ArrowRight size={16} />
        </button>
      </form>
    </div>
  )
}