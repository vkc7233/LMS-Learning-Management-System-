const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  amount: { type: Number, required: true },
  originalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  couponUsed: { type: String, default: null },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'success' },
  transactionId: { type: String, unique: true },
  paymentMethod: { type: String, default: 'simulated' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
