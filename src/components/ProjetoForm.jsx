import { useEffect, useState } from 'react'
import { CATEGORIAS, STATUS } from '../constants'
import { listarResponsaveis } from '../api/client'
import Dropdown from './Dropdown.jsx'

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
          <Dropdown
            id="responsavel"
            variant="field"
            placeholder="Selecione um responsável"
            value={values.responsavelId}
            onChange={(v) => handleChange('responsavelId', v)}
            options={responsaveis.map((r) => ({ value: r.id, label: r.nome }))}
          />
          {errors.responsavelId && <span className="field-error">{errors.responsavelId}</span>}
        </div>

        <div className="field">
          <label htmlFor="categoria">Categoria</label>
          <Dropdown
            id="categoria"
            variant="field"
            value={values.categoria}
            onChange={(v) => handleChange('categoria', v)}
            options={CATEGORIAS}
          />
        </div>
      </div>

      {isEdit && (
        <div className="field">
          <label htmlFor="status">Status</label>
          <Dropdown
            id="status"
            variant="field"
            value={values.status}
            onChange={(v) => handleChange('status', v)}
            options={STATUS}
          />
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
