import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Loader2 } from 'lucide-react'


function WineGlass() {
  return (
    <>
      {/* Injecting CSS Animations*/}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(1.5deg); }
        }
        @keyframes swish {
          0%, 100% { transform: rotate(0deg) scaleY(1); }
          50% { transform: rotate(-1deg) scaleY(1.03); }
        }
        @keyframes bubbleUp {
          0% { transform: translateY(8px); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.4; }
          100% { transform: translateY(-12px); opacity: 0; }
        }
        .animate-glass { animation: float 5s ease-in-out infinite; }
        .animate-wine { animation: swish 5s ease-in-out infinite; transform-origin: bottom center; }
        .bubble-1 { animation: bubbleUp 3.5s ease-in-out infinite; transform-origin: center; }
        .bubble-2 { animation: bubbleUp 4.2s ease-in-out infinite 1s; transform-origin: center; }
        .bubble-3 { animation: bubbleUp 2.8s ease-in-out infinite 0.5s; transform-origin: center; }
      `}</style>

      <svg viewBox="0 0 160 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-44 drop-shadow-md animate-glass">
        {/* base shadow */}
        <ellipse cx="80" cy="268" rx="38" ry="6" fill="#C4607A" opacity="0.18" />
        {/* stem */}
        <rect x="74" y="188" width="12" height="68" rx="6" fill="#C4607A" opacity="0.45" />
        {/* base */}
        <path d="M50 260 Q58 256 80 256 Q102 256 110 260" stroke="#C4607A" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.55" />
        <ellipse cx="80" cy="260" rx="30" ry="5" fill="#C4607A" opacity="0.28" />
        
        {/* bowl glass body */}
        <path d="M44 36 Q30 100 34 132 Q38 164 80 176 Q122 164 126 132 Q130 100 116 36 Z" fill="#fff" opacity="0.4" />
        <path d="M44 36 Q30 100 34 132 Q38 164 80 176 Q122 164 126 132 Q130 100 116 36 Z" fill="none" stroke="#C4607A" strokeWidth="2.5" strokeLinejoin="round" />
        
        {/* rim */}
        <path d="M44 36 Q56 40 80 40 Q104 40 116 36" stroke="#C4607A" strokeWidth="2" fill="none" strokeLinecap="round" />
        
        {/* Animated Wine Content Group */}
        <g className="animate-wine">
          {/* wine fill */}
          <path d="M34 132 Q38 164 80 176 Q122 164 126 132 Q104 136 80 136 Q56 136 34 132 Z" fill="#ED93B1" opacity="0.55" />
          <path d="M34 132 Q56 128 80 128 Q104 128 126 132" fill="none" stroke="#D4537E" strokeWidth="1.5" opacity="0.7" />
          
          {/* Animated floating bubbles inside the liquid */}
          <circle cx="62" cy="145" r="3" fill="#fff" className="bubble-1" />
          <circle cx="85" cy="150" r="2" fill="#fff" className="bubble-2" />
          <circle cx="72" cy="140" r="2.5" fill="#fff" className="bubble-3" />
          <circle cx="98" cy="142" r="1.5" fill="#fff" className="bubble-1" />
        </g>

        {/* stem connector curves */}
        <path d="M74 188 Q67 182 65 176" stroke="#C4607A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M86 188 Q93 182 95 176" stroke="#C4607A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    </>
  )
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    await login(form.email.trim(), form.password.trim())
    navigate('/dashboard')
  } catch (err) {
    setError(err.response?.data?.error || 'Wrong email or password.')
  } finally {
    setLoading(false)
  }
}
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50">

      {/*Left: Brand panel*/}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden px-16 py-12"
        style={{ background: '#F4C0D1' }}>

        {/* decorative blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-30 pointer-events-none"
          style={{ background: '#ED93B1' }} />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full opacity-20 pointer-events-none"
          style={{ background: '#D4537E' }} />
        <div className="absolute top-1/2 right-8 w-32 h-32 rounded-full opacity-10 pointer-events-none"
          style={{ background: '#993556' }} />

        {/* brand */}
        <div className="relative z-10">
          <p className="text-xl font-extrabold tracking-tight" style={{ color:'#FFFFFF' }}>
            Biggie Chill Spot
          </p>
          <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: '#FF9900' }}>
            Wines &amp; Spirits 
          </p>
        </div>

        {/* wine glass centrepiece */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 py-8">
          <WineGlass />
        </div>

        {/* tagline */}
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight" style={{ color: '#FFFFFF' }}>
            Every pour,<br />
            <span style={{ color: '#FF9900' }}>perfectly available.</span>
          </h1>
        </div>
      </div>

      {/*Right: Login form*/}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 sm:px-12 py-12 bg-gradient-to-br from-slate-50 to-rose-50/30">

        {/* mobile logo */}
        <div className="lg:hidden flex flex-col items-center gap-2 mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm"
            style={{ background: '#F4C0D1' }}>
            <WineGlass />
          </div>
          <p className="font-extrabold text-slate-900 text-2xl mt-2 tracking-tight">Biggie Chillie Spot</p>
          <p className="text-xs uppercase tracking-widest font-bold" style={{ color: '#D4537E' }}>
            Wines &amp; Spirits
          </p>
        </div>

        {/* Beautiful Form Container Card */}
        <div className="w-full max-w-md shadow-xl rounded-2xl p-8 bg-slate-200 border border-slate-100/80 backdrop-blur-md">

          {/* heading */}
          <div className="mb-6">
            <p className="text-xs font-extrabold uppercase tracking-widest mb-1" style={{ color: '#D4537E' }}>
              Welcome back
            </p>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to your account</h2>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                Email address
              </label>
              <input
                className="w-full px-4 py-3 text-sm bg-slate-50/50 border rounded-xl text-slate-900 placeholder-slate-400 transition-all duration-200 outline-none focus:bg-white focus:shadow-sm"
                style={{ borderColor: '#f0d0da' }}
                onFocus={e => e.target.style.borderColor = '#D4537E'}
                onBlur={e => e.target.style.borderColor = '#f0d0da'}
                type="email"
                placeholder="you@biggiechilliespot.co.ke"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 pr-10 text-sm bg-slate-50/50 border rounded-xl text-slate-900 placeholder-slate-400 transition-all duration-200 outline-none focus:bg-white focus:shadow-sm"
                  style={{ borderColor: '#f0d0da' }}
                  onFocus={e => e.target.style.borderColor = '#D4537E'}
                  onBlur={e => e.target.style.borderColor = '#f0d0da'}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm rounded-xl px-4 py-3 border font-medium flex items-center gap-2"
                style={{ color: '#993556', background: '#FBEAF0', borderColor: '#F4C0D1' }}>
                <span>⚠️</span> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 mt-2 shadow-md shadow-rose-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#D4537E' }}
              onMouseEnter={e => { if (!loading) e.target.style.background = '#C4395F' }}
              onMouseLeave={e => { if (!loading) e.target.style.background = '#D4537E' }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}