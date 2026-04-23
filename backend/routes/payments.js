const express = require('express');
const router = express.Router();
const { checkout, getMyPayments, getAllPayments } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/checkout', authorize('student'), checkout);
router.get('/my-payments', getMyPayments);
router.get('/', authorize('admin'), getAllPayments);

module.exports = router;
