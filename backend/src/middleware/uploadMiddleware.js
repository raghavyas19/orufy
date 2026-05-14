import multer from 'multer'
import path from 'path'

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  if (IMAGE_TYPES.includes(file.mimetype)) cb(null, true)
  else cb(new Error('Invalid file type. Only jpg, jpeg, png, webp allowed.'), false)
}

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
})

export default upload
