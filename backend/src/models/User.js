const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { ROLES, AUTH_PROVIDER, VERIFICATION_STATUS } = require('../config/constants');

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: false }
);

const refreshTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    userAgent: { type: String },
    ip: { type: String },
    expiresAt: { type: Date, required: true },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const sellerProfileSchema = new mongoose.Schema(
  {
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.NOT_SUBMITTED,
    },
    documents: {
      aadhaarUrl: { type: String },
      panUrl: { type: String },
      selfieUrl: { type: String },
      purchaseBillUrl: { type: String },
    },
    rejectionReason: { type: String },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/, 'Invalid email address'],
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      match: [/^[6-9]\d{9}$/, 'Invalid Indian mobile number'],
    },
    password: { type: String, minlength: 8, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.BUYER },
    avatar: { type: String, default: '' },

    authProvider: { type: String, enum: Object.values(AUTH_PROVIDER), default: AUTH_PROVIDER.LOCAL },
    googleId: { type: String, select: false },

    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },

    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    otp: {
      codeHash: { type: String, select: false },
      purpose: { type: String, enum: ['login', 'phone_verify'], select: false },
      expiresAt: { type: Date, select: false },
      attempts: { type: Number, default: 0, select: false },
    },

    addresses: [addressSchema],
    sellerProfile: { type: sellerProfileSchema, default: () => ({}) },

    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },

    isBlocked: { type: Boolean, default: false },
    blockReason: { type: String },

    refreshTokens: { type: [refreshTokenSchema], select: false, default: [] },

    lastLoginAt: { type: Date },
    lastSeen: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ 'sellerProfile.verificationStatus': 1 });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.generateAccessToken = function generateAccessToken() {
  return jwt.sign({ sub: this._id.toString(), role: this.role }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });
};

userSchema.methods.generateRefreshToken = function generateRefreshToken() {
  return jwt.sign({ sub: this._id.toString(), type: 'refresh' }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject({ virtuals: false });
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.otp;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  delete obj.googleId;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
