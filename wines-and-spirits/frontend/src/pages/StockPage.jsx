import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../context/ProductContext'
import { Search, Plus, Edit2, ArrowUpCircle, X, ScanBarcode, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import api from '../utils/api'
import AdjustModal from '../components/AdjustModal'
import Toast from '../components/Toast'

const kes = (n) => `KES ${Number(n).toLocaleString('en-KE')}`

function StockBar({ qty, threshold }) {
  const pct = threshold > 0 ? Math.min(100, Math.round((qty / (threshold * 2)) * 100)) : 100
  const color = qty === 0 ? 'bg-red-400' : qty <= threshold ? 'bg-amber-400' : 'bg-brand-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={clsx('text-xs font-bold', qty===0?'text-red-500':qty<=threshold?'text-amber-500':'text-slate-700')}>{qty}</span>
    </div>
  )
}

function DeleteConfirmModal({ product, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false)

  const handleConfirm = async () => {
    setDeleting(true)
    await onConfirm()
    setDeleting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm card p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <h3 className="font-bold text-slate-800">Delete product?</h3>
        </div>
        <p className="text-sm text-slate-500 mb-5">
          This will permanently delete <strong>{product.name}</strong>. This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 justify-center flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductModal({ product, categories, onClose, onSave }) {
  const [form, setForm] = useState({
    name: product?.name||'', sku: product?.sku||'', barcode: product?.barcode||'',
    category: product?.category||'Whiskey', price: product?.price||'', cost: product?.cost||'',
    wholesalePrice: product?.wholesalePrice||'', wholesaleMinQty: product?.wholesaleMinQty||'',
    stock: product?.stock??0, threshold: product?.threshold||5, unit: product?.unit||'750ml', emoji: product?.emoji||'🍷'
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const [justScanned, setJustScanned] = useState(false)
  const [barcodeScanning, setBarcodeScanning] = useState(false)
  const barcodeRef = useRef(null)
  const F = (k) => e => setForm(f => ({...f, [k]: e.target.value}))

  const handleSubmit = async () => {
    setSaving(true); setError('')
    try {
      if (product) {
        await api.put(`/products/${product.id}`, form)
      } else {
        await api.post('/products', form)
      }
      onSave()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg card p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-800">{product?'Edit product':'Add product'}</h3>
          <button onClick={onClose}><X size={18} className="text-slate-400"/></button>
        </div>
        {error && <div className="mb-4 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-100">{error}</div>}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="label">Product name</label><input className="input" value={form.name} onChange={F('name')} placeholder="e.g. Johnnie Walker Black" /></div>
          <div className="col-span-2">
            <label className="label flex items-center gap-1.5">
              <ScanBarcode size={13} className="text-brand-500" /> Barcode
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={barcodeRef}
                  className={clsx('input pr-16 font-mono transition-all',
                    barcodeScanning && !justScanned && 'ring-2 ring-brand-300 border-brand-400',
                    justScanned && 'ring-2 ring-green-400 border-green-400'
                  )}
                  value={form.barcode}
                  onChange={F('barcode')}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && barcodeScanning) {
                      e.preventDefault()
                      setJustScanned(true)
                      setBarcodeScanning(false)
                      setTimeout(() => setJustScanned(false), 2000)
                    }
                  }}
                  placeholder={barcodeScanning ? 'Scan now — point scanner at barcode…' : 'Type manually or use scanner →'}
                />
                {justScanned && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-[10px] font-bold">✓ Scanned</span>
                )}
                {barcodeScanning && !justScanned && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 text-[10px] font-bold animate-pulse">Ready…</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => { setBarcodeScanning(v => !v); barcodeRef.current?.focus() }}
                title={barcodeScanning ? 'Cancel scan' : 'Activate barcode scanner'}
                className={clsx(
                  'shrink-0 px-3 rounded-xl border-2 transition-all flex items-center gap-1.5 text-xs font-semibold',
                  barcodeScanning
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-200 text-slate-500 hover:border-brand-300 hover:text-brand-600 bg-white'
                )}
              >
                <ScanBarcode size={14} />
                {barcodeScanning ? 'Cancel' : 'Scan'}
              </button>
            </div>
            {barcodeScanning && (
              <p className="text-[10px] text-brand-500 mt-1.5 font-medium">
                Scanner active — point your barcode scanner at the product and it will fill automatically.
              </p>
            )}
          </div>
          <div><label className="label">SKU</label><input className="input" value={form.sku} onChange={F('sku')} /></div>
          <div><label className="label">Emoji icon</label><input className="input" value={form.emoji} onChange={F('emoji')} /></div>
          <div>
            <label className="label">Category</label>
            <input className="input" list="cat-opts" value={form.category} onChange={F('category')} placeholder="e.g. Whiskey" />
            <datalist id="cat-opts">{categories.slice(1).map(c=><option key={c} value={c}/>)}</datalist>
          </div>
          <div><label className="label">Unit</label><input className="input" value={form.unit} onChange={F('unit')} placeholder="750ml" /></div>
          <div><label className="label">Selling price (KES)</label><input className="input" type="number" value={form.price} onChange={F('price')} /></div>
          <div><label className="label">Cost price (KES)</label><input className="input" type="number" value={form.cost} onChange={F('cost')} /></div>
          <div><label className="label">Wholesale price (KES)</label><input className="input" type="number" value={form.wholesalePrice} onChange={F('wholesalePrice')} placeholder="Optional" /></div>
          <div><label className="label">Min qty for wholesale</label><input className="input" type="number" value={form.wholesaleMinQty} onChange={F('wholesaleMinQty')} placeholder="e.g. 6" /></div>
          <div><label className="label">Current stock</label><input className="input" type="number" value={form.stock} onChange={F('stock')} /></div>
          <div><label className="label">Low stock threshold</label><input className="input" type="number" value={form.threshold} onChange={F('threshold')} /></div>
        </div>
        <div className="flex gap-2 mt-5 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary">{saving?'Saving…':product?'Save changes':'Add product'}</button>
        </div>
      </div>
    </div>
  )
}

export default function StockPage() {

  const { products, categories, refresh } = useProducts()
  const [search,     setSearch]     = useState('')
  const [cat,        setCat]        = useState('All')
  const [filter,     setFilter]     = useState('all')
  const [editProduct,    setEditProduct]    = useState(null)
  const [showAdd,        setShowAdd]        = useState(false)
  const [adjustProduct,  setAdjustProduct]  = useState(null)
  const [deleteProduct,  setDeleteProduct]  = useState(null)
  const [toast, setToast] = useState(null)

  // Scanner state
  const [scanMode,    setScanMode]    = useState(false)
  const [scanFlash,   setScanFlash]   = useState(null) // 'ok' | 'notfound' | null
  const [scanMessage, setScanMessage] = useState('')
  const scanRef = useRef(null)

  const showToast = (message, type = 'success') => setToast({ message, type })

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${deleteProduct.id}`)
      showToast(`"${deleteProduct.name}" deleted`)
      setDeleteProduct(null)
      refresh()
    } catch {
      showToast('Failed to delete product', 'error')
    }
  }

  // When scan mode turns on, focus the scan input
  useEffect(() => {
    if (scanMode) scanRef.current?.focus()
  }, [scanMode])

  const handleScanKeyDown = (e) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const code = search.trim()
    if (!code) return

    const match = products.find(p =>
      p.barcode === code || p.sku.toLowerCase() === code.toLowerCase()
    )

    if (match) {
      setScanFlash('ok')
      setScanMessage(`Found: ${match.name}`)
      setSearch('')
      // Open adjust modal for this product
      setTimeout(() => {
        setAdjustProduct(match)
        setScanFlash(null)
        setScanMessage('')
        // Keep focus on scan input after modal closes
      }, 400)
    } else {
      setScanFlash('notfound')
      setScanMessage('Product not found — check barcode or SKU')
      setTimeout(() => {
        setScanFlash(null)
        setScanMessage('')
        setSearch('')
      }, 2000)
    }
  }

  const filtered = products.filter(p => {
    const mc = cat==='All' || p.category===cat
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || (p.barcode||'').includes(search)
    const mf = filter==='all' ? true : filter==='low' ? p.stock<=p.threshold : filter==='out' ? p.stock===0 : true
    return mc && ms && mf
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stock management</h1>
          <p className="text-sm text-slate-400 mt-0.5">{products.length} products across {categories.length-1} categories</p>
        </div>
        <div className="flex gap-2">
          {/* Stock take scanner button */}
          <button
            onClick={() => setScanMode(v => !v)}
            title={scanMode ? 'Exit stock take mode' : 'Start barcode stock take'}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all',
              scanMode
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
            )}
          >
            <ScanBarcode size={15} className={scanMode ? 'text-brand-600' : 'text-slate-400'} />
            {scanMode ? 'Exit scan mode' : 'Scan to adjust'}
          </button>
          <button onClick={()=>setShowAdd(true)} className="btn-primary"><Plus size={15}/>Add product</button>
        </div>
      </div>

      {/* Scan mode banner + input */}
      {scanMode && (
        <div className={clsx(
          'rounded-2xl border-2 p-4 transition-all',
          scanFlash === 'ok' ? 'border-brand-400 bg-brand-50' :
          scanFlash === 'notfound' ? 'border-red-400 bg-red-50' :
          'border-brand-300 bg-brand-50/60'
        )}>
          <div className="flex items-center gap-2 mb-3">
            <ScanBarcode size={16} className="text-brand-600 shrink-0" />
            <p className="text-sm font-bold text-brand-800">Stock take — scan mode active</p>
            <button onClick={() => { setScanMode(false); setSearch('') }} className="ml-auto text-slate-400 hover:text-slate-600">
              <X size={15} />
            </button>
          </div>
          <p className="text-xs text-brand-600 mb-3">
            Scan a product barcode or SKU — the adjust stock modal will open automatically.
          </p>
          <div className="relative">
            <ScanBarcode size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" />
            <input
              ref={scanRef}
              className={clsx(
                'input pl-9 text-sm font-mono transition-all',
                scanFlash === 'ok' && 'ring-2 ring-brand-400 border-brand-400',
                scanFlash === 'notfound' && 'ring-2 ring-red-400 border-red-400'
              )}
              placeholder="Scan barcode or type SKU and press Enter…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleScanKeyDown}
              autoComplete="off"
            />
            {scanFlash === 'ok' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-600 text-xs font-bold">✓ {scanMessage}</span>
            )}
            {scanFlash === 'notfound' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xs font-bold">⚠ {scanMessage}</span>
            )}
            {!scanFlash && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-300 text-[10px] font-bold animate-pulse">Ready…</span>
            )}
          </div>
          <p className="text-[10px] text-brand-400 mt-2">
            After each scan, enter the quantity in the modal that opens, then this input stays ready for the next product.
          </p>
        </div>
      )}

      {/* Search + filters — hidden in scan mode */}
      {!scanMode && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input className="input pl-9 text-sm" placeholder="Search by name or SKU…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select className="input sm:w-36 text-sm" value={cat} onChange={e=>setCat(e.target.value)}>
            {categories.map(c=><option key={c}>{c}</option>)}
          </select>
          <select className="input sm:w-40 text-sm" value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="all">All levels</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Category</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Retail</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 hidden lg:table-cell">Wholesale</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 hidden lg:table-cell">Cost</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 min-w-[140px]">Stock level</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(p => (
                <tr key={p.id} className={clsx(
                  'hover:bg-slate-50 transition-colors',
                  scanMode && 'cursor-pointer'
                )}
                  onClick={() => scanMode && setAdjustProduct(p)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{p.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.unit} · {p.sku}</p>
                        {p.barcode && <p className="text-[10px] text-slate-300 font-mono">{p.barcode}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="badge-slate">{p.category}</span></td>
                  <td className="px-4 py-3 text-right font-bold text-slate-800 text-sm">{kes(p.price)}</td>
                  <td className="px-4 py-3 text-right text-xs hidden lg:table-cell">
                    {p.wholesalePrice
                      ? <span className="text-purple-600 font-semibold">{kes(p.wholesalePrice)}<span className="text-slate-300 font-normal ml-1">×{p.wholesaleMinQty}</span></span>
                      : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-slate-400 hidden lg:table-cell">{kes(p.cost)}</td>
                  <td className="px-4 py-3 min-w-[140px]">
                    <StockBar qty={p.stock} threshold={p.threshold} />
                    <p className="text-[10px] text-slate-300 mt-0.5">min {p.threshold}</p>
                  </td>
                  <td className="px-4 py-3">
                    {p.stock===0 ? <span className="badge-red">Out of stock</span>
                     : p.stock<=p.threshold ? <span className="badge-amber">Low stock</span>
                     : <span className="badge-green">In stock</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={e => { e.stopPropagation(); setAdjustProduct(p) }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        title="Adjust stock"
                      >
                        <ArrowUpCircle size={15}/>
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setEditProduct(p) }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={15}/>
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setDeleteProduct(p) }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0 && (
            <div className="flex flex-col items-center py-16 text-slate-300">
              <span className="text-4xl">📦</span>
              <p className="text-sm mt-2">No products found</p>
            </div>
          )}
        </div>
      </div>

      {(showAdd||editProduct) && (
        <ProductModal product={editProduct} categories={categories}
          onClose={()=>{setShowAdd(false);setEditProduct(null)}}
          onSave={()=>{const wasEdit=!!editProduct;setShowAdd(false);setEditProduct(null);refresh();showToast(wasEdit?'Product updated':'Product added')}} />
      )}
      {adjustProduct && (
        <AdjustModal product={adjustProduct}
          onClose={()=>{ setAdjustProduct(null); if(scanMode) setTimeout(()=>scanRef.current?.focus(), 100) }}
          onSave={()=>{ setAdjustProduct(null); refresh(); showToast('Stock adjusted'); if(scanMode) setTimeout(()=>scanRef.current?.focus(), 100) }} />
      )}
      {deleteProduct && (
        <DeleteConfirmModal
          product={deleteProduct}
          onClose={()=>setDeleteProduct(null)}
          onConfirm={handleDelete}
        />
      )}

      <Toast toast={toast} onClose={()=>setToast(null)} />
    </div>
  )
}