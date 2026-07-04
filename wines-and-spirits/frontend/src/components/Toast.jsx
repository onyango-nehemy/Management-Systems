import { useEffect } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [toast])

  if (!toast) return null

  return (
    <div className="fixed bottom-5 right-5 z-[60] animate-in slide-in-from-bottom-2 fade-in duration-200">
      <div className={clsx(
        'flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold min-w-[240px]',
        toast.type === 'error'
          ? 'bg-red-50 border-red-200 text-red-700'
          : 'bg-brand-50 border-brand-200 text-brand-700'
      )}>
        <span className="text-base">{toast.type === 'error' ? '⚠️' : '✅'}</span>
        <span className="flex-1">{toast.message}</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}