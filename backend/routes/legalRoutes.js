// routes/legalRoutes.js
import { Router } from 'express'
import { getTerms, getPrivacy } from '../controllers/legalController.js'

const router = Router()
router.get('/terms', getTerms)
router.get('/privacy', getPrivacy)

export default router
