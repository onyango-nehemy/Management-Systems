import { useState, useEffect } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Download, TrendingUp, ShoppingBag, CreditCard, Wallet, Store } from 'lucide-react'
import api from '../utils/api'

const kes = (n) => `KES ${Number(n).toLocaleString('en-KE')}`
const AVG_MARGIN = 0.32 // 32% average margin estimate
const profitOf = (revenue) => Math.round(revenue * AVG_MARGIN)

const Tip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null
  return (
    <div className="bg-white border border-slate-100 shadow-card rounded-xl px-3 py-2 text-xs space-y-0.5">
      <p className="text-slate-500">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} className="font-bold" style={{ color: p.color }}>
          {p.dataKey === 'profit' ? 'Profit: ' : 'Revenue: '}{kes(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const [range,   setRange]   = useState('week')
  const [weekly,  setWeekly]  = useState([])
  const [sales,   setSales]   = useState([])
  const [top,     setTop]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/sales/weekly'),
      api.get('/sales'),
      api.get('/dashboard/top-products'),
    ]).then(([w, s, t]) => {
      setWeekly(w.data.weekly)
      setSales(s.data.sales)
      setTop(t.data.top)
    }).finally(() => setLoading(false))
  }, [])

  const weekRevenue  = weekly.reduce((s,d)=>s+d.revenue,0)
  const weekTx       = weekly.reduce((s,d)=>s+d.tx,0)
  const todayRevenue = weekly[weekly.length-1]?.revenue || 0
  const todayTx      = weekly[weekly.length-1]?.tx || 0
  const monthRevenue = Math.round(weekRevenue * 4.3)
  const monthTx      = Math.round(weekTx * 4.3)

  const RANGES = {
    day:   { label: 'Today',      revenue: todayRevenue, tx: todayTx },
    week:  { label: 'This week',  revenue: weekRevenue,  tx: weekTx },
    month: { label: 'This month', revenue: monthRevenue, tx: monthTx },
  }

  const { label, revenue, tx } = RANGES[range]
  const profit = profitOf(revenue)

  const mpesaTotal     = sales.filter(s=>s.payment==='M-Pesa').reduce((a,s)=>a+s.total,0)
  const cashTotal      = sales.filter(s=>s.payment==='Cash').reduce((a,s)=>a+s.total,0)
  const wholesaleTotal = sales.filter(s=>s.saleType==='wholesale').reduce((a,s)=>a+s.total,0)
  const retailTotal    = sales.filter(s=>s.saleType==='retail').reduce((a,s)=>a+s.total,0)

  const PIE_PAYMENT = [
    { name: 'M-Pesa',     value: mpesaTotal },
    { name: 'Cash',       value: cashTotal },
  ]
  const PIE_SALETYPE = [
    { name: 'Retail',     value: retailTotal },
    { name: 'Wholesale',  value: wholesaleTotal },
  ]
  const COLORS_PAYMENT  = ['#db2777','#f59e0b']
  const COLORS_SALETYPE = ['#6366f1','#8b5cf6']

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading reports…</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-xl font-bold text-slate-900">Reports</h1><p className="text-sm text-slate-400 mt-0.5">Sales & stock analytics</p></div>
        <div className="flex gap-2">
          <div className="flex bg-slate-100 rounded-xl p-1">
            {['day','week','month'].map(r=>(
              <button key={r} onClick={()=>setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${range===r?'bg-white text-slate-800 shadow-soft':'text-slate-500 hover:text-slate-700'}`}>
                {RANGES[r].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {label:'Total revenue',    value:kes(revenue),             icon:TrendingUp, bg:'bg-brand-50',   ic:'text-brand-600'},
          {label:'Estimated profit', value:kes(profit),              icon:Wallet,     bg:'bg-emerald-50', ic:'text-emerald-600'},
          {label:'Transactions',     value:tx,                       icon:ShoppingBag,bg:'bg-blue-50',    ic:'text-blue-600'},
          {label:'Avg order value',  value:kes(tx ? Math.round(revenue/tx) : 0), icon:CreditCard, bg:'bg-amber-50', ic:'text-amber-600'},
        ].map(s=>(
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}><s.icon size={18} className={s.ic}/></div>
            <div><p className="text-xs text-slate-500">{s.label}</p><p className="text-lg font-bold text-slate-900">{s.value}</p></div>
          </div>
        ))}
      </div>

      {/* Wholesale summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 flex items-center gap-3 border-l-4 border-purple-400">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50"><Store size={18} className="text-purple-600"/></div>
          <div><p className="text-xs text-slate-500">Wholesale revenue (all time)</p><p className="text-lg font-bold text-slate-900">{kes(wholesaleTotal)}</p></div>
        </div>
        <div className="card p-4 flex items-center gap-3 border-l-4 border-brand-400">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-50"><ShoppingBag size={18} className="text-brand-600"/></div>
          <div><p className="text-xs text-slate-500">Retail revenue (all time)</p><p className="text-lg font-bold text-slate-900">{kes(retailTotal)}</p></div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-800">Revenue & profit trend</h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2.5 h-2.5 rounded-full inline-block bg-brand-500"/>Revenue</span>
            <span className="flex items-center gap-1.5 text-slate-500"><span className="w-2.5 h-2.5 rounded-full inline-block bg-emerald-500"/>Profit</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={weekly.map(d => ({ ...d, profit: profitOf(d.revenue) }))} margin={{top:0,right:0,left:-22,bottom:0}}>
            <defs>
              <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#db2777" stopOpacity={0.15}/><stop offset="95%" stopColor="#db2777" stopOpacity={0}/></linearGradient>
              <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
            <XAxis dataKey="day" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
            <Tooltip content={<Tip/>}/>
            <Area type="monotone" dataKey="revenue" stroke="#db2777" strokeWidth={2} fill="url(#gr)"/>
            <Area type="monotone" dataKey="profit"  stroke="#10b981" strokeWidth={2} fill="url(#gp)"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Top products</h2>
          {top.length === 0
            ? <p className="text-xs text-slate-400 text-center py-6">No sales recorded yet</p>
            : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={top} layout="vertical" barSize={12} margin={{left:0,right:40,top:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
                  <XAxis type="number" tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
                  <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:'#64748b'}} axisLine={false} tickLine={false} width={100}/>
                  <Tooltip formatter={v=>kes(v)} cursor={{fill:'#f8fafc'}}/>
                  <Bar dataKey="revenue" radius={[0,5,5,0]}>
                    {top.map((_,i)=><Cell key={i} fill={i===0?'#db2777':'#fbcfe8'}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Payment split</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={PIE_PAYMENT} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                {PIE_PAYMENT.map((_,i)=><Cell key={i} fill={COLORS_PAYMENT[i]}/>)}
              </Pie>
              <Legend formatter={(v,e)=>`${v}: ${kes(e.payload.value)}`} iconType="circle" iconSize={8} wrapperStyle={{fontSize:'11px'}}/>
              <Tooltip formatter={v=>kes(v)}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Retail vs Wholesale</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={PIE_SALETYPE} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                {PIE_SALETYPE.map((_,i)=><Cell key={i} fill={COLORS_SALETYPE[i]}/>)}
              </Pie>
              <Legend formatter={(v,e)=>`${v}: ${kes(e.payload.value)}`} iconType="circle" iconSize={8} wrapperStyle={{fontSize:'11px'}}/>
              <Tooltip formatter={v=>kes(v)}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-slate-100"><h2 className="text-sm font-bold text-slate-800">All transactions</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Receipt #','Date & Time','Cashier','Type','Payment','Items','Total'].map((h,i)=>(
                  <th key={h} className={`px-5 py-3 text-xs font-semibold text-slate-400 ${i>=5?'text-right':'text-left'} ${h==='Cashier'?'hidden sm:table-cell':''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sales.map(s=>(
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{s.receiptNo}</td>
                  <td className="px-5 py-3 text-xs text-slate-500">{new Date(s.createdAt).toLocaleString('en-KE')}</td>
                  <td className="px-5 py-3 text-xs text-slate-500 hidden sm:table-cell">{s.cashier?.name}</td>
                  <td className="px-5 py-3"><span className={s.saleType==='wholesale'?'badge-blue':'badge-slate'}>{s.saleType}</span></td>
                  <td className="px-5 py-3"><span className={s.payment==='M-Pesa'?'badge-green':'badge-amber'}>{s.payment}</span></td>
                  <td className="px-5 py-3 text-xs text-slate-500 text-right">{s.items?.length ?? '—'}</td>
                  <td className="px-5 py-3 text-right font-bold text-slate-800 text-xs">{kes(s.total)}</td>
                </tr>
              ))}
              {sales.length===0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-xs text-slate-400">No transactions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
