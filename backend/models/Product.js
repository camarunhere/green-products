const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    default: null
  },
  images: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Home & Garden', 'Food & Beverage', 'Fashion', 'Personal Care', 'Tech & Gadgets', 'Kids & Baby', 'Outdoor & Travel', 'Office & Stationery']
  },
  sustainabilityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 50
  },
  ecoBadges: [{
    type: String,
    enum: ['Organic', 'Recycled', 'Carbon Neutral', 'Fair Trade', 'Vegan', 'Biodegradable', 'Zero Waste', 'Cruelty Free', 'B Corp', 'Rainforest Alliance']
  }],
  verified: {
    type: Boolean,
    default: false
  },
  verificationNotes: {
    type: String,
    default: ''
  },
  brand: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  reviews: [reviewSchema],
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  weight: { type: String, default: '' },
  material: { type: String, default: '' },
  origin: { type: String, default: '' }
}, { timestamps: true });

productSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    this.rating = this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
};

module.exports = mongoose.model('Product', productSchema);
