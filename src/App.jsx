import { Route, Routes } from 'react-router-dom'
import Topbar from './components/Topbar.jsx'
import { ToastProvider } from './components/ToastContext.jsx'
import NovoProjeto from './pages/NovoProjeto.jsx'
import EditarProjeto from './pages/EditarProjeto.jsx'
import PainelProjetos from './pages/PainelProjetos.jsx'
import Responsaveis from './pages/Responsaveis.jsx'
import Dashboard from './pages/dashboard.jsx'
import Login from './pages/Login.jsx'

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <div className="app-shell">
              <Topbar />
              <main className="app-content">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/novo-projeto" element={<NovoProjeto />} />
                  <Route path="/painel" element={<PainelProjetos />} />
                  <Route path="/projetos/:id/editar" element={<EditarProjeto />} />
                  <Route path="/responsaveis" element={<Responsaveis />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </ToastProvider>
  )
}