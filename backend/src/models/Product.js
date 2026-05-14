import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    productType: { type: String },
    description: { type: String },
    brand: { type: String },
    stock: { type: Number, default: 0 },
    mrp: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        provider: { type: String, enum: ['cloudinary', 'local'], default: 'local' }
      }
    ],
    exchangeEligibility: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    metadata: { type: Object }
  },
  { timestamps: true }
)

const Product = mongoose.model('Product', productSchema)
export default Product
