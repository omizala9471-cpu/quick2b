import React, { useState } from 'react';
import { API_BASE } from '../config';
import { 
  Upload, 
  FileSpreadsheet, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight
} from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadSuccess, onResetSample }) {
  const [booksFile, setBooksFile] = useState(null);
  const [twobFile, setTwobFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!booksFile || !twobFile) {
      setError('Please select both Books Dump and GSTR-2B Dump files.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('books_file', booksFile);
    formData.append('twob_file', twobFile);

    try {
      const res = await fetch(`${API_BASE}/reconcile`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Reconciliation failed.');
      }

      const data = await res.json();
      onUploadSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Error uploading files.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-slate-900 text-base tracking-tight">
                Upload Accounting & Portal Datasets
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Ingest Books Purchase Register & GSTR-2B Statement
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Books Dump Upload */}
          <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors bg-slate-50">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              1. Books Dump / Purchase Register (.xlsx, .csv)
            </label>
            <p className="text-[11px] text-slate-500 mb-2 font-mono">
              Exported from TallyPrime, Busy, Zoho Books, SAP (Contains Supplier, GSTIN, Doc No, Date, Taxes)
            </p>
            <div className="flex items-center justify-between">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => setBooksFile(e.target.files[0])}
                className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-slate-800 file:shadow-2xs hover:file:bg-slate-100 cursor-pointer"
              />
              {booksFile && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </div>
          </div>

          {/* GSTR 2B Dump Upload */}
          <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors bg-slate-50">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              2. GSTR-2B Portal Dump (.xlsx, .csv)
            </label>
            <p className="text-[11px] text-slate-500 mb-2 font-mono">
              Official statement downloaded from GST Portal (Includes Invoices, Debit/Credit Notes)
            </p>
            <div className="flex items-center justify-between">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => setTwobFile(e.target.files[0])}
                className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-slate-800 file:shadow-2xs hover:file:bg-slate-100 cursor-pointer"
              />
              {twobFile && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end space-x-2.5">
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
              className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs disabled:opacity-50 flex items-center space-x-2 transition-all shadow-sm"
            >
              <span>{loading ? 'Reconciling...' : 'Start Reconciliation'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
