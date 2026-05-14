import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { createAndSendOtp, verifyOtp } from '../services/otpService.js'

export const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ success: false, message: 'Email required' })
  await createAndSendOtp(email)
  res.json({ success: true, message: 'OTP sent to email' })
})

export const verifyOtpController = asyncHandler(async (req, res) => {
  const { email, otp } = req.body
  if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP required' })

  const user = await User.findOne({ email })
  const check = verifyOtp(user, otp)
  if (!check.ok) return res.status(400).json({ success: false, message: check.message })

  user.isVerified = true
  user.otp = undefined
  user.otpExpiry = undefined
  await user.save()

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

  res.json({
    success: true,
    message: 'Verified',
    data: {
      token,
      user: { id: user._id, email: user.email, name: user.name }
    }
  })
})

export const me = asyncHandler(async (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' })
  res.json({ success: true, data: req.user })
})
