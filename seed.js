// ============================================================
// Infotact Food App — MongoDB Seed Script
// Run with: mongosh infotact_foodapp seed.js
//
// NOTE: Passwords below are BCrypt hashes of "demo123".
// Change all credentials before using in production.
// ============================================================

db = db.getSiblingDB('infotact_foodapp');

// Clear existing data
db.users.drop();
db.restaurants.drop();
db.menu_items.drop();
db.orders.drop();
db.reviews.drop();
db.table_reservations.drop();

print('🗑️  Cleared existing collections');

// ── Users ──────────────────────────────────────────────────
// BCrypt hash of "demo123" — CHANGE IN PRODUCTION
const bcryptDemo = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

const customerUser = {
  _id: ObjectId('650000000000000000000001'),
  email: 'customer@demo.com',
  password: bcryptDemo,
  name: 'Arjun Kumar',
  phone: '9876543210',
  role: 'CONSUMER',
  loyaltyPoints: 120,
  address: '12, Anna Nagar, Chennai',
  latitude: 13.0827,
  longitude: 80.2707,
  active: true,
  createdAt: new Date()
};

const partnerUser = {
  _id: ObjectId('650000000000000000000002'),
  email: 'partner@demo.com',
  password: bcryptDemo,
  name: 'Priya Sharma',
  phone: '9876543211',
  role: 'RESTAURANT_PARTNER',
  loyaltyPoints: 0,
  active: true,
  restaurantId: '650000000000000000000010',
  createdAt: new Date()
};

const courierUser = {
  _id: ObjectId('650000000000000000000003'),
  email: 'courier@demo.com',
  password: bcryptDemo,
  name: 'Ravi Delivery',
  phone: '9876543212',
  role: 'DELIVERY_COURIER',
  loyaltyPoints: 0,
  active: true,
  createdAt: new Date()
};

db.users.insertMany([customerUser, partnerUser, courierUser]);
print('✅ Users seeded (3)');

// ── Restaurants ────────────────────────────────────────────
const restaurants = [
  {
    _id: ObjectId('650000000000000000000010'),
    name: 'Spice Garden',
    description: 'Authentic South Indian cuisine with traditional recipes passed down generations.',
    ownerId: '650000000000000000000002',
    ownerEmail: 'partner@demo.com',
    cuisineType: 'South Indian',
    category: 'Casual',
    address: '45, T Nagar, Chennai',
    city: 'Chennai',
    pincode: '600017',
    location: [80.2341, 13.0418],
    phone: '044-12345678',
    averageRating: 4.3,
    totalReviews: 87,
    openTime: '08:00',
    closeTime: '22:00',
    isOpen: true,
    acceptingOrders: true,
    acceptingReservations: true,
    deliveryRadius: 10.0,
    deliveryFee: 30.0,
    minimumOrderAmount: 150.0,
    averageDeliveryTime: 35,
    tags: ['popular', 'family', 'vegetarian'],
    createdAt: new Date()
  },
  {
    _id: ObjectId('650000000000000000000011'),
    name: 'Dragon Palace',
    description: 'Best Chinese food in the city — Dim Sum, Noodles, and Sizzlers.',
    ownerId: '650000000000000000000002',
    ownerEmail: 'partner@demo.com',
    cuisineType: 'Chinese',
    category: 'Fine Dining',
    address: '78, Nungambakkam, Chennai',
    city: 'Chennai',
    pincode: '600034',
    location: [80.2492, 13.0585],
    phone: '044-98765432',
    averageRating: 4.5,
    totalReviews: 134,
    openTime: '11:00',
    closeTime: '23:00',
    isOpen: true,
    acceptingOrders: true,
    acceptingReservations: true,
    deliveryRadius: 12.0,
    deliveryFee: 40.0,
    minimumOrderAmount: 200.0,
    averageDeliveryTime: 40,
    tags: ['chinese', 'noodles', 'trending'],
    createdAt: new Date()
  },
  {
    _id: ObjectId('650000000000000000000012'),
    name: 'Burger Barn',
    description: 'Gourmet burgers, loaded fries and thick milkshakes.',
    ownerId: '650000000000000000000002',
    ownerEmail: 'partner@demo.com',
    cuisineType: 'Fast Food',
    category: 'Fast Food',
    address: '22, Velachery, Chennai',
    city: 'Chennai',
    pincode: '600042',
    location: [80.2190, 12.9786],
    phone: '044-55556666',
    averageRating: 4.1,
    totalReviews: 56,
    openTime: '10:00',
    closeTime: '23:30',
    isOpen: true,
    acceptingOrders: true,
    acceptingReservations: false,
    deliveryRadius: 8.0,
    deliveryFee: 25.0,
    minimumOrderAmount: 100.0,
    averageDeliveryTime: 25,
    tags: ['burgers', 'fast', 'affordable'],
    createdAt: new Date()
  }
];

db.restaurants.insertMany(restaurants);
print('✅ Restaurants seeded (3)');

// ── Menu Items ─────────────────────────────────────────────
const menuItems = [
  { restaurantId: '650000000000000000000010', name: 'Masala Dosa',          price: 80,  category: 'Main Course', isVeg: true,  isAvailable: true, preparationTime: 15, tags: ['bestseller'] },
  { restaurantId: '650000000000000000000010', name: 'Idli Sambar',          price: 60,  category: 'Breakfast',   isVeg: true,  isAvailable: true, preparationTime: 10 },
  { restaurantId: '650000000000000000000010', name: 'Chettinad Chicken',    price: 220, category: 'Main Course', isVeg: false, isAvailable: true, preparationTime: 25, tags: ['spicy'] },
  { restaurantId: '650000000000000000000010', name: 'Filter Coffee',        price: 40,  category: 'Beverage',    isVeg: true,  isAvailable: true, preparationTime: 5 },
  { restaurantId: '650000000000000000000010', name: 'Pongal',               price: 70,  category: 'Breakfast',   isVeg: true,  isAvailable: true, preparationTime: 12 },
  { restaurantId: '650000000000000000000011', name: 'Hakka Noodles',        price: 180, category: 'Main Course', isVeg: true,  isAvailable: true, preparationTime: 20, tags: ['bestseller'] },
  { restaurantId: '650000000000000000000011', name: 'Chicken Dimsums',      price: 220, category: 'Starter',     isVeg: false, isAvailable: true, preparationTime: 18 },
  { restaurantId: '650000000000000000000011', name: 'Kung Pao Chicken',     price: 280, category: 'Main Course', isVeg: false, isAvailable: true, preparationTime: 22, tags: ['spicy'] },
  { restaurantId: '650000000000000000000011', name: 'Veg Fried Rice',       price: 160, category: 'Main Course', isVeg: true,  isAvailable: true, preparationTime: 18 },
  { restaurantId: '650000000000000000000011', name: 'Spring Rolls',         price: 130, category: 'Starter',     isVeg: true,  isAvailable: true, preparationTime: 15 },
  { restaurantId: '650000000000000000000012', name: 'Classic Cheeseburger', price: 199, category: 'Main Course', isVeg: false, isAvailable: true, preparationTime: 15, tags: ['bestseller'] },
  { restaurantId: '650000000000000000000012', name: 'Veggie Burger',        price: 169, category: 'Main Course', isVeg: true,  isAvailable: true, preparationTime: 12 },
  { restaurantId: '650000000000000000000012', name: 'Loaded Fries',         price: 129, category: 'Starter',     isVeg: true,  isAvailable: true, preparationTime: 10 },
  { restaurantId: '650000000000000000000012', name: 'Chocolate Shake',      price: 99,  category: 'Beverage',    isVeg: true,  isAvailable: true, preparationTime: 5 },
  { restaurantId: '650000000000000000000012', name: 'Chicken Wings',        price: 249, category: 'Starter',     isVeg: false, isAvailable: true, preparationTime: 18 },
];

db.menu_items.insertMany(menuItems);
print('✅ Menu items seeded (15)');

// Indexes
db.restaurants.createIndex({ location: '2dsphere' });
db.menu_items.createIndex({ restaurantId: 1 });
db.orders.createIndex({ customerId: 1 });
db.orders.createIndex({ restaurantId: 1 });
db.reviews.createIndex({ restaurantId: 1 });
db.table_reservations.createIndex({ restaurantId: 1, reservationDateTime: 1 });
print('✅ Indexes created');

print('\n🚀 Seed complete! Demo login credentials:');
print('   customer@demo.com  / demo123');
print('   partner@demo.com   / demo123');
print('   courier@demo.com   / demo123');
print('   ⚠️  Change these before deploying to production!');
