import { useState, useEffect, useRef } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../context/ProductContext'
import { printReceipt } from '../utils/printReceipt'
import { Search, ScanBarcode, Plus, Minus, Trash2, ShoppingCart, Smartphone, Banknote, Printer, CheckCircle, X, Loader2, Store, ShoppingBag } from 'lucide-react'
import clsx from 'clsx'
import api from '../utils/api'

const kes = (n) => `KES ${Number(n).toLocaleString('en-KE')}`

function ProductCard({ p, onAdd, saleType }) {
  const out = p.stock === 0
  const low = p.stock > 0 && p.stock <= p.threshold
  const isWholesale = saleType === 'wholesale'
  const showWholesale = isWholesale && p.wholesalePrice
  const displayPrice = showWholesale ? p.wholesalePrice : p.price

  return (
    <button onClick={() => !out && onAdd(p)} disabled={out}
      className={clsx('card p-3 text-left w-full transition-all active:scale-95',
        out ? 'opacity-40 cursor-not-allowed' : 'hover:border-brand-200 hover:shadow-soft cursor-pointer')}>
      <div className="w-full aspect-square bg-gradient-to-br from-brand-50 to-slate-50 rounded-xl mb-2.5 flex items-center justify-center text-2xl">
        {p.emoji}
      </div>
      <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2 min-h-[2rem]">{p.name}</p>
      <p className="text-xs text-slate-400 mt-0.5">{p.unit}</p>
      <div className="flex items-center justify-between mt-2">
        <div>
          <span className="text-sm font-bold text-brand-600">{kes(displayPrice)}</span>
          {showWholesale && <p className="text-[9px] text-purple-500 font-semibold">Wholesale ×{p.wholesaleMinQty}</p>}
        </div>
        {out && <span className="badge-red text-[10px]">Out</span>}
        {low && <span className="badge-amber text-[10px]">Low</span>}
        {!out && !low && <span className="text-[10px] text-slate-300">{p.stock}</span>}
      </div>
    </button>
  )
}

export default function POSPage() {
  const { user } = useAuth()
  const { items, add, remove, updateQty, clear, count } = useCart()
  const { products, categories, refresh } = useProducts()
  const [search,     setSearch]     = useState('')
  const [cat,        setCat]        = useState('All')
  const [saleType,   setSaleType]   = useState('retail')
  const [cartOpen,   setCartOpen]   = useState(false)
  const [payModal,   setPayModal]   = useState(false)
  const [payMethod,  setPayMethod]  = useState('M-Pesa')
  const [phone,      setPhone]      = useState('')
  const [paying,     setPaying]     = useState(false)
  const [success,    setSuccess]    = useState(null)
  const [scanFlash,  setScanFlash]  = useState(null)
  const [scanMode,   setScanMode]   = useState(false)
  const [payError,   setPayError]   = useState('')

  const searchRef = useRef(null)

  const handleSaleTypeChange = (type) => {
    setSaleType(type)
    clear()
  }

  const getItemPrice = (p, type) => {
    if (type === 'wholesale' && p.wholesalePrice) return p.wholesalePrice
    return p.price
  }

  const handleAdd = (p) => {
    add({ ...p, price: getItemPrice(p, saleType) })
  }

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  const filtered = products.filter(p => {
    const mc = cat === 'All' || p.category === cat
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) ||
               p.sku.toLowerCase().includes(search.toLowerCase()) ||
               (p.barcode || '').includes(search)
    return mc && ms
  })

  const handleScanKeyDown = (e) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const code = search.trim()
    if (!code) return
    const match = products.find(p => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase())
    if (match && match.stock > 0) {
      handleAdd(match)
      setScanFlash('ok')
      setSearch('')
      searchRef.current?.focus()
    } else {
      setScanFlash('notfound')
    }
    setTimeout(() => setScanFlash(null), 1200)
  }

  const handlePay = async () => {
    setPaying(true)
    setPayError('')
    try {
      const payload = {
        items: items.map(i => ({ productId: i.id, quantity: i.qty, price: i.price })),
        payment: payMethod,
        mpesaRef: payMethod === 'M-Pesa' ? phone : null,
        customerPhone: null,
        saleType,
      }
      const res = await api.post('/sales', payload)
      const sale = res.data.sale
      setSuccess({
        receiptNo: sale.receiptNo,
        items: sale.items.map(i => ({ name: i.product.name, qty: i.quantity, price: i.price, emoji: i.product.emoji })),
        total: sale.total,
        payment: sale.payment,
        mpesaRef: sale.mpesaRef,
        cashier: user?.name ?? 'Cashier',
        saleType: sale.saleType,
      })
      refresh()
      clear()
      setPayModal(false)
    } catch (err) {
      setPayError(err.response?.data?.error || 'Payment failed')
    } finally {
      setPaying(false)
    }
  }

  const handlePrint = () => { if (success) printReceipt(success) }

  const CartContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} className="text-slate-500" />
          <span className="text-sm font-bold text-slate-700">Cart</span>
          {count > 0 && <span className="w-5 h-5 bg-brand-100 text-brand-700 rounded-full text-[10px] font-bold flex items-center justify-center">{count}</span>}
        </div>
        {items.length > 0 && <button onClick={clear} className="text-xs text-red-400 hover:text-red-600 font-medium">Clear all</button>}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        {items.length === 0
          ? <div className="flex flex-col items-center justify-center h-36 text-slate-300"><ShoppingCart size={32}/><p className="text-xs mt-2 text-slate-400">Cart is empty</p></div>
          : items.map(item => (
            <div key={item.id} className="flex items-start gap-2 bg-white/80 rounded-xl p-2.5 shadow-sm border border-slate-200/60">
              <span className="text-base mt-0.5">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">{item.name}</p>
                <p className="text-xs text-brand-600 font-bold mt-0.5">{kes(item.price)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:border-brand-300 text-slate-600"><Minus size={10}/></button>
                <span className="text-xs font-bold w-5 text-center text-slate-800">{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:border-brand-300 text-slate-600"><Plus size={10}/></button>
                <button onClick={() => remove(item.id)} className="w-6 h-6 rounded-lg flex items-center justify-center text-red-300 hover:bg-red-50 hover:text-red-500 ml-0.5"><Trash2 size={10}/></button>
              </div>
            </div>
          ))
        }
      </div>

      {items.length > 0 && (
        <div className="p-4 border-t border-slate-200/80 bg-slate-200/40 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">{count} item{count!==1?'s':''}</span>
            <span className="text-lg font-bold text-slate-900">{kes(total)}</span>
          </div>
          <button onClick={() => { setPayError(''); setPayModal(true); setCartOpen(false) }} className="btn-primary w-full justify-center font-semibold">
            Charge {kes(total)}
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-6rem)] lg:h-[calc(100vh-3.5rem)]">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Sale type toggle */}
        <div className="flex gap-2 mb-3">
          {[
            { v: 'retail',    label: 'Retail',    Icon: ShoppingBag },
            { v: 'wholesale', label: 'Wholesale', Icon: Store },
          ].map(({ v, label, Icon }) => (
            <button key={v} onClick={() => handleSaleTypeChange(v)}
              className={clsx('flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all',
                saleType === v
                  ? v === 'wholesale' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300')}>
              <Icon size={15} /> {label}
            </button>
          ))}
          {saleType === 'wholesale' && (
            <span className="ml-auto flex items-center text-xs text-purple-600 font-semibold bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100">
              Wholesale prices active
            </span>
          )}
        </div>

        {/* Search + Scanner */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              className={clsx('input pl-9 text-sm transition-all',
                scanMode && !scanFlash && 'ring-2 ring-brand-300 border-brand-400',
                scanFlash === 'ok' && 'ring-2 ring-brand-400 border-brand-400',
                scanFlash === 'notfound' && 'ring-2 ring-red-400 border-red-400')}
              placeholder={scanMode ? 'Scan barcode now…' : 'Search product or scan barcode…'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleScanKeyDown}
            />
            {scanFlash === 'ok' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-500 text-[10px] font-bold">✓ Added</span>
            )}
            {scanFlash === 'notfound' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-[10px] font-bold">No match</span>
            )}
            {scanMode && !scanFlash && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 text-[10px] font-bold animate-pulse">
                Ready…
              </span>
            )}
          </div>

          {/* Scanner toggle button */}
          <button
            onClick={() => {
              setScanMode(v => !v)
              searchRef.current?.focus()
            }}
            title={scanMode ? 'Exit scan mode' : 'Activate barcode scanner'}
            className={clsx(
              'shrink-0 px-3 rounded-xl border-2 transition-all flex items-center justify-center',
              scanMode
                ? 'border-brand-500 bg-brand-50 text-brand-600'
                : 'btn-secondary'
            )}
          >
            <ScanBarcode size={16} className={scanMode ? 'text-brand-600' : ''} />
          </button>

          <button onClick={() => setCartOpen(true)} className="btn-secondary lg:hidden shrink-0 px-3 relative">
            <ShoppingCart size={16}/>
            {count > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{count}</span>}
          </button>
        </div>

        {/* Scan mode banner */}
        {scanMode && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-700 font-semibold">
            <ScanBarcode size={14} className="text-brand-500 shrink-0" />
            Scanner active — point your barcode scanner at a product and scan.
            <button onClick={() => setScanMode(false)} className="ml-auto text-brand-400 hover:text-brand-600">
              <X size={13} />
            </button>
          </div>
        )}

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={clsx('px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all',
                cat===c ? 'bg-brand-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600')}>
              {c}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map(p => <ProductCard key={p.id} p={p} onAdd={handleAdd} saleType={saleType} />)}
          </div>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-slate-300">
              <Search size={28}/><p className="text-sm mt-2">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop cart */}
      <div className="hidden lg:flex lg:w-72 xl:w-80 flex-col rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.08)]">
        <CartContent />
      </div>

      {/* Mobile cart drawer */}
      {cartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="relative z-10 max-h-[80vh] flex flex-col bg-slate-100 rounded-t-2xl shadow-2xl border-t border-slate-200">
            <div className="flex justify-center pt-2.5 pb-1"><div className="w-8 h-1 bg-slate-300 rounded-full"/></div>
            <CartContent />
          </div>
        </div>
      )}

      {/* Payment modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !paying && setPayModal(false)} />
          <div className="relative z-10 w-full max-w-sm card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Complete payment</h3>
              {!paying && <button onClick={() => setPayModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>}
            </div>
            {payError && <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-100">{payError}</div>}
            <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl p-5 text-center border border-brand-100">
              <p className="text-xs text-brand-600 font-semibold uppercase tracking-wide mb-1">Total amount</p>
              <p className="text-4xl font-bold text-brand-800">{kes(total)}</p>
              <p className="text-xs text-brand-500 mt-1">{count} item{count!==1?'s':''} · <span className={saleType==='wholesale'?'text-purple-600 font-semibold':''}>{saleType}</span></p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Payment method</p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { m: 'M-Pesa', Icon: Smartphone, sub: 'Paybill' },
                  { m: 'Cash',   Icon: Banknote,   sub: 'Physical cash' },
                ].map(({ m, Icon, sub }) => (
                  <button key={m} onClick={() => setPayMethod(m)}
                    className={clsx('flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
                      payMethod===m ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300')}>
                    <Icon size={22} className={payMethod===m ? 'text-brand-600' : 'text-slate-400'} />
                    <div className="text-center">
                      <p className={clsx('text-sm font-bold', payMethod===m ? 'text-brand-700' : 'text-slate-600')}>{m}</p>
                      <p className="text-[10px] text-slate-400">{sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {payMethod === 'M-Pesa' && (
              <div>
                <label className="label">M-PESA Reference Number</label>
                <input className="input" placeholder="e.g. UG1AQ9MMEP" value={phone} onChange={e => setPhone(e.target.value)} />
                <p className="text-xs text-slate-400 mt-1"></p>
              </div>
            )}
            <button onClick={handlePay} disabled={paying || (payMethod==='M-Pesa' && !phone)} className="btn-primary w-full justify-center py-3 font-semibold">
              {paying
                ? <><Loader2 size={15} className="animate-spin"/>{payMethod==='M-Pesa' ? 'Recording payment…' : 'Processing…'}</>
                : `Confirm ${payMethod} · ${kes(total)}`}
            </button>
          </div>
        </div>
      )}

      {/* Success modal */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm card p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-brand-50 border-4 border-brand-100 flex items-center justify-center mx-auto">
              <CheckCircle size={34} className="text-brand-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Payment received!</h3>
              <p className="text-sm text-slate-500 mt-1">{success.payment} · {kes(success.total)}</p>
              {success.mpesaRef && <p className="text-xs text-slate-400 mt-0.5 font-mono">Ref: {success.mpesaRef}</p>}
              {success.saleType === 'wholesale' && <span className="badge-blue mt-1">Wholesale order</span>}
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-left space-y-1">
              {success.items.slice(0,3).map((i,idx) => (
                <div key={idx} className="flex justify-between text-xs text-slate-600">
                  <span>{i.name} ×{i.qty}</span>
                  <span className="font-semibold">{kes(i.price*i.qty)}</span>
                </div>
              ))}
              {success.items.length > 3 && <p className="text-xs text-slate-400">+{success.items.length-3} more items</p>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handlePrint} className="btn-secondary justify-center"><Printer size={15}/> Print receipt</button>
              <button onClick={() => setSuccess(null)} className="btn-primary justify-center">New sale</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}