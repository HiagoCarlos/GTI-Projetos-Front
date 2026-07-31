import { useEffect, useState } from 'react'
import {
  Folder, Pencil, X, User, Calendar, Clock, Activity, CheckCircle2, XCircle,
  Layers, Code2, CircleHelp, Wrench, Circle
} from 'lucide-react'
import { atualizarProjeto, buscarProjeto, excluirProjeto, listarResponsaveis } from '../api/client'
import { CATEGORIAS, STATUS, labelCategoria, labelStatus } from '../constants'
import ConfirmModal from './ConfirmModal.jsx'
import Dropdown from './Dropdown.jsx'
import { useToast } from './ToastContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { podeEditar, podeExcluir } from '../permissoes.js'

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
  const { usuario } = useAuth()
  const [projeto, setProjeto] = useState(null)
  const [responsaveis, setResponsaveis] = useState([])
  const [mode, setMode] = useState('view')
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(false)

  const podeEditarProjeto = podeEditar(usuario?.cargo)
  const podeExcluirProjeto = podeExcluir(usuario?.cargo)

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
            {mode === 'view' && podeEditarProjeto && (
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
              {podeEditarProjeto ? (
                <Dropdown
                  variant="pill"
                  className={`status-${projeto.status.toLowerCase()}`}
                  icon={StatusIcon}
                  value={projeto.status}
                  onChange={handleStatusRapido}
                  options={STATUS}
                />
              ) : (
                <span className={`status-badge status-${projeto.status.toLowerCase()}`}>
                  <span className="dot" />
                  {labelStatus(projeto.status)}
                </span>
              )}
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
              {podeExcluirProjeto ? (
                <button className="btn btn-danger" onClick={() => setPendingDelete(true)}>
                  Excluir
                </button>
              ) : <span />}
              {podeEditarProjeto && (
                <button className="btn btn-primary" onClick={iniciarEdicao}>
                  <Pencil size={14} /> Editar projeto
                </button>
              )}
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
                <Dropdown
                  variant="field"
                  placeholder="Selecione um responsável"
                  value={form.responsavelId}
                  onChange={(v) => setForm({ ...form, responsavelId: v })}
                  options={responsaveis.map((r) => ({ value: r.id, label: r.nome }))}
                />
              </div>
              <div className="field">
                <label>Categoria</label>
                <Dropdown
                  variant="field"
                  value={form.categoria}
                  onChange={(v) => setForm({ ...form, categoria: v })}
                  options={CATEGORIAS}
                />
              </div>
            </div>

            <div className="detalhes-status-row">
              <span className="detalhes-status-label">Status</span>
              <Dropdown
                variant="pill"
                className={`status-${form.status.toLowerCase()}`}
                icon={STATUS_ICONS[form.status]}
                value={form.status}
                onChange={(v) => setForm({ ...form, status: v })}
                options={STATUS}
              />
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
