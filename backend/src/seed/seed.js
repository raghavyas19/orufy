import dotenv from 'dotenv'
import connectDB from '../config/db.js'
import Category from '../models/Category.js'
import Product from '../models/Product.js'
import Testimonial from '../models/Testimonial.js'
import User from '../models/User.js'

dotenv.config()

const seed = async () => {
  await connectDB()
  console.log('Seeding data...')

  await Category.deleteMany()
  const categories = await Category.insertMany([
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Home', slug: 'home' },
    { name: 'Fashion', slug: 'fashion' }
  ])

  await Product.deleteMany()
  const products = await Product.insertMany([
    { name: 'Sample Phone', description: 'A nice phone', price: 499, images: [], category: categories[0]._id },
    { name: 'Coffee Mug', description: 'Ceramic mug', price: 12.99, images: [], category: categories[1]._id }
  ])

  await Testimonial.deleteMany()
  await Testimonial.insertMany([
    { name: 'Alice', message: 'Great service', avatar: '' },
    { name: 'Bob', message: 'Fast delivery', avatar: '' }
  ])

  await User.deleteMany()
  await User.create({
    email: 'seed@orufy.local',
    isVerified: true,
  })

  console.log('Seed complete')
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed error', err)
  process.exit(1)
})
