import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/inventory.css';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  PackagePlus,
  Trash2,
  Edit3,
  Clock,
  Utensils,
  Layers,
  FileText,
  X,
  RefreshCw,
  Building2,
  Tag
} from 'lucide-react';

const CATEGORIES = [
  'Dairy',
  'Bakery',
  'Produce',
  'Beverages',
  'Spices & Staples',
  'Packaging',
  'Meat & Seafood',
  'General',
];

const UNITS = ['kg', 'grams', 'liters', 'ml', 'pcs', 'packets', 'boxes', 'cans'];

const Inventory = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    rawItems: [],
    trackedDishes: [],
    metrics: {
      totalRawItems: 0,
      totalTrackedDishes: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalValuation: 0,
    },
  });

  // Active Tab: 'raw' | 'dishes' | 'logs'
  const [activeTab, setActiveTab] = useState('raw');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'low' | 'out'

  // Modals
  const [isAddRawOpen, setIsAddRawOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isDishStockOpen, setIsDishStockOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [rawForm, setRawForm] = useState({
    name: '',
    sku: '',
    category: 'General',
    unit: 'pcs',
    currentStock: '',
    minStockThreshold: 5,
    costPerUnit: '',
    supplierName: '',
    supplierContact: '',
    notes: '',
  });

  const [restockForm, setRestockForm] = useState({
    quantity: '',
    costPerUnit: '',
    supplierName: '',
    notes: '',
  });

  const [dishStockForm, setDishStockForm] = useState({
    dishId: '',
    dishName: '',
    stockQuantity: '',
    trackStock: true,
    lowStockThreshold: 5,
  });

  // Logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Fetch all inventory data
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Fetch inventory error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs when switching to logs tab
  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch('/api/inventory/logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
      }
    } catch (err) {
      console.error('Fetch logs error:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchInventory();
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'logs' && token) {
      fetchLogs();
    }
  }, [activeTab, token]);

  // Handle Add Raw Item
  const handleCreateRawItem = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(rawForm),
      });
      const json = await res.json();
      if (json.success) {
        setIsAddRawOpen(false);
        setRawForm({
          name: '',
          sku: '',
          category: 'General',
          unit: 'pcs',
          currentStock: '',
          minStockThreshold: 5,
          costPerUnit: '',
          supplierName: '',
          supplierContact: '',
          notes: '',
        });
        fetchInventory();
      } else {
        alert(json.message || 'Error adding inventory item');
      }
    } catch (err) {
      console.error('Create item error:', err);
    }
  };

  // Handle Restock Item
  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      const res = await fetch(`/api/inventory/${selectedItem._id}/restock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(restockForm),
      });
      const json = await res.json();
      if (json.success) {
        setIsRestockOpen(false);
        setSelectedItem(null);
        setRestockForm({ quantity: '', costPerUnit: '', supplierName: '', notes: '' });
        fetchInventory();
      } else {
        alert(json.message || 'Error restocking item');
      }
    } catch (err) {
      console.error('Restock error:', err);
    }
  };

  // Handle Dish Direct Stock Update
  const handleDishStockSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/inventory/dish-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dishStockForm),
      });
      const json = await res.json();
      if (json.success) {
        setIsDishStockOpen(false);
        fetchInventory();
      } else {
        alert(json.message || 'Error updating dish stock');
      }
    } catch (err) {
      console.error('Update dish stock error:', err);
    }
  };

  // Handle Delete Item
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to remove this inventory item?')) return;
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        fetchInventory();
      }
    } catch (err) {
      console.error('Delete item error:', err);
    }
  };

  // Filtered raw items
  const filteredRawItems = useMemo(() => {
    return (data.rawItems || []).filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;

      let matchesStatus = true;
      if (statusFilter === 'out') {
        matchesStatus = item.currentStock === 0;
      } else if (statusFilter === 'low') {
        matchesStatus = item.currentStock > 0 && item.currentStock <= item.minStockThreshold;
      }

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [data.rawItems, searchQuery, categoryFilter, statusFilter]);

  // Filtered tracked dishes
  const filteredDishes = useMemo(() => {
    return (data.trackedDishes || []).filter((dish) => {
      const matchesSearch =
        searchQuery === '' || dish.name.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === 'out') {
        matchesStatus = dish.stockQuantity === 0 || !dish.isAvailable;
      } else if (statusFilter === 'low') {
        matchesStatus =
          dish.stockQuantity > 0 && dish.stockQuantity <= (dish.lowStockThreshold || 5);
      }

      return matchesSearch && matchesStatus;
    });
  }, [data.trackedDishes, searchQuery, statusFilter]);

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Title & CTA buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center font-bold">
                  <Boxes className="w-5 h-5" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-outfit">
                  Inventory & Stock Control
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Real-time raw material tracking, automatic order deductions, and sold-out prevention
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsAddRawOpen(true)}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Ingredient / Material</span>
              </button>
            </div>
          </div>

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Raw Materials Tracked
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {data.metrics.totalRawItems}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {data.metrics.totalTrackedDishes} Dishes Link
                </span>
              </div>
            </div>

            <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-2xs bg-amber-50/20">
              <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Low Stock Warning
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-amber-600 font-mono">
                  {data.metrics.lowStockCount}
                </span>
                <span className="text-[11px] font-semibold text-amber-600">Restock Soon</span>
              </div>
            </div>

            <div className="bg-white border border-rose-200/80 rounded-2xl p-4 shadow-2xs bg-rose-50/20">
              <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider block">
                Out of Stock (Sold Out)
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-rose-600 font-mono">
                  {data.metrics.outOfStockCount}
                </span>
                <span className="text-[11px] font-semibold text-rose-600">Disabled on QR Menu</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Estimated Stock Value
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  ₹{data.metrics.totalValuation.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600">Total Asset</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'raw'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Raw Materials & Ingredients ({data.rawItems.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('dishes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'dishes'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Dishes Direct Stock ({data.trackedDishes.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'logs'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Stock Audit Logs</span>
            </button>
          </div>

          {/* TAB 1: Raw Materials & Packaging Master */}
          {activeTab === 'raw' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-xs">
              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by ingredient or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
                  >
                    <option value="all">All Stock Levels</option>
                    <option value="low">Low Stock Only</option>
                    <option value="out">Out of Stock Only</option>
                  </select>
                </div>
              </div>

              {/* Items Table */}
              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading Inventory...</div>
              ) : filteredRawItems.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Boxes className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">No inventory items found</p>
                  <p className="text-[11px] text-slate-400">
                    Click "+ Add Ingredient / Material" to start tracking your stock.
                  </p>
                </div>
              ) : (
                <div className="inventory-table-container">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                        <th className="py-3 px-3">Item / Ingredient</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3 text-right">Current Stock</th>
                        <th className="py-3 px-3 text-right">Min Threshold</th>
                        <th className="py-3 px-3 text-right">Unit Cost</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Supplier</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRawItems.map((item) => {
                        const isOut = item.currentStock === 0;
                        const isLow = !isOut && item.currentStock <= item.minStockThreshold;

                        return (
                          <tr key={item._id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3 px-3">
                              <span className="font-bold text-slate-900 block">{item.name}</span>
                              {item.sku && (
                                <span className="text-[10px] font-mono text-slate-400">
                                  SKU: {item.sku}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                {item.category}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                              {item.currentStock} {item.unit}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-slate-500">
                              {item.minStockThreshold} {item.unit}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-slate-700">
                              ₹{item.costPerUnit || 0}
                            </td>
                            <td className="py-3 px-3">
                              {isOut ? (
                                <span className="inventory-badge-out px-2 py-0.5 rounded-full text-[10px] font-bold">
                                  Out of Stock
                                </span>
                              ) : isLow ? (
                                <span className="inventory-badge-low px-2 py-0.5 rounded-full text-[10px] font-bold">
                                  Low Stock
                                </span>
                              ) : (
                                <span className="inventory-badge-ok px-2 py-0.5 rounded-full text-[10px] font-bold">
                                  In Stock
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-500 text-[11px]">
                              {item.supplierName || '—'}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setRestockForm({
                                      quantity: '',
                                      costPerUnit: item.costPerUnit || '',
                                      supplierName: item.supplierName || '',
                                      notes: '',
                                    });
                                    setIsRestockOpen(true);
                                  }}
                                  className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                                >
                                  <PackagePlus className="w-3.5 h-3.5" /> Restock
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item._id)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Dishes Direct Stock Tracking */}
          {activeTab === 'dishes' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Dishes with Direct Unit Count
                  </h3>
                  <p className="text-xs text-slate-500">
                    When dishes reach 0, they are automatically marked as "Sold Out" on the customer QR menu
                  </p>
                </div>
              </div>

              {filteredDishes.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Utensils className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">
                    No dishes currently tracking direct stock
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Go to "Menu Items" to toggle "Track Stock" on any dish.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredDishes.map((dish) => {
                    const isOut = dish.stockQuantity <= 0 || !dish.isAvailable;
                    const isLow = !isOut && dish.stockQuantity <= (dish.lowStockThreshold || 5);

                    return (
                      <div
                        key={dish._id}
                        className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{dish.name}</h4>
                            <span className="text-[11px] font-mono text-slate-500">
                              Price: ₹{dish.price}
                            </span>
                          </div>
                          {isOut ? (
                            <span className="inventory-badge-out px-2 py-0.5 rounded-full text-[10px] font-bold">
                              Sold Out
                            </span>
                          ) : isLow ? (
                            <span className="inventory-badge-low px-2 py-0.5 rounded-full text-[10px] font-bold">
                              Low Stock
                            </span>
                          ) : (
                            <span className="inventory-badge-ok px-2 py-0.5 rounded-full text-[10px] font-bold">
                              Available
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">
                              Remaining Stock
                            </span>
                            <span className="font-mono font-black text-slate-900 text-sm">
                              {dish.stockQuantity} units
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              setDishStockForm({
                                dishId: dish._id,
                                dishName: dish.name,
                                stockQuantity: dish.stockQuantity,
                                trackStock: dish.trackStock,
                                lowStockThreshold: dish.lowStockThreshold || 5,
                              });
                              setIsDishStockOpen(true);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                          >
                            Update Stock
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Stock Audit Logs */}
          {activeTab === 'logs' && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Stock Movement Audit Trail</h3>
                  <p className="text-xs text-slate-500">
                    Every order sale, restock shipment, and manual adjustment recorded chronologically
                  </p>
                </div>
                <button
                  onClick={fetchLogs}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 text-slate-600"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>

              {logsLoading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading audit logs...</div>
              ) : logs.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No stock logs recorded yet.
                </div>
              ) : (
                <div className="inventory-table-container">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                        <th className="py-3 px-3">Timestamp</th>
                        <th className="py-3 px-3">Item / Dish</th>
                        <th className="py-3 px-3">Type</th>
                        <th className="py-3 px-3 text-right">Qty Changed</th>
                        <th className="py-3 px-3 text-right">Prev ➔ New Stock</th>
                        <th className="py-3 px-3">Notes / Order</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900">{log.itemName}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                                log.changeType === 'sale_deduction'
                                  ? 'bg-rose-50 text-rose-700'
                                  : log.changeType === 'manual_restock'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {log.changeType.replace('_', ' ')}
                            </span>
                          </td>
                          <td
                            className={`py-3 px-3 text-right font-mono font-black ${
                              log.quantityChanged > 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-600 text-[11px]">
                            {log.previousStock} ➔ <strong>{log.newStock}</strong>
                          </td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">
                            {log.notes || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Add Raw Material / Ingredient */}
      {isAddRawOpen && (
        <Modal
          isOpen={isAddRawOpen}
          onClose={() => setIsAddRawOpen(false)}
          title="Add Raw Material / Ingredient"
        >
          <form onSubmit={handleCreateRawItem} className="space-y-4 text-xs text-left">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Item / Ingredient Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Full Cream Milk, Brioche Buns, Truffle Aioli"
                value={rawForm.name}
                onChange={(e) => setRawForm({ ...rawForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={rawForm.category}
                  onChange={(e) => setRawForm({ ...rawForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Measurement Unit</label>
                <select
                  value={rawForm.unit}
                  onChange={(e) => setRawForm({ ...rawForm, unit: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Initial Stock</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={rawForm.currentStock}
                  onChange={(e) => setRawForm({ ...rawForm, currentStock: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Low Alert At</label>
                <input
                  type="number"
                  min="0"
                  placeholder="5"
                  value={rawForm.minStockThreshold}
                  onChange={(e) => setRawForm({ ...rawForm, minStockThreshold: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cost / Unit (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="₹0"
                  value={rawForm.costPerUnit}
                  onChange={(e) => setRawForm({ ...rawForm, costPerUnit: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Supplier Name</label>
                <input
                  type="text"
                  placeholder="e.g. Amul Dairy Depot"
                  value={rawForm.supplierName}
                  onChange={(e) => setRawForm({ ...rawForm, supplierName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Supplier Phone</label>
                <input
                  type="text"
                  placeholder="+91..."
                  value={rawForm.supplierContact}
                  onChange={(e) => setRawForm({ ...rawForm, supplierContact: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddRawOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm"
              >
                Save Item
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Quick Restock Modal */}
      {isRestockOpen && selectedItem && (
        <Modal
          isOpen={isRestockOpen}
          onClose={() => setIsRestockOpen(false)}
          title={`Restock: ${selectedItem.name}`}
        >
          <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs text-left">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-slate-500 text-[11px] block">Current Available Stock:</span>
                <span className="text-lg font-black font-mono text-slate-900">
                  {selectedItem.currentStock} {selectedItem.unit}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-[11px] block">Measurement:</span>
                <span className="font-bold text-slate-700 uppercase">{selectedItem.unit}</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Quantity to Add *</label>
              <input
                type="number"
                required
                min="0.1"
                step="any"
                placeholder={`e.g. 10 (${selectedItem.unit})`}
                value={restockForm.quantity}
                onChange={(e) => setRestockForm({ ...restockForm, quantity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 font-mono text-sm font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Cost / Unit (₹)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="₹"
                  value={restockForm.costPerUnit}
                  onChange={(e) => setRestockForm({ ...restockForm, costPerUnit: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Supplier Name</label>
                <input
                  type="text"
                  placeholder="Supplier / Invoice"
                  value={restockForm.supplierName}
                  onChange={(e) => setRestockForm({ ...restockForm, supplierName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Notes / Invoice Ref</label>
              <input
                type="text"
                placeholder="e.g. Delivery Batch #842 from weekly supplier"
                value={restockForm.notes}
                onChange={(e) => setRestockForm({ ...restockForm, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRestockOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
              >
                Confirm Restock
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: Dish Direct Stock Update */}
      {isDishStockOpen && (
        <Modal
          isOpen={isDishStockOpen}
          onClose={() => setIsDishStockOpen(false)}
          title={`Update Stock: ${dishStockForm.dishName}`}
        >
          <form onSubmit={handleDishStockSubmit} className="space-y-4 text-xs text-left">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Enable Stock Tracking</span>
                <span className="text-[11px] text-slate-500">
                  Auto-disable on QR menu when stock reaches 0
                </span>
              </div>
              <input
                type="checkbox"
                checked={dishStockForm.trackStock}
                onChange={(e) =>
                  setDishStockForm({ ...dishStockForm, trackStock: e.target.checked })
                }
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Available Portions / Units *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 25"
                value={dishStockForm.stockQuantity}
                onChange={(e) =>
                  setDishStockForm({ ...dishStockForm, stockQuantity: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 font-mono text-sm font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Low Stock Warning Level
              </label>
              <input
                type="number"
                min="1"
                placeholder="5"
                value={dishStockForm.lowStockThreshold}
                onChange={(e) =>
                  setDishStockForm({ ...dishStockForm, lowStockThreshold: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDishStockOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm"
              >
                Update Dish Stock
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Inventory;
