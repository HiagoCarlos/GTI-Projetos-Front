import { useState } from 'react'
import { Terminal, ArrowRight } from 'lucide-react'

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    // Autenticação real ainda não implementada.
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

        <button className="btn btn-primary login-submit" type="submit">
          Autenticar <ArrowRight size={16} />
        </button>
      </form>
    </div>
  )
}