import { useEffect, useState } from 'react'
import { criarResponsavel, excluirResponsavel, listarResponsaveis } from '../api/client'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { useToast } from '../components/ToastContext.jsx'

export default function Responsaveis() {
  const { push } = useToast()
  const [responsaveis, setResponsaveis] = useState([])
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  function carregar() {
    listarResponsaveis().then(setResponsaveis).catch((err) => push(err.message, 'error'))
  }

  useEffect(carregar, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim()) {
      push('Informe o nome do responsável', 'error')
      return
    }
    setSaving(true)
    try {
      await criarResponsavel({ nome, email: email || null })
      setNome('')
      setEmail('')
      push('Responsável cadastrado', 'success')
      carregar()
    } catch (err) {
      push(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function confirmarExclusao() {
    try {
      await excluirResponsavel(pendingDelete.id)
      push('Responsável removido', 'success')
      setPendingDelete(null)
      carregar()
    } catch (err) {
      push('Não é possível remover: responsável vinculado a projetos', 'error')
      setPendingDelete(null)
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Responsáveis</h1>
          <p>Cadastre as pessoas que podem ser designadas como responsáveis por projetos.</p>
        </div>
      </div>

      <form className="corner-frame responsavel-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="nome">Nome</label>
          <input id="nome" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="email">E-mail (opcional)</label>
          <input id="email" placeholder="nome@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Salvando...' : 'Adicionar'}
        </button>
      </form>

      <div className="responsavel-list">
        {responsaveis.map((r) => (
          <div key={r.id} className="corner-frame responsavel-row">
            <div className="responsavel-avatar">{r.nome?.charAt(0).toUpperCase()}</div>
            <div className="responsavel-info">
              <strong>{r.nome}</strong>
              {r.email && <span>{r.email}</span>}
            </div>
            <button className="btn btn-icon" onClick={() => setPendingDelete(r)} title="Remover">✕</button>
          </div>
        ))}
        {responsaveis.length === 0 && <p className="empty-hint">Nenhum responsável cadastrado ainda.</p>}
      </div>

      {pendingDelete && (
        <ConfirmModal
          title="Remover responsável"
          message={`Remover "${pendingDelete.nome}"? Isso só é possível se não houver projetos vinculados a ele.`}
          confirmLabel="Remover"
          onConfirm={confirmarExclusao}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  )
}
