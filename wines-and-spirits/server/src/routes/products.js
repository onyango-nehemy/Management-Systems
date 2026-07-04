import { Router } from 'express'
import prisma from '../db.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

// GET /api/products — all active products (authenticated)
router.get('/', authenticate, async (req, res) => {
  try {
    const { category, search } = req.query
    const where = { isActive: true }
    if (category && category !== 'All') where.category = category
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku:  { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search } },
      ]
    }
    const products = await prisma.product.findMany({ where, orderBy: { name: 'asc' } })
    res.json({ products })
  } catch {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// GET /api/products/categories
router.get('/categories', authenticate, async (req, res) => {
  try {
    const cats = await prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    })
    res.json({ categories: ['All', ...cats.map(c => c.category)] })
  } catch {
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// GET /api/products/low-stock
router.get('/low-stock', authenticate, async (req, res) => {
  try {

    const all = await prisma.product.findMany({ where: { isActive: true }, orderBy: { stock: 'asc' } })
    const lowStock = all.filter(p => p.stock <= p.threshold)
    res.json({ products: lowStock })
  } catch {
    res.status(500).json({ error: 'Failed to fetch low stock' })
  }
})

// GET /api/products/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: Number(req.params.id) } })
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json({ product })
  } catch {
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// POST /api/products — all authenticated users
router.post('/', authenticate, async (req, res) => {
  const { name, sku, barcode, category, price, wholesalePrice, wholesaleMinQty, cost, stock, threshold, unit, emoji } = req.body
  if (!name || !sku || !category || !price || !cost || !unit) {
    return res.status(400).json({ error: 'name, sku, category, price, cost, unit are required' })
  }
  try {
    const product = await prisma.product.create({
      data: {
        name, sku, barcode: barcode || null, category,
        price: Number(price), wholesalePrice: wholesalePrice ? Number(wholesalePrice) : null,
        wholesaleMinQty: wholesaleMinQty ? Number(wholesaleMinQty) : null,
        cost: Number(cost), stock: Number(stock || 0),
        threshold: Number(threshold || 5), unit, emoji: emoji || null
      }
    })
    res.status(201).json({ product })
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'SKU already exists' })
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// PUT /api/products/:id — all authenticated users
router.put('/:id', authenticate, async (req, res) => {
  const { name, sku, barcode, category, price, wholesalePrice, wholesaleMinQty, cost, stock, threshold, unit, emoji } = req.body
  try {
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: {
        name, sku, barcode: barcode || null, category,
        price: Number(price), wholesalePrice: wholesalePrice ? Number(wholesalePrice) : null,
        wholesaleMinQty: wholesaleMinQty ? Number(wholesaleMinQty) : null,
        cost: Number(cost), stock: Number(stock),
        threshold: Number(threshold), unit, emoji: emoji || null
      }
    })
    res.json({ product })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Product not found' })
    res.status(500).json({ error: 'Failed to update product' })
  }
})


router.delete('/:id', authenticate, async (req, res) => {
  const id = Number(req.params.id)
  try {
    await prisma.product.delete({ where: { id } })
    return res.json({ message: 'Product deleted', archived: false })
  } catch (err) {
    console.error('DELETE /products/:id failed — code:', err.code)
    console.error(err)
    if (err.code === 'P2025') return res.status(404).json({ error: 'Product not found' })
    const isForeignKeyViolation = err.code === 'P2003' || String(err.message).includes('23001') || String(err.message).includes('foreign key constraint')
    if (isForeignKeyViolation) {
      try {
        await prisma.product.update({ where: { id }, data: { isActive: false } })
        return res.json({ message: 'Product has sales history — archived instead of deleted', archived: true })
      } catch (archiveErr) {
        console.error('Archive fallback failed:', archiveErr)
        return res.status(500).json({ error: 'Failed to archive product' })
      }
    }
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

export default router