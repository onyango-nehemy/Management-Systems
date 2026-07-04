import { Router } from 'express'
import prisma from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// POST /api/stock/adjust — adjust stock level
router.post('/adjust', authenticate, async (req, res) => {
  const { productId, type, quantity, note } = req.body
  if (!productId || !type || !quantity) {
    return res.status(400).json({ error: 'productId, type, quantity are required' })
  }

  try {
    const product = await prisma.product.findUnique({ where: { id: Number(productId) } })
    if (!product) return res.status(404).json({ error: 'Product not found' })

    let newStock = product.stock
    const qty = Number(quantity)

    if (type === 'in')     newStock = product.stock + qty
    else if (type === 'out')    newStock = Math.max(0, product.stock - qty)
    else if (type === 'adjust') newStock = qty

    const [updated] = await prisma.$transaction([
      prisma.product.update({
        where: { id: Number(productId) },
        data: { stock: newStock }
      }),
      prisma.stockAdjustment.create({
        data: { productId: Number(productId), type, quantity: qty, note: note || null, userId: req.user.id }
      })
    ])

    res.json({ product: updated })
  } catch {
    res.status(500).json({ error: 'Failed to adjust stock' })
  }
})

// GET /api/stock/adjustments — history
router.get('/adjustments', authenticate, async (req, res) => {
  try {
    const adjustments = await prisma.stockAdjustment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    })
    res.json({ adjustments })
  } catch {
    res.status(500).json({ error: 'Failed to fetch adjustments' })
  }
})

export default router
