import { Resend } from 'resend'
import dotenv from 'dotenv'

dotenv.config()

const RESEND_API_KEY = process.env.RESEND_API_KEY
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

export default resend
