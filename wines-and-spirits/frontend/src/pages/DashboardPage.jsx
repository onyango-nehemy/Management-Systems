import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { TrendingUp, ShoppingBag, AlertTriangle, ArrowRight, Smartphone, Banknote, ArrowUpRight, Store } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../utils/api'

const kes = (n) => `KES ${Number(n).toLocaleString('en-KE')}`

// Plain arrays
const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const months = ['January','February','March','April','May','June','July','August','September','October','November','December']

function Tip({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xs font-semibold text-slate-800">{value}</p>
    </div>
  )
}

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-100 shadow-card rounded-xl px-3 py-2 text-xs">
      <p className="text-slate-500 font-medium">{label}</p>
      <p className="font-bold text-slate-900 mt-0.5">{kes(payload[0].value)}</p>
      <p className="text-slate-400">{payload[0]?.payload?.tx} sales</p>
    </div>
  )
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  //Clock hooks
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const dateStr = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`
  const timeStr = now.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  

  const [stats,   setStats]   = useState(null)
  const [weekly,  setWeekly]  = useState([])
  const [top,     setTop]     = useState([])
  const [loading, setLoading] = useState(true)

useEffect(() => {
  Promise.all([
    api.get('/dashboard/stats'),
    api.get('/sales/weekly'),
    api.get('/dashboard/top-products'),
  ]).then(([s, w, t]) => {
    setStats(s.data)
    setWeekly(w.data.weekly ?? [])
    setTop(t.data.top ?? [])
  }).catch(err => {
    console.error('Dashboard fetch error:', err)
  }).finally(() => setLoading(false))
}, [])
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading dashboard…</div>
  )

  const { todayTotal=0, todayMpesa=0, todayCash=0, todayWholesale=0, todayCount=0, lowStockCount=0, lowStockItems=[] } = stats || {}
  const todayRetail = todayTotal - todayWholesale

  const heroStats = [
    { label: "Today's revenue",  value: kes(todayTotal) },
    { label: 'Transactions',     value: todayCount },
    ...(lowStockCount > 0 ? [{ label: 'Low stock alerts', value: `${lowStockCount} items`, danger: true }] : []),
  ]

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 text-white px-6 py-5 lg:px-8 lg:py-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500 rounded-full opacity-20 -translate-y-1/2 translate-x-1/4 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-brand-900 rounded-full opacity-20 translate-y-1/2 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-brand-200 text-xs font-semibold uppercase tracking-widest mb-1">
                {dateStr} &nbsp;·&nbsp; {timeStr}
              </p>
              <h1 className="text-xl lg:text-2xl font-bold leading-tight">Welcome back, {firstName}.</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate('/pos')} className="bg-white text-brand-700 hover:bg-brand-50 font-semibold text-sm px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
                Open POS <ArrowRight size={14} />
              </button>
              {lowStockCount > 0 && (
                <button onClick={() => navigate('/alerts')} className="bg-white/15 hover:bg-white/25 text-white text-sm px-4 py-2 rounded-xl transition-colors flex items-center gap-2 border border-white/20">
                  <AlertTriangle size={13} /> View alerts
                </button>
              )}
            </div>
          </div>
          <div className={`grid gap-3 mt-5 ${heroStats.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {heroStats.map(({ label, value, danger }) => (
              <div key={label} className={`rounded-xl px-4 py-3 text-center sm:text-left ${danger ? 'bg-red-500/30 border border-red-300/30' : 'bg-white/15'} backdrop-blur`}>
                <p className={`text-xs mb-0.5 ${danger ? 'text-red-200' : 'text-brand-200'}`}>{label}</p>
                <p className="text-white font-bold text-lg">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's revenue",  value: kes(todayTotal),     sub: `${todayCount} transactions`,    icon: TrendingUp,  bg: 'bg-brand-50',  ic: 'text-brand-600' },
          { label: 'M-Pesa collected', value: kes(todayMpesa),     sub: 'M-Pesa payments',               icon: Smartphone,  bg: 'bg-blue-50',   ic: 'text-blue-600' },
          { label: 'Cash collected',   value: kes(todayCash),      sub: 'Cash payments',                 icon: Banknote,    bg: 'bg-amber-50',  ic: 'text-amber-600' },
          { label: 'Wholesale sales',  value: kes(todayWholesale), sub: 'Bulk orders today',             icon: Store,       bg: 'bg-purple-50', ic: 'text-purple-600' },
        ].map(({ label, value, sub, icon: Icon, bg, ic }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon size={17} className={ic} />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            <p className="text-xs font-medium text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Revenue this week</h2>
              <p className="text-xs text-slate-400 mt-0.5">{kes(weekly.reduce((s,d)=>s+d.revenue,0))} total</p>
            </div>
            <span className="badge-green text-xs">{weekly.reduce((s,d)=>s+d.tx,0)} sales</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekly} barSize={26} margin={{ top:0, right:0, left:-22, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTip />} cursor={{ fill:'#f8fafc' }} />
              <Bar dataKey="revenue" radius={[5,5,0,0]}>
                {weekly.map((_,i) => <Cell key={i} fill={i===weekly.length-1?'#db2777':'#fbcfe8'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Top sellers</h2>
          {top.length === 0
            ? <p className="text-xs text-slate-400 text-center py-8">No sales yet</p>
            : (
              <div className="space-y-3.5">
                {top.map((p,i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-200 w-4 shrink-0">{i+1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{p.name}</p>
                      <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-400 rounded-full" style={{ width:`${(p.revenue/(top[0]?.revenue||1))*100}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-600 shrink-0">{p.sold}</span>
                  </div>
                ))}
              </div>
            )
          }
          <div className="mt-5 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 mb-3">Today's breakdown</h3>
            <Tip label="Retail sales"    value={kes(todayRetail)} />
            <Tip label="Wholesale sales" value={kes(todayWholesale)} />
            <Tip label="M-Pesa share"    value={todayTotal ? `${Math.round(todayMpesa/todayTotal*100)}%` : '—'} />
            <Tip label="Cash share"      value={todayTotal ? `${Math.round(todayCash/todayTotal*100)}%` : '—'} />
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">Recent transactions</h2>
          {isAdmin && (
            <button onClick={() => navigate('/reports')} className="text-xs text-brand-600 font-medium flex items-center gap-1 hover:text-brand-700">
              View all <ArrowRight size={12} />
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50">
                {['Receipt','Time','Cashier','Type','Payment','Total'].map(h => (
                  <th key={h} className={`px-5 py-3 text-xs font-semibold text-slate-400 ${h==='Total'?'text-right':'text-left'} ${h==='Cashier'?'hidden sm:table-cell':''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(stats?.todaySales || []).slice(0,6).map(s => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{s.receiptNo}</td>
                  <td className="px-5 py-3 text-xs text-slate-500">{new Date(s.createdAt).toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'})}</td>
                  <td className="px-5 py-3 text-xs text-slate-500 hidden sm:table-cell">{s.cashier?.name}</td>
                  <td className="px-5 py-3"><span className={s.saleType==='wholesale'?'badge-blue':'badge-slate'}>{s.saleType}</span></td>
                  <td className="px-5 py-3"><span className={s.payment==='M-Pesa'?'badge-green':'badge-amber'}>{s.payment}</span></td>
                  <td className="px-5 py-3 text-right text-xs font-bold text-slate-800">{kes(s.total)}</td>
                </tr>
              ))}
              {(!stats?.todaySales?.length) && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-xs text-slate-400">No transactions today yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}