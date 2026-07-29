import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { excluirProjeto, listarProjetos } from '../api/client'
import { CATEGORIAS, STATUS, labelCategoria, labelStatus } from '../constants'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { useToast } from '../components/ToastContext.jsx'

const PAGE_SIZE = 8

export default function PainelProjetos() {
  const { push } = useToast()
  const [projetos, setProjetos] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pendingDelete, setPendingDelete] = useState(null)

  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('')
  const [categoria, setCategoria] = useState('')

  const filtros = useMemo(() => ({
    titulo: busca || undefined,
    status: status || undefined,
    categoria: categoria || undefined,
    page,
    size: PAGE_SIZE,
    sort: 'dataCriacao,desc'
  }), [busca, status, categoria, page])

  async function carregar() {
    setLoading(true)
    try {
      const data = await listarProjetos(filtros)
      setProjetos(data.content || [])
      setTotalPages(data.totalPages ?? 0)
      setTotalElements(data.totalElements ?? 0)
    } catch (err) {
      push(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros])

  useEffect(() => {
    setPage(0)
  }, [busca, status, categoria])

  async function confirmarExclusao() {
    try {
      await excluirProjeto(pendingDelete.id)
      push('Projeto excluído', 'success')
      setPendingDelete(null)
      carregar()
    } catch (err) {
      push(err.message, 'error')
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Painel de Projetos</h1>
          <p>Visualize, filtre e gerencie o status de todos os projetos cadastrados.</p>
        </div>
      </div>

      <div className="panel-toolbar">
        <div className="results-count">
          <span>▤</span> {totalElements} projeto{totalElements === 1 ? '' : 's'}
        </div>
        <div className="toolbar-filters">
          <input
            className="search-input"
            placeholder="Buscar por título..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos os status</option>
            {STATUS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Todas as categorias</option>
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="empty-hint">Carregando projetos...</p>}

      {!loading && projetos.length === 0 && (
        <div className="corner-frame empty-state">
          <div className="empty-icon">▤</div>
          <h3>Nenhum projeto encontrado</h3>
          <p>Ajuste os filtros ou registre um novo projeto para visualizá-lo aqui.</p>
          <Link className="btn btn-primary" to="/novo-projeto">Criar novo projeto</Link>
        </div>
      )}

      {!loading && projetos.length > 0 && (
        <div className="table-wrap corner-frame">
          <table className="data-table">
  <thead>
    <tr>
      <th>Projeto</th>
      <th>Categoria</th>
      <th>Responsável</th>
      <th>Criado em</th>
      <th>Atualizado em</th>
      <th>Status</th>
      <th aria-label="Ações"></th>
    </tr>
  </thead>
  <tbody>
    {projetos.map((p) => (
      <tr key={p.id}>
        <td data-label="Projeto">
          <span className="table-title">{p.titulo}</span>
        </td>
        <td data-label="Categoria">{labelCategoria(p.categoria)}</td>
        <td data-label="Responsável">{p.responsavelNome}</td>
        <td data-label="Criado em"><span className="meta-date">{formatarData(p.dataCriacao)}</span></td>
        <td data-label="Atualizado em"><span className="meta-date">{formatarData(p.dataAtualizacao)}</span></td>
        <td data-label="Status">
          <span className={`status-badge status-${p.status.toLowerCase()}`}>
            <span className="dot" />
            {labelStatus(p.status)}
          </span>
        </td>
        <td data-label="Ações" className="table-actions">
          <Link className="btn btn-icon" to={`/projetos/${p.id}/editar`} title="Editar">✎</Link>
          <button className="btn btn-icon" onClick={() => setPendingDelete(p)} title="Excluir">✕</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </button>
          <span className="pagination-info">Página {page + 1} de {totalPages}</span>
          <button className="btn btn-secondary" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Próxima
          </button>
        </div>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Excluir projeto"
          message={`Tem certeza que deseja excluir "${pendingDelete.titulo}"? Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          onConfirm={confirmarExclusao}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  )
}

function formatarData(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  return date.toLocaleDateString('pt-BR')
}
