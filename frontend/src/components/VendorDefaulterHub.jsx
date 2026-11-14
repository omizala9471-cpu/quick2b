import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Mail, 
  Copy, 
  Check, 
  AlertCircle, 
  Send,
  X
} from 'lucide-react';
import { API_BASE } from '../config';

export default function VendorDefaulterHub({ items, clientName }) {
  const [selectedVendorNotice, setSelectedVendorNotice] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loadingNotice, setLoadingNotice] = useState(false);

  const missingVendors = useMemo(() => {
    const map = {};
    items.filter(i => i.status === 'Not found in 2B').forEach(item => {
      const gstin = item.gstin;
      if (!map[gstin]) {
        map[gstin] = {
          supplier: item.supplier,
          gstin: item.gstin,
          invoices: [],
          totalTax: 0,
          totalAmount: 0
        };
      }
      const tax = (item.igst || 0) + (item.cgst || 0) + (item.sgst || 0);
      map[gstin].invoices.push(item);
      map[gstin].totalTax += tax;
      map[gstin].totalAmount += (item.doc_amount || 0);
    });
    return Object.values(map);
  }, [items]);

  const totalAtRisk = useMemo(() => {
    return missingVendors.reduce((acc, v) => acc + v.totalTax, 0);
  }, [missingVendors]);

  const handleGenerateNotice = async (vendor) => {
    setLoadingNotice(true);
    try {
      const res = await fetch(`${API_BASE}/vendor-notice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier: vendor.supplier,
          gstin: vendor.gstin,
          client_name: clientName || 'Shri Mahadev Automobiles',
          recipient_email: ''
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedVendorNotice(data);
      }
    } catch (err) {
      console.error('Error generating notice:', err);
    } finally {
      setLoadingNotice(false);
    }
  };

  const copyToClipboard = () => {
    if (selectedVendorNotice?.body) {
      navigator.clipboard.writeText(selectedVendorNotice.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-300 shadow-[0_2px_8px_rgba(15,23,42,0.04)] overflow-hidden mb-8">
      
      {/* Header with defined border */}
      <div className="p-5 border-b border-slate-300 bg-gradient-to-r from-slate-50 via-white to-slate-50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold border border-rose-300 shadow-2xs">
              <AlertCircle className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <h3 className="font-sans font-black text-slate-900 text-base tracking-tight">
                Section 16(2)(aa) Blocked ITC & Vendor Action Center
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Purchase Bills Accounted in Books but Blocked in GSTR-2B • Automatic Demand Notice Dispatcher
              </p>
            </div>
          </div>
        </div>

        <div className="bg-rose-100/90 border border-rose-300 px-4 py-1.5 rounded-xl shadow-2xs">
          <span className="text-[10px] text-rose-800 uppercase font-mono font-bold block">Blocked ITC Exposure</span>
          <span className="text-sm font-black font-mono text-rose-800">
            ₹{totalAtRisk.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Grid of Defaulting Vendors with Defined Top Borders & Inner Framed Tables */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/60">
        {missingVendors.length === 0 ? (
          <div className="col-span-3 text-center py-10 text-slate-500 font-sans">
            ✓ 100% GSTR-2B Compliance. Zero unfiled vendor invoices.
          </div>
        ) : (
          missingVendors.map((vendor) => (
            <div 
              key={vendor.gstin}
              className="p-4 bg-white rounded-xl border border-slate-300 hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between border-t-3 border-t-rose-500 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                    {vendor.invoices.length} Unfiled {vendor.invoices.length === 1 ? 'Bill' : 'Bills'}
                  </span>
                  <span className="font-mono text-xs font-black text-rose-700">
                    Tax: ₹{vendor.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="font-sans font-black text-sm text-slate-900 mb-0.5 truncate" title={vendor.supplier}>
                  {vendor.supplier}
                </div>

                <div className="font-mono text-xs text-slate-500 mb-3">
                  GSTIN: <span className="font-semibold text-slate-700">{vendor.gstin}</span>
                </div>

                {/* Inner Framed List of bills */}
                <div className="border border-slate-200 bg-slate-50/70 p-2.5 rounded-lg space-y-1.5 mb-4 text-[11px] font-mono shadow-2xs">
                  {vendor.invoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between text-slate-700">
                      <span className="truncate max-w-[140px] text-slate-600 font-medium">{inv.doc_no} ({inv.date_iso})</span>
                      <span className="font-extrabold text-slate-900">
                        ₹{((inv.igst || 0) + (inv.cgst || 0) + (inv.sgst || 0)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button with Defined Shadow & Border */}
              <button
                onClick={() => handleGenerateNotice(vendor)}
                className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-sans font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all border border-rose-700"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Generate Demand Notice</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Notice Preview Modal */}
      {selectedVendorNotice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-300 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <h4 className="font-sans font-bold text-slate-900 text-sm">
                  Statutory GSTR-1 Demand Notice — {selectedVendorNotice.supplier}
                </h4>
              </div>
              <button
                onClick={() => setSelectedVendorNotice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-mono font-bold text-slate-500 mb-1">Subject</label>
              <div className="p-2.5 bg-slate-50 rounded-lg text-xs font-mono text-slate-800 select-all border border-slate-300 font-semibold">
                {selectedVendorNotice.subject}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-mono font-bold text-slate-500 mb-1">Statutory Communication Body</label>
              <pre className="p-3.5 bg-slate-50 text-slate-800 rounded-xl text-xs font-mono whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed border border-slate-300 font-medium">
                {selectedVendorNotice.body}
              </pre>
            </div>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="text-[11px] text-slate-500 font-mono">
                Authorized Auditor: <span className="font-bold text-slate-800">CA Kanhaiya Soni</span>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Copied!' : 'Copy Notice'}</span>
                </button>

                <a
                  href={`mailto:?subject=${encodeURIComponent(selectedVendorNotice.subject)}&body=${encodeURIComponent(selectedVendorNotice.body)}`}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
