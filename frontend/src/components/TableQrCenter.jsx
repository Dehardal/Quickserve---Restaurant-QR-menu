import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  QrCode,
  Download,
  Printer,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Plus,
  Trash2,
  Search,
  Utensils,
  Building2,
  ShoppingBag,
} from 'lucide-react';

// Canvas utility to embed restaurant logo in center of QR code
const embedRestaurantLogo = (qrDataUrl, logoUrl, brandColor = '#4f46e5', name = 'R') => {
  return new Promise((resolve) => {
    if (!qrDataUrl) return resolve('');
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = qrDataUrl;
    qrImg.onload = () => {
      const size = 640;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // 1. Draw base QR code
      ctx.drawImage(qrImg, 0, 0, size, size);

      // Emblem metrics (22% of QR width)
      const emblemSize = Math.floor(size * 0.22);
      const pos = (size - emblemSize) / 2;

      // 2. White protective backing plate
      ctx.save();
      ctx.beginPath();
      const pad = 8;
      const boxSize = emblemSize + pad * 2;
      const boxPos = pos - pad;
      const radius = 18;
      if (ctx.roundRect) {
        ctx.roundRect(boxPos, boxPos, boxSize, boxSize, radius);
      } else {
        ctx.rect(boxPos, boxPos, boxSize, boxSize);
      }
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 2;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#f1f5f9';
      ctx.stroke();
      ctx.restore();

      const drawFallbackMonogram = () => {
        ctx.save();
        ctx.beginPath();
        const center = size / 2;
        ctx.arc(center, center, emblemSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = brandColor || '#4f46e5';
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold ' + Math.floor(emblemSize * 0.5) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initial = name ? name.trim().charAt(0).toUpperCase() : 'R';
        ctx.fillText(initial, center, center);
        ctx.restore();
        resolve(canvas.toDataURL('image/png'));
      };

      if (logoUrl) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = logoUrl;
        logoImg.onload = () => {
          ctx.save();
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(pos, pos, emblemSize, emblemSize, 12);
          } else {
            ctx.rect(pos, pos, emblemSize, emblemSize);
          }
          ctx.clip();
          ctx.drawImage(logoImg, pos, pos, emblemSize, emblemSize);
          ctx.restore();
          resolve(canvas.toDataURL('image/png'));
        };
        logoImg.onerror = () => {
          drawFallbackMonogram();
        };
      } else {
        drawFallbackMonogram();
      }
    };
    qrImg.onerror = () => {
      resolve(qrDataUrl);
    };
  });
};

const TableQrCenter = () => {
  const { token, restaurant, updateLocalRestaurant } = useAuth();

  const [activeChannel, setActiveChannel] = useState('dine_in'); // 'dine_in' | 'corporate' | 'takeaway'
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [newTable, setNewTable] = useState('');
  const [tableSearch, setTableSearch] = useState('');

  const [companies, setCompanies] = useState([
    'Google Campus',
    'WeWork Hub',
    'TCS Tech Park',
  ]);
  const [selectedCompany, setSelectedCompany] = useState('Google Campus');
  const [newCompanyInput, setNewCompanyInput] = useState('');

  const [qrCodeData, setQrCodeData] = useState(null);
  const [brandedQrUrl, setBrandedQrUrl] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [copied, setCopied] = useState(false);

  const brandColor = restaurant?.branding?.primaryColor || '#4f46e5';
  const customDomain = restaurant?.customDomain || '';

  // Initialize from restaurant profile
  useEffect(() => {
    if (restaurant) {
      if (restaurant.tables?.length > 0) {
        setTables(restaurant.tables);
        if (!selectedTable || !restaurant.tables.includes(selectedTable)) {
          setSelectedTable(restaurant.tables[0]);
        }
      } else {
        setTables([]);
        setSelectedTable('');
      }

      if (restaurant.companies?.length > 0) {
        const comps = restaurant.companies.map((c) => (typeof c === 'string' ? c : c.name));
        setCompanies(comps);
        if (!comps.includes(selectedCompany)) {
          setSelectedCompany(comps[0] || '');
        }
      }
    }
  }, [restaurant]);

  // Fetch QR on channel or target change
  useEffect(() => {
    if (activeChannel === 'dine_in' && selectedTable) {
      fetchQR({ tableNumber: selectedTable });
    } else if (activeChannel === 'corporate' && selectedCompany) {
      fetchQR({ company: selectedCompany });
    } else if (activeChannel === 'takeaway') {
      fetchTakeawayQR();
    }
  }, [activeChannel, selectedTable, selectedCompany]);

  const fetchQR = async (params) => {
    setQrLoading(true);
    try {
      const q = new URLSearchParams(params).toString();
      const res = await fetch(`/api/restaurant/qr?${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setQrCodeData(data.data);
        const branded = await embedRestaurantLogo(
          data.data.qrCodeUrl,
          restaurant?.logo,
          brandColor,
          restaurant?.name
        );
        setBrandedQrUrl(branded);
      }
    } catch (err) {
      console.error('Fetch QR error:', err);
    } finally {
      setQrLoading(false);
    }
  };

  const fetchTakeawayQR = async () => {
    setQrLoading(true);
    try {
      let targetBase = restaurant?.customDomain
        ? `https://${restaurant.customDomain}`
        : window.location.origin;
      const targetUrl = `${targetBase}/?type=takeaway`;

      const res = await fetch(`/api/restaurant/qr?tableNumber=Takeaway+Counter`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const fullData = {
          ...data.data,
          targetUrl,
          tableNumber: 'Takeaway Counter',
        };
        setQrCodeData(fullData);
        const branded = await embedRestaurantLogo(
          data.data.qrCodeUrl,
          restaurant?.logo,
          brandColor,
          restaurant?.name
        );
        setBrandedQrUrl(branded);
      }
    } catch (err) {
      console.error('Takeaway QR error:', err);
    } finally {
      setQrLoading(false);
    }
  };

  // Add Table and immediately sync
  const addTable = async () => {
    if (!newTable || newTable.trim() === '') return;
    const trimmed = newTable.trim();
    if (tables.includes(trimmed)) {
      setStatusMsg({ type: 'error', text: `Table "${trimmed}" already exists.` });
      return;
    }

    const updated = [...tables, trimmed];
    setTables(updated);
    setNewTable('');
    if (!selectedTable) setSelectedTable(trimmed);

    try {
      const response = await fetch('/api/restaurant/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tables: updated }),
      });
      const data = await response.json();
      if (data.success) {
        updateLocalRestaurant(data.data);
        setStatusMsg({ type: 'success', text: `Table "${trimmed}" added successfully!` });
        setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error('Save table error:', err);
    }
  };

  // Remove Table and sync
  const removeTable = async (tableToRemove) => {
    const updated = tables.filter((t) => t !== tableToRemove);
    setTables(updated);
    if (selectedTable === tableToRemove) {
      const nextTable = updated.length > 0 ? updated[0] : '';
      setSelectedTable(nextTable);
      if (!nextTable) {
        setQrCodeData(null);
        setBrandedQrUrl('');
      }
    }

    try {
      const response = await fetch('/api/restaurant/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tables: updated }),
      });
      const data = await response.json();
      if (data.success) {
        updateLocalRestaurant(data.data);
        setStatusMsg({ type: 'success', text: `Table "${tableToRemove}" removed.` });
        setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error('Delete table error:', err);
    }
  };

  // Corporate partner handlers
  const handleAddCompany = async (e) => {
    if (e) e.preventDefault();
    if (!newCompanyInput.trim()) return;
    const name = newCompanyInput.trim();
    if (!companies.includes(name)) {
      const updated = [...companies, name];
      setCompanies(updated);
      setSelectedCompany(name);
      setNewCompanyInput('');

      try {
        const res = await fetch('/api/restaurant/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ companies: updated.map((c) => ({ name: c })) }),
        });
        const data = await res.json();
        if (data.success) {
          updateLocalRestaurant(data.data);
          setStatusMsg({ type: 'success', text: `Partner "${name}" added.` });
          setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteCompany = async (comp) => {
    const updated = companies.filter((c) => c !== comp);
    setCompanies(updated);
    if (selectedCompany === comp) {
      setSelectedCompany(updated[0] || '');
    }

    try {
      const res = await fetch('/api/restaurant/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companies: updated.map((c) => ({ name: c })) }),
      });
      const data = await res.json();
      if (data.success) {
        updateLocalRestaurant(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyUrl = () => {
    if (!qrCodeData?.targetUrl) return;
    navigator.clipboard.writeText(qrCodeData.targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const finalUrl = brandedQrUrl || qrCodeData?.qrCodeUrl;
    if (!finalUrl) return;
    const label =
      activeChannel === 'dine_in'
        ? selectedTable
        : activeChannel === 'corporate'
        ? selectedCompany
        : 'Takeaway';
    const link = document.createElement('a');
    link.href = finalUrl;
    link.download = `QR_${(restaurant?.name || 'Restaurant').replace(/\s+/g, '_')}_${label.replace(
      /\s+/g,
      '_'
    )}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printTent = () => {
    window.print();
  };

  const filteredTables = tables.filter((t) =>
    t.toLowerCase().includes(tableSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-tent-card, #printable-tent-card * {
            visibility: visible !important;
          }
          #printable-tent-card {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            box-shadow: none !important;
            border: 2px solid #000 !important;
            width: 320px !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* Toast Alert */}
      {statusMsg.text && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-semibold animate-slide-up ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
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

      {/* Channel Switcher Tabs */}
      <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-2xl w-full max-w-md">
        <button
          type="button"
          onClick={() => setActiveChannel('dine_in')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeChannel === 'dine_in'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Utensils className="w-3.5 h-3.5 text-emerald-600" />
          <span>Dine-In Tables</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveChannel('corporate')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeChannel === 'corporate'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Corporate Desk</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveChannel('takeaway')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeChannel === 'takeaway'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
          <span>Direct Takeaway</span>
        </button>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Column 1: Dining Tables / Channel Management (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
          {activeChannel === 'dine_in' && (
            <>
              <div>
                <h3 className="text-base font-bold text-slate-900">Dining Tables Management</h3>
                <p className="text-xs text-slate-500">
                  Add, remove, or organize tables. Each table generates a cryptographically secured QR code.
                </p>
              </div>

              {/* Add Table Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTable}
                  onChange={(e) => setNewTable(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTable();
                    }
                  }}
                  placeholder="e.g. Table 6, Patio 1, Rooftop 3"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
                <button
                  type="button"
                  onClick={addTable}
                  className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Table
                </button>
              </div>

              {/* Table search filter if > 6 tables */}
              {tables.length > 6 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search tables..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
              )}

              {/* Grid of Tables */}
              {tables.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                  <QrCode className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No tables added yet</p>
                  <p className="text-[11px] text-slate-400">
                    Type a table name above and click "Add Table" to generate your first QR code.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  {filteredTables.map((t) => (
                    <div
                      key={t}
                      onClick={() => setSelectedTable(t)}
                      className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer select-none ${
                        selectedTable === t
                          ? 'border-brand-500 bg-brand-50/40 text-brand-700 shadow-sm font-bold ring-2 ring-brand-500/20'
                          : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <span className="text-xs truncate mr-2">{t}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTable(t);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer shrink-0"
                        title={`Remove ${t}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeChannel === 'corporate' && (
            <>
              <div>
                <h3 className="text-base font-bold text-slate-900">Corporate Delivery Partners</h3>
                <p className="text-xs text-slate-500">
                  Generate standee QR cards for company pantries, tech parks, and co-working hubs.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCompanyInput}
                  onChange={(e) => setNewCompanyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCompany();
                    }
                  }}
                  placeholder="e.g. Microsoft Cyber City, WeWork DLF"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={handleAddCompany}
                  disabled={!newCompanyInput.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Partner
                </button>
              </div>

              <div className="space-y-2 pt-1 max-h-72 overflow-y-auto">
                {companies.map((c) => (
                  <div
                    key={c}
                    onClick={() => setSelectedCompany(c)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer select-none ${
                      selectedCompany === c
                        ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 shadow-sm font-bold ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <span className="text-xs truncate flex-1">{c}</span>
                    <div className="flex items-center gap-1.5">
                      {selectedCompany === c && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      {companies.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCompany(c);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                          title="Remove Partner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeChannel === 'takeaway' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Direct Takeaway & Counter QR</h3>
                <p className="text-xs text-slate-500">
                  Place this standee at your payment counter, pickup counter, or front entrance.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 text-purple-900 space-y-2">
                <span className="font-bold text-xs flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-purple-600" />
                  Counter Ordering Without Table Selection
                </span>
                <p className="text-xs text-purple-800 leading-relaxed">
                  When walk-in guests scan this QR, they can order takeout meals directly from their phones without being assigned a dining table.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Live QR Standee Card & Generator (1 col) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-center">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              {activeChannel === 'corporate'
                ? 'Corporate Pantry Standee'
                : activeChannel === 'takeaway'
                ? 'Takeaway Counter Standee'
                : 'Table Standee Preview'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {customDomain ? `Domain: ${customDomain}` : 'Using default system domain'}
            </p>
          </div>

          {/* Printable Acrylic Standee Container */}
          <div
            id="printable-tent-card"
            className="w-full max-w-[240px] mx-auto bg-white border-2 border-slate-900 rounded-3xl p-5 shadow-lg flex flex-col items-center text-center space-y-3"
          >
            {/* Logo */}
            {restaurant?.logo ? (
              <img
                src={restaurant.logo}
                alt=""
                className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-xs"
              />
            ) : (
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-base shadow-xs"
                style={{ backgroundColor: brandColor }}
              >
                {restaurant?.name ? restaurant.name.charAt(0) : 'R'}
              </div>
            )}

            <div>
              <h4 className="font-black text-xs text-slate-900 tracking-tight uppercase">
                {restaurant?.name || 'Restaurant'}
              </h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {activeChannel === 'corporate'
                  ? 'Official Office Food Partner'
                  : activeChannel === 'takeaway'
                  ? 'Scan to Order Takeaway'
                  : 'Scan to View Menu & Order'}
              </p>
            </div>

            {/* QR Frame */}
            <div className="w-44 h-44 p-2 rounded-2xl bg-white border border-slate-100 shadow-inner flex items-center justify-center">
              {qrLoading ? (
                <div className="flex flex-col items-center gap-1.5 text-slate-400">
                  <Loader2 className="w-7 h-7 animate-spin text-brand-600" />
                  <span className="text-[9px] font-bold">Compositing Logo...</span>
                </div>
              ) : brandedQrUrl || qrCodeData?.qrCodeUrl ? (
                <img
                  src={brandedQrUrl || qrCodeData.qrCodeUrl}
                  alt="Branded Table QR"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-slate-400 text-center">
                  <QrCode className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                  <span className="text-[10px]">Select a table</span>
                </div>
              )}
            </div>

            {/* Badge */}
            <div
              className={`px-4 py-1.5 rounded-xl text-white font-black text-[11px] uppercase tracking-wider shadow-xs ${
                activeChannel === 'corporate'
                  ? 'bg-indigo-600'
                  : activeChannel === 'takeaway'
                  ? 'bg-purple-600'
                  : ''
              }`}
              style={activeChannel === 'dine_in' ? { backgroundColor: restaurant?.branding?.secondaryColor || '#1c1917' } : {}}
            >
              {activeChannel === 'corporate'
                ? selectedCompany
                : activeChannel === 'takeaway'
                ? 'Takeaway Pickup'
                : selectedTable || 'Table'}
            </div>

            <p className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider">
              No app download needed • Instant Camera Scan
            </p>
          </div>

          {/* Target URL & Action Buttons */}
          {qrCodeData?.targetUrl && (
            <div className="space-y-2 pt-1">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-600 font-mono truncate text-left flex items-center justify-between gap-1">
                <span className="truncate">{qrCodeData.targetUrl}</span>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-[10px] font-bold shrink-0 cursor-pointer"
                  title="Copy direct target URL"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={downloadQR}
                  disabled={!brandedQrUrl && !qrCodeData?.qrCodeUrl}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  PNG
                </button>
                <button
                  type="button"
                  onClick={printTent}
                  disabled={!brandedQrUrl && !qrCodeData?.qrCodeUrl}
                  className="py-2.5 px-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Standee
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableQrCenter;
