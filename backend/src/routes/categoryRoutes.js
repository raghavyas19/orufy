import express from 'express'
import asyncHandler from 'express-async-handler'
import Category from '../models/Category.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', asyncHandler(async (req, res) => {
  const categories = await Category.find()
  res.json({ success: true, data: categories })
}))

router.post('/', protect, asyncHandler(async (req, res) => {
  const { name, slug } = req.body
  const cat = await Category.create({ name, slug })
  res.status(201).json({ success: true, data: cat })
}))

export default router
