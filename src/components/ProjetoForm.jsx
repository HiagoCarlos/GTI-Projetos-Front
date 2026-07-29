import { useEffect, useState } from 'react'
import { CATEGORIAS, STATUS } from '../constants'
import { listarResponsaveis } from '../api/client'

const EMPTY = {
  titulo: '',
  descricao: '',
  responsavelId: '',
  categoria: 'INFRAESTRUTURA',
  status: 'PLANEJADO'
}

export default function ProjetoForm({ initialValue, submitLabel, onSubmit, onChange, isEdit = false }) {
  const [values, setValues] = useState(initialValue || EMPTY)
  const [responsaveis, setResponsaveis] = useState([])
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    listarResponsaveis().then(setResponsaveis).catch(() => {})
  }, [])

  useEffect(() => {
    if (initialValue) setValues(initialValue)
  }, [initialValue])

  useEffect(() => {
    onChange?.(values, responsaveis)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, responsaveis])

  function handleChange(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: null }))
  }

  function validate() {
    const next = {}
    if (!values.titulo?.trim()) next.titulo = 'Informe o título do projeto'
    if (!values.descricao?.trim()) next.descricao = 'Informe a descrição'
    if (!values.responsavelId) next.responsavelId = 'Selecione um responsável'
    if (!values.categoria) next.categoria = 'Selecione uma categoria'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      await onSubmit({ ...values, responsavelId: Number(values.responsavelId) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="corner-frame form-card" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="titulo">Título do projeto</label>
        <input
          id="titulo"
          placeholder="Ex: Migração de Servidores"
          value={values.titulo}
          onChange={(e) => handleChange('titulo', e.target.value)}
        />
        {errors.titulo && <span className="field-error">{errors.titulo}</span>}
      </div>

      <div className="field">
        <label htmlFor="descricao">Descrição</label>
        <textarea
          id="descricao"
          rows={5}
          placeholder="Objetivos, escopo e contexto do projeto..."
          value={values.descricao}
          onChange={(e) => handleChange('descricao', e.target.value)}
        />
        {errors.descricao && <span className="field-error">{errors.descricao}</span>}
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="responsavel">Responsável</label>
          <select
            id="responsavel"
            value={values.responsavelId}
            onChange={(e) => handleChange('responsavelId', e.target.value)}
          >
            <option value="">Selecione um responsável</option>
            {responsaveis.map((r) => (
              <option key={r.id} value={r.id}>{r.nome}</option>
            ))}
          </select>
          {errors.responsavelId && <span className="field-error">{errors.responsavelId}</span>}
        </div>

        <div className="field">
          <label htmlFor="categoria">Categoria</label>
          <select
            id="categoria"
            value={values.categoria}
            onChange={(e) => handleChange('categoria', e.target.value)}
          >
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {isEdit && (
        <div className="field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={values.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            {STATUS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      )}

      {!isEdit && (
        <div className="info-banner">
          <span>◷</span>
          O projeto será criado com o status <strong>Planejado</strong>. Altere o status pelo painel de projetos após o cadastro.
        </div>
      )}

      <button className="btn btn-primary form-submit" type="submit" disabled={saving}>
        {saving ? 'Salvando...' : submitLabel}
      </button>
    </form>
  )
}
