const express = require('express');
const router = express.Router();
const {
  listClients,
  createClient,
  updateClient,
  getDnsGuide,
  deleteClient,
} = require('../controllers/agencyController');
const { protect, requireSuperAdmin } = require('../middleware/authMiddleware');

// All routes here require logged-in superadmin
router.use(protect, requireSuperAdmin);

router.route('/restaurants').get(listClients).post(createClient);
router.route('/restaurants/:id').put(updateClient).delete(deleteClient);
router.route('/dns-guide/:id').get(getDnsGuide);

module.exports = router;

