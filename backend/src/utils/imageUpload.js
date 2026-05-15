import stream from 'stream'
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js'

function normalizeImageRecord(image) {
  if (!image) return null

  if (typeof image === 'string') {
    return { url: image, provider: 'local' }
  }

  const url = image.url || image.secure_url || image.imageUrl || image.src || image.path
  if (!url) return null

  return {
    url,
    publicId: image.publicId || image.public_id || image.id,
    provider: image.provider || (url.includes('cloudinary.com') ? 'cloudinary' : 'local')
  }
}

export async function uploadBuffer(buffer, originalName) {
  if (isCloudinaryConfigured) {
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

  throw new Error('Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.')
}

export function normalizeImagesPayload(images = []) {
  return images.map(normalizeImageRecord).filter(Boolean)
}
