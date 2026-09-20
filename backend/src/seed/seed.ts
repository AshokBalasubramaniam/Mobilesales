import mongoose from 'mongoose';
import env from '../config/env';
import logger from '../utils/logger';
import User from '../models/User';
import Mobile from '../models/Mobile';
import Coupon from '../models/Coupon';
import { ROLES, MOBILE_STATUS, MOBILE_CONDITION, DEVICE_CATEGORY, VERIFICATION_STATUS, COUPON_DISCOUNT_TYPE } from '../config/constants';
import type { MobileCondition, DeviceCategory } from '../types/constants';

interface SampleListing {
  category: DeviceCategory;
  brand: string;
  model: string;
  storage?: number;
  ram?: number;
  price: number;
  mrp: number;
  condition: MobileCondition;
  batteryHealth?: number;
}

const SAMPLE_LISTINGS: SampleListing[] = [
  // Phones
  { category: DEVICE_CATEGORY.PHONE, brand: 'Apple', model: 'iPhone 13', storage: 128, ram: 4, price: 42000, mrp: 69900, condition: MOBILE_CONDITION.EXCELLENT, batteryHealth: 92 },
  { category: DEVICE_CATEGORY.PHONE, brand: 'Samsung', model: 'Galaxy S22', storage: 256, ram: 8, price: 38000, mrp: 72999, condition: MOBILE_CONDITION.GOOD, batteryHealth: 88 },
  { category: DEVICE_CATEGORY.PHONE, brand: 'OnePlus', model: '11R', storage: 128, ram: 8, price: 25000, mrp: 39999, condition: MOBILE_CONDITION.GOOD, batteryHealth: 95 },
  { category: DEVICE_CATEGORY.PHONE, brand: 'Xiaomi', model: 'Redmi Note 12 Pro', storage: 128, ram: 6, price: 14000, mrp: 24999, condition: MOBILE_CONDITION.FAIR, batteryHealth: 80 },
  { category: DEVICE_CATEGORY.PHONE, brand: 'Apple', model: 'iPhone 12', storage: 64, ram: 4, price: 30000, mrp: 59900, condition: MOBILE_CONDITION.GOOD, batteryHealth: 85 },
  { category: DEVICE_CATEGORY.PHONE, brand: 'Nothing', model: 'Phone (2)', storage: 128, ram: 8, price: 32000, mrp: 44999, condition: MOBILE_CONDITION.EXCELLENT, batteryHealth: 96 },
  { category: DEVICE_CATEGORY.PHONE, brand: 'Nokia', model: 'G42', storage: 128, ram: 6, price: 11000, mrp: 17999, condition: MOBILE_CONDITION.GOOD, batteryHealth: 90 },

  // Laptops
  { category: DEVICE_CATEGORY.LAPTOP, brand: 'Apple', model: 'MacBook Air M2', storage: 256, ram: 8, price: 78999, mrp: 101900, condition: MOBILE_CONDITION.EXCELLENT, batteryHealth: 94 },
  { category: DEVICE_CATEGORY.LAPTOP, brand: 'Dell', model: 'XPS 13', storage: 512, ram: 16, price: 45000, mrp: 56500, condition: MOBILE_CONDITION.GOOD, batteryHealth: 87 },
  { category: DEVICE_CATEGORY.LAPTOP, brand: 'HP', model: 'Pavilion x360', storage: 512, ram: 8, price: 39000, mrp: 62999, condition: MOBILE_CONDITION.GOOD, batteryHealth: 83 },
  { category: DEVICE_CATEGORY.LAPTOP, brand: 'Lenovo', model: 'ThinkPad E14', storage: 256, ram: 8, price: 32000, mrp: 54999, condition: MOBILE_CONDITION.FAIR, batteryHealth: 78 },
  { category: DEVICE_CATEGORY.LAPTOP, brand: 'Asus', model: 'ROG Strix G15', storage: 1000, ram: 16, price: 68000, mrp: 99999, condition: MOBILE_CONDITION.EXCELLENT, batteryHealth: 91 },

  // Tablets
  { category: DEVICE_CATEGORY.TABLET, brand: 'Apple', model: 'iPad Air', storage: 64, ram: 4, price: 36000, mrp: 54900, condition: MOBILE_CONDITION.EXCELLENT, batteryHealth: 93 },
  { category: DEVICE_CATEGORY.TABLET, brand: 'Samsung', model: 'Galaxy Tab S8', storage: 128, ram: 8, price: 29000, mrp: 45999, condition: MOBILE_CONDITION.GOOD, batteryHealth: 86 },

  // Smartwatch
  { category: DEVICE_CATEGORY.SMARTWATCH, brand: 'Apple', model: 'Watch Series 8', price: 25999, mrp: 34999, condition: MOBILE_CONDITION.GOOD, batteryHealth: 89 },

  // Accessory
  { category: DEVICE_CATEGORY.ACCESSORY, brand: 'Anker', model: 'PowerCore 20000', price: 1899, mrp: 2999, condition: MOBILE_CONDITION.EXCELLENT },

  // Gaming
  { category: DEVICE_CATEGORY.GAMING, brand: 'Sony', model: 'PlayStation 5', price: 34999, mrp: 54990, condition: MOBILE_CONDITION.GOOD },

  // Audio
  { category: DEVICE_CATEGORY.AUDIO, brand: 'Apple', model: 'AirPods Pro 2', price: 16999, mrp: 26900, condition: MOBILE_CONDITION.EXCELLENT },

  // Camera
  { category: DEVICE_CATEGORY.CAMERA, brand: 'Canon', model: 'EOS 200D', price: 28999, mrp: 46999, condition: MOBILE_CONDITION.GOOD },
];

const connect = async (): Promise<void> => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  logger.info('Seed script connected to MongoDB');
};

const destroy = async (): Promise<void> => {
  await connect();
  await Promise.all([User.deleteMany({}), Mobile.deleteMany({}), Coupon.deleteMany({})]);
  logger.info('Destroyed core collections');
  await mongoose.disconnect();
};

const seed = async (): Promise<void> => {
  await connect();

  let admin = await User.findOne({ email: env.admin.email });
  if (!admin) {
    admin = await User.create({
      name: 'Platform Admin',
      email: env.admin.email,
      password: env.admin.password,
      role: ROLES.ADMIN,
      isEmailVerified: true,
    });
    logger.info(`Created admin user: ${admin.email} / ${env.admin.password}`);
  }

  let seller = await User.findOne({ email: 'seller.demo@mobilesales.local' });
  if (!seller) {
    seller = await User.create({
      name: 'Demo Seller',
      email: 'seller.demo@mobilesales.local',
      phone: '9876543210',
      password: 'Seller@12345',
      role: ROLES.SELLER,
      isEmailVerified: true,
      sellerProfile: { isVerified: true, verificationStatus: VERIFICATION_STATUS.APPROVED },
    });
    logger.info(`Created demo seller: ${seller.email} / Seller@12345`);
  }

  let buyer = await User.findOne({ email: 'buyer.demo@mobilesales.local' });
  if (!buyer) {
    buyer = await User.create({
      name: 'Demo Buyer',
      email: 'buyer.demo@mobilesales.local',
      phone: '9123456780',
      password: 'Buyer@12345',
      role: ROLES.BUYER,
      isEmailVerified: true,
    });
    logger.info(`Created demo buyer: ${buyer.email} / Buyer@12345`);
  }

  const existingListings = await Mobile.countDocuments({ seller: seller._id });
  if (existingListings === 0) {
    await Mobile.insertMany(
      SAMPLE_LISTINGS.map((listing) => ({
        ...listing,
        seller: seller._id,
        negotiable: true,
        imeiVerified: listing.category === DEVICE_CATEGORY.PHONE,
        chargerIncluded: true,
        originalBoxAvailable: true,
        accessoriesIncluded: ['charger', 'box'],
        description: `${listing.brand} ${listing.model} in ${listing.condition} condition.`,
        images: [{ url: 'https://placehold.co/600x400?text=' + encodeURIComponent(listing.model), isPrimary: true, order: 0 }],
        location: { state: 'Karnataka', city: 'Bengaluru', pincode: '560001', geo: { type: 'Point', coordinates: [77.5946, 12.9716] } },
        status: MOBILE_STATUS.ACTIVE,
        approvedAt: new Date(),
      }))
    );
    logger.info(`Seeded ${SAMPLE_LISTINGS.length} sample listings`);
  }

  const existingCoupon = await Coupon.findOne({ code: 'WELCOME100' });
  if (!existingCoupon) {
    await Coupon.create({
      code: 'WELCOME100',
      description: 'Flat ₹100 off on your first order',
      discountType: COUPON_DISCOUNT_TYPE.FLAT,
      discountValue: 100,
      minOrderValue: 1000,
      perUserLimit: 1,
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      applicableFor: 'new_users',
      createdBy: admin._id,
    });
    logger.info('Seeded WELCOME100 coupon');
  }

  logger.info('Seeding complete');
  await mongoose.disconnect();
};

const run = async (): Promise<void> => {
  try {
    if (process.argv.includes('--destroy')) {
      await destroy();
    } else {
      await seed();
    }
    process.exit(0);
  } catch (err) {
    logger.error('Seeding failed:', err);
    process.exit(1);
  }
};

run();
