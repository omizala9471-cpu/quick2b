import React, { useState } from 'react';
import { API_BASE } from '../config';
import { Building2, X, Plus, AlertCircle } from 'lucide-react';

export default function ClientModal({ isOpen, onClose, onClientCreated }) {
  const [name, setName] = useState('');
  const [gstin, setGstin] = useState('');
  const [fy, setFy] = useState('2025-26');
  const [email, setEmail] = useState('kanhaiyasoni@ca.in');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !gstin.trim()) {
      setError('Client Name and GSTIN are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: '',
          name: name.trim(),
          trade_name: name.trim(),
          gstin: gstin.trim().toUpperCase(),
          fy: fy,
          email: email.trim(),
          contact_person: contactPerson.trim(),
          phone: phone.trim()
        })
      });

      if (!res.ok) {
        throw new Error('Failed to create client entity profile.');
      }

      const newClient = await res.json();
      onClientCreated(newClient);
      onClose();
    } catch (err) {
      setError(err.message || 'Error creating client profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-slate-900 text-base tracking-tight">
                Add Client Entity Profile
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Configure profile for multi-client GST reconciliation
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Client / Trade Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Shri Mahadev Automobiles"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Client GSTIN (15 Characters) *
            </label>
            <input
              type="text"
              required
              maxLength={15}
              placeholder="e.g. 08AAACM0000A1Z5"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono uppercase text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fiscal Cycle (FY)
              </label>
              <select
                value={fy}
                onChange={(e) => setFy(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
              >
                <option value="2025-26">FY 2025-26</option>
                <option value="2026-27">FY 2026-27</option>
                <option value="2024-25">FY 2024-25</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Auditor Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-blue-600 font-mono focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                placeholder="e.g. Mahadev Sharma"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                placeholder="+91 98290 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Creating...' : 'Save & Switch Profile'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
