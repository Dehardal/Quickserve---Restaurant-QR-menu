import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CustomDropdown from '../components/CustomDropdown';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/offers.css';
import {
  Ticket,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  Power,
  Sparkles,
  Tag,
  UtensilsCrossed,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  X
} from 'lucide-react';

const Offers = () => {
  const { token, restaurant } = useAuth();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAudience, setFilterAudience] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [copiedCode, setCopiedCode] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(20);
  const [minOrderValue, setMinOrderValue] = useState(199);
  const [maxDiscount, setMaxDiscount] = useState(100);
  const [applicableFor, setApplicableFor] = useState('all');
  const [targetAudience, setTargetAudience] = useState('all'); // 'all' | 'first_order' | 'repeat_customers'
  const [usageLimitPerUser, setUsageLimitPerUser] = useState(1);
  const [badgeText, setBadgeText] = useState('SPECIAL OFFER');
  const [bannerColor, setBannerColor] = useState('indigo');
  const [endDate, setEndDate] = useState('');

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/offers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOffers(data.data || []);
      }
    } catch (err) {
      console.error('Fetch offers error:', err);
      setStatusMsg({ type: 'error', text: 'Failed to load offers' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const resetForm = () => {
    setTitle('');
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue(20);
    setMinOrderValue(199);
    setMaxDiscount(100);
    setApplicableFor('all');
    setTargetAudience('all');
    setUsageLimitPerUser(1);
    setBadgeText('SPECIAL OFFER');
    setBannerColor('indigo');
    setEndDate('');
    setEditingOffer(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (offer) => {
    setEditingOffer(offer);
    setTitle(offer.title || '');
    setCode(offer.code || '');
    setDescription(offer.description || '');
    setDiscountType(offer.discountType || 'percentage');
    setDiscountValue(offer.discountValue || 0);
    setMinOrderValue(offer.minOrderValue || 0);
    setMaxDiscount(offer.maxDiscount || '');
    setApplicableFor(offer.applicableFor || 'all');
    setTargetAudience(offer.targetAudience || 'all');
    setUsageLimitPerUser(offer.usageLimitPerUser ?? 1);
    setBadgeText(offer.badgeText || 'SPECIAL OFFER');
    setBannerColor(offer.bannerColor || 'indigo');
    setEndDate(offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : '');
    setShowModal(true);
  };

  const handleCopyCode = (codeStr) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedCode(codeStr);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleToggleStatus = async (offerId) => {
    try {
      const res = await fetch(`/api/offers/${offerId}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOffers(offers.map((o) => (o._id === offerId ? data.data : o)));
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const handleDeleteOffer = async (offerId, offerCode) => {
    if (!window.confirm(`Delete coupon "${offerCode}" permanently?`)) return;

    try {
      const res = await fetch(`/api/offers/${offerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOffers(offers.filter((o) => o._id !== offerId));
        setStatusMsg({ type: 'success', text: `Offer "${offerCode}" deleted.` });
      }
    } catch (err) {
      console.error('Delete offer error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg({ type: '', text: '' });

    const payload = {
      title,
      code: code.trim().toUpperCase(),
      description,
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      applicableFor,
      targetAudience,
      usageLimitPerUser: Number(usageLimitPerUser) || 0,
      badgeText,
      bannerColor,
      endDate: endDate ? new Date(endDate) : null,
    };

    try {
      const url = editingOffer ? `/api/offers/${editingOffer._id}` : '/api/offers';
      const method = editingOffer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        resetForm();
        fetchOffers();
        setStatusMsg({
          type: 'success',
          text: editingOffer ? 'Offer updated successfully!' : 'New offer created successfully!',
        });
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (err) {
      console.error('Submit offer error:', err);
      alert('Error saving offer');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered offers
  const filteredOffers = offers.filter((o) => {
    const matchesQuery =
      o.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = filterChannel === 'all' || o.applicableFor === 'all' || o.applicableFor === filterChannel;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && o.isActive) ||
      (filterStatus === 'inactive' && !o.isActive);
    const matchesAudience = filterAudience === 'all' || (o.targetAudience || 'all') === filterAudience;
    return matchesQuery && matchesChannel && matchesStatus && matchesAudience;
  });

  const activeCount = offers.filter((o) => o.isActive).length;
  const totalUsage = offers.reduce((acc, o) => acc + (o.usageCount || 0), 0);

  const brandColor = restaurant?.branding?.primaryColor || '#4f46e5';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title="Offers & Promo Engine" />

        <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Toast Notification */}
          {statusMsg.text && (
            <div
              className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold animate-slide-up ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  : 'bg-rose-50 border-rose-100 text-rose-600'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Top Header & Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Coupons</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{offers.length}</h3>
                <p className="text-xs text-slate-500 mt-1">{activeCount} currently live for customers</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Live</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</h3>
                <p className="text-xs text-slate-500 mt-1">Visible on customer checkout</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Times Redeemed</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{totalUsage}</h3>
                <p className="text-xs text-slate-500 mt-1">Orders placed with coupon</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search by code or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="w-32">
                <CustomDropdown
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'active', label: 'Active Only' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                />
              </div>

              <div className="w-36">
                <CustomDropdown
                  value={filterChannel}
                  onChange={setFilterChannel}
                  options={[
                    { value: 'all', label: 'All Channels' },
                    { value: 'dine_in', label: 'Dine-In' },
                    { value: 'company_delivery', label: 'Corporate' },
                    { value: 'takeaway', label: 'Takeaway' },
                  ]}
                />
              </div>

              <div className="w-36">
                <CustomDropdown
                  value={filterAudience}
                  onChange={setFilterAudience}
                  options={[
                    { value: 'all', label: 'All Audiences' },
                    { value: 'first_order', label: '🎉 1st Order' },
                    { value: 'repeat_customers', label: '⭐ Regulars' },
                  ]}
                />
              </div>

              <button
                onClick={openCreateModal}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-brand-500/20 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create Coupon</span>
              </button>
            </div>
          </div>

          {/* Offers Grid */}
          {loading ? (
            <div className="p-16 text-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-600" />
              <p className="text-xs">Loading promotional offers...</p>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center space-y-3">
              <Ticket className="w-12 h-12 mx-auto text-slate-300" />
              <h4 className="text-base font-bold text-slate-800">No Offers Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create promotional discount codes (e.g. 20% off for first-time visitors or ₹50 off on orders above ₹299).
              </p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-sm mt-2"
              >
                <Plus className="w-4 h-4" />
                Create First Coupon
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOffers.map((offer) => {
                const isExpired = offer.endDate && new Date(offer.endDate) < new Date();

                return (
                  <div
                    key={offer._id}
                    className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 transition hover:border-slate-300 ${
                      offer.isActive && !isExpired ? 'border-slate-200/90' : 'border-slate-200/60 opacity-60'
                    }`}
                  >
                    {/* Top status bar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-100">
                          {offer.badgeText || 'OFFER'}
                        </span>
                        {offer.targetAudience === 'first_order' && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            🎉 1st Order
                          </span>
                        )}
                        {offer.targetAudience === 'repeat_customers' && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            ⭐ Regulars
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleStatus(offer._id)}
                          className={`p-1.5 rounded-lg transition ${
                            offer.isActive
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-slate-400 hover:bg-slate-100'
                          }`}
                          title={offer.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(offer)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(offer._id, offer.code)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Code badge */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Coupon Code</span>
                        <span className="font-mono font-black text-slate-900 text-sm tracking-wide">{offer.code}</span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(offer.code)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:border-slate-300 flex items-center gap-1 shadow-2xs transition"
                      >
                        {copiedCode === offer.code ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode === offer.code ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Details */}
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{offer.title}</h4>
                      {offer.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{offer.description}</p>
                      )}
                    </div>

                    {/* Terms */}
                    <div className="space-y-1.5 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Discount:</span>
                        <span className="font-bold text-slate-800">
                          {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} FLAT`}
                          {offer.maxDiscount ? ` (Up to ₹${offer.maxDiscount})` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Min Order:</span>
                        <span className="font-semibold text-slate-800">₹{offer.minOrderValue || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Channel:</span>
                        <span className="font-semibold text-slate-800 uppercase">{offer.applicableFor.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Target Audience:</span>
                        <span className="font-semibold text-slate-800">
                          {offer.targetAudience === 'first_order'
                            ? '1st-Time Customers'
                            : offer.targetAudience === 'repeat_customers'
                            ? 'Regulars Only'
                            : 'All Customers'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Per User Limit:</span>
                        <span className="font-semibold text-slate-800">
                          {offer.usageLimitPerUser ? `Max ${offer.usageLimitPerUser}x / mobile` : 'Unlimited'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Redemptions:</span>
                        <span className="font-semibold text-slate-800">{offer.usageCount || 0} times</span>
                      </div>
                      {offer.endDate && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Expires:</span>
                          <span className={isExpired ? 'font-bold text-rose-500' : 'font-semibold text-slate-800'}>
                            {new Date(offer.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {editingOffer ? 'Edit Coupon Offer' : 'Create New Coupon Offer'}
                </h3>
                <p className="text-xs text-slate-400">Define promotional discounts and checkout redemption rules</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-slate-600 text-[10px]">Offer Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Weekend Special 20% Off"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-slate-600 text-[10px]">Promo Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WEEKEND20"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono uppercase font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-slate-600 text-[10px]">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Valid on all orders above ₹299"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Discount Details */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold uppercase text-[10px] text-slate-500 tracking-wider block">Discount Value</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">
                      {discountType === 'percentage' ? 'Percentage %' : 'Flat ₹'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Max Cap (₹)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Optional"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Eligibility Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-slate-600 text-[10px]">Target Audience *</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium"
                  >
                    <option value="all">👥 All Customers (Open to everyone)</option>
                    <option value="first_order">🎉 1st-Time Customers Only (New users)</option>
                    <option value="repeat_customers">⭐ Regulars Only (1+ prior orders)</option>
                  </select>
                  <span className="text-[10px] text-slate-400 block">
                    Verified automatically via customer mobile number at checkout.
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-slate-600 text-[10px]">Per-User Limit</label>
                  <input
                    type="number"
                    min="0"
                    value={usageLimitPerUser}
                    onChange={(e) => setUsageLimitPerUser(e.target.value)}
                    placeholder="1"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Max redemptions allowed per phone number (0 = unlimited).
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-slate-600 text-[10px]">Min Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-slate-600 text-[10px]">Applicable Channel</label>
                  <select
                    value={applicableFor}
                    onChange={(e) => setApplicableFor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="all">All Channels</option>
                    <option value="dine_in">Dine-In Tables Only</option>
                    <option value="company_delivery">Corporate Delivery Only</option>
                    <option value="takeaway">Takeaway Counters Only</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-slate-600 text-[10px]">Expiry Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingOffer ? 'Update Offer' : 'Create Offer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offers;

