import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  let token
  const auth = req.headers.authorization
  if (auth && auth.startsWith('Bearer')) {
    token = auth.split(' ')[1]
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select('-otp -otpExpiry')
      return next()
    } catch (err) {
      res.status(401)
      return next(new Error('Not authorized, token failed'))
    }
  }
  res.status(401)
  next(new Error('Not authorized, no token'))
}
