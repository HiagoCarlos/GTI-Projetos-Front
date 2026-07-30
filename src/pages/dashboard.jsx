import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Folder, Activity, CheckCircle2, Clock, UserRound } from 'lucide-react'
import { buscarDashboard, listarProjetos } from '../api/client'
import { labelStatus } from '../constants'
import { useToast } from '../components/ToastContext.jsx'

export default function Dashboard() {
  const { push } = useToast()
  const [dados, setDados] = useState(null)
  const [recentes, setRecentes] = useState([])

  useEffect(() => {
    buscarDashboard().then(setDados).catch((err) => push(err.message, 'error'))
    listarProjetos({ sort: 'dataAtualizacao,desc', size: 5, page: 0 })
      .then((data) => setRecentes(data.content || []))
      .catch(() => {})
  }, [])

  if (!dados) return <p className="empty-hint">Carregando dashboard...</p>

  if (dados.totalProjetos === 0) {
    return (
      <>
        <div className="page-header">
          <div>
            <h1>Visão Geral</h1>
            <p>Panorama dos projetos cadastrados no GTI.</p>
          </div>
        </div>
        <div className="corner-frame empty-state">
          <div className="empty-icon"><Folder size={22} /></div>
          <h3>Nenhum projeto cadastrado ainda</h3>
          <p>Registre o primeiro projeto para começar a acompanhar indicadores por aqui.</p>
          <Link className="btn btn-primary" to="/novo-projeto">Cadastrar primeiro projeto</Link>
        </div>
      </>
    )
  }

  const emAndamento = dados.porStatus?.EM_ANDAMENTO || 0
  const concluidos = dados.porStatus?.CONCLUIDO || 0
  const planejados = dados.porStatus?.PLANEJADO || 0

  return (
    <>
      <div className="overview-header">
        <h1>Visão Geral</h1>
       
      </div>

      <div className="stat-grid">
        <StatCard label="Total de Projetos" value={dados.totalProjetos} icon={<Folder size={18} />} bgIcon={<Folder size={84} strokeWidth={1.4} />} variant="neutral" />
<StatCard label="Em Andamento" value={emAndamento} icon={<Activity size={18} />} bgIcon={<Activity size={84} strokeWidth={1.4} />} variant="accent" />
<StatCard label="Concluídos" value={concluidos} icon={<CheckCircle2 size={18} />} bgIcon={<CheckCircle2 size={84} strokeWidth={1.4} />} variant="success" />
<StatCard label="Planejados" value={planejados} icon={<Clock size={18} />} bgIcon={<Clock size={84} strokeWidth={1.4} />} variant="info" />
      </div>

      <div className="corner-frame activity-panel">
        <div className="activity-header">
          <Activity size={16} />
          <h3>Atividade Recente</h3>
        </div>
        <div className="activity-list">
          {recentes.length === 0 && <p className="empty-hint">Nenhuma atividade ainda.</p>}
          {recentes.map((p) => (
            <div className="activity-row" key={p.id}>
              <div>
                <p className="activity-title">{p.titulo}</p>
                <span className="activity-time">Atualizado {tempoRelativo(p.dataAtualizacao)}</span>
              </div>
              <span className={`status-badge status-${p.status.toLowerCase()}`}>
                {labelStatus(p.status)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function StatCard({ label, value, icon, bgIcon, variant }) {
  return (
    <div className={`corner-frame stat-card stat-card-${variant}`}>
      <div className="stat-card-bg-icon">{bgIcon}</div>
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        <span className={`stat-card-icon stat-icon-${variant}`}>{icon}</span>
      </div>
      <span className="stat-card-value">{value}</span>
    </div>
  )
}

function tempoRelativo(iso) {
  if (!iso) return ''
  const diffMs = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return 'agora mesmo'
  if (min < 60) return `há ${min} minuto${min > 1 ? 's' : ''}`
  const horas = Math.floor(min / 60)
  if (horas < 24) return `há cerca de ${horas} hora${horas > 1 ? 's' : ''}`
  const dias = Math.floor(horas / 24)
  return `há ${dias} dia${dias > 1 ? 's' : ''}`
}