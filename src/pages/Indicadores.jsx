import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { buscarDashboard } from '../api/client'
import { labelCategoria, labelStatus } from '../constants'
import { useToast } from '../components/ToastContext.jsx'

export default function Indicadores() {
  const { push } = useToast()
  const [data, setData] = useState(null)

  useEffect(() => {
    buscarDashboard().then(setData).catch((err) => push(err.message, 'error'))
  }, [])

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Visão Geral</h1>
          <p>Panorama dos projetos cadastrados no GTI — volume, status e categorias.</p>
        </div>
      </div>

      {!data && <p className="empty-hint">Carregando indicadores...</p>}

      {data && data.totalProjetos === 0 && (
        <div className="corner-frame empty-state">
          <div className="empty-icon">▤</div>
          <h3>Nenhum projeto cadastrado ainda</h3>
          <p>Registre o primeiro projeto para começar a acompanhar indicadores por aqui.</p>
          <Link className="btn btn-primary" to="/novo-projeto">Cadastrar primeiro projeto</Link>
        </div>
      )}

      {data && data.totalProjetos > 0 && (
        <>
          <div className="overview-row">
            <div className="corner-frame total-card">
              <span className="total-label">Total de projetos</span>
              <span className="total-value">{data.totalProjetos}</span>
            </div>
            <div className="overview-actions">
              <Link className="btn btn-primary" to="/novo-projeto">+ Novo projeto</Link>
              <Link className="btn btn-secondary" to="/painel">Ver painel completo</Link>
            </div>
          </div>

          <div className="indicators-grid">
            <div className="corner-frame indicator-block">
              <h3>Por status</h3>
              <Barras entries={data.porStatus} labelFn={labelStatus} variant="status" />
            </div>

            <div className="corner-frame indicator-block">
              <h3>Por categoria</h3>
              <Barras entries={data.porCategoria} labelFn={labelCategoria} variant="categoria" />
            </div>
          </div>
        </>
      )}
    </>
  )
}

function Barras({ entries, labelFn, variant }) {
  const list = Object.entries(entries || {})
  const max = Math.max(1, ...list.map(([, v]) => v))

  if (list.length === 0) {
    return <p className="empty-hint">Sem dados ainda.</p>
  }

  return (
    <div className="bar-list">
      {list.map(([key, value]) => (
        <div className="bar-row" key={key}>
          <span className="bar-label">{labelFn(key)}</span>
          <div className="bar-track">
            <div
              className={`bar-fill ${variant === 'status' ? `bar-${key.toLowerCase()}` : 'bar-categoria'}`}
              style={{ width: `${(value / max) * 100}%` }}
            />
          </div>
          <span className="bar-value">{value}</span>
        </div>
      ))}
    </div>
  )
}
