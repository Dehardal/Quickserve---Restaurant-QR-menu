const InventoryItem = require('../models/InventoryItem');
const Dish = require('../models/Dish');
const StockLog = require('../models/StockLog');

// @desc    Get all inventory items and dish stock summary
// @route   GET /api/inventory
// @access  Private
const getInventory = async (req, res) => {
  try {
    const ownerId = req.user._id;

    // Fetch raw material / packaging inventory items
    const rawItems = await InventoryItem.find({ restaurant: ownerId }).sort({ createdAt: -1 });

    // Fetch dishes that are tracking stock
    const trackedDishes = await Dish.find({ owner: ownerId, trackStock: true }).populate('category', 'name');

    // Calculate metrics
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalValuation = 0;

    rawItems.forEach((item) => {
      totalValuation += (item.currentStock || 0) * (item.costPerUnit || 0);
      if (item.currentStock === 0) {
        outOfStockCount++;
      } else if (item.currentStock <= item.minStockThreshold) {
        lowStockCount++;
      }
    });

    trackedDishes.forEach((dish) => {
      totalValuation += (dish.stockQuantity || 0) * (dish.price || 0);
      if (dish.stockQuantity === 0 || !dish.isAvailable) {
        outOfStockCount++;
      } else if (dish.stockQuantity <= (dish.lowStockThreshold || 5)) {
        lowStockCount++;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        rawItems,
        trackedDishes,
        metrics: {
          totalRawItems: rawItems.length,
          totalTrackedDishes: trackedDishes.length,
          lowStockCount,
          outOfStockCount,
          totalValuation,
        },
      },
    });
  } catch (error) {
    console.error('Get inventory error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new raw material or packaging item
// @route   POST /api/inventory
// @access  Private
const createInventoryItem = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const {
      name,
      sku,
      category,
      unit,
      currentStock,
      minStockThreshold,
      costPerUnit,
      supplierName,
      supplierContact,
      notes,
    } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide an item name' });
    }

    const item = await InventoryItem.create({
      restaurant: ownerId,
      name: name.trim(),
      sku: sku ? sku.trim() : '',
      category: category || 'General',
      unit: unit || 'pcs',
      currentStock: Number(currentStock) || 0,
      minStockThreshold: Number(minStockThreshold) || 5,
      costPerUnit: Number(costPerUnit) || 0,
      supplierName: supplierName || '',
      supplierContact: supplierContact || '',
      notes: notes || '',
    });

    // Create initial stock audit log
    if (Number(currentStock) > 0) {
      await StockLog.create({
        restaurant: ownerId,
        inventoryItem: item._id,
        itemName: item.name,
        changeType: 'manual_restock',
        quantityChanged: Number(currentStock),
        previousStock: 0,
        newStock: Number(currentStock),
        notes: 'Initial stock intake',
      });
    }

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error('Create inventory item error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an inventory item
// @route   PUT /api/inventory/:id
// @access  Private
const updateInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findOne({ _id: req.params.id, restaurant: req.user._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const prevStock = item.currentStock;
    const newStock = req.body.currentStock !== undefined ? Number(req.body.currentStock) : prevStock;

    Object.assign(item, req.body);
    await item.save();

    if (prevStock !== newStock) {
      await StockLog.create({
        restaurant: req.user._id,
        inventoryItem: item._id,
        itemName: item.name,
        changeType: 'adjustment',
        quantityChanged: newStock - prevStock,
        previousStock: prevStock,
        newStock: newStock,
        notes: req.body.notes || 'Manual stock level adjustment',
      });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error('Update inventory item error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restock an inventory item
// @route   POST /api/inventory/:id/restock
// @access  Private
const restockInventoryItem = async (req, res) => {
  try {
    const { quantity, costPerUnit, supplierName, notes } = req.body;
    const addedQty = Number(quantity);

    if (!addedQty || addedQty <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid positive quantity to restock' });
    }

    const item = await InventoryItem.findOne({ _id: req.params.id, restaurant: req.user._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const previousStock = item.currentStock;
    const newStock = previousStock + addedQty;

    item.currentStock = newStock;
    if (costPerUnit) item.costPerUnit = Number(costPerUnit);
    if (supplierName) item.supplierName = supplierName;
    await item.save();

    const log = await StockLog.create({
      restaurant: req.user._id,
      inventoryItem: item._id,
      itemName: item.name,
      changeType: 'manual_restock',
      quantityChanged: addedQty,
      previousStock,
      newStock,
      notes: notes || `Restocked +${addedQty} ${item.unit} from ${supplierName || 'supplier'}`,
    });

    res.status(200).json({ success: true, data: item, log });
  } catch (error) {
    console.error('Restock item error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update dish direct stock
// @route   POST /api/inventory/dish-stock
// @access  Private
const updateDishStock = async (req, res) => {
  try {
    const { dishId, stockQuantity, trackStock, lowStockThreshold } = req.body;

    const dish = await Dish.findOne({ _id: dishId, owner: req.user._id });
    if (!dish) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }

    const prevStock = dish.stockQuantity || 0;
    const newStock = Number(stockQuantity);

    dish.trackStock = trackStock !== undefined ? trackStock : dish.trackStock;
    dish.stockQuantity = newStock;
    if (lowStockThreshold !== undefined) dish.lowStockThreshold = Number(lowStockThreshold);

    // If stock > 0, ensure dish is marked available
    if (newStock > 0 && !dish.isAvailable) {
      dish.isAvailable = true;
    } else if (newStock === 0 && dish.trackStock) {
      dish.isAvailable = false;
    }

    await dish.save();

    await StockLog.create({
      restaurant: req.user._id,
      dish: dish._id,
      itemName: dish.name,
      changeType: 'adjustment',
      quantityChanged: newStock - prevStock,
      previousStock: prevStock,
      newStock: newStock,
      notes: 'Dish direct stock update',
    });

    // Notify clients if availability changed
    const io = req.app.get('socketio');
    if (io) {
      io.to(req.user._id.toString()).emit('dish_availability_changed', {
        dishId: dish._id,
        isAvailable: dish.isAvailable,
        stockQuantity: dish.stockQuantity,
      });
    }

    res.status(200).json({ success: true, data: dish });
  } catch (error) {
    console.error('Update dish stock error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private
const deleteInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findOneAndDelete({ _id: req.params.id, restaurant: req.user._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get stock audit logs
// @route   GET /api/inventory/logs
// @access  Private
const getStockLogs = async (req, res) => {
  try {
    const logs = await StockLog.find({ restaurant: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('Get logs error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get low stock alerts for dashboard banner
// @route   GET /api/inventory/alerts
// @access  Private
const getLowStockAlerts = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const rawAlerts = await InventoryItem.find({
      restaurant: ownerId,
      $expr: { $lte: ['$currentStock', '$minStockThreshold'] },
    }).select('name category unit currentStock minStockThreshold');

    const dishAlerts = await Dish.find({
      owner: ownerId,
      trackStock: true,
      $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
    }).select('name price stockQuantity lowStockThreshold isAvailable');

    res.status(200).json({
      success: true,
      data: {
        rawAlerts,
        dishAlerts,
        totalAlerts: rawAlerts.length + dishAlerts.length,
      },
    });
  } catch (error) {
    console.error('Get alerts error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  restockInventoryItem,
  updateDishStock,
  deleteInventoryItem,
  getStockLogs,
  getLowStockAlerts,
};
