const express = require('express');
const router = express.Router();
const {
  getOffers,
  getActiveOffers,
  validateOffer,
  createOffer,
  updateOffer,
  toggleOfferStatus,
  deleteOffer,
} = require('../controllers/offerController');
const { protect } = require('../middleware/authMiddleware');

// Public customer routes
router.get('/active', getActiveOffers);
router.post('/validate', validateOffer);

// Private restaurant owner routes
router.use(protect);
router.route('/').get(getOffers).post(createOffer);
router.route('/:id').put(updateOffer).delete(deleteOffer);
router.patch('/:id/toggle', toggleOfferStatus);

module.exports = router;

