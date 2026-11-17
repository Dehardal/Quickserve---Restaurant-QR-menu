const express = require('express');
const router = express.Router();
const {
  getPaymentConfig,
  createCashfreeOrder,
  verifyCashfreeOrder,
  handleCashfreeWebhook,
} = require('../controllers/paymentController');

// Public endpoints
router.get('/config', getPaymentConfig);
router.post('/cashfree/create-order', createCashfreeOrder);
router.post('/cashfree/verify', verifyCashfreeOrder);
router.post('/cashfree/webhook', handleCashfreeWebhook);

module.exports = router;

