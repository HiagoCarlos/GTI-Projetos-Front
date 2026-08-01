import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, X, SlidersHorizontal, ArrowUpDown, List, LayoutGrid,
  Layers, Code2, CircleHelp, Wrench, Circle, User, Calendar, ChevronRight, Trash2, Folder
} from 'lucide-react'
import { excluirProjeto, listarProjetos } from '../api/client'
import { CATEGORIAS, STATUS, labelCategoria, labelStatus } from '../constants'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { useToast } from '../components/ToastContext.jsx'
import ProjetoDetalhesModal from '../components/ProjetoDetalhesModal.jsx'
import Dropdown from '../components/Dropdown.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { podeExcluir } from '../permissoes.js'

const PAGE_SIZE = 8

const CATEGORIA_ICONS = {
  INFRAESTRUTURA: Layers,
  DESENVOLVIMENTO: Code2,
  SUPORTE: CircleHelp,
  MANUTENCAO: Wrench,
  OUTROS: Circle
}

const SORT_OPTIONS = [
  { value: 'dataAtualizacao,desc', label: 'Mais recentes' },
  { value: 'dataAtualizacao,asc', label: 'Mais antigas' },
  { value: 'titulo,asc', label: 'Título A-Z' }
]

export default function PainelProjetos() {
  const { push } = useToast()
  const { usuario } = useAuth()
  const [projetos, setProjetos] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [detalhesId, setDetalhesId] = useState(null)
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('')
  const [categoria, setCategoria] = useState('')
  const [sort, setSort] = useState('dataAtualizacao,desc')
  const [view, setView] = useState('list')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filtrosAtivos = Boolean(busca || status || categoria)

  const filtros = useMemo(() => ({
    titulo: busca || undefined,
    status: status || undefined,
    categoria: categoria || undefined,
    page,
    size: PAGE_SIZE,
    sort
  }), [busca, status, categoria, page, sort])

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
  }, [busca, status, categoria, sort])

  function limparFiltros() {
    setBusca('')
    setStatus('')
    setCategoria('')
  }

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
          <p>Visualize, filtre e gerencie todos os projetos cadastrados.</p>
        </div>
      </div>

      <div className="search-row">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            placeholder="Buscar por título..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {busca && (
            <button className="search-clear" onClick={() => setBusca('')} aria-label="Limpar busca">
              <X size={14} />
            </button>
          )}
        </div>

        <button
          className={`icon-toggle ${filtersOpen ? 'icon-toggle-active' : ''}`}
          onClick={() => setFiltersOpen((v) => !v)}
          aria-label="Filtros"
          title="Filtros"
        >
          <SlidersHorizontal size={16} />
        </button>

        <Dropdown
          variant="sort"
          icon={ArrowUpDown}
          value={sort}
          onChange={setSort}
          options={SORT_OPTIONS}
        />

        <div className="view-toggle">
          <button
            className={view === 'list' ? 'active' : ''}
            onClick={() => setView('list')}
            aria-label="Visualização em lista"
            title="Lista"
          >
            <List size={16} />
          </button>
          <button
            className={view === 'grid' ? 'active' : ''}
            onClick={() => setView('grid')}
            aria-label="Visualização em grade"
            title="Grade"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div className="corner-frame filter-panel">
          <div className="filter-group">
            <span className="filter-group-label">Status</span>
            <div className="pill-row">
              <button className={`pill ${status === '' ? 'pill-active' : ''}`} onClick={() => setStatus('')}>
                Todos
              </button>
              {STATUS.map((s) => (
                <button
                  key={s.value}
                  className={`pill ${status === s.value ? 'pill-active' : ''}`}
                  onClick={() => setStatus(s.value)}
                >
                  <span className={`pill-dot dot-${s.value.toLowerCase()}`} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-group-label">Categoria</span>
            <div className="pill-row">
              <button className={`pill ${categoria === '' ? 'pill-active' : ''}`} onClick={() => setCategoria('')}>
                Todas
              </button>
              {CATEGORIAS.map((c) => {
                const Icon = CATEGORIA_ICONS[c.value]
                return (
                  <button
                    key={c.value}
                    className={`pill ${categoria === c.value ? 'pill-active' : ''}`}
                    onClick={() => setCategoria(c.value)}
                  >
                    <Icon size={13} />
                    {c.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="results-row">
        <span className="results-count">
          <List size={14} /> {totalElements} projeto{totalElements === 1 ? '' : 's'}
        </span>
        {filtrosAtivos && (
          <button className="reset-filters" onClick={limparFiltros}>
            ‹ ver todos
          </button>
        )}
      </div>

      {loading && <p className="empty-hint">Carregando projetos...</p>}

      {!loading && projetos.length === 0 && (
        filtrosAtivos ? (
          <div className="corner-frame empty-state">
            <div className="empty-icon"><Search size={20} /></div>
            <h3>Nenhum projeto encontrado</h3>
            <p>Ajuste os filtros ou registre um novo projeto para visualizá-lo aqui.</p>
            <Link className="btn btn-primary" to="/novo-projeto">Criar novo projeto</Link>
          </div>
        ) : (
          <div className="corner-frame empty-state">
            <div className="empty-icon"><Folder size={20} /></div>
            <h3>Nenhum projeto cadastrado</h3>
            <p>Registre o primeiro projeto para visualizá-lo aqui no painel.</p>
            <Link className="btn btn-primary" to="/novo-projeto">Criar primeiro projeto</Link>
          </div>
        )
      )}

      {!loading && projetos.length > 0 && (
        <div className={`projeto-collection projeto-collection-${view}`}>
          {projetos.map((p) => {
            const CategoriaIcon = CATEGORIA_ICONS[p.categoria]
            return (
              <div key={p.id} className="corner-frame projeto-card-v2">
                <span className={`card-accent dot-${p.status.toLowerCase()}`} />
                <div className="card-body">
                  <div className="card-header">
                    <h3 className="card-title" title={p.titulo}>{p.titulo}</h3>
                    <span className={`status-badge status-${p.status.toLowerCase()}`}>
                      <span className="dot" />
                      {labelStatus(p.status)}
                    </span>
                  </div>

                  {p.descricao && <p className="card-desc">{p.descricao}</p>}

                  <div className="card-footer-row">
                    <div className="card-tags">
                      <span className="tag-pill">
                        <CategoriaIcon size={13} /> {labelCategoria(p.categoria)}
                      </span>
                      <span className="card-meta-inline"><User size={12} /> {p.responsavelNome}</span>
                      <span className="card-meta-inline"><Calendar size={12} /> {formatarData(p.dataCriacao)}</span>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  {podeExcluir(usuario?.cargo) && (
                    <button
                      className="btn btn-icon"
                      onClick={() => setPendingDelete(p)}
                      title="Excluir"
                      aria-label="Excluir projeto"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <button className="card-details" onClick={() => setDetalhesId(p.id)}>
                    Detalhes <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )
          })}
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
      {detalhesId && (
        <ProjetoDetalhesModal
          projetoId={detalhesId}
          onClose={() => setDetalhesId(null)}
          onChanged={carregar}
        />
      )}
    </>
  )
}

function formatarData(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR')
}