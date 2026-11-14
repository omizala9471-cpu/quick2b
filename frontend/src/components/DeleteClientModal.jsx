import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';
import { API_BASE } from '../config';

export default function DeleteClientModal({
  isOpen,
  client,
  totalClientsCount,
  onClose,
  onDeleted
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !client) return null;

  const isOnlyOne = totalClientsCount <= 1;

  const handleDelete = async () => {
    if (isOnlyOne) {
      setError('Cannot delete the only remaining client profile in Quick2B.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/clients/${client.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to delete client profile.');
      }

      const data = await res.json();
      onDeleted(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Error occurred while deleting client profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-300 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold border border-rose-200 shadow-2xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-slate-900 text-base tracking-tight">
                Delete Client Profile
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Statutory audit profile removal
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

        {/* Warning Body */}
        <div className="mt-4 space-y-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Target Entity</div>
            <div className="font-bold text-slate-900 text-sm truncate">{client.name}</div>
            <div className="text-xs text-slate-600 font-mono mt-0.5">
              GSTIN: <span className="font-bold text-slate-800">{client.gstin}</span> • FY {client.fy || '2025-26'}
            </div>
          </div>

          {isOnlyOne ? (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs flex items-start space-x-2 font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>Protected Client:</strong> You cannot delete this client because Quick2B requires at least one active client entity. Create another client before deleting this one.
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2 font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>
                <strong>Warning:</strong> Deleting this client will permanently remove its statutory configuration and any linked reconciliation records. This cannot be undone.
              </span>
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-mono">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            disabled={loading || isOnlyOne}
            onClick={handleDelete}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 flex items-center space-x-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Delete</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
