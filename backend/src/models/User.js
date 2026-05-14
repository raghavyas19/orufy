import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    name: { type: String },
    avatar: { type: String }
  },
  { timestamps: true }
)

const User = mongoose.model('User', userSchema)
export default User
