const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  updateOrderStatus,
  getTableOrders,
  requestTableBill,
  updateOrderPayment,
  settleTableBill,
  getOrderInvoice,
  getTableInvoice,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Public routes for customers & tables scanning QR
router.post('/', createOrder);
router.get('/table', getTableOrders);
router.get('/table/invoice', getTableInvoice);
router.post('/table/settle', settleTableBill);
router.post('/request-bill', requestTableBill);
router.put('/:id/payment', updateOrderPayment);
router.get('/:id/invoice', getOrderInvoice);

// Private routes for restaurant owners to fetch and manage order state
router.get('/', protect, getOrders);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
