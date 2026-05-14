import { customAlphabet } from 'nanoid'
import User from '../models/User.js'
import { sendOtpEmail } from './emailService.js'

const nano = customAlphabet('0123456789', 6)

export async function createAndSendOtp(email) {
  const otp = nano()
  const expiry = new Date(Date.now() + 10 * 60 * 1000)

  const user = await User.findOneAndUpdate(
    { email },
    { email, otp, otpExpiry: expiry },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  await sendOtpEmail(email, otp)
  return { user, otp }
}

export function verifyOtp(user, code) {
  if (!user) return { ok: false, message: 'User not found' }
  if (!user.otp || !user.otpExpiry) return { ok: false, message: 'No OTP set' }
  if (new Date() > user.otpExpiry) return { ok: false, message: 'OTP expired' }
  if (String(user.otp) !== String(code)) return { ok: false, message: 'Invalid OTP' }
  return { ok: true }
}
