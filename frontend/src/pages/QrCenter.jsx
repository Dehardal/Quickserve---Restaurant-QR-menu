import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/qr-center.css';
import {
  QrCode,
  Download,
  Printer,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Layers,
  Copy,
  Check,
  Globe,
  Building2,
  Utensils,
  ShoppingBag,
  Plus,
  Trash2,
  Search,
} from 'lucide-react';

// Client-side HTML5 Canvas utility to composite the restaurant's logo in the center of the QR code
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

      // Emblem metrics (22% of QR width is ideal for QR error correction levels)
      const emblemSize = Math.floor(size * 0.22);
      const pos = (size - emblemSize) / 2;

      // 2. Clean protective white plate with rounded corners
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
        // Monogram background circle with primary brand color
        ctx.save();
        ctx.beginPath();
        const center = size / 2;
        const radiusCircle = emblemSize / 2;
        ctx.arc(center, center, radiusCircle, 0, Math.PI * 2);
        ctx.fillStyle = brandColor || '#4f46e5';
        ctx.fill();

        // Monogram initial text
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

const QrCenter = () => {
  const { token, restaurant } = useAuth();

  const [activeChannel, setActiveChannel] = useState('dine_in'); // 'dine_in' | 'corporate' | 'takeaway'
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableSearch, setTableSearch] = useState('');

  const [companies, setCompanies] = useState([
    'Google Campus',
    'WeWork Hub',
    'TCS Tech Park',
    'Co-Working Space',
  ]);
  const [selectedCompany, setSelectedCompany] = useState('Google Campus');
  const [newCompanyInput, setNewCompanyInput] = useState('');

  const [qrData, setQrData] = useState(null);
  const [brandedQrUrl, setBrandedQrUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const brandColor = restaurant?.branding?.primaryColor || '#4f46e5';

  useEffect(() => {
    if (restaurant && restaurant.tables?.length > 0) {
      setTables(restaurant.tables);
      setSelectedTable(restaurant.tables[0]);
    }
    if (restaurant && restaurant.companies?.length > 0) {
      setCompanies(restaurant.companies.map((c) => (typeof c === 'string' ? c : c.name)));
    }
  }, [restaurant]);

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
    setLoading(true);
    try {
      const q = new URLSearchParams(params).toString();
      const res = await fetch(`/api/restaurant/qr?${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setQrData(data.data);
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
      setLoading(false);
    }
  };

  const fetchTakeawayQR = async () => {
    setLoading(true);
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
        setQrData(fullData);
        const branded = await embedRestaurantLogo(
          data.data.qrCodeUrl,
          restaurant?.logo,
          brandColor,
          restaurant?.name
        );
        setBrandedQrUrl(branded);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (!newCompanyInput.trim()) return;
    const name = newCompanyInput.trim();
    if (!companies.includes(name)) {
      const updated = [...companies, name];
      setCompanies(updated);
      setSelectedCompany(name);

      // Persist to restaurant profile
      try {
        await fetch('/api/restaurant/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            companies: updated.map((c) => ({ name: c })),
          }),
        });
      } catch (saveErr) {
        console.error('Save companies error:', saveErr);
      }
    }
    setNewCompanyInput('');
  };

  const handleDeleteCompany = async (companyToDelete) => {
    const updated = companies.filter((c) => c !== companyToDelete);
    setCompanies(updated);
    if (selectedCompany === companyToDelete) {
      setSelectedCompany(updated[0] || '');
    }
    try {
      await fetch('/api/restaurant/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companies: updated.map((c) => ({ name: c })),
        }),
      });
    } catch (saveErr) {
      console.error('Delete company error:', saveErr);
    }
  };

  const handleCopyUrl = () => {
    if (!qrData?.targetUrl) return;
    navigator.clipboard.writeText(qrData.targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPNG = () => {
    const finalUrl = brandedQrUrl || qrData?.qrCodeUrl;
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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
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
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title="Table & QR Studio" />

        <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-white/10 text-brand-400">
                  <QrCode className="w-5 h-5 text-indigo-400" />
                </span>
                <h2 className="text-xl font-bold tracking-tight">QR Studio & Standee Generator</h2>
              </div>
              <p className="text-xs text-slate-300 max-w-xl">
                Generate branded high-resolution QR codes with centered logo for{' '}
                <strong>Dine-In Tables</strong>, <strong>Corporate Tech Parks</strong>, and{' '}
                <strong>Takeaway Counters</strong>.
              </p>
            </div>

            {restaurant?.customDomain && (
              <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 text-xs">
                <Globe className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Serving Custom Domain
                  </span>
                  <span className="font-mono font-bold text-emerald-400">{restaurant.customDomain}</span>
                </div>
              </div>
            )}
          </div>

          {/* 3-Channel Switcher Tabs */}
          <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-2xl w-full max-w-md">
            <button
              onClick={() => setActiveChannel('dine_in')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                activeChannel === 'dine_in'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Utensils className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dine-In Tables</span>
            </button>

            <button
              onClick={() => setActiveChannel('corporate')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                activeChannel === 'corporate'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Corporate Desk</span>
            </button>

            <button
              onClick={() => setActiveChannel('takeaway')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                activeChannel === 'takeaway'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
              <span>Direct Takeaway</span>
            </button>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Selector & Options (1 column) */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
              {activeChannel === 'dine_in' && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Select Dining Table</h3>
                      <p className="text-xs text-slate-400">Click a table to generate its secured Dine-In QR</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {tables.length} Tables
                    </span>
                  </div>

                  {tables.length > 6 && (
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search tables..."
                        value={tableSearch}
                        onChange={(e) => setTableSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                    {filteredTables.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTable(t)}
                        className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between ${
                          selectedTable === t
                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-sm'
                            : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span>{t}</span>
                        {selectedTable === t && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {activeChannel === 'corporate' && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Corporate Delivery Client</h3>
                      <p className="text-xs text-slate-400">Generate standee for tech park offices & pantries</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {companies.length} Partners
                    </span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {companies.map((c) => (
                      <div
                        key={c}
                        onClick={() => setSelectedCompany(c)}
                        className={`w-full p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between text-left cursor-pointer ${
                          selectedCompany === c
                            ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 shadow-sm'
                            : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="truncate flex-1">{c}</span>
                        <div className="flex items-center gap-1">
                          {selectedCompany === c && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                          {companies.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCompany(c);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                              title="Remove Partner"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddCompany} className="flex gap-1.5 pt-2 border-t border-slate-100">
                    <input
                      type="text"
                      placeholder="Add tech park or office name..."
                      value={newCompanyInput}
                      onChange={(e) => setNewCompanyInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!newCompanyInput.trim()}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </form>
                </>
              )}

              {activeChannel === 'takeaway' && (
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Direct Online Takeaway / Counter Pickup</h3>
                    <p className="text-xs text-slate-400">
                      Place this QR at the entrance, counter, or share via Instagram/WhatsApp
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 space-y-2 text-xs">
                    <span className="font-bold flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-purple-600" /> Direct Customer Ordering
                    </span>
                    <p className="text-[11px] text-purple-800 leading-relaxed">
                      Customers who scan this or visit directly do not need a table token. They can browse your menu, choose dishes, pay online, and pick up when ready.
                    </p>
                  </div>
                </div>
              )}

              {/* Target URL details */}
              {qrData && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
                      Encoded Target URL
                    </span>
                    <button
                      onClick={handleCopyUrl}
                      className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-[11px] font-bold"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy URL'}</span>
                    </button>
                  </div>
                  <p className="font-mono text-[11px] text-slate-600 break-all bg-white p-2.5 rounded-xl border border-slate-200">
                    {qrData.targetUrl}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Live Preview & Standee Mockup (2 columns) */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center gap-6 text-center">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {activeChannel === 'corporate'
                    ? 'Corporate Pantry Standee'
                    : activeChannel === 'takeaway'
                    ? 'Takeaway Counter Standee'
                    : 'Table Standee Preview'}
                </h3>
                <p className="text-xs text-slate-400">
                  Ready-to-print standee card with high-density QR code & centered logo
                </p>
              </div>

              {/* Printable Table Tent Container */}
              <div
                id="printable-tent-card"
                className="w-full max-w-xs bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-xl flex flex-col items-center text-center space-y-4"
              >
                {/* Brand Logo or Initial */}
                {restaurant?.logo ? (
                  <img
                    src={restaurant.logo}
                    alt=""
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm"
                    style={{ backgroundColor: brandColor }}
                  >
                    {restaurant?.name ? restaurant.name.charAt(0) : 'R'}
                  </div>
                )}

                <div>
                  <h4 className="font-black text-base text-slate-900 tracking-tight uppercase">
                    {restaurant?.name || 'Restaurant'}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {activeChannel === 'corporate'
                      ? 'Official Office Food Partner'
                      : activeChannel === 'takeaway'
                      ? 'Scan to Order Takeaway'
                      : 'Scan to View Menu & Order'}
                  </p>
                </div>

                {/* Branded QR Code Box with Embedded Logo */}
                <div className="w-52 h-52 p-2 rounded-2xl bg-white border border-slate-100 shadow-inner flex items-center justify-center">
                  {loading ? (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                      <span className="text-[10px] font-bold">Compositing Logo...</span>
                    </div>
                  ) : brandedQrUrl || qrData?.qrCodeUrl ? (
                    <img
                      src={brandedQrUrl || qrData.qrCodeUrl}
                      alt="Branded Table QR"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <QrCode className="w-10 h-10 text-slate-300" />
                  )}
                </div>

                {/* Table / Channel Badge */}
                <div
                  className={`px-5 py-2 rounded-xl text-white font-black text-xs uppercase tracking-wider shadow-sm ${
                    activeChannel === 'corporate'
                      ? 'bg-indigo-600'
                      : activeChannel === 'takeaway'
                      ? 'bg-purple-600'
                      : 'bg-slate-900'
                  }`}
                >
                  {activeChannel === 'corporate'
                    ? selectedCompany
                    : activeChannel === 'takeaway'
                    ? 'Takeaway Pickup'
                    : selectedTable || 'Table'}
                </div>

                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                  No app download needed • Instant Camera Scan
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full max-w-xs">
                <button
                  onClick={downloadPNG}
                  disabled={!brandedQrUrl && !qrData?.qrCodeUrl}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG</span>
                </button>
                <button
                  onClick={printTent}
                  disabled={!brandedQrUrl && !qrData?.qrCodeUrl}
                  className="flex-1 py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Standee</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QrCenter;
