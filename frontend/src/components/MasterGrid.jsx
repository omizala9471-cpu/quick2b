import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Layers
} from 'lucide-react';

export default function MasterGrid({ items, onEditRow, activeFilter, onSelectFilter }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (activeFilter === 'matched' && item.status !== 'Matched') return false;
      if (activeFilter === 'not_in_books' && item.status !== 'Not found in Books') return false;
      if (activeFilter === 'not_in_2b' && item.status !== 'Not found in 2B') return false;
      if (activeFilter === 'mismatch' && item.status !== 'Mismatch') return false;

      if (sourceFilter !== 'ALL' && item.source !== sourceFilter) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesSupplier = (item.supplier || '').toLowerCase().includes(q);
        const matchesGSTIN = (item.gstin || '').toLowerCase().includes(q);
        const matchesDoc = (item.doc_no || '').toLowerCase().includes(q);
        const matchesStatus = (item.status || '').toLowerCase().includes(q);
        if (!matchesSupplier && !matchesGSTIN && !matchesDoc && !matchesStatus) return false;
      }

      return true;
    });
  }, [items, activeFilter, sourceFilter, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage]);

  const fmt = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '0.00';
    return Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Matched':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100/90 text-emerald-800 border border-emerald-300 font-mono shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>MATCHED</span>
          </span>
        );
      case 'Not found in Books':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100/90 text-amber-900 border border-amber-300 font-mono shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            <span>NOT IN BOOKS</span>
          </span>
        );
      case 'Not found in 2B':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100/90 text-rose-800 border border-rose-300 font-mono shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            <span>NOT IN 2B</span>
          </span>
        );
      case 'Mismatch':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100/90 text-purple-900 border border-purple-300 font-mono shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
            <span>TAX MISMATCH</span>
          </span>
        );
      case 'RCM Applicable':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100/90 text-indigo-900 border border-indigo-300 font-mono shadow-2xs">
            <span>RCM APPLICABLE</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-300 shadow-[0_2px_8px_rgba(15,23,42,0.04)] overflow-hidden mb-8">
      
      {/* Search & Filter Bar with Defined Borders */}
      <div className="p-4 sm:p-5 border-b border-slate-300 bg-gradient-to-r from-slate-50 via-white to-slate-50 flex flex-wrap items-center justify-between gap-4">
        
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-200/80 p-1 rounded-xl border border-slate-300 shadow-inner font-sans">
          {[
            { id: 'all', label: 'All Vouchers', count: items.length },
            { id: 'matched', label: 'Matched Parity', count: items.filter(i => i.status === 'Matched').length, color: 'text-emerald-800' },
            { id: 'not_in_books', label: 'Unbooked in Books', count: items.filter(i => i.status === 'Not found in Books').length, color: 'text-amber-900' },
            { id: 'not_in_2b', label: 'Blocked Leaks (2B)', count: items.filter(i => i.status === 'Not found in 2B').length, color: 'text-rose-800' },
            { id: 'mismatch', label: 'Tax Mismatch', count: items.filter(i => i.status === 'Mismatch').length, color: 'text-purple-800' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                onSelectFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 border border-slate-200 font-bold ${tab.color || 'text-slate-700'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Source & Search */}
        <div className="flex items-center space-x-2.5 w-full lg:w-auto">
          {/* Source Filter */}
          <div className="flex items-center space-x-1 bg-slate-200/80 p-1 rounded-xl text-xs font-bold border border-slate-300 shadow-inner">
            {['ALL', '2B', 'Books'].map(s => (
              <button
                key={s}
                onClick={() => {
                  setSourceFilter(s);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  sourceFilter === s 
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-300' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s === 'ALL' ? 'Both' : s}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 lg:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search vendor, GSTIN, invoice..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono shadow-2xs font-medium"
            />
          </div>
        </div>

      </div>

      {/* Grid Data Table with Alternating Zebra Shading & Dividing Borders */}
      <div className="overflow-x-auto max-h-[650px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10 border-b-2 border-slate-300 font-black uppercase text-[10px] tracking-wider shadow-xs">
            <tr>
              <th className="p-3 pl-4 border-r border-slate-200">Src</th>
              <th className="p-3 border-r border-slate-200">Date</th>
              <th className="p-3 border-r border-slate-200 w-56">Supplier Entity</th>
              <th className="p-3 border-r border-slate-200">GSTIN / UIN</th>
              <th className="p-3 border-r border-slate-200">Type</th>
              <th className="p-3 border-r border-slate-200">Doc No.</th>
              <th className="p-3 text-right border-r border-slate-200">Gross (₹)</th>
              <th className="p-3 text-right border-r border-slate-200">Taxable (₹)</th>
              <th className="p-3 text-right border-r border-slate-200">IGST</th>
              <th className="p-3 text-right border-r border-slate-200">CGST</th>
              <th className="p-3 text-right border-r border-slate-200">SGST</th>
              <th className="p-3 text-right border-r border-slate-200 bg-indigo-50 text-indigo-950 font-black">Books GST</th>
              <th className="p-3 text-right border-r border-slate-200 bg-sky-50 text-sky-950 font-black">2B GST</th>
              <th className="p-3 text-right border-r border-slate-200 bg-slate-200/70 text-slate-900 font-black">Variance</th>
              <th className="p-3 text-center border-r border-slate-200 bg-slate-200/70 text-slate-900 font-black">Status</th>
              <th className="p-3 border-r border-slate-200">Knock-Off</th>
              <th className="p-3 border-r border-slate-200">Txn Month</th>
              <th className="p-3 border-r border-slate-200">2B Month</th>
              <th className="p-3 border-r border-slate-200">3B Month</th>
              <th className="p-3 border-r border-slate-200">Table 4(B)(2)</th>
              <th className="p-3 border-r border-slate-200">Table 4(D)(1)</th>
              <th className="p-3 text-center pr-4">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={22} className="p-12 text-center text-slate-500 font-sans">
                  No records match your active audit filter.
                </td>
              </tr>
            ) : (
              paginatedItems.map((row, idx) => {
                const diff = (row.books_gst || 0) - (row.two_b_gst || 0);
                const isDiffSignificant = Math.abs(diff) > 0.05;

                return (
                  <tr 
                    key={`${row.doc_no}_${idx}`} 
                    className={`transition-colors border-b border-slate-200 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                    } hover:bg-blue-50/40`}
                  >
                    
                    {/* Source */}
                    <td className="p-2.5 pl-4 border-r border-slate-200">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        row.source === '2B' ? 'bg-sky-50 text-sky-800 border-sky-200' : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      }`}>
                        {row.source}
                      </span>
                    </td>

                    <td className="p-2.5 border-r border-slate-200 font-mono text-[11px] whitespace-nowrap text-slate-700">{row.doc_date || '-'}</td>
                    <td className="p-2.5 border-r border-slate-200 font-sans font-extrabold text-slate-900 max-w-[200px] truncate" title={row.supplier}>
                      {row.supplier}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 font-mono text-[11px] text-slate-700">{row.gstin}</td>
                    <td className="p-2.5 border-r border-slate-200 text-[11px] text-slate-500">{row.doc_type || 'Invoice'}</td>
                    <td className="p-2.5 border-r border-slate-200 font-mono font-bold text-slate-900">{row.doc_no}</td>

                    {/* Monetary Columns */}
                    <td className="p-2.5 text-right border-r border-slate-200 font-mono text-slate-700">{fmt(row.doc_amount)}</td>
                    <td className="p-2.5 text-right border-r border-slate-200 font-mono text-slate-700">{fmt(row.taxable_value)}</td>
                    <td className="p-2.5 text-right border-r border-slate-200 font-mono text-slate-700">{fmt(row.igst)}</td>
                    <td className="p-2.5 text-right border-r border-slate-200 font-mono text-slate-700">{fmt(row.cgst)}</td>
                    <td className="p-2.5 text-right border-r border-slate-200 font-mono text-slate-700">{fmt(row.sgst)}</td>

                    {/* Reco Comparative Columns */}
                    <td className="p-2.5 text-right border-r border-slate-200 font-mono font-bold bg-indigo-50/40 text-indigo-950">
                      {fmt(row.books_gst)}
                    </td>
                    <td className="p-2.5 text-right border-r border-slate-200 font-mono font-bold bg-sky-50/40 text-sky-950">
                      {fmt(row.two_b_gst)}
                    </td>
                    <td className={`p-2.5 text-right border-r border-slate-200 font-mono font-black ${
                      isDiffSignificant ? 'text-rose-600 bg-rose-50/50' : 'text-slate-600'
                    }`}>
                      {fmt(diff)}
                    </td>

                    {/* Status Badge */}
                    <td className="p-2.5 text-center border-r border-slate-200 whitespace-nowrap">
                      {getStatusBadge(row.status)}
                    </td>

                    {/* Extra Tracking */}
                    <td className="p-2.5 border-r border-slate-200 text-center font-mono text-[11px] text-slate-400">
                      {row.knock_off_key ? row.knock_off_key.substring(0, 10) : '-'}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 font-mono text-[11px] text-slate-700 text-center">{row.txn_month || '-'}</td>
                    <td className="p-2.5 border-r border-slate-200 font-mono text-[11px] text-blue-700 font-bold text-center">{row.two_b_month || '-'}</td>
                    <td className="p-2.5 border-r border-slate-200 font-mono text-[11px] text-slate-700 text-center">{row.three_b_month || '-'}</td>
                    <td className="p-2.5 border-r border-slate-200 font-mono text-[11px] text-slate-700 text-center">{row.table_4b2 || '-'}</td>
                    <td className="p-2.5 border-r border-slate-200 font-mono text-[11px] text-slate-700 text-center">{row.table_4d1 || '-'}</td>

                    {/* Action Button */}
                    <td className="p-2 text-center pr-4">
                      <button
                        onClick={() => onEditRow(row)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-all shadow-2xs"
                        title="Audit / Override Rule 37A"
                      >
                        Audit
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-300 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-mono">
        <div>
          Showing <strong className="text-slate-900 font-bold">{paginatedItems.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
          <strong className="text-slate-900 font-bold">{Math.min(currentPage * pageSize, filteredItems.length)}</strong> of{' '}
          <strong className="text-slate-900 font-bold">{filteredItems.length}</strong> invoices
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-extrabold text-slate-900">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
