import { useEffect, useState } from 'react'
import {
  Folder, Pencil, X, User, Calendar, Clock, Activity, CheckCircle2, XCircle,
  Layers, Code2, CircleHelp, Wrench, Circle
} from 'lucide-react'
import { atualizarProjeto, buscarProjeto, excluirProjeto, listarResponsaveis } from '../api/client'
import { CATEGORIAS, STATUS, labelCategoria } from '../constants'
import ConfirmModal from './ConfirmModal.jsx'
import { useToast } from './ToastContext.jsx'

const CATEGORIA_ICONS = {
  INFRAESTRUTURA: Layers,
  DESENVOLVIMENTO: Code2,
  SUPORTE: CircleHelp,
  MANUTENCAO: Wrench,
  OUTROS: Circle
}

const STATUS_ICONS = {
  PLANEJADO: Clock,
  EM_ANDAMENTO: Activity,
  CONCLUIDO: CheckCircle2,
  CANCELADO: XCircle
}

export default function ProjetoDetalhesModal({ projetoId, onClose, onChanged }) {
  const { push } = useToast()
  const [projeto, setProjeto] = useState(null)
  const [responsaveis, setResponsaveis] = useState([])
  const [mode, setMode] = useState('view')
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(false)

  useEffect(() => {
    buscarProjeto(projetoId).then(setProjeto).catch((err) => push(err.message, 'error'))
    listarResponsaveis().then(setResponsaveis).catch(() => {})
  }, [projetoId])

  if (!projeto) return null

  function iniciarEdicao() {
    setForm({
      titulo: projeto.titulo,
      descricao: projeto.descricao,
      responsavelId: projeto.responsavel?.id ?? '',
      categoria: projeto.categoria,
      status: projeto.status
    })
    setMode('edit')
  }

  async function handleStatusRapido(novoStatus) {
    try {
      const atualizado = await atualizarProjeto(projeto.id, {
        titulo: projeto.titulo,
        descricao: projeto.descricao,
        responsavelId: projeto.responsavel.id,
        categoria: projeto.categoria,
        status: novoStatus
      })
      setProjeto(atualizado)
      push('Status atualizado', 'success')
      onChanged?.()
    } catch (err) {
      push(err.message, 'error')
    }
  }

  async function handleSalvar(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const atualizado = await atualizarProjeto(projeto.id, {
        ...form,
        responsavelId: Number(form.responsavelId)
      })
      setProjeto(atualizado)
      setMode('view')
      push('Projeto atualizado com sucesso', 'success')
      onChanged?.()
    } catch (err) {
      push(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function confirmarExclusao() {
    try {
      await excluirProjeto(projeto.id)
      push('Projeto excluído', 'success')
      onChanged?.()
      onClose()
    } catch (err) {
      push(err.message, 'error')
    }
  }

  const StatusIcon = STATUS_ICONS[projeto.status]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="corner-frame detalhes-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detalhes-header">
          <span className="modal-eyebrow">
            <Folder size={13} /> {mode === 'view' ? 'DETALHES DO PROJETO' : 'EDITAR PROJETO'}
          </span>
          <div className="detalhes-header-actions">
            {mode === 'view' && (
              <button className="detalhes-icon-btn" onClick={iniciarEdicao} title="Editar">
                <Pencil size={14} /> Editar
              </button>
            )}
            <button className="detalhes-icon-btn" onClick={onClose} title="Fechar" aria-label="Fechar">
              <X size={16} />
            </button>
          </div>
        </div>

        {mode === 'view' && (
          <>
            <span className="tag-pill tag-pill-lg">
              {(() => {
                const Icon = CATEGORIA_ICONS[projeto.categoria]
                return <Icon size={13} />
              })()}
              {labelCategoria(projeto.categoria).toUpperCase()}
            </span>

            <h2 className="detalhes-title">{projeto.titulo}</h2>

            <div className="detalhes-status-row">
              <span className="detalhes-status-label">Status atual</span>
              <div className={`status-select-pill status-${projeto.status.toLowerCase()}`}>
                <StatusIcon size={13} />
                <select
                  value={projeto.status}
                  onChange={(e) => handleStatusRapido(e.target.value)}
                >
                  {STATUS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="detalhes-block">
              <span className="detalhes-block-label">Descrição</span>
              <div className="detalhes-box">{projeto.descricao}</div>
            </div>

            <div className="detalhes-grid">
              <div className="detalhes-block">
                <span className="detalhes-block-label"><User size={12} /> Responsável</span>
                <div className="detalhes-box">{projeto.responsavel?.nome}</div>
              </div>
              <div className="detalhes-block">
                <span className="detalhes-block-label"><Calendar size={12} /> Criado em</span>
                <div className="detalhes-box">{formatarDataLonga(projeto.dataCriacao)}</div>
              </div>
            </div>

            <div className="detalhes-id">#{projeto.id}</div>

            <div className="detalhes-footer">
              <button className="btn btn-danger" onClick={() => setPendingDelete(true)}>
                Excluir
              </button>
              <button className="btn btn-primary" onClick={iniciarEdicao}>
                <Pencil size={14} /> Editar projeto
              </button>
            </div>
          </>
        )}

        {mode === 'edit' && form && (
          <form onSubmit={handleSalvar} className="detalhes-edit-form">
            <div className="field">
              <label>Título</label>
              <input
                value={form.titulo}
                maxLength={200}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Descrição</label>
              <textarea
                rows={4}
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="field">
                <label>Responsável</label>
                <select
                  value={form.responsavelId}
                  onChange={(e) => setForm({ ...form, responsavelId: e.target.value })}
                >
                  {responsaveis.map((r) => (
                    <option key={r.id} value={r.id}>{r.nome}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Categoria</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="detalhes-status-row">
              <span className="detalhes-status-label">Status</span>
              <div className={`status-select-pill status-${form.status.toLowerCase()}`}>
                {(() => {
                  const Icon = STATUS_ICONS[form.status]
                  return <Icon size={13} />
                })()}
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {STATUS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="detalhes-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setMode('view')}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        )}
      </div>

      {pendingDelete && (
        <ConfirmModal
          title="Excluir projeto"
          message={`Tem certeza que deseja excluir "${projeto.titulo}"? Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          onConfirm={confirmarExclusao}
          onCancel={() => setPendingDelete(false)}
        />
      )}
    </div>
  )
}

function formatarDataLonga(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}           