import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  RotateCw,
  FileSpreadsheet,
  FileText,
  Activity,
  ArrowUpRight
} from 'lucide-react';

export default function KPICards({ kpis, activeTab, onSelectTab }) {
  if (!kpis) return null;

  const totalRows = kpis.total_rows ?? 0;
  const matchedCount = kpis.matched_count ?? 0;
  const notInBooksCount = kpis.not_in_books_count ?? 0;
  const notIn2bCount = kpis.not_in_2b_count ?? 0;

  const matchedPct = totalRows > 0 ? ((matchedCount / totalRows) * 100).toFixed(1) : '0.0';
  const notInBooksPct = totalRows > 0 ? ((notInBooksCount / totalRows) * 100).toFixed(1) : '0.0';
  const notIn2bPct = totalRows > 0 ? ((notIn2bCount / totalRows) * 100).toFixed(1) : '0.0';

  const fmtCurrency = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const cards = [
    {
      id: 'all',
      title: 'GSTR-2B Statement',
      amount: fmtCurrency(kpis.total_2b_gst ?? 0),
      badge: `${kpis.total_2b_rows ?? 0} Invoices`,
      sub: 'Govt Auto-Drafted Statement',
      icon: FileSpreadsheet,
      cardClass: 'card-sapphire',
      iconBoxClass: 'bg-sky-50 text-sky-600 border border-sky-200/90 shadow-2xs',
      badgeClass: 'bg-sky-50 text-sky-800 border border-sky-200 font-bold',
      activeRing: 'ring-2 ring-sky-600 border-sky-600 shadow-md'
    },
    {
      id: 'books',
      title: 'Master Books Register',
      amount: fmtCurrency(kpis.total_books_gst ?? 0),
      badge: `${kpis.total_books_rows ?? 0} Vouchers`,
      sub: 'Accounting Ledger Recorded',
      icon: FileText,
      cardClass: 'card-indigo',
      iconBoxClass: 'bg-indigo-50 text-indigo-600 border border-indigo-200/90 shadow-2xs',
      badgeClass: 'bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold',
      activeRing: 'ring-2 ring-indigo-600 border-indigo-600 shadow-md'
    },
    {
      id: 'matched',
      title: 'Fully Matched ITC',
      amount: `${matchedCount}`,
      badge: fmtCurrency(kpis.matched_gst ?? (matchedCount > 0 ? (kpis.total_books_gst || 0) : 0)),
      sub: 'Full Parity Verified',
      icon: CheckCircle2,
      cardClass: 'card-emerald',
      iconBoxClass: 'bg-emerald-50 text-emerald-600 border border-emerald-200/90 shadow-2xs',
      badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold',
      activeRing: 'ring-2 ring-emerald-600 border-emerald-600 shadow-md'
    },
    {
      id: 'not_in_books',
      title: 'Missing in Books',
      amount: `${notInBooksCount}`,
      badge: fmtCurrency(kpis.not_in_books_gst ?? 0),
      sub: 'In 2B • Unbooked in Tally',
      icon: AlertTriangle,
      cardClass: 'card-amber',
      iconBoxClass: 'bg-amber-50 text-amber-600 border border-amber-200/90 shadow-2xs',
      badgeClass: 'bg-amber-50 text-amber-900 border border-amber-200 font-bold',
      activeRing: 'ring-2 ring-amber-500 border-amber-500 shadow-md'
    },
    {
      id: 'not_in_2b',
      title: 'Blocked ITC Leaks',
      amount: `${notIn2bCount}`,
      badge: fmtCurrency(kpis.not_in_2b_gst ?? 0),
      sub: 'Sec 16(2)(aa) Blocked ITC',
      icon: AlertCircle,
      cardClass: 'card-rose',
      iconBoxClass: 'bg-rose-50 text-rose-600 border border-rose-200/90 shadow-2xs',
      badgeClass: 'bg-rose-50 text-rose-800 border border-rose-200 font-bold',
      activeRing: 'ring-2 ring-rose-600 border-rose-600 shadow-md'
    },
    {
      id: 'timing',
      title: 'Rule 37A Timing',
      amount: fmtCurrency(kpis.reclaims_4d1_total ?? 0),
      badge: `Rev: ${fmtCurrency(kpis.reversals_4b2_total ?? 0)}`,
      sub: 'Table 4(B)(2) / 4(D)(1)',
      icon: RotateCw,
      cardClass: 'card-purple',
      iconBoxClass: 'bg-purple-50 text-purple-600 border border-purple-200/90 shadow-2xs',
      badgeClass: 'bg-purple-50 text-purple-800 border border-purple-200 font-bold',
      activeRing: 'ring-2 ring-purple-600 border-purple-600 shadow-md'
    }
  ];

  return (
    <div className="space-y-4 mb-6">
      
      {/* Defined Reconciliation Parity Card with Rich Borders */}
      <div className="bg-gradient-to-r from-white via-slate-50/70 to-white rounded-2xl p-4 sm:p-5 border border-slate-300 shadow-[0_2px_8px_rgba(15,23,42,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        
        {/* Subtle decorative top highlight */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Reconciliation Parity Status
              </span>
              <span className="bg-emerald-100/80 text-emerald-800 font-mono font-black text-xs px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                {matchedPct}% Match Rate
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {totalRows > 0 
                ? `${totalRows} Total Invoices Audited across FY 2025-26 & FY 2026-27` 
                : '0 Total Invoices Audited • Awaiting Upload'}
            </p>
          </div>
        </div>

        {/* Tactile Multi-Segment Progress Tube */}
        <div className="w-full md:flex-1 max-w-lg">
          <div className="h-4 rounded-full bg-slate-200/80 overflow-hidden flex border border-slate-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] p-0.5">
            <div 
              style={{ width: `${matchedPct}%` }} 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-l-full hover:brightness-110 transition-all cursor-pointer relative group"
              title={`Matched: ${matchedCount} bills (${matchedPct}%)`}
              onClick={() => onSelectTab && onSelectTab('matched')}
            />
            <div 
              style={{ width: `${notInBooksPct}%` }} 
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 transition-all cursor-pointer relative border-l border-white/40"
              title={`Missing in Books: ${notInBooksCount} bills (${notInBooksPct}%)`}
              onClick={() => onSelectTab && onSelectTab('not_in_books')}
            />
            <div 
              style={{ width: `${notIn2bPct}%` }} 
              className="bg-gradient-to-r from-rose-500 to-red-600 rounded-r-full hover:brightness-110 transition-all cursor-pointer relative border-l border-white/40"
              title={`Missing in 2B: ${notIn2bCount} bills (${notIn2bPct}%)`}
              onClick={() => onSelectTab && onSelectTab('not_in_2b')}
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-[11px] font-mono">
            <button 
              onClick={() => onSelectTab && onSelectTab('matched')}
              className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 transition-colors shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold">Matched:</span>
              <span className="font-bold text-slate-900">{matchedCount}</span>
            </button>
            <button 
              onClick={() => onSelectTab && onSelectTab('not_in_books')}
              className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 transition-colors shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="font-semibold">Unbooked:</span>
              <span className="font-bold text-slate-900">{notInBooksCount}</span>
            </button>
            <button 
              onClick={() => onSelectTab && onSelectTab('not_in_2b')}
              className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 transition-colors shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="font-semibold">Blocked:</span>
              <span className="font-bold text-rose-600">{notIn2bCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 High-Definition Metric Cards with Defined Borders */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {cards.map((c) => {
          const Icon = c.icon;
          const isSelected = activeTab === c.id;

          return (
            <div
              key={c.id}
              onClick={() => onSelectTab && onSelectTab(c.id)}
              className={`metric-card ${c.cardClass} p-3.5 cursor-pointer flex flex-col justify-between ${
                isSelected ? c.activeRing : ''
              }`}
            >
              <div>
                {/* Header row inside card */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${c.iconBoxClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${c.badgeClass}`}>
                    {c.badge}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-slate-500 tracking-tight uppercase truncate">
                  {c.title}
                </div>

                <div className="text-base sm:text-lg font-black font-mono text-slate-900 mt-1 tracking-tight">
                  {c.amount}
                </div>
              </div>

              {/* Bottom footer bar of card */}
              <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span className="truncate">{c.sub}</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
