import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import { Building2, X, Plus, AlertCircle, Edit3, Save, Loader2 } from 'lucide-react';

export default function ClientModal({
  isOpen,
  onClose,
  onClientSaved,
  clientToEdit = null
}) {
  const [name, setName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [gstin, setGstin] = useState('');
  const [fy, setFy] = useState('2025-26');
  const [email, setEmail] = useState('kanhaiyasoni@ca.in');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!clientToEdit;

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name || '');
      setTradeName(clientToEdit.trade_name || clientToEdit.name || '');
      setGstin(clientToEdit.gstin || '');
      setFy(clientToEdit.fy || '2025-26');
      setEmail(clientToEdit.email || 'kanhaiyasoni@ca.in');
      setContactPerson(clientToEdit.contact_person || '');
      setPhone(clientToEdit.phone || '');
    } else {
      setName('');
      setTradeName('');
      setGstin('');
      setFy('2025-26');
      setEmail('kanhaiyasoni@ca.in');
      setContactPerson('');
      setPhone('');
    }
    setError('');
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !gstin.trim()) {
      setError('Client Name and GSTIN are required.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      id: clientToEdit?.id || '',
      name: name.trim(),
      trade_name: (tradeName.trim() || name.trim()),
      gstin: gstin.trim().toUpperCase(),
      fy: fy,
      email: email.trim() || 'contact@quick2b.in',
      contact_person: contactPerson.trim(),
      phone: phone.trim()
    };

    try {
      const url = isEdit 
        ? `${API_BASE}/clients/${clientToEdit.id}`
        : `${API_BASE}/clients`;
      
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Failed to ${isEdit ? 'update' : 'create'} client entity profile.`);
      }

      const savedClient = await res.json();
      if (onClientSaved) {
        onClientSaved(savedClient, isEdit);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Error saving client profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-300 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-2xs border ${
              isEdit 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-blue-50 text-blue-600 border-blue-200'
            }`}>
              {isEdit ? <Edit3 className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-sans font-bold text-slate-900 text-base tracking-tight">
                {isEdit ? 'Edit Client Entity Profile' : 'Add Client Entity Profile'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {isEdit ? 'Modify entity trade name, GSTIN & FY' : 'Configure profile for multi-client GST reconciliation'}
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
              Client Legal / Trade Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Shri Mahadev Automobiles"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 outline-none"
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
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono uppercase text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 outline-none"
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
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
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
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-blue-600 font-mono focus:ring-1 focus:ring-blue-500 outline-none"
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
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 outline-none"
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
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-xl text-white font-bold text-xs disabled:opacity-50 shadow-sm transition-all flex items-center space-x-1.5 ${
                isEdit 
                  ? 'bg-amber-600 hover:bg-amber-700' 
                  : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEdit ? 'Saving Changes...' : 'Creating Profile...'}</span>
                </>
              ) : (
                <>
                  {isEdit ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isEdit ? 'Save Profile Changes' : 'Create & Switch Profile'}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
