import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, FolderKanban, FolderPlus, Users,
  Folder, Activity, CheckCircle2, UserRound, LogOut
} from 'lucide-react'
import { buscarDashboard } from '../api/client'

const NAV_ITEMS = [
  { to: '/', label: 'Visão Geral', end: true, icon: LayoutDashboard },
  { to: '/painel', label: 'Painel de Projetos', icon: FolderKanban },
  { to: '/novo-projeto', label: 'Novo Projeto', icon: FolderPlus },
  { to: '/responsaveis', label: 'Responsáveis', icon: Users }
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

          <div className="topbar-row-right">
            {totais && (
              <div className="topbar-stats">
                <div className="topbar-stat">
                 
                </div>
                <div className="topbar-stat">
                  
                </div>
                <div className="topbar-stat">
                  
                </div>
              </div>
            )}

            <div className="topbar-account">
              <div className="user-badge">
                <div className="user-avatar">
                  <UserRound size={17} />
                </div>
                <div className="user-badge-text">
                  <strong>Equipe GTI</strong>
                  <span>Área interna</span>
                </div>
              </div>
              <button className="topbar-logout" title="Sair" aria-label="Sair">
                <LogOut size={16} />
              </button>
            </div>

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
        </div>

        <nav className={`topbar-nav${menuAberto ? ' topbar-nav-open' : ''}`}>
          {NAV_ITEMS.map((item) => {
            const Icone = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuAberto(false)}
                className={({ isActive }) => `topbar-link${isActive ? ' topbar-link-active' : ''}`}
              >
                <Icone size={16} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </header>
  )
}