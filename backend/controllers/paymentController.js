const Payment = require('../models/Payment');
const Course = require('../models/Course');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const { v4: uuidv4 } = require('uuid');

// @route POST /api/payments/checkout
exports.checkout = async (req, res) => {
  try {
    const { courseId, couponCode } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Check already enrolled
    if (course.enrolledStudents.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    let finalPrice = course.price;
    let discountAmount = 0;
    let appliedCoupon = null;

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (!coupon) return res.status(400).json({ success: false, message: 'Invalid coupon code' });

      const validity = coupon.isValid();
      if (!validity.valid) return res.status(400).json({ success: false, message: validity.reason });

      if (coupon.discountType === 'percentage') {
        discountAmount = Math.round((course.price * coupon.discountValue) / 100);
      } else {
        discountAmount = Math.min(coupon.discountValue, course.price);
      }
      finalPrice = Math.max(0, course.price - discountAmount);
      appliedCoupon = coupon;
    }

    // Simulate payment (always succeeds for free/paid)
    const payment = await Payment.create({
      user: req.user.id,
      course: courseId,
      amount: finalPrice,
      originalAmount: course.price,
      discountAmount,
      couponUsed: appliedCoupon ? appliedCoupon.code : null,
      transactionId: uuidv4(),
      status: 'success',
    });

    // Enroll student
    await Course.findByIdAndUpdate(courseId, { $addToSet: { enrolledStudents: req.user.id } });
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { enrolledCourses: courseId } });

    // Increment coupon usage
    if (appliedCoupon) {
      await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usedCount: 1 } });
    }

    res.status(201).json({
      success: true,
      message: 'Payment successful. You are now enrolled!',
      payment: await payment.populate([{ path: 'course', select: 'title thumbnail' }]),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/payments/my-payments
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('course', 'title thumbnail price')
      .sort('-createdAt');
    res.json({ success: true, count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/payments  (Admin)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email')
      .populate('course', 'title price')
      .sort('-createdAt');
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    res.json({ success: true, count: payments.length, totalRevenue, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
