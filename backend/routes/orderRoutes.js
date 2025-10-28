// backend/routes/orderRoutes.js
import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  createOrder,
  getMyOrders,
} from '../controllers/orderController.js'

const router = Router()

// skapa köp/hyra
router.post('/', requireAuth, createOrder)

// mina egna orders
router.get('/me', requireAuth, getMyOrders)

export default router
