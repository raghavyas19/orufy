import express from 'express'
import upload from '../middleware/uploadMiddleware.js'
import { uploadBuffer } from '../utils/imageUpload.js'
const router = express.Router()

router.post('/', upload.array('images', 6), async (req, res, next) => {
  try {
    const files = req.files || []
    const urls = []
    for (const file of files) {
      const uploaded = await uploadBuffer(file.buffer, file.originalname)
      urls.push(uploaded)
    }

    res.json({ success: true, data: urls })
  } catch (err) {
    next(err)
  }
})

export default router
