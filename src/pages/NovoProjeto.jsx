import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import ProjetoForm from '../components/ProjetoForm.jsx'
import { criarProjeto } from '../api/client'
import { useToast } from '../components/ToastContext.jsx'
import { labelCategoria } from '../constants'

export default function NovoProjeto() {
  const navigate = useNavigate()
  const { push } = useToast()
  const [preview, setPreview] = useState(null)
  const [responsaveis, setResponsaveis] = useState([])

  async function handleSubmit(values) {
    try {
      const { status, ...payload } = values
      await criarProjeto(payload)
      push('Projeto cadastrado com sucesso', 'success')
      navigate('/painel')
    } catch (err) {
      push(err.message, 'error')
    }
  }

  function handleChange(values, respList) {
    setPreview(values)
    setResponsaveis(respList)
  }

  const responsavelNome = responsaveis.find(
    (r) => String(r.id) === String(preview?.responsavelId)
  )?.nome

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Cadastrar Projeto</h1>
          <p>Preencha os campos abaixo para registrar um novo projeto no sistema do GTI.</p>
        </div>
      </div>

      <div className="cadastro-layout">
        <ProjetoForm submitLabel="Registrar Projeto" onSubmit={handleSubmit} onChange={handleChange} />

        <aside className="preview-panel corner-frame">
          <span className="preview-label">Pré-visualização</span>
          <div className="preview-card">
            <div className="preview-title-row">
              <h4>{preview?.titulo?.trim() || 'Título do projeto'}</h4>
              <span className="status-badge status-planejado">
                <span className="dot" /> Planejado
              </span>
            </div>
            <p className="preview-desc">
              {preview?.descricao?.trim() || 'A descrição informada aparecerá aqui conforme você digita.'}
            </p>
            <div className="preview-meta">
              <span>{preview?.categoria ? labelCategoria(preview.categoria) : 'Categoria'}</span>
              <span className="meta-sep">·</span>
              <span>{responsavelNome || 'Responsável'}</span>
            </div>
          </div>
          <p className="preview-hint">
            É assim que o projeto vai aparecer no Painel de Projetos assim que for registrado.
          </p>
        </aside>
      </div>
    </>
  )
}
