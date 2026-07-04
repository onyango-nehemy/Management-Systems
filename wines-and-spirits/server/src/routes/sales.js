import { Router } from 'express'
import prisma from '../db.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

// POST /api/sales — create a new sale (POS checkout)
router.post('/', authenticate, async (req, res) => {
  const { items, payment, mpesaRef, customerPhone, saleType } = req.body
  // items: [{ productId, quantity, price }]

  if (!items || !items.length || !payment) {
    return res.status(400).json({ error: 'items and payment are required' })
  }

  try {
    const receiptNo = `BCS${Date.now().toString().slice(-6)}`
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

    const sale = await prisma.$transaction(async (tx) => {
      // Create the sale
      const newSale = await tx.sale.create({
        data: {
          receiptNo,
          total,
          payment,
          mpesaRef: mpesaRef || null,
          customerPhone: customerPhone || null,
          saleType: saleType || 'retail',
          cashierId: req.user.id,
          items: {
            create: items.map(i => ({
              productId: i.productId,
              quantity:  i.quantity,
              price:     i.price,
            }))
          }
        },
        include: { items: { include: { product: true } }, cashier: { select: { name: true } } }
      })

      // Deduct stock for each item
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })
      }

      return newSale
    })

    res.status(201).json({ sale })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create sale' })
  }
})

// GET /api/sales — list sales (admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { from, to, payment, saleType } = req.query
    const where = {}
    if (payment) where.payment = payment
    if (saleType) where.saleType = saleType
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from)
      if (to)   where.createdAt.lte = new Date(to)
    }

    const sales = await prisma.sale.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        cashier: { select: { name: true } },
        items: { include: { product: { select: { name: true, emoji: true } } } }
      }
    })
    res.json({ sales })
  } catch {
    res.status(500).json({ error: 'Failed to fetch sales' })
  }
})

// GET /api/sales/today — today's sales summary
router.get('/today', authenticate, async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0)
    const end   = new Date(); end.setHours(23, 59, 59, 999)

    const sales = await prisma.sale.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { cashier: { select: { name: true } } }
    })

    const total     = sales.reduce((s, t) => s + t.total, 0)
    const mpesa     = sales.filter(s => s.payment === 'M-Pesa').reduce((s, t) => s + t.total, 0)
    const cash      = sales.filter(s => s.payment === 'Cash').reduce((s, t) => s + t.total, 0)
    const wholesale = sales.filter(s => s.saleType === 'wholesale').reduce((s, t) => s + t.total, 0)
    const retail    = sales.filter(s => s.saleType === 'retail').reduce((s, t) => s + t.total, 0)

    res.json({
      total, mpesa, cash, wholesale, retail,
      count: sales.length,
      sales: sales.slice(0, 20)
    })
  } catch {
    res.status(500).json({ error: 'Failed to fetch today stats' })
  }
})

// GET /api/sales/weekly — revenue by day for the last 7 days
router.get('/weekly', authenticate, async (req, res) => {
  try {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const start = new Date(d); start.setHours(0, 0, 0, 0)
      const end   = new Date(d); end.setHours(23, 59, 59, 999)

      const sales = await prisma.sale.findMany({
        where: { createdAt: { gte: start, lte: end } }
      })

      const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
      days.push({
        day: dayNames[d.getDay()],
        revenue: sales.reduce((s, t) => s + t.total, 0),
        tx: sales.length
      })
    }
    res.json({ weekly: days })
  } catch {
    res.status(500).json({ error: 'Failed to fetch weekly data' })
  }
})

export default router
