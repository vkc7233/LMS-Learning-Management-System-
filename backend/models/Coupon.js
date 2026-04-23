const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  maxUses: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

couponSchema.methods.isValid = function () {
  if (!this.isActive) return { valid: false, reason: 'Coupon is inactive' };
  if (this.usedCount >= this.maxUses) return { valid: false, reason: 'Coupon usage limit reached' };
  if (this.expiresAt && new Date() > this.expiresAt) return { valid: false, reason: 'Coupon has expired' };
  return { valid: true };
};

module.exports = mongoose.model('Coupon', couponSchema);
