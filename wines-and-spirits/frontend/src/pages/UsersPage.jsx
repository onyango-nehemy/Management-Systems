import { useState, useEffect } from 'react'
import { Plus, Edit2, UserCheck, UserX, X, Eye, EyeOff, ShieldCheck, Trash2, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import api from '../utils/api'

function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({ name:user?.name||'', email:user?.email||'', role:user?.role||'staff', password:'' })
  const [show, setShow]     = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const F = k => e => setForm(f=>({...f,[k]:e.target.value}))

  const handleSubmit = async () => {
    setSaving(true); setError('')
    try {
      const payload = { ...form }
      if (!payload.password) delete payload.password
      if (user) {
        await api.put(`/users/${user.id}`, payload)
      } else {
        await api.post('/users', payload)
      }
      onSave()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative z-10 w-full max-w-sm card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-800">{user?'Edit user':'Add staff account'}</h3>
          <button onClick={onClose}><X size={18} className="text-slate-400"/></button>
        </div>
        {error && <div className="mb-4 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-100">{error}</div>}
        <div className="space-y-4">
          <div><label className="label">Full name</label><input className="input" value={form.name} onChange={F('name')} placeholder="e.g. Faith Muthoni"/></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={F('email')} placeholder="staff@biggiechillspot.co.ke"/></div>
          <div>
            <label className="label">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {['admin','staff'].map(r=>(
                <button key={r} onClick={()=>setForm(f=>({...f,role:r}))}
                  className={clsx('py-2.5 rounded-xl border-2 text-sm font-semibold capitalize transition-all',
                    form.role===r?'border-brand-500 bg-brand-50 text-brand-700':'border-slate-200 text-slate-600 hover:border-slate-300')}>
                  {r}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1.5">{form.role==='admin'?'Full access to all features.':'POS, stock view, and alerts only.'}</p>
          </div>
          <div>
            <label className="label">{user?'New password (blank to keep)':'Password'}</label>
            <div className="relative">
              <input className="input pr-10" type={show?'text':'password'} value={form.password} onChange={F('password')} placeholder="••••••••"/>
              <button type="button" onClick={()=>setShow(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {show?<EyeOff size={15}/>:<Eye size={15}/>}
              </button>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1 justify-center">
            {saving?<><Loader2 size={14} className="animate-spin"/>Saving…</>:user?'Save changes':'Create account'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteModal({ user, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative z-10 w-full max-w-xs card p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto"><Trash2 size={22} className="text-red-500"/></div>
        <div>
          <h3 className="font-bold text-slate-800">Delete account?</h3>
          <p className="text-sm text-slate-500 mt-1"><span className="font-semibold text-slate-700">{user.name}</span> will be permanently removed.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={onConfirm} className="flex-1 justify-center flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
            <Trash2 size={13}/> Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [users,        setUsers]        = useState([])
  const [modal,        setModal]        = useState(null)
  const [showAdd,      setShowAdd]      = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

const load = async () => {
  try {
    const r = await api.get('/users')
    setUsers(r.data.users ?? r.data ?? [])
  } catch (err) {
    console.error('Failed to load users:', err)
  }
}

useEffect(() => { load() }, [])

  const toggle = async (id) => {
    await api.patch(`/users/${id}/toggle`)
    load()
  }

  const deleteUser = async (id) => {
    await api.delete(`/users/${id}`)
    setDeleteTarget(null)
    load()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">User management</h1>
          <p className="text-sm text-slate-400 mt-0.5">{users.filter(u=>u.active).length} active · {users.filter(u=>!u.active).length} inactive</p>
        </div>
        <button onClick={()=>setShowAdd(true)} className="btn-primary"><Plus size={15}/>Add staff</button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {users.map(u=>(
          <div key={u.id} className={clsx('card p-4 flex items-center gap-4 transition-opacity',!u.active&&'opacity-60')}>
            <div className={clsx('w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold shrink-0',
              u.role==='admin'?'bg-brand-100 text-brand-700':u.role==='owner'?'bg-purple-100 text-purple-700':'bg-slate-100 text-slate-600')}>
              {u.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-slate-800">{u.name}</p>
                <span className={u.role==='owner'?'badge-blue':u.role==='admin'?'badge-green':'badge-slate capitalize'}>{u.role}</span>
                {!u.active&&<span className="badge-red">Inactive</span>}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={()=>setModal(u)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Edit"><Edit2 size={14}/></button>
              <button onClick={()=>toggle(u.id)} title={u.active?'Deactivate':'Activate'}
                className={clsx('p-2 rounded-xl transition-colors',u.active?'text-amber-400 hover:text-amber-600 hover:bg-amber-50':'text-brand-500 hover:text-brand-700 hover:bg-brand-50')}>
                {u.active?<UserX size={14}/>:<UserCheck size={14}/>}
              </button>
              <button onClick={()=>setDeleteTarget(u)} title="Delete account" className="p-2 rounded-xl text-red-300 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
      </div>


      {(showAdd||modal) && <UserModal user={modal} onClose={()=>{setShowAdd(false);setModal(null)}} onSave={()=>{setShowAdd(false);setModal(null);load()}}/>}
      {deleteTarget && <DeleteModal user={deleteTarget} onConfirm={()=>deleteUser(deleteTarget.id)} onClose={()=>setDeleteTarget(null)}/>}
    </div>
  )
}
