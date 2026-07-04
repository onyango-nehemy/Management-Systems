import { createContext, useContext, useState, useCallback } from 'react'
const Ctx = createContext(null)
export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const add = useCallback((p) => setItems(prev => { const ex = prev.find(i => i.id === p.id); return ex ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }] }), [])
  const remove = useCallback((id) => setItems(prev => prev.filter(i => i.id !== id)), [])
  const updateQty = useCallback((id, qty) => { if (qty <= 0) { remove(id); return } setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i)) }, [remove])
  const clear = useCallback(() => setItems([]), [])
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const count = items.reduce((s, i) => s + i.qty, 0)
  return <Ctx.Provider value={{ items, add, remove, updateQty, clear, total, count }}>{children}</Ctx.Provider>
}
export const useCart = () => useContext(Ctx)
