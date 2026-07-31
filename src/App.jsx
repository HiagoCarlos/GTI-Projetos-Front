import { Route, Routes } from 'react-router-dom'
import Topbar from './components/Topbar.jsx'
import { ToastProvider } from './components/ToastContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { podeCriar, podeEditar } from './permissoes.js'
import NovoProjeto from './pages/NovoProjeto.jsx'
import EditarProjeto from './pages/EditarProjeto.jsx'
import PainelProjetos from './pages/PainelProjetos.jsx'
import Responsaveis from './pages/Responsaveis.jsx'
import Dashboard from './pages/dashboard.jsx'
import Login from './pages/Login.jsx'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="app-shell">
                  <Topbar />
                  <main className="app-content">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route
                        path="/novo-projeto"
                        element={
                          <ProtectedRoute exigir={podeCriar}>
                            <NovoProjeto />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/painel" element={<PainelProjetos />} />
                      <Route
                        path="/projetos/:id/editar"
                        element={
                          <ProtectedRoute exigir={podeEditar}>
                            <EditarProjeto />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/responsaveis" element={<Responsaveis />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}