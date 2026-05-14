import express from 'express'
import { sendOtp, verifyOtpController, me } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/send-otp', sendOtp)
router.post('/verify-otp', verifyOtpController)
router.get('/me', protect, me)

export default router
