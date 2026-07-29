import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ProjetoForm from '../components/ProjetoForm.jsx'
import { atualizarProjeto, buscarProjeto } from '../api/client'
import { useToast } from '../components/ToastContext.jsx'

export default function EditarProjeto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { push } = useToast()
  const [initialValue, setInitialValue] = useState(null)
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    buscarProjeto(id)
      .then((data) => {
        setInitialValue({
          titulo: data.titulo,
          descricao: data.descricao,
          responsavelId: data.responsavel?.id ?? '',
          categoria: data.categoria,
          status: data.status
        })
        setMeta({
          dataCriacao: data.dataCriacao,
          dataAtualizacao: data.dataAtualizacao
        })
      })
      .catch((err) => push(err.message, 'error'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(values) {
    try {
      await atualizarProjeto(id, values)
      push('Projeto atualizado com sucesso', 'success')
      navigate('/painel')
    } catch (err) {
      push(err.message, 'error')
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Editar Projeto</h1>
          <p>Atualize as informações do projeto, incluindo o status atual.</p>
        </div>
      </div>

      {loading && <p className="empty-hint">Carregando projeto...</p>}

      {!loading && initialValue && (
        <>
          {meta && (
            <div className="meta-strip">
              <span><strong>Criado em:</strong> {formatarData(meta.dataCriacao)}</span>
              <span><strong>Última atualização:</strong> {formatarData(meta.dataAtualizacao)}</span>
            </div>
          )}
          <ProjetoForm
            initialValue={initialValue}
            submitLabel="Salvar Alterações"
            onSubmit={handleSubmit}
            isEdit
          />
        </>
      )}
    </>
  )
}

function formatarData(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR')
}