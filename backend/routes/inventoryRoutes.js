const express = require('express');
const router = express.Router();
const {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  restockInventoryItem,
  updateDishStock,
  deleteInventoryItem,
  getStockLogs,
  getLowStockAlerts,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All inventory routes require logged-in restaurant owner

router.get('/', getInventory);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);
router.post('/:id/restock', restockInventoryItem);
router.post('/dish-stock', updateDishStock);
router.get('/logs', getStockLogs);
router.get('/alerts', getLowStockAlerts);

module.exports = router;
