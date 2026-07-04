import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useProducts } from '../../context/ProductContext'
import { LayoutDashboard, ShoppingCart, Package, Bell, BarChart3, Users, LogOut, Menu, X, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',     roles: ['owner','admin','staff'] },
  { to: '/pos',       icon: ShoppingCart,    label: 'Point of Sale', roles: ['owner','admin','staff'], cart: true },
  { to: '/stock',     icon: Package,         label: 'Stock',         roles: ['owner','admin','staff'] },
  { to: '/alerts',    icon: Bell,            label: 'Low Stock',     roles: ['owner','admin','staff'], alert: true },
  { to: '/reports',   icon: BarChart3,       label: 'Reports',       roles: ['owner','admin'] },
  { to: '/users',     icon: Users,           label: 'Users',         roles: ['owner','admin'] },
]

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-2xl">🍷</span>
      <div>
        <p className="text-sm font-bold text-slate-900 leading-tight">Biggie Chill Spot</p>
        <p className="text-xs text-slate-400">Wines &amp; Spirits</p>
      </div>
    </div>
  )
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { count }        = useCart()
  const { products }     = useProducts()
  const navigate         = useNavigate()
  const [open, setOpen]  = useState(false)

  // Derived live from ProductContext — updates automatically whenever
  // refresh() runs anywhere in the app (after add/edit/delete/adjust),
  // no separate fetch or stale snapshot involved.
  const alertCount = products.filter(p => p.stock <= p.threshold).length

  const nav = NAV.filter(n => n.roles.includes(user?.role))

  const handleLogout = () => { logout(); navigate('/login') }

  const SidebarInner = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="px-5 py-5 border-b border-slate-100"><Logo /></div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label, alert, cart }) => (
          <NavLink key={to} to={to} onClick={() => setOpen(false)}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
              isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}>
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'} />
                <span className="flex-1">{label}</span>
                {alert && alertCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{alertCount}</span>
                )}
                {cart && count > 0 && (
                  <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">{count}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-700 text-sm shrink-0">
            {user?.name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-ghost w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50 text-sm">
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-100 z-20 shadow-soft">
        <SidebarInner />
      </aside>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-64 z-50 shadow-xl">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 z-10">
              <X size={18} />
            </button>
            <SidebarInner />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:pl-60">
        <header className="lg:hidden sticky top-0 z-10 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100">
            <Menu size={20} />
          </button>
          <Logo />
          {alertCount > 0 && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-red-600 font-medium">
              <AlertTriangle size={13} />{alertCount} low stock
            </div>
          )}
        </header>

        <main className="flex-1 p-4 lg:p-6 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}