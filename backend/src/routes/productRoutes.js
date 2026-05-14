import express from 'express'
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js'
import { protect } from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'

const router = express.Router()

router.get('/', listProducts)
router.get('/:id', getProduct)
router.post('/', protect, upload.array('images', 6), createProduct)
router.put('/:id', protect, upload.array('images', 6), updateProduct)
router.delete('/:id', protect, deleteProduct)

export default router
