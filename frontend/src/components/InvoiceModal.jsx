import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Download, 
  Store,
  Check,
  ExternalLink,
  Receipt
} from 'lucide-react';

const InvoiceModal = ({ 
  isOpen, 
  onClose, 
  invoiceData, 
  onMarkPaid, 
  isStaff = false,
  loading = false 
}) => {
  if (!isOpen || !invoiceData) return null;

  const {
    restaurant = {},
    invoiceNumber = `INV-${Date.now().toString().slice(-6)}`,
    date = new Date(),
    tableNumber = 'Table',
    customerName = 'Guest',
    customerMobile = '',
    items = [],
    subtotal = 0,
    cgst = 0,
    sgst = 0,
    taxAmount = 0,
    grandTotal = 0,
    paymentStatus = 'pending',
    paymentMethod = 'cash',
    upiQrCodeUrl = '',
  } = invoiceData;

  const isPaid = paymentStatus === 'paid';

  const formattedDate = new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Generates standalone, print-perfect HTML document for Thermal (80mm) or Standard (A4/PDF)
  const generateBillHtml = () => {
    const itemsRows = items.map((item, idx) => `
      <tr>
        <td style="padding: 6px 0; text-align: left; font-weight: 600; font-size: 13px; color: #111;">
          ${item.name}
        </td>
        <td style="padding: 6px 4px; text-align: center; font-size: 13px; color: #333;">
          ${item.quantity}
        </td>
        <td style="padding: 6px 4px; text-align: right; font-size: 13px; color: #444;">
          ₹${(item.price || 0).toFixed(2)}
        </td>
        <td style="padding: 6px 0; text-align: right; font-weight: 700; font-size: 13px; color: #111;">
          ₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Bill Receipt - ${invoiceNumber}</title>
          <style>
            @page {
              size: auto;
              margin: 10mm 8mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #111827;
              background: #ffffff;
              padding: 16px;
              max-width: 420px;
              margin: 0 auto;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              border-bottom: 2px dashed #9ca3af;
              padding-bottom: 12px;
              margin-bottom: 12px;
            }
            .restaurant-title {
              font-size: 22px;
              font-weight: 900;
              letter-spacing: -0.5px;
              text-transform: uppercase;
              color: #0f172a;
              margin-bottom: 4px;
            }
            .restaurant-sub {
              font-size: 11px;
              color: #4b5563;
              margin-bottom: 2px;
            }
            .bill-tag {
              display: inline-block;
              margin-top: 6px;
              padding: 3px 10px;
              background: #f1f5f9;
              border: 1px solid #cbd5e1;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              border-radius: 4px;
              color: #1e293b;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 6px 12px;
              font-size: 11px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 10px 12px;
              border-radius: 8px;
              margin-bottom: 14px;
            }
            .meta-label {
              font-size: 9px;
              text-transform: uppercase;
              font-weight: 800;
              color: #64748b;
              letter-spacing: 0.5px;
            }
            .meta-val {
              font-weight: 800;
              color: #0f172a;
              font-size: 12px;
            }
            .meta-table {
              font-size: 14px;
              font-weight: 900;
              color: #4f46e5;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 14px;
            }
            th {
              border-bottom: 2px solid #0f172a;
              padding: 6px 0;
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #334155;
            }
            td {
              border-bottom: 1px dashed #e2e8f0;
            }
            .calc-box {
              border-top: 2px solid #0f172a;
              padding-top: 8px;
              margin-bottom: 14px;
            }
            .calc-line {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: #475569;
              margin-bottom: 4px;
            }
            .calc-total {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 18px;
              font-weight: 900;
              color: #0f172a;
              border-top: 2px dashed #0f172a;
              border-bottom: 2px dashed #0f172a;
              padding: 10px 0;
              margin-top: 8px;
              margin-bottom: 14px;
            }
            .status-badge {
              text-align: center;
              padding: 8px 12px;
              border-radius: 8px;
              font-size: 13px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 14px;
              border: 2px solid;
            }
            .status-paid {
              background: #ecfdf5;
              color: #065f46;
              border-color: #059669;
            }
            .status-pending {
              background: #fffbeb;
              color: #92400e;
              border-color: #d97706;
            }
            .qr-box {
              text-align: center;
              border: 2px dashed #cbd5e1;
              padding: 12px;
              border-radius: 10px;
              background: #ffffff;
              margin-bottom: 14px;
            }
            .qr-box img {
              width: 150px;
              height: 150px;
              display: block;
              margin: 0 auto 6px;
            }
            .qr-title {
              font-size: 12px;
              font-weight: 900;
              text-transform: uppercase;
              color: #0f172a;
            }
            .qr-desc {
              font-size: 10px;
              color: #64748b;
              margin-top: 2px;
            }
            .footer {
              text-align: center;
              font-size: 10px;
              color: #64748b;
              border-top: 1px dashed #cbd5e1;
              padding-top: 10px;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="restaurant-title">${restaurant.name || 'Restaurant'}</div>
            ${restaurant.address ? `<div class="restaurant-sub">${restaurant.address}</div>` : ''}
            ${restaurant.contactNumber ? `<div class="restaurant-sub">Phone: ${restaurant.contactNumber}</div>` : ''}
            <div class="bill-tag">Tax Invoice / Dining Receipt</div>
          </div>

          <div class="meta-grid">
            <div>
              <div class="meta-label">Invoice #</div>
              <div class="meta-val">${invoiceNumber}</div>
            </div>
            <div style="text-align: right;">
              <div class="meta-label">Date & Time</div>
              <div class="meta-val">${formattedDate} ${formattedTime}</div>
            </div>
            <div>
              <div class="meta-label">Table Assigned</div>
              <div class="meta-table">${tableNumber}</div>
            </div>
            <div style="text-align: right;">
              <div class="meta-label">Customer</div>
              <div class="meta-val">${customerName} ${customerMobile ? `(${customerMobile})` : ''}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Rate</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div class="calc-box">
            <div class="calc-line">
              <span>Items Subtotal:</span>
              <span style="font-weight: 700; color: #0f172a;">₹${subtotal.toFixed(2)}</span>
            </div>
            <div class="calc-line">
              <span>CGST (2.5%):</span>
              <span>₹${(cgst || taxAmount / 2).toFixed(2)}</span>
            </div>
            <div class="calc-line">
              <span>SGST (2.5%):</span>
              <span>₹${(sgst || taxAmount / 2).toFixed(2)}</span>
            </div>
            <div class="calc-total">
              <span>GRAND TOTAL:</span>
              <span>₹${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div class="status-badge ${isPaid ? 'status-paid' : 'status-pending'}">
            ${isPaid ? `PAID (${(paymentMethod || 'UPI').toUpperCase()})` : `PAYMENT PENDING (${(paymentMethod || 'CASH').toUpperCase()})`}
          </div>

          ${upiQrCodeUrl ? `
            <div class="qr-box">
              <img src="${upiQrCodeUrl}" alt="Scan to Pay QR Code" />
              <div class="qr-title">Scan to Pay: ₹${grandTotal.toFixed(2)}</div>
              <div class="qr-desc">Scan using Google Pay, PhonePe, Paytm, or BHIM</div>
              ${restaurant.upiId ? `<div class="qr-desc" style="font-family: monospace; font-weight: 700; margin-top: 3px;">UPI ID: ${restaurant.upiId}</div>` : ''}
            </div>
          ` : ''}

          <div class="footer">
            Thank you for dining with us! Please visit again.<br/>
            Bill generated via QuickServe Digital POS
          </div>
        </body>
      </html>
    `;
  };

  // 100% Reliable Iframe Printing (Guaranteed no blank pages!)
  const handlePrint = () => {
    const htmlContent = generateBillHtml();
    
    // Create hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Trigger print after iframe renders
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      // Clean up after 2 seconds
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (e) {
          // ignore cleanup error
        }
      }, 2000);
    }, 250);
  };

  // Open in a standalone new browser window / tab
  const handleOpenInNewTab = () => {
    const htmlContent = generateBillHtml();
    const newWin = window.open('', '_blank');
    if (newWin) {
      newWin.document.open();
      newWin.document.write(htmlContent);
      newWin.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Modal Dialog Card */}
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 animate-slide-up">
        
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-brand-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              Tax Invoice & Dine-in Receipt
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body (Styled exactly like a genuine restaurant bill) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/40">
          
          <div className="bg-white border-2 border-slate-900 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
            
            {/* 1. Restaurant Header */}
            <div className="text-center border-b-2 border-dashed border-slate-300 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 mx-auto mb-2">
                <Store className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                {restaurant.name || 'QuickServe Restaurant'}
              </h2>
              {restaurant.address && (
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-0.5">{restaurant.address}</p>
              )}
              {restaurant.contactNumber && (
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Contact: {restaurant.contactNumber}</p>
              )}
              <div className="mt-2 inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-700 border border-slate-200">
                Tax Invoice / Guest Bill
              </div>
            </div>

            {/* 2. Metadata Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Invoice Number</span>
                <span className="font-extrabold text-slate-900 font-mono text-[11px]">{invoiceNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Date & Time</span>
                <span className="font-extrabold text-slate-900">{formattedDate} {formattedTime}</span>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Table Assigned</span>
                <span className="font-black text-brand-600 text-sm">{tableNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Customer Profile</span>
                <span className="font-bold text-slate-800">{customerName} {customerMobile ? `(${customerMobile})` : ''}</span>
              </div>
            </div>

            {/* 3. Items List Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <th className="py-2.5 pl-3">Item Name</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Rate</th>
                    <th className="py-2.5 text-right pr-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 pl-3 font-extrabold text-slate-800">{item.name}</td>
                      <td className="py-2.5 text-center font-bold text-slate-600">×{item.quantity}</td>
                      <td className="py-2.5 text-right font-medium text-slate-500">₹{(item.price || 0).toFixed(2)}</td>
                      <td className="py-2.5 text-right pr-3 font-black text-slate-900">
                        ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. Financial Calculations */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-bold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>CGST (2.5%):</span>
                <span>₹{(cgst || taxAmount / 2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>SGST (2.5%):</span>
                <span>₹{(sgst || taxAmount / 2).toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-slate-900 pt-2 flex justify-between items-center text-sm font-black text-slate-900">
                <span className="uppercase tracking-wider">Grand Total:</span>
                <span className="text-brand-600 text-lg">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* 5. Payment Status Stamp */}
            <div className="text-center">
              {isPaid ? (
                <div className="p-3 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-emerald-800 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    PAID IN FULL ({paymentMethod?.toUpperCase() || 'UPI'})
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border-2 border-amber-500 rounded-2xl text-amber-800 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    PAYMENT PENDING ({paymentMethod === 'cash' ? 'CASH ON DELIVERY' : 'ONLINE UPI'})
                  </span>
                </div>
              )}
            </div>

            {/* 6. Prominent Dynamic Payment UPI QR Code */}
            {upiQrCodeUrl && (
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/60 flex flex-col sm:flex-row items-center gap-4">
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0 flex flex-col items-center">
                  <img 
                    src={upiQrCodeUrl} 
                    alt="Scan to Pay QR Code" 
                    className="w-32 h-32 object-contain"
                  />
                  <span className="text-[9px] font-black uppercase text-slate-500 mt-1 tracking-wider">
                    Scan to Pay ₹{grandTotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <span className="text-xs font-black uppercase text-slate-800 block">
                    Instant UPI QR Code
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    Customer or delivery staff can scan this dynamic QR code using Google Pay, PhonePe, Paytm, or BHIM to pay ₹{grandTotal.toFixed(2)} immediately.
                  </p>
                  {restaurant.upiId && (
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      UPI VPA: <span className="font-bold text-slate-800">{restaurant.upiId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 7. Receipt Footer Note */}
            <div className="text-center text-[10px] text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-200">
              Thank you for dining with us! Please visit again.
            </div>

          </div>

        </div>

        {/* Modal Controls Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenInNewTab}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              title="Open standalone bill in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in Tab</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Close
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isStaff && !isPaid && onMarkPaid && (
              <button
                onClick={onMarkPaid}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Paid (Cash)</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-brand-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>Print Bill</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvoiceModal;
