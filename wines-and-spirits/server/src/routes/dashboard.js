import { Router } from 'express'
import prisma from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// GET /api/dashboard/stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0)
    const end   = new Date(); end.setHours(23, 59, 59, 999)

    const [todaySales, allProducts] = await Promise.all([
      prisma.sale.findMany({
        where: { createdAt: { gte: start, lte: end } },
        orderBy: { createdAt: 'desc' },
        include: { cashier: { select: { name: true } } }
      }),
      prisma.product.findMany({ where: { isActive: true } })
    ])

    const lowStock = allProducts.filter(p => p.stock <= p.threshold)

    const todayTotal     = todaySales.reduce((s, t) => s + t.total, 0)
    const todayMpesa     = todaySales.filter(s => s.payment === 'M-Pesa').reduce((s, t) => s + t.total, 0)
    const todayCash      = todaySales.filter(s => s.payment === 'Cash').reduce((s, t) => s + t.total, 0)
    const todayWholesale = todaySales.filter(s => s.saleType === 'wholesale').reduce((s, t) => s + t.total, 0)

    res.json({
      todayTotal,
      todayMpesa,
      todayCash,
      todayWholesale,
      todayCount: todaySales.length,
      lowStockCount: lowStock.length,
      lowStockItems: lowStock,
      todaySales,
    })
  } catch {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' })
  }
})

// GET /api/dashboard/top-products
router.get('/top-products', authenticate, async (req, res) => {
  try {
    const saleItems = await prisma.saleItem.findMany({
      include: { product: { select: { name: true } } }
    })

    const map = {}
    for (const item of saleItems) {
      if (!map[item.productId]) map[item.productId] = { name: item.product.name, sold: 0, revenue: 0 }
      map[item.productId].sold    += item.quantity
      map[item.productId].revenue += item.price * item.quantity
    }

    const top = Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
    res.json({ top })
  } catch {
    res.status(500).json({ error: 'Failed to fetch top products' })
  }
})

export default router