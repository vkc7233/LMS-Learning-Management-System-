const Coupon = require('../models/Coupon');

// @route GET /api/coupons  (Admin)
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().populate('createdBy', 'name').sort('-createdAt');
    res.json({ success: true, count: coupons.length, coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/coupons  (Admin)
exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/coupons/:id  (Admin)
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/coupons/:id  (Admin)
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/coupons/validate  (Student - public)
exports.validateCoupon = async (req, res) => {
  try {
    const { code, price } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

    const validity = coupon.isValid();
    if (!validity.valid) return res.status(400).json({ success: false, message: validity.reason });

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((price * coupon.discountValue) / 100);
    } else {
      discount = Math.min(coupon.discountValue, price);
    }

    res.json({
      success: true,
      coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
      discountAmount: discount,
      finalPrice: Math.max(0, price - discount),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
