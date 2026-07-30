import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check, ChevronLeft, ChevronRight, Plus, Pencil, User, Calendar,
  Layers, Code2, CircleHelp, Wrench, Circle, CheckCircle2
} from 'lucide-react'
import { criarProjeto, listarResponsaveis } from '../api/client'
import { CATEGORIAS, labelCategoria } from '../constants'
import { useToast } from '../components/ToastContext.jsx'
import Dropdown from '../components/Dropdown.jsx'

const CATEGORIA_ICONS = {
  INFRAESTRUTURA: Layers,
  DESENVOLVIMENTO: Code2,
  SUPORTE: CircleHelp,
  MANUTENCAO: Wrench,
  OUTROS: Circle
}

const STEPS = [
  { key: 'categoria', label: 'Categoria' },
  { key: 'projeto', label: 'Projeto' },
  { key: 'detalhes', label: 'Detalhes' },
  { key: 'revisao', label: 'Revisão' }
]

const TITULO_MAX = 80

function hoje() {
  return new Date().toISOString().slice(0, 10)
}

export default function NovoProjeto() {
  const navigate = useNavigate()
  const { push } = useToast()

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [responsaveis, setResponsaveis] = useState([])

  const [categoria, setCategoria] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [responsavelId, setResponsavelId] = useState('')
  const [dataInicio, setDataInicio] = useState(hoje())

  useEffect(() => {
    listarResponsaveis().then(setResponsaveis).catch(() => {})
  }, [])

  const responsavelNome = useMemo(
    () => responsaveis.find((r) => String(r.id) === String(responsavelId))?.nome,
    [responsaveis, responsavelId]
  )

  const podeAvancar = useMemo(() => {
    if (step === 0) return Boolean(categoria)
    if (step === 1) return Boolean(titulo.trim()) && Boolean(descricao.trim())
    if (step === 2) return Boolean(responsavelId) && Boolean(dataInicio)
    return true
  }, [step, categoria, titulo, descricao, responsavelId, dataInicio])

  function irPara(indice) {
    setStep(indice)
  }

  function avancar() {
    if (!podeAvancar) return
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function voltar() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function registrarProjeto() {
    setSaving(true)
    try {
      await criarProjeto({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        responsavelId: Number(responsavelId),
        categoria
      })
      push('Projeto cadastrado com sucesso', 'success')
      navigate('/painel')
    } catch (err) {
      push(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const CategoriaIconSelecionada = categoria ? CATEGORIA_ICONS[categoria] : null
  const progresso = (step / (STEPS.length - 1)) * 100

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Novo Projeto</h1>
          <p>Siga as etapas para registrar um projeto no sistema GTI.</p>
        </div>
      </div>

      <div className="wizard-steps">
        {STEPS.map((s, i) => (
          <div className="wizard-step-item" key={s.key}>
            <div className="wizard-step">
              <span
                className={`wizard-step-circle ${
                  i < step ? 'wizard-step-done' : i === step ? 'wizard-step-active' : ''
                }`}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </span>
              <span
                className={`wizard-step-label ${
                  i < step ? 'wizard-step-label-done' : i === step ? 'wizard-step-label-active' : ''
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span className={`wizard-step-connector ${i < step ? 'wizard-step-connector-done' : ''}`} />
            )}
          </div>
        ))}
      </div>
      <div className="wizard-progress">
        <div className="wizard-progress-fill" style={{ width: `${progresso}%` }} />
      </div>

      <div className="corner-frame wizard-body">
        {step === 0 && (
          <>
            <div className="wizard-step-heading">
              <h3>Qual o tipo do projeto?</h3>
              <p>Escolha a categoria que melhor representa a iniciativa.</p>
            </div>

            <div className="category-grid">
              {CATEGORIAS.map((c) => {
                const Icon = CATEGORIA_ICONS[c.value]
                const selecionada = categoria === c.value
                return (
                  <button
                    type="button"
                    key={c.value}
                    className={`category-card ${selecionada ? 'category-card-selected' : ''}`}
                    onClick={() => setCategoria(c.value)}
                  >
                    {selecionada && (
                      <span className="category-card-badge">
                        <CheckCircle2 size={16} />
                      </span>
                    )}
                    <Icon size={22} className="category-card-icon" />
                    <strong>{c.label}</strong>
                    <p>{c.descricaoCurta}</p>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="wizard-step-heading">
              <h3>Defina a identidade do projeto</h3>
              <p>Um bom título resume a iniciativa. A descrição contextualiza o time.</p>
            </div>

            <div className="wizard-title-row">
              <input
                className="wizard-title-input"
                value={titulo}
                maxLength={TITULO_MAX}
                placeholder="Título do projeto"
                onChange={(e) => setTitulo(e.target.value)}
                autoFocus
              />
              <span className="wizard-title-counter">{titulo.length}/{TITULO_MAX}</span>
            </div>
            <p className="wizard-hint">Seja direto — evite siglas sem contexto.</p>

            <div className="field wizard-field-spaced">
              <label>Descrição</label>
              <textarea
                rows={5}
                value={descricao}
                placeholder="Objetivos, escopo e contexto do projeto..."
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="wizard-step-heading">
              <h3>Responsável e prazo</h3>
              <p>Quem lidera e quando o projeto foi iniciado.</p>
            </div>

            <div className="field">
              <label><User size={12} /> Responsável</label>
              <Dropdown
                variant="field"
                placeholder="Selecione um responsável"
                value={responsavelId}
                onChange={setResponsavelId}
                options={responsaveis.map((r) => ({ value: r.id, label: r.nome }))}
              />
            </div>

            <div className="field wizard-field-spaced">
              <label><Calendar size={12} /> Data de início</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="wizard-step-heading">
              <h3>Tudo certo?</h3>
              <p>Confirme os dados antes de registrar o projeto no sistema.</p>
            </div>

            <div className="wizard-preview-card">
              <div className="wizard-preview-top">
                <span className="tag-pill wizard-preview-categoria">
                  {CategoriaIconSelecionada && <CategoriaIconSelecionada size={13} />}
                  {labelCategoria(categoria).toUpperCase()}
                </span>
                <span className="status-badge status-planejado">
                  <span className="dot" /> Planejado
                </span>
              </div>

              <h3 className="wizard-preview-title">{titulo}</h3>
              <p className="wizard-preview-desc">{descricao}</p>

              <div className="wizard-preview-meta">
                <span><User size={12} /> {responsavelNome}</span>
                <span><Calendar size={12} /> {formatarDataLonga(dataInicio)}</span>
              </div>
            </div>

            <div className="wizard-edit-row">
              <button type="button" className="wizard-edit-chip" onClick={() => irPara(0)}>
                <Pencil size={12} /> Categoria
              </button>
              <button type="button" className="wizard-edit-chip" onClick={() => irPara(1)}>
                <Pencil size={12} /> Título e descrição
              </button>
              <button type="button" className="wizard-edit-chip" onClick={() => irPara(2)}>
                <Pencil size={12} /> Responsável e data
              </button>
            </div>
          </>
        )}
      </div>

      <div className="wizard-nav">
        {step > 0 ? (
          <button type="button" className="btn btn-secondary" onClick={voltar}>
            <ChevronLeft size={14} /> Voltar
          </button>
        ) : <span />}

        {step < STEPS.length - 1 ? (
          <button type="button" className="btn btn-primary" disabled={!podeAvancar} onClick={avancar}>
            {step === 2 ? 'Revisar' : 'Próximo'} <ChevronRight size={14} />
          </button>
        ) : (
          <button type="button" className="btn btn-primary" disabled={saving} onClick={registrarProjeto}>
            <Plus size={14} /> {saving ? 'Registrando...' : 'Registrar Projeto'}
          </button>
        )}
      </div>
    </>
  )
}

function formatarDataLonga(isoData) {
  if (!isoData) return ''
  const [ano, mes, dia] = isoData.split('-').map(Number)
  return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}
