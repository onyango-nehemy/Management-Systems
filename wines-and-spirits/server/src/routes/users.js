import { Router } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../db.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

// GET /api/users
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
      orderBy: { createdAt: 'asc' }
    })
    res.json({ users })
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// POST /api/users
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, email, password, role } = req.body
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'name, email, password, role are required' })
  }
  try {
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
      select: { id: true, name: true, email: true, role: true, active: true }
    })
    res.status(201).json({ user })
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Email already exists' })
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// PUT /api/users/:id
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { name, email, role, password } = req.body
  try {
    const data = { name, email, role }
    if (password) data.password = await bcrypt.hash(password, 10)
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data,
      select: { id: true, name: true, email: true, role: true, active: true }
    })
    res.json({ user })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'User not found' })
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// PATCH /api/users/:id/toggle — activate/deactivate
router.patch('/:id/toggle', authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } })
    if (!user) return res.status(404).json({ error: 'User not found' })
    const updated = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { active: !user.active },
      select: { id: true, name: true, email: true, role: true, active: true }
    })
    res.json({ user: updated })
  } catch {
    res.status(500).json({ error: 'Failed to toggle user status' })
  }
})

// DELETE /api/users/:id
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'User deleted' })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'User not found' })
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

export default router
