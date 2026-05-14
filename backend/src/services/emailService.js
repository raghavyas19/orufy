import resend from '../config/resend.js'
import dotenv from 'dotenv'

dotenv.config()

const FROM = process.env.EMAIL_FROM || 'no-reply@orufy.example'

export async function sendOtpEmail(to, otp) {
  const subject = 'Your Orufy login OTP'
  const html = `
    <div style="font-family: Arial, sans-serif; font-size:16px;">
      <p>Hi,</p>
      <p>Your One Time Password (OTP) for Orufy is:</p>
      <h2 style="letter-spacing:4px">${otp}</h2>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `

  if (!resend) {
    console.warn('Resend not configured - skipping real email send')
    return { ok: true }
  }

  const resp = await resend.emails.send({
    from: FROM,
    to: to,
    subject,
    html
  })

  return resp
}
