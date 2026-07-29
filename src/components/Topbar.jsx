import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { buscarDashboard } from '../api/client'

const NAV_ITEMS = [
  { to: '/', label: 'Visão Geral', end: true },
  { to: '/painel', label: 'Painel de Projetos' },
  { to: '/novo-projeto', label: 'Novo Projeto' },
  { to: '/responsaveis', label: 'Responsáveis' }
]

export default function Topbar() {
  const [totais, setTotais] = useState(null)
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    buscarDashboard().then(setTotais).catch(() => {})
  }, [])

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-row">
          <div className="brand">
            <span className="brand-mark">GTI</span>
            <div>
              <div className="brand-title">Sistema de Projetos</div>
              <span className="brand-sub">Gestão de Tecnologia da Informação</span>
            </div>
          </div>

          {totais && (
            <div className="topbar-stats">
              <div className="topbar-stat">
                <strong>{totais.totalProjetos}</strong>
                <span>total</span>
              </div>
              <div className="topbar-stat">
                <strong>{totais.porStatus?.EM_ANDAMENTO || 0}</strong>
                <span>ativos</span>
              </div>
              <div className="topbar-stat">
                <strong>{totais.porStatus?.CONCLUIDO || 0}</strong>
                <span>concluídos</span>
              </div>
            </div>
          )}

          <button
            className="menu-toggle"
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
            onClick={() => setMenuAberto((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav className={`topbar-nav${menuAberto ? ' topbar-nav-open' : ''}`}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuAberto(false)}
              className={({ isActive }) => `topbar-link${isActive ? ' topbar-link-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
