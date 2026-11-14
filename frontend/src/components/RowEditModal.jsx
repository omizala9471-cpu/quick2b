import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import { Edit3, X, Check, AlertCircle } from 'lucide-react';

export default function RowEditModal({ isOpen, row, onClose, onSaveOverride }) {
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
        throw new Error('Failed to update row override.');
      }

      const data = await res.json();
      onSaveOverride(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Error updating override.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Invoice Compliance Override</h3>
              <p className="text-xs text-slate-500">{row.supplier} • Doc: {row.doc_no}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Summary Pill */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Source</span>
            <span className="font-bold text-slate-800">{row.source}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">GST Amount</span>
            <span className="font-bold text-slate-800">₹{((row.igst||0)+(row.cgst||0)+(row.sgst||0)).toFixed(2)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Current Status</span>
            <span className="font-bold text-emerald-700">{row.status}</span>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center space-x-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Manual Knock-Off Override (Col Q)
            </label>
            <select
              value={knockOff}
              onChange={(e) => setKnockOff(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="-">- (Default Auto Match)</option>
              <option value="Knock Off">Knock Off (Forces Status: Matched)</option>
              <option value="Direct">Direct (Forces Status: Matched)</option>
              <option value="RCM">RCM (Forces Status: RCM Applicable)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Claimed Month of 3B (Col T)
              </label>
              <input
                type="text"
                placeholder="e.g. 2025-05 or Pending"
                value={claimedMonth}
                onChange={(e) => setClaimedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Remark (Col Z)
              </label>
              <input
                type="text"
                placeholder="ok, Pending, etc."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reversed in Table 4(B)(2) (Col U)
              </label>
              <input
                type="text"
                placeholder="e.g. 2025-06, - "
                value={reversed4b2}
                onChange={(e) => setReversed4b2(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reclaimed in Table 4(D)(1) (Col V)
              </label>
              <input
                type="text"
                placeholder="e.g. 2025-08, - "
                value={reclaimed4d1}
                onChange={(e) => setReclaimed4d1(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-900/20 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Apply Override'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
