import fs from 'fs'
import path from 'path'
import stream from 'stream'
import { promisify } from 'util'
import cloudinary from '../config/cloudinary.js'

const pipeline = promisify(stream.pipeline)

export async function uploadBuffer(buffer, originalName) {
  if (process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME) {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: process.env.CLOUDINARY_FOLDER || 'orufy' },
        (error, output) => {
          if (error) return reject(error)
          resolve(output)
        }
      )

      stream.Readable.from([buffer]).pipe(uploadStream)
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
      provider: 'cloudinary'
    }
  }

  const uploadDir = path.join(process.cwd(), 'uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const safeName = `${Date.now()}-${originalName}`.replace(/\s+/g, '-')
  const filePath = path.join(uploadDir, safeName)
  await pipeline(stream.Readable.from([buffer]), fs.createWriteStream(filePath))

  return {
    url: `/uploads/${safeName}`,
    publicId: safeName,
    provider: 'local'
  }
}
