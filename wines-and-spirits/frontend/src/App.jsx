import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ProductProvider } from './context/ProductContext'
import AppLayout    from './components/layout/AppLayout'
import LoginPage    from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import POSPage      from './pages/POSPage'
import StockPage    from './pages/StockPage'
import AlertsPage   from './pages/AlertsPage'
import ReportsPage  from './pages/ReportsPage'
import UsersPage    from './pages/UsersPage'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role === 'staff') return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Loading…</div>

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pos"       element={<POSPage />} />
        <Route path="/stock"     element={<StockPage />} />
        <Route path="/alerts"    element={<AlertsPage />} />
        <Route path="/reports"   element={<ProtectedRoute adminOnly><ReportsPage /></ProtectedRoute>} />
        <Route path="/users"     element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}