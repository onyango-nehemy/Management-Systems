import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import clsx from 'clsx'
import { useProducts } from '../context/ProductContext'
import AdjustModal from '../components/AdjustModal'
import Toast from '../components/Toast'

export default function AlertsPage() {
  const navigate = useNavigate()
  const { products, refresh } = useProducts()
  const [adjustProduct, setAdjustProduct] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => setToast({ message, type })

  const items = products.filter(p => p.stock <= p.threshold)
  const sorted = [...items].sort((a, b) => a.stock - b.stock)
  const out  = sorted.filter(p => p.stock === 0)
  const crit = sorted.filter(p => p.stock > 0 && p.stock <= Math.ceil(p.threshold / 2))
  const warn = sorted.filter(p => p.stock > Math.ceil(p.threshold / 2))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Low stock alerts</h1>
          <p className="text-sm text-slate-400 mt-0.5">{sorted.length} items need attention</p>
        </div>
        <button onClick={() => navigate('/stock')} className="btn-secondary text-sm">View all stock</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Out of stock', count: out.length,  bg: 'bg-red-50 border-red-100',    tc: 'text-red-600' },
          { label: 'Critical',     count: crit.length, bg: 'bg-amber-50 border-amber-100', tc: 'text-amber-600' },
          { label: 'Running low',  count: warn.length, bg: 'bg-yellow-50 border-yellow-100', tc: 'text-yellow-600' },
        ].map(s => (
          <div key={s.label} className={`card p-4 border ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.tc}`}>{s.count}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {sorted.length === 0
        ? <div className="card p-16 flex flex-col items-center text-slate-300"><span className="text-5xl">✅</span><p className="text-sm mt-3">All products are well stocked!</p></div>
        : (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-500" />
              <h2 className="text-sm font-bold text-slate-800">Items requiring restocking</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {sorted.map(p => {
                const pct = p.threshold > 0 ? Math.min(100, Math.round((p.stock / (p.threshold * 2)) * 100)) : 0
                const tag = p.stock === 0
                  ? { l: 'Out of stock', cls: 'badge-red' }
                  : p.stock <= Math.ceil(p.threshold / 2)
                  ? { l: 'Critical', cls: 'badge-red' }
                  : { l: 'Low stock', cls: 'badge-amber' }
                return (
                  <div key={p.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">{p.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.category} · {p.unit}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={tag.cls}>{tag.l}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>Stock level</span>
                              <span><strong className={p.stock === 0 ? 'text-red-500' : 'text-amber-500'}>{p.stock}</strong> / {p.threshold} min</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={clsx('h-full rounded-full', p.stock === 0 ? 'bg-red-400' : pct < 30 ? 'bg-red-400' : 'bg-amber-400')}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <button onClick={() => setAdjustProduct(p)} className="shrink-0 text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1">
                            Restock <ArrowRight size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      }

      {adjustProduct && (
        <AdjustModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onSave={() => {
            setAdjustProduct(null)
            refresh()
            showToast('Stock adjusted')
          }}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}