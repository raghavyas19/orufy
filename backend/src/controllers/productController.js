import asyncHandler from 'express-async-handler'
import Product from '../models/Product.js'
import { uploadBuffer, normalizeImagesPayload } from '../utils/imageUpload.js'

async function buildImages(files, bodyImages, fallbackImages = []) {
  const images = []

  if (bodyImages !== undefined) {
    try {
      const parsedImages = JSON.parse(bodyImages)
      if (Array.isArray(parsedImages)) {
        images.push(...normalizeImagesPayload(parsedImages))
      }
    } catch (error) {
      throw new Error('Invalid images payload')
    }
  } else {
    images.push(...fallbackImages)
  }

  if (files?.length) {
    for (const file of files) {
      const uploaded = await uploadBuffer(file.buffer, file.originalname)
      images.push(uploaded)
    }
  }

  return images
}

export const listProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 }).populate('category')
  res.json({ success: true, data: products })
})

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category')
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
  res.json({ success: true, data: product })
})

export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    productType,
    description,
    brand,
    stock,
    mrp,
    price,
    category,
    exchangeEligibility,
    published,
    images: bodyImages
  } = req.body

  let images = []
  try {
    images = await buildImages(req.files, bodyImages)
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || 'Invalid images payload' })
  }

  const product = await Product.create({
    name,
    productType,
    description,
    brand,
    stock,
    mrp,
    price,
    category,
    exchangeEligibility: exchangeEligibility === true || exchangeEligibility === 'true' || exchangeEligibility === 'Yes',
    published: published === true || published === 'true',
    images
  })
  res.status(201).json({ success: true, data: product })
})

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' })

  const {
    name,
    productType,
    description,
    brand,
    stock,
    mrp,
    price,
    category,
    exchangeEligibility,
    published,
    images: bodyImages,
  } = req.body

  if (name !== undefined) product.name = name
  if (productType !== undefined) product.productType = productType
  if (description !== undefined) product.description = description
  if (brand !== undefined) product.brand = brand
  if (stock !== undefined) product.stock = stock
  if (mrp !== undefined) product.mrp = mrp
  if (price !== undefined) product.price = price
  if (category !== undefined) product.category = category

  if (exchangeEligibility !== undefined) {
    product.exchangeEligibility = exchangeEligibility === true || exchangeEligibility === 'true' || exchangeEligibility === 'Yes'
  }
  if (published !== undefined) {
    product.published = published === true || published === 'true'
  }

  if (bodyImages !== undefined || req.files?.length) {
    try {
      product.images = await buildImages(req.files, bodyImages, product.images)
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message || 'Invalid images payload' })
    }
  }

  await product.save()
  res.json({ success: true, data: product })
})

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
  await product.deleteOne()
  res.json({ success: true, message: 'Product removed' })
})
