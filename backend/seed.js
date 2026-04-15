const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');

const products = [
  {
    name: 'Bamboo Toothbrush Set',
    description: 'A set of 4 biodegradable bamboo toothbrushes with BPA-free bristles. 100% compostable handle, zero plastic packaging. Perfect for a zero-waste bathroom routine.',
    price: 12.99,
    originalPrice: 16.99,
    images: ['https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&q=80'],
    category: 'Personal Care',
    sustainabilityScore: 95,
    ecoBadges: ['Biodegradable', 'Zero Waste', 'Vegan', 'Cruelty Free'],
    verified: true,
    verificationNotes: 'Certified by EcoLabel. 100% bamboo handle, compostable packaging.',
    brand: 'EcoBrush Co.',
    stock: 150,
    featured: true,
    rating: 4.8,
    numReviews: 124,
    tags: ['bamboo', 'oral care', 'zero waste', 'biodegradable'],
    material: 'Moso Bamboo',
    origin: 'Vietnam'
  },
  {
    name: 'Organic Cotton Tote Bag',
    description: 'Handcrafted from 100% GOTS-certified organic cotton. Durable, washable, and designed to last a lifetime. Say goodbye to single-use plastic bags.',
    price: 18.50,
    originalPrice: null,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'],
    category: 'Fashion',
    sustainabilityScore: 92,
    ecoBadges: ['Organic', 'Fair Trade', 'Vegan'],
    verified: true,
    verificationNotes: 'GOTS certified organic cotton. Fair Trade factory verified.',
    brand: 'GreenThread',
    stock: 200,
    featured: true,
    rating: 4.7,
    numReviews: 89,
    tags: ['cotton', 'tote', 'reusable', 'fashion'],
    material: 'Organic Cotton',
    origin: 'India'
  },
  {
    name: 'Recycled Glass Water Bottle',
    description: 'Beautiful 500ml water bottle made from 100% recycled borosilicate glass. Leak-proof bamboo lid. Keeps your drinks fresh and plastic-free.',
    price: 24.99,
    originalPrice: 29.99,
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80'],
    category: 'Home & Garden',
    sustainabilityScore: 88,
    ecoBadges: ['Recycled', 'Zero Waste', 'Carbon Neutral'],
    verified: true,
    verificationNotes: 'Made from post-consumer recycled glass. Carbon neutral shipping.',
    brand: 'PureGlass',
    stock: 85,
    featured: true,
    rating: 4.9,
    numReviews: 203,
    tags: ['glass', 'water bottle', 'recycled', 'reusable'],
    weight: '500ml',
    material: 'Recycled Borosilicate Glass',
    origin: 'Germany'
  },
  {
    name: 'Solar-Powered Charger',
    description: 'Portable 20W solar panel charger for all your devices. Dual USB output. Perfect for camping, hiking, and eco-conscious travelers.',
    price: 49.99,
    originalPrice: 64.99,
    images: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80'],
    category: 'Tech & Gadgets',
    sustainabilityScore: 85,
    ecoBadges: ['Carbon Neutral', 'Recycled'],
    verified: true,
    verificationNotes: 'Solar efficiency certified. Recycled aluminum frame.',
    brand: 'SolarTech',
    stock: 45,
    featured: true,
    rating: 4.6,
    numReviews: 67,
    tags: ['solar', 'charger', 'tech', 'outdoor'],
    material: 'Monocrystalline Silicon + Recycled Aluminum',
    origin: 'China'
  },
  {
    name: 'Compostable Dish Sponges (6-pack)',
    description: 'Plant-based loofah and cellulose sponges that fully compost within 30 days. Replace plastic scrubbers with these effective, natural alternatives.',
    price: 9.99,
    originalPrice: null,
    images: ['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&q=80'],
    category: 'Home & Garden',
    sustainabilityScore: 97,
    ecoBadges: ['Biodegradable', 'Zero Waste', 'Vegan', 'Organic'],
    verified: true,
    verificationNotes: 'USDA BioPreferred certified. Compostable in 30 days.',
    brand: 'CleanEarth',
    stock: 320,
    featured: false,
    rating: 4.5,
    numReviews: 156,
    tags: ['compostable', 'sponge', 'kitchen', 'zero waste'],
    material: 'Loofah & Cellulose',
    origin: 'USA'
  },
  {
    name: 'Organic Matcha Green Tea',
    description: 'Premium ceremonial grade matcha sourced directly from small family farms in Japan. Packed in recyclable tin. No additives, just pure zen.',
    price: 22.00,
    originalPrice: null,
    images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80'],
    category: 'Food & Beverage',
    sustainabilityScore: 90,
    ecoBadges: ['Organic', 'Fair Trade', 'Rainforest Alliance'],
    verified: true,
    verificationNotes: 'USDA Organic certified. Direct trade with Uji farmers.',
    brand: 'TeaHouse Japan',
    stock: 120,
    featured: true,
    rating: 4.9,
    numReviews: 88,
    tags: ['matcha', 'tea', 'organic', 'food'],
    weight: '100g',
    origin: 'Japan'
  },
  {
    name: 'Beeswax Food Wraps (3-pack)',
    description: 'Reusable food wraps made from organic cotton infused with beeswax, pine resin, and jojoba oil. The natural alternative to plastic wrap. Washable and reusable for up to a year.',
    price: 16.95,
    originalPrice: 19.99,
    images: ['https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80'],
    category: 'Home & Garden',
    sustainabilityScore: 93,
    ecoBadges: ['Organic', 'Biodegradable', 'Zero Waste'],
    verified: true,
    verificationNotes: 'Beeswax sourced from certified apiaries. Fully biodegradable.',
    brand: 'BeeWrap',
    stock: 175,
    featured: false,
    rating: 4.7,
    numReviews: 112,
    tags: ['beeswax', 'food wrap', 'kitchen', 'reusable'],
    material: 'Organic Cotton + Beeswax',
    origin: 'UK'
  },
  {
    name: 'Recycled Plastic Backpack',
    description: 'Stylish 20L daypack made from 100% recycled plastic bottles (approx. 30 PET bottles per bag). Water-resistant, durable, and fully functional.',
    price: 79.99,
    originalPrice: 99.99,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'],
    category: 'Outdoor & Travel',
    sustainabilityScore: 82,
    ecoBadges: ['Recycled', 'Carbon Neutral'],
    verified: true,
    verificationNotes: 'Made from certified recycled PET. Bluesign approved fabric.',
    brand: 'EcoTrail',
    stock: 60,
    featured: true,
    rating: 4.5,
    numReviews: 74,
    tags: ['backpack', 'recycled', 'outdoor', 'travel'],
    material: 'Recycled PET',
    origin: 'Netherlands'
  },
  {
    name: 'Natural Beeswax Candles',
    description: 'Hand-poured 100% pure beeswax candles with cotton wicks. Burns cleaner and longer than paraffin. Natural honey scent. No synthetic fragrances or dyes.',
    price: 14.99,
    originalPrice: null,
    images: ['https://images.unsplash.com/photo-1603905870736-1a0c78a3d3b0?w=600&q=80'],
    category: 'Home & Garden',
    sustainabilityScore: 88,
    ecoBadges: ['Organic', 'Vegan', 'Cruelty Free'],
    verified: false,
    verificationNotes: 'Verification pending for beeswax sourcing certification.',
    brand: 'NaturalGlow',
    stock: 90,
    featured: false,
    rating: 4.6,
    numReviews: 45,
    tags: ['candles', 'beeswax', 'home', 'natural'],
    material: 'Pure Beeswax + Cotton Wick',
    origin: 'USA'
  },
  {
    name: 'Organic Baby Onesie Set',
    description: 'Super soft set of 3 onesies made from GOTS-certified organic cotton. Free from harmful dyes and chemicals. Safe for delicate baby skin.',
    price: 34.99,
    originalPrice: 39.99,
    images: ['https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&q=80'],
    category: 'Kids & Baby',
    sustainabilityScore: 94,
    ecoBadges: ['Organic', 'Fair Trade', 'Cruelty Free'],
    verified: true,
    verificationNotes: 'GOTS certified. OEKO-TEX Standard 100 verified.',
    brand: 'TinyEco',
    stock: 110,
    featured: false,
    rating: 4.8,
    numReviews: 63,
    tags: ['baby', 'organic', 'cotton', 'kids'],
    material: 'GOTS Organic Cotton',
    origin: 'India'
  },
  {
    name: 'Recycled Paper Notebook',
    description: '100% post-consumer recycled paper notebook with a seed paper cover you can plant after use. 160 pages, lay-flat binding. Pen not included.',
    price: 11.99,
    originalPrice: null,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80'],
    category: 'Office & Stationery',
    sustainabilityScore: 91,
    ecoBadges: ['Recycled', 'Zero Waste', 'Biodegradable'],
    verified: true,
    verificationNotes: 'FSC certified recycled paper. Cover is plantable seed paper.',
    brand: 'GreenPages',
    stock: 240,
    featured: false,
    rating: 4.4,
    numReviews: 38,
    tags: ['notebook', 'recycled paper', 'stationery', 'office'],
    material: 'Recycled Paper',
    origin: 'Canada'
  },
  {
    name: 'Solid Shampoo Bar',
    description: 'One bar replaces 3 bottles of liquid shampoo. Made with natural oils and botanical extracts. Free from sulfates, parabens, and silicones. 100% plastic-free packaging.',
    price: 13.50,
    originalPrice: null,
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80'],
    category: 'Personal Care',
    sustainabilityScore: 96,
    ecoBadges: ['Vegan', 'Zero Waste', 'Cruelty Free', 'Biodegradable'],
    verified: true,
    verificationNotes: 'COSMOS organic certified. Leaping Bunny certified cruelty-free.',
    brand: 'BarNaturals',
    stock: 195,
    featured: true,
    rating: 4.7,
    numReviews: 91,
    tags: ['shampoo', 'bar', 'plastic free', 'personal care'],
    material: 'Natural Oils & Botanicals',
    origin: 'France'
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany();
    await Product.deleteMany();
    console.log('Cleared existing data');

    // Create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@greenproducts.com',
      password: 'admin123',
      role: 'admin'
    });

    // Create test user
    const user = await User.create({
      name: 'John Eco',
      email: 'user@greenproducts.com',
      password: 'user123',
      role: 'user'
    });

    // Seed products
    await Product.insertMany(products);

    console.log(`\n✅ Database seeded successfully!`);
    console.log(`👤 Admin: admin@greenproducts.com / admin123`);
    console.log(`👤 User:  user@greenproducts.com / user123`);
    console.log(`📦 ${products.length} products added\n`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
