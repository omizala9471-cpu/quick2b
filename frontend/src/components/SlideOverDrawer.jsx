import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { API_BASE } from '../config';

export default function SlideOverDrawer({ isOpen, row, onClose, onSaveOverride }) {
  const [knockOff, setKnockOff] = useState('-');
  const [claimedMonth, setClaimedMonth] = useState('-');
  const [reversed4b2, setReversed4b2] = useState('-');
  const [reclaimed4d1, setReclaimed4d1] = useState('-');
  const [remark, setRemark] = useState('ok');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (row) {
      setKnockOff(row.manual_knock_off || '-');
      setClaimedMonth(row.claimed_month_3b || '-');
      setReversed4b2(row.reversed_4b2 || '-');
      setReclaimed4d1(row.reclaimed_4d1 || '-');
      setRemark(row.special_remark || 'ok');
    }
  }, [row]);

  if (!isOpen || !row) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          row_id: row.id,
          source: row.source,
          gstin: row.gstin,
          doc_no: row.doc_no,
          manual_knock_off: knockOff,
          claimed_month_3b: claimedMonth,
          reversed_4b2: reversed4b2,
          reclaimed_4d1: reclaimed4d1,
          special_remark: remark
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update compliance details.');
      }

      const data = await res.json();
      onSaveOverride(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Error updating record.');
    } finally {
      setSaving(false);
    }
  };

  const totalTax = (row.igst || 0) + (row.cgst || 0) + (row.sgst || 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-250 text-slate-900">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-200 bg-slate-50 text-slate-900">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                row.source === '2B' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}>
                {row.source} Line Item
              </span>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="font-sans font-bold text-lg text-slate-900 truncate">
              {row.supplier}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Doc No: <strong className="text-slate-800">{row.doc_no}</strong> • Date: {row.date_iso}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Taxable Value</span>
                <span className="font-bold text-slate-900">₹{(row.taxable_value || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Total GST</span>
                <span className="font-bold text-blue-600">₹{totalTax.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form id="override-form" onSubmit={handleSave} className="space-y-4">
              
              {/* Knock-Off Key */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Knock-Off Reference Key (Col Q)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2025-07 or -"
                  value={knockOff}
                  onChange={(e) => setKnockOff(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* GSTR-3B Claimed Month */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  GSTR-3B Claimed Month (Col T)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2025-07 or -"
                  value={claimedMonth}
                  onChange={(e) => setClaimedMonth(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <div className="flex items-center space-x-1.5 mt-1.5">
                  <span className="text-[10px] text-slate-500 font-mono">Quick set:</span>
                  <button
                    type="button"
                    onClick={() => setClaimedMonth(row.month_2b)}
                    className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-blue-600 font-mono"
                  >
                    2B Month ({row.month_2b})
                  </button>
                  <button
                    type="button"
                    onClick={() => setClaimedMonth('Pending')}
                    className="text-[10px] px-2 py-0.5 bg-amber-50 hover:bg-amber-100 rounded font-semibold text-amber-800 font-mono border border-amber-200"
                  >
                    Pending
                  </button>
                </div>
              </div>

              {/* Rule 37A Reversals Table 4(B)(2) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rule 37A Reversal Table 4(B)(2) (Col U)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2025-06, 2025-07 & 08, or -"
                  value={reversed4b2}
                  onChange={(e) => setReversed4b2(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Rule 37A Reclaims Table 4(D)(1) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rule 37A Reclaim Table 4(D)(1) (Col V)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2025-08 or -"
                  value={reclaimed4d1}
                  onChange={(e) => setReclaimed4d1(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Special Remark */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Special Audit Remark (Col Z)
                </label>
                <input
                  type="text"
                  placeholder="ok, Pending, Under Review"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

            </form>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="override-form"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs disabled:opacity-50 flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Audit Compliance'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
