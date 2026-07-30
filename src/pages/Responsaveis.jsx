import { useEffect, useMemo, useState } from 'react'
import {
  Plus, Crown, Star, Briefcase, BookOpen, Search, X, Trash2, Save
} from 'lucide-react'
import { criarResponsavel, excluirResponsavel, listarProjetos, listarResponsaveis } from '../api/client'
import { CARGOS, labelCargo } from '../constants'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { useToast } from '../components/ToastContext.jsx'

const CARGO_META = {
  DIRETOR: { icon: Crown, css: 'diretor' },
  VICE_DIRETOR: { icon: Star, css: 'vice_diretor' },
  COORDENADOR: { icon: Briefcase, css: 'coordenador' },
  ANALISTA: { icon: BookOpen, css: 'analista' }
}

const AVATAR_PALETTE = [
  '#8b7cf6', '#f28cb1', '#6db8f2', '#4fd68a', '#fec817', '#f2685c', '#7fd4d4', '#c98cf2'
]

function corAvatar(nome) {
  let hash = 0
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

export default function Responsaveis() {
  const { push } = useToast()
  const [responsaveis, setResponsaveis] = useState([])
  const [projetos, setProjetos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [nome, setNome] = useState('')
  const [cargo, setCargo] = useState('')
  const [saving, setSaving] = useState(false)
  const [busca, setBusca] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)

function carregar() {
  setCarregando(true)
  Promise.all([listarResponsaveis(), listarProjetos({ size: 1000 }).catch(() => [])])
    .then(([resp, proj]) => {
      setResponsaveis(resp)
      setProjetos(Array.isArray(proj) ? proj : proj?.content || [])
    })
    .catch((err) => push(err.message, 'error'))
    .finally(() => setCarregando(false))
}
  useEffect(carregar, [])

  function limparFormulario() {
    setNome('')
    setCargo('')
  }

  function abrirFormulario() {
    setShowForm(true)
  }

  function cancelarFormulario() {
    setShowForm(false)
    limparFormulario()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nome.trim()) {
      push('Informe o nome do responsável', 'error')
      return
    }
    if (!cargo) {
      push('Selecione o cargo do responsável', 'error')
      return
    }
    setSaving(true)
    try {
      await criarResponsavel({ nome: nome.trim(), cargo })
      push('Responsável cadastrado', 'success')
      cancelarFormulario()
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

  function contarProjetos(responsavelId) {
    return projetos.filter((p) => (p.responsavelId ?? p.responsavel?.id) === responsavelId).length
  }

  const grupos = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const filtrados = responsaveis.filter((r) => {
      if (!termo) return true
      return (
        r.nome?.toLowerCase().includes(termo) ||
        labelCargo(r.cargo).toLowerCase().includes(termo)
      )
    })

    const ordem = [...CARGOS.map((c) => c.value), null]
    return ordem
      .map((valorCargo) => ({
        cargo: valorCargo,
        membros: filtrados.filter((r) => (r.cargo || null) === valorCargo)
      }))
      .filter((g) => g.membros.length > 0)
  }, [responsaveis, projetos, busca])

  return (
    <>
      <div className="page-header responsavel-header">
        <div>
          <h1>Responsáveis</h1>
          <p>Equipe do GTI e seus cargos no sistema.</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={abrirFormulario}>
            <Plus size={16} /> Adicionar
          </button>
        )}
      </div>

      {showForm && (
        <form className="corner-frame responsavel-form-card" onSubmit={handleSubmit}>
          <h3 className="responsavel-form-title">Novo responsável</h3>

          <div className="form-row responsavel-form-row">
            <div className="field">
              <label htmlFor="nome">Nome completo</label>
              <input
                id="nome"
                placeholder="Ex: Lucas Mendes"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoFocus
              />
            </div>

            <div className="field">
              <label>Cargo</label>
              <div className="cargo-picker">
                {CARGOS.map((c) => {
                  const Icone = CARGO_META[c.value].icon
                  const selecionado = cargo === c.value
                  return (
                    <button
                      type="button"
                      key={c.value}
                      className={`cargo-option${selecionado ? ' cargo-option-selected' : ''}`}
                      onClick={() => setCargo(c.value)}
                    >
                      <Icone size={16} />
                      {c.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="responsavel-form-actions">
            <button type="button" className="btn btn-secondary" onClick={cancelarFormulario}>
              Cancelar
            </button>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              <Save size={15} /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      )}

      <div className="search-row">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            placeholder="Buscar por nome ou cargo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {busca && (
            <button className="search-clear" onClick={() => setBusca('')} aria-label="Limpar busca">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {!carregando && grupos.length === 0 && (
        <p className="empty-hint">Nenhum responsável encontrado.</p>
      )}

      {grupos.map((grupo) => {
        const meta = grupo.cargo ? CARGO_META[grupo.cargo] : null
        const Icone = meta?.icon
        return (
          <div className="cargo-group" key={grupo.cargo || 'sem-cargo'}>
            <div className="cargo-group-header">
              <span className={`cargo-pill${meta ? ` cargo-${meta.css}` : ' cargo-neutro'}`}>
                {Icone && <Icone size={12} />} {labelCargo(grupo.cargo)}
              </span>
              <span className="cargo-group-count">
                {grupo.membros.length} {grupo.membros.length === 1 ? 'membro' : 'membros'}
              </span>
              <span className="cargo-group-line" />
            </div>

            <div className="responsavel-list">
              {grupo.membros.map((r) => {
                const totalProjetos = contarProjetos(r.id)
                return (
                  <div key={r.id} className="corner-frame responsavel-row">
                    <div className="responsavel-avatar" style={{ background: corAvatar(r.nome || '?') }}>
                      {r.nome?.charAt(0).toUpperCase()}
                    </div>
                    <div className="responsavel-info">
                      <strong>{r.nome}</strong>
                      <span className={meta ? `cargo-text-${meta.css}` : 'cargo-text-neutro'}>
                        {labelCargo(r.cargo)}
                      </span>
                    </div>
                    <span className="responsavel-projeto-count">
                      {totalProjetos === 0 ? 'sem projetos' : `${totalProjetos} projeto${totalProjetos > 1 ? 's' : ''}`}
                    </span>
                    <button className="btn btn-icon" onClick={() => setPendingDelete(r)} title="Remover">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

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