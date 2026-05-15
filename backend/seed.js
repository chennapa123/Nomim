/**
 * AgriMart Seed Script
 * Run: cd backend && node seed.js
 * Creates demo farmer, vendor, and products for testing
 */

const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
require('dotenv').config();

const FARMERS = [
  {
    name: 'Raju Patel', email: 'farmer1@test.com', password: 'test123',
    role: 'farmer', phone: '9876543210',
    farmName: 'Green Valley Organics',
    farmingType: 'organic',
    cropTypes: ['Tomatoes', 'Onions', 'Potatoes', 'Capsicum'],
    farmLocation: { city: 'Nashik', state: 'Maharashtra', pincode: '422001' },
    bio: 'Third-generation farmer growing organic vegetables using traditional methods combined with modern techniques. Certified organic since 2018.',
    rating: 4.8, totalRatings: 124, isVerified: true
  },
  {
    name: 'Sunita Devi', email: 'farmer2@test.com', password: 'test123',
    role: 'farmer', phone: '9876543211',
    farmName: 'Sunita Spice Farm',
    farmingType: 'conventional',
    cropTypes: ['Turmeric', 'Chilli', 'Coriander', 'Cumin'],
    farmLocation: { city: 'Guntur', state: 'Andhra Pradesh', pincode: '522001' },
    bio: 'Specializing in premium spices grown in the fertile soils of Guntur. Known for quality red chillies and turmeric.',
    rating: 4.6, totalRatings: 89
  },
  {
    name: 'Harpreet Singh', email: 'farmer3@test.com', password: 'test123',
    role: 'farmer', phone: '9876543212',
    farmName: 'Punjab Golden Grains',
    farmingType: 'conventional',
    cropTypes: ['Wheat', 'Rice', 'Mustard', 'Basmati'],
    farmLocation: { city: 'Amritsar', state: 'Punjab', pincode: '143001' },
    bio: 'Growing premium Basmati rice and wheat in the heart of Punjab. Direct farm-to-table, no storage delays.',
    rating: 4.9, totalRatings: 201
  }
];

const VENDORS = [
  {
    name: 'Suresh Kumar', email: 'vendor1@test.com', password: 'test123',
    role: 'vendor', phone: '9876543220',
    businessName: 'Suresh Fresh Mart',
    businessType: 'retailer',
    businessLocation: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' }
  },
  {
    name: 'Priya Restaurants', email: 'vendor2@test.com', password: 'test123',
    role: 'vendor', phone: '9876543221',
    businessName: "Priya's Kitchen Chain",
    businessType: 'restaurant',
    businessLocation: { city: 'Bangalore', state: 'Karnataka', pincode: '560001' }
  }
];

const getProducts = (farmerMap) => [
  {
    farmer: farmerMap['farmer1@test.com'],
    name: 'Organic Cherry Tomatoes',
    description: 'Sweet and juicy organic cherry tomatoes, freshly picked. Perfect for salads and restaurants. Grown without any pesticides using natural compost.',
    category: 'vegetables', price: 85, unit: 'kg',
    availableQuantity: 300, minOrderQuantity: 5,
    isOrganic: true, isFeatured: true,
    location: { city: 'Nashik', state: 'Maharashtra', pincode: '422001' },
    tags: ['organic', 'fresh', 'seasonal', 'cherry-tomatoes'],
    deliveryOptions: { vendorPickup: true, farmerDelivery: true, shippingAvailable: false },
    images: [{ url: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&q=80' }],
    rating: 4.7, totalRatings: 42
  },
  {
    farmer: farmerMap['farmer1@test.com'],
    name: 'Organic Red Onions',
    description: 'Premium quality organic red onions with intense flavour. Ideal for bulk purchase by restaurants and retailers. Freshly harvested from our certified organic farm.',
    category: 'vegetables', price: 35, unit: 'kg',
    availableQuantity: 2000, minOrderQuantity: 20,
    isOrganic: true,
    location: { city: 'Nashik', state: 'Maharashtra', pincode: '422001' },
    tags: ['organic', 'bulk', 'onions'],
    deliveryOptions: { vendorPickup: true, farmerDelivery: false, shippingAvailable: false },
    images: [{ url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&q=80' }],
    rating: 4.5, totalRatings: 31
  },
  {
    farmer: farmerMap['farmer2@test.com'],
    name: 'Guntur Red Chilli (Teja Variety)',
    description: 'The famous Teja variety red chilli from Guntur — known for its intense heat and brilliant red colour. A staple for spice wholesalers and pickle manufacturers.',
    category: 'spices', price: 220, unit: 'kg',
    availableQuantity: 500, minOrderQuantity: 10,
    isOrganic: false, isFeatured: true,
    location: { city: 'Guntur', state: 'Andhra Pradesh', pincode: '522001' },
    tags: ['spicy', 'guntur', 'teja', 'bulk'],
    deliveryOptions: { vendorPickup: true, farmerDelivery: false, shippingAvailable: true },
    images: [{ url: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&q=80' }],
    rating: 4.8, totalRatings: 58
  },
  {
    farmer: farmerMap['farmer2@test.com'],
    name: 'Organic Turmeric Powder',
    description: 'Pure turmeric grown and stone-ground on our farm. High curcumin content (4.5%+). Tested and certified. Ideal for food processing companies and Ayurvedic suppliers.',
    category: 'spices', price: 180, unit: 'kg',
    availableQuantity: 200, minOrderQuantity: 5,
    isOrganic: true,
    location: { city: 'Guntur', state: 'Andhra Pradesh', pincode: '522001' },
    tags: ['turmeric', 'organic', 'powder', 'high-curcumin'],
    deliveryOptions: { vendorPickup: true, farmerDelivery: false, shippingAvailable: true },
    images: [{ url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&q=80' }],
    rating: 4.6, totalRatings: 27
  },
  {
    farmer: farmerMap['farmer3@test.com'],
    name: 'Pusa Basmati Rice 1121',
    description: 'Premium extra-long grain Basmati rice from the golden fields of Punjab. Aged for 12 months for superior aroma and non-sticky cooking. A top choice for exporters and restaurants.',
    category: 'grains', price: 95, unit: 'kg',
    availableQuantity: 5000, minOrderQuantity: 50,
    isOrganic: false, isFeatured: true,
    location: { city: 'Amritsar', state: 'Punjab', pincode: '143001' },
    tags: ['basmati', 'aged', 'premium', '1121'],
    deliveryOptions: { vendorPickup: true, farmerDelivery: true, shippingAvailable: true },
    images: [{ url: 'https://images.unsplash.com/photo-1536304993881-ff86e0c9b18a?w=600&q=80' }],
    rating: 4.9, totalRatings: 87
  },
  {
    farmer: farmerMap['farmer3@test.com'],
    name: 'Organic Wheat (Sharbati)',
    description: 'Sharbati wheat from Amritsar — naturally sweet, golden kernels with high protein content. Perfect for atta mills, bakeries, and health food brands.',
    category: 'grains', price: 28, unit: 'kg',
    availableQuantity: 10000, minOrderQuantity: 100,
    isOrganic: true,
    location: { city: 'Amritsar', state: 'Punjab', pincode: '143001' },
    tags: ['wheat', 'sharbati', 'bulk', 'organic'],
    deliveryOptions: { vendorPickup: true, farmerDelivery: true, shippingAvailable: true },
    images: [{ url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80' }],
    rating: 4.7, totalRatings: 63
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/agrimart');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([User.deleteMany({}), Product.deleteMany({})]);
    console.log('🗑  Cleared existing data');

    // Create farmers
    const createdFarmers = await User.create(FARMERS);
    console.log(`✅ Created ${createdFarmers.length} farmers`);

    // Create vendors
    const createdVendors = await User.create(VENDORS);
    console.log(`✅ Created ${createdVendors.length} vendors`);

    // Map email -> _id for products
    const farmerMap = {};
    createdFarmers.forEach(f => { farmerMap[f.email] = f._id; });

    // Create products
    const createdProducts = await Product.create(getProducts(farmerMap));
    console.log(`✅ Created ${createdProducts.length} products`);

    console.log('\n🎉 Seed complete!\n');
    console.log('--- Test Accounts ---');
    console.log('Farmers:');
    FARMERS.forEach(f => console.log(`  ${f.email} / test123 (${f.farmName})`));
    console.log('\nVendors:');
    VENDORS.forEach(v => console.log(`  ${v.email} / test123 (${v.businessName})`));
    console.log('\nVisit: http://localhost:3000');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
