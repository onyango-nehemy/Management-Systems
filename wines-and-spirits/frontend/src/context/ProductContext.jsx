import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../utils/api'
import { useAuth } from './AuthContext'

const ProductContext = createContext(null)

export function ProductProvider({ children }) {
  const { user } = useAuth()
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState(['All'])
  const [loading, setLoading]       = useState(true)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [pRes, cRes] = await Promise.all([
        api.get('/products'),
        api.get('/products/categories'),
      ])
      setProducts(pRes.data.products)
      setCategories(cRes.data.categories)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      refresh()
    } else {
      // authenticated endpoints before a token exists.
      setProducts([])
      setCategories(['All'])
      setLoading(false)
    }
  }, [user, refresh])

  return (
    <ProductContext.Provider value={{ products, categories, loading, refresh }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProducts must be used within a ProductProvider')
  return ctx
}