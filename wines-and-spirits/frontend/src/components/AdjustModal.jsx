import { useState } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'
import api from '../utils/api'

export default function AdjustModal({ product, onClose, onSave }) {
  const [type, setType] = useState('in')
  const [qty, setQty]   = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const handleSubmit = async () => {
    setSaving(true); setError('')
    try {
      await api.post('/stock/adjust', { productId: product.id, type, quantity: Number(qty), note })
      onSave()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to adjust stock')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">Adjust stock</h3>
          <button onClick={onClose}><X size={18} className="text-slate-400"/></button>
        </div>
        {error && <div className="mb-4 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-100">{error}</div>}
        <div className="bg-brand-50 rounded-xl p-3 mb-4 flex items-center gap-3">
          <span className="text-2xl">{product.emoji}</span>
          <div>
            <p className="text-sm font-semibold text-slate-800">{product.name}</p>
            <p className="text-xs text-slate-500">Current stock: <strong>{product.stock} units</strong></p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[{v:'in',l:'Receive stock'},{v:'out',l:'Remove stock'}].map(({v,l})=>(
            <button key={v} onClick={()=>setType(v)}
              className={clsx('flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all',
                type===v ? 'border-brand-400 bg-brand-50' : 'border-slate-200 hover:border-slate-300')}>
              <span className="text-lg">{v==='in'?'📦':'📤'}</span>
              <span className="text-[10px] font-semibold text-slate-600 leading-tight">{l}</span>
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <div><label className="label">Quantity</label><input className="input" type="number" placeholder="Enter quantity" value={qty} onChange={e=>setQty(e.target.value)} autoFocus /></div>
          <div><label className="label">Note (optional)</label><input className="input" placeholder="e.g. Delivery, Breakage…" value={note} onChange={e=>setNote(e.target.value)} /></div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleSubmit} disabled={!qty||saving} className="btn-primary flex-1 justify-center">{saving?'Saving…':'Confirm'}</button>
        </div>
      </div>
    </div>
  )
}