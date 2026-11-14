import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Table as TableIcon
} from 'lucide-react';

export default function SummaryMatrix({ matrixData }) {
  const [collapsedQuarters, setCollapsedQuarters] = useState({});
  const [manualInputs, setManualInputs] = useState({});
  const [selectedFY, setSelectedFY] = useState('2025-26');

  if (!matrixData || Object.keys(matrixData).length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-slate-500 font-mono text-xs border border-slate-300 shadow-sm">
        No comparative matrix data available.
      </div>
    );
  }

  const toggleQuarter = (qKey) => {
    setCollapsedQuarters(prev => ({
      ...prev,
      [qKey]: !prev[qKey]
    }));
  };

  const handleManualChange = (month, taxKey, value) => {
    const valNum = parseFloat(value) || 0.0;
    setManualInputs(prev => ({
      ...prev,
      [`${month}_${taxKey}`]: valNum
    }));
  };

  const quartersConfig = [
    {
      id: 'FY25-26_Q1',
      fy: '2025-26',
      label: 'QTR-1 (Apr 2025 - Jun 2025)',
      short: 'QTR-1',
      months: ['2025-04', '2025-05', '2025-06']
    },
    {
      id: 'FY25-26_Q2',
      fy: '2025-26',
      label: 'QTR-2 (Jul 2025 - Sep 2025)',
      short: 'QTR-2',
      months: ['2025-07', '2025-08', '2025-09']
    },
    {
      id: 'FY25-26_Q3',
      fy: '2025-26',
      label: 'QTR-3 (Oct 2025 - Dec 2025)',
      short: 'QTR-3',
      months: ['2025-10', '2025-11', '2025-12']
    },
    {
      id: 'FY25-26_Q4',
      fy: '2025-26',
      label: 'QTR-4 (Jan 2026 - Mar 2026)',
      short: 'QTR-4',
      months: ['2026-01', '2026-02', '2026-03']
    },
    {
      id: 'FY26-27_Q1',
      fy: '2026-27',
      label: 'QTR-1 (Apr 2026 - Jun 2026)',
      short: 'QTR-1',
      months: ['2026-04', '2026-05', '2026-06']
    },
    {
      id: 'FY26-27_Q2',
      fy: '2026-27',
      label: 'QTR-2 (Jul 2026 - Sep 2026)',
      short: 'QTR-2',
      months: ['2026-07', '2026-08', '2026-09']
    },
    {
      id: 'FY26-27_Q3',
      fy: '2026-27',
      label: 'QTR-3 (Oct 2026 - Dec 2026)',
      short: 'QTR-3',
      months: ['2026-10', '2026-11', '2026-12']
    },
    {
      id: 'FY26-27_Q4',
      fy: '2026-27',
      label: 'QTR-4 (Jan 2027 - Mar 2027)',
      short: 'QTR-4',
      months: ['2027-01', '2027-02', '2027-03']
    }
  ];

  const fmt = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '0.00';
    return Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const renderVal = (val, isDiff = false) => {
    const num = Number(val || 0);
    const isNegative = num < -0.01;
    if (isDiff && isNegative) {
      return (
        <span className="font-mono tabular-nums text-xs bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-black border border-rose-300">
          {fmt(num)}
        </span>
      );
    }
    return (
      <span className={`font-mono tabular-nums text-xs ${num > 0.01 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
        {fmt(num)}
      </span>
    );
  };

  const calculateQuarterTotal = (months) => {
    const total = {
      two_b: { igst: 0, cgst: 0, sgst: 0 },
      books: { igst: 0, cgst: 0, sgst: 0 },
      diff_books: { igst: 0, cgst: 0, sgst: 0 },
      three_b: { igst: 0, cgst: 0, sgst: 0 },
      diff_3b: { igst: 0, cgst: 0, sgst: 0 },
      three_b_manual: { igst: 0, cgst: 0, sgst: 0 },
      diff_manual: { igst: 0, cgst: 0, sgst: 0 }
    };

    months.forEach(m => {
      const d = matrixData[m];
      if (d) {
        ['igst', 'cgst', 'sgst'].forEach(k => {
          total.two_b[k] += d.two_b[k] || 0;
          total.books[k] += d.books[k] || 0;
          total.diff_books[k] += d.diff_books[k] || 0;
          total.three_b[k] += d.three_b[k] || 0;
          total.diff_3b[k] += d.diff_3b[k] || 0;
          
          const manualVal = manualInputs[`${m}_${k}`] || 0;
          total.three_b_manual[k] += manualVal;
          total.diff_manual[k] += (d.three_b[k] || 0) - manualVal;
        });
      }
    });

    return total;
  };

  const calculateFYTotal = (qList) => {
    const fyTotal = {
      two_b: { igst: 0, cgst: 0, sgst: 0 },
      books: { igst: 0, cgst: 0, sgst: 0 },
      diff_books: { igst: 0, cgst: 0, sgst: 0 },
      three_b: { igst: 0, cgst: 0, sgst: 0 },
      diff_3b: { igst: 0, cgst: 0, sgst: 0 },
      three_b_manual: { igst: 0, cgst: 0, sgst: 0 },
      diff_manual: { igst: 0, cgst: 0, sgst: 0 }
    };

    qList.forEach(q => {
      const qTot = calculateQuarterTotal(q.months);
      ['igst', 'cgst', 'sgst'].forEach(k => {
        fyTotal.two_b[k] += qTot.two_b[k];
        fyTotal.books[k] += qTot.books[k];
        fyTotal.diff_books[k] += qTot.diff_books[k];
        fyTotal.three_b[k] += qTot.three_b[k];
        fyTotal.diff_3b[k] += qTot.diff_3b[k];
        fyTotal.three_b_manual[k] += qTot.three_b_manual[k];
        fyTotal.diff_manual[k] += qTot.diff_manual[k];
      });
    });

    return fyTotal;
  };

  const fy2526Quarters = quartersConfig.filter(q => q.fy === '2025-26');
  const fy2627Quarters = quartersConfig.filter(q => q.fy === '2026-27');
  const fy2526Total = calculateFYTotal(fy2526Quarters);
  const fy2627Total = calculateFYTotal(fy2627Quarters);

  const activeFYTotal = selectedFY === '2025-26' ? fy2526Total : (selectedFY === '2026-27' ? fy2627Total : calculateFYTotal(quartersConfig));

  const filteredQuarters = quartersConfig.filter(q => {
    if (selectedFY === 'ALL') return true;
    return q.fy === selectedFY;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-300 shadow-[0_2px_8px_rgba(15,23,42,0.04)] overflow-hidden">
      
      {/* Header with defined border & subtle gradient */}
      <div className="p-4 sm:p-5 border-b border-slate-300 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-white to-slate-50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
            <TableIcon className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
              3B vs 2B vs Books Comparative Financial Matrix
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Live automated parity formulas matching CA benchmark standards
            </p>
          </div>
        </div>

        {/* Segmented Fiscal Year Toggle */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-xl border border-slate-300 text-xs font-mono shadow-inner">
          {['2025-26', '2026-27', 'ALL'].map((fy) => (
            <button
              key={fy}
              onClick={() => setSelectedFY(fy)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedFY === fy
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-300/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {fy === 'ALL' ? 'All Fiscal Cycles' : `FY ${fy}`}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Defined Metric Pods with Layered Borders */}
      <div className="p-4 bg-slate-50/90 border-b border-slate-300 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-2xs border-t-3 border-t-sky-500">
          <span className="text-sky-700 text-[10px] uppercase font-bold block font-mono">2B Statement ({selectedFY})</span>
          <span className="font-mono text-base font-extrabold text-slate-900">₹{fmt(activeFYTotal.two_b.cgst)}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-2xs border-t-3 border-t-indigo-500">
          <span className="text-indigo-700 text-[10px] uppercase font-bold block font-mono">Books CGST/SGST</span>
          <span className="font-mono text-base font-extrabold text-slate-900">₹{fmt(activeFYTotal.books.cgst)}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-2xs border-t-3 border-t-amber-500">
          <span className="text-amber-800 text-[10px] uppercase font-bold block font-mono">Net Gap (2B vs Books)</span>
          <span className="font-mono text-base font-extrabold text-slate-900">₹{fmt(activeFYTotal.diff_books.cgst)}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-2xs border-t-3 border-t-emerald-500">
          <span className="text-emerald-700 text-[10px] uppercase font-bold block font-mono">3B Claimed ITC</span>
          <span className="font-mono text-base font-extrabold text-slate-900">₹{fmt(activeFYTotal.three_b.cgst)}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-2xs border-t-3 border-t-purple-500">
          <span className="text-purple-700 text-[10px] uppercase font-bold block font-mono">Diff 2B vs 3B</span>
          <span className="font-mono text-base font-extrabold text-slate-900">₹{fmt(activeFYTotal.diff_3b.cgst)}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-2xs border-t-3 border-t-slate-500">
          <span className="text-slate-600 text-[10px] uppercase font-bold block font-mono">Rule 37A Timing</span>
          <span className="font-mono text-xs font-bold text-slate-800 block">Rev: ₹{fmt(activeFYTotal.reversals_4b2 || 0)}</span>
          <span className="font-mono text-xs font-bold text-blue-700 block">Rec: ₹{fmt(activeFYTotal.reclaims_4d1 || 0)}</span>
        </div>
      </div>

      {/* Matrix Table with High-Contrast Dividing Borders */}
      <div className="overflow-x-auto max-h-[620px]">
        <table className="w-full text-left border-collapse text-xs">
          
          {/* Header Row 1: Category Banners */}
          <thead className="sticky top-0 z-20 border-b-2 border-slate-300 bg-white shadow-xs">
            <tr>
              <th rowSpan={2} className="p-3 border-r-2 border-slate-300 bg-slate-100 font-extrabold text-slate-800 w-32 text-center text-[10px] uppercase tracking-wider">
                Return Period
              </th>
              <th colSpan={3} className="p-2 border-r border-slate-300 text-center font-extrabold bg-sky-50 text-sky-950 text-xs border-b border-sky-300">
                As per GSTR-2B Statement
              </th>
              <th colSpan={3} className="p-2 border-r border-slate-300 text-center font-extrabold bg-indigo-50 text-indigo-950 text-xs border-b border-indigo-300">
                As per Books of Accounts
              </th>
              <th colSpan={3} className="p-2 border-r border-slate-300 text-center font-extrabold bg-amber-50 text-amber-950 text-xs border-b border-amber-300">
                Variance: 2B vs Books
              </th>
              <th colSpan={3} className="p-2 border-r border-slate-300 text-center font-extrabold bg-emerald-50 text-emerald-950 text-xs border-b border-emerald-300">
                As per GSTR-3B (Auto)
              </th>
              <th colSpan={3} className="p-2 border-r border-slate-300 text-center font-extrabold bg-purple-50 text-purple-950 text-xs border-b border-purple-300">
                Variance: 2B vs 3B
              </th>
              <th colSpan={3} className="p-2 border-r border-slate-300 text-center font-extrabold bg-slate-100 text-slate-800 text-xs border-b border-slate-300">
                As per 3B (Portal Filed)
              </th>
              <th colSpan={3} className="p-2 text-center font-extrabold bg-rose-50 text-rose-950 text-xs border-b border-rose-300">
                Variance: 3B vs 3B(M)
              </th>
            </tr>
            {/* Header Row 2: Sub-columns */}
            <tr className="bg-slate-100/90 border-b border-slate-300 font-extrabold text-[10px] text-slate-600 font-mono">
              <th className="px-2.5 py-1.5 text-right border-r border-slate-200">IGST</th>
              <th className="px-2.5 py-1.5 text-right border-r border-slate-200">CGST</th>
              <th className="px-2.5 py-1.5 text-right border-r-2 border-slate-300">SGST</th>

              <th className="px-2.5 py-1.5 text-right border-r border-slate-200">IGST</th>
              <th className="px-2.5 py-1.5 text-right border-r border-slate-200">CGST</th>
              <th className="px-2.5 py-1.5 text-right border-r-2 border-slate-300">SGST</th>

              <th className="px-2.5 py-1.5 text-right border-r border-slate-200">IGST</th>
              <th className="px-2.5 py-1.5 text-right border-r border-slate-200">CGST</th>
              <th className="px-2.5 py-1.5 text-right border-r-2 border-slate-300">SGST</th>

              <th className="px-2.5 py-1.5 text-right border-r border-slate-200">IGST</th>
              <th className="px-2.5 py-1.5 text-right border-r border-slate-200">CGST</th>
              <th className="px-2.5 py-1.5 text-right border-r-2 border-slate-300">SGST</th>

              <th className="px-2.5 py-1.5 text-right border-r border-slate-200">IGST</th>
              <th className="px-2.5 py-1.5 text-right border-r border-slate-200">CGST</th>
              <th className="px-2.5 py-1.5 text-right border-r-2 border-slate-300">SGST</th>

              <th className="px-2.5 py-1.5 text-right border-r border-slate-200">IGST</th>
              <th className="px-2.5 py-1.5 text-right border-r border-slate-200">CGST</th>
              <th className="px-2.5 py-1.5 text-right border-r-2 border-slate-300">SGST</th>

              <th className="px-2.5 py-1.5 text-right border-r border-slate-200">IGST</th>
              <th className="px-2.5 py-1.5 text-right border-r border-slate-200">CGST</th>
              <th className="px-2.5 py-1.5 text-right">SGST</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 font-mono">
            {filteredQuarters.map((q) => {
              const isCollapsed = collapsedQuarters[q.id];
              const qTotal = calculateQuarterTotal(q.months);

              return (
                <React.Fragment key={q.id}>
                  
                  {/* Monthly rows inside quarter with alternating zebra */}
                  {!isCollapsed && q.months.map((m, idx) => {
                    const row = matrixData[m] || {
                      two_b: {}, books: {}, diff_books: {}, three_b: {}, diff_3b: {}, three_b_manual: {}, diff_manual: {}
                    };

                    const manualIGST = manualInputs[`${m}_igst`] ?? 0;
                    const manualCGST = manualInputs[`${m}_cgst`] ?? 0;
                    const manualSGST = manualInputs[`${m}_sgst`] ?? 0;

                    const diffManIGST = (row.three_b.igst || 0) - manualIGST;
                    const diffManCGST = (row.three_b.cgst || 0) - manualCGST;
                    const diffManSGST = (row.three_b.sgst || 0) - manualSGST;

                    return (
                      <tr key={m} className={`transition-colors border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'} hover:bg-blue-50/40`}>
                        <td className="p-2.5 pl-4 border-r-2 border-slate-300 font-mono font-extrabold text-slate-900 bg-slate-100/70 whitespace-nowrap">
                          {m}
                        </td>

                        {/* 2B */}
                        <td className="p-2 text-right border-r border-slate-200">{renderVal(row.two_b.igst)}</td>
                        <td className="p-2 text-right border-r border-slate-200">{renderVal(row.two_b.cgst)}</td>
                        <td className="p-2 text-right border-r-2 border-slate-300 font-bold">{renderVal(row.two_b.sgst)}</td>

                        {/* Books */}
                        <td className="p-2 text-right border-r border-slate-200">{renderVal(row.books.igst)}</td>
                        <td className="p-2 text-right border-r border-slate-200">{renderVal(row.books.cgst)}</td>
                        <td className="p-2 text-right border-r-2 border-slate-300 font-bold">{renderVal(row.books.sgst)}</td>

                        {/* Diff 2B vs Books */}
                        <td className="p-2 text-right border-r border-slate-200">{renderVal(row.diff_books.igst, true)}</td>
                        <td className="p-2 text-right border-r border-slate-200">{renderVal(row.diff_books.cgst, true)}</td>
                        <td className="p-2 text-right border-r-2 border-slate-300 font-extrabold">{renderVal(row.diff_books.sgst, true)}</td>

                        {/* 3B */}
                        <td className="p-2 text-right border-r border-slate-200">{renderVal(row.three_b.igst)}</td>
                        <td className="p-2 text-right border-r border-slate-200">{renderVal(row.three_b.cgst)}</td>
                        <td className="p-2 text-right border-r-2 border-slate-300 font-bold">{renderVal(row.three_b.sgst)}</td>

                        {/* Diff 2B vs 3B */}
                        <td className="p-2 text-right border-r border-slate-200">{renderVal(row.diff_3b.igst, true)}</td>
                        <td className="p-2 text-right border-r border-slate-200">{renderVal(row.diff_3b.cgst, true)}</td>
                        <td className="p-2 text-right border-r-2 border-slate-300 font-extrabold">{renderVal(row.diff_3b.sgst, true)}</td>

                        {/* Manual 3B Inputs */}
                        <td className="p-1 text-right border-r border-slate-200">
                          <input
                            type="number"
                            step="0.01"
                            value={manualIGST || ''}
                            placeholder="0.00"
                            onChange={(e) => handleManualChange(m, 'igst', e.target.value)}
                            className="w-20 text-right font-mono text-xs px-1.5 py-0.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white text-slate-900 placeholder-slate-400 font-semibold"
                          />
                        </td>
                        <td className="p-1 text-right border-r border-slate-200">
                          <input
                            type="number"
                            step="0.01"
                            value={manualCGST || ''}
                            placeholder="0.00"
                            onChange={(e) => handleManualChange(m, 'cgst', e.target.value)}
                            className="w-20 text-right font-mono text-xs px-1.5 py-0.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white text-slate-900 placeholder-slate-400 font-semibold"
                          />
                        </td>
                        <td className="p-1 text-right border-r-2 border-slate-300">
                          <input
                            type="number"
                            step="0.01"
                            value={manualSGST || ''}
                            placeholder="0.00"
                            onChange={(e) => handleManualChange(m, 'sgst', e.target.value)}
                            className="w-20 text-right font-mono text-xs px-1.5 py-0.5 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white text-slate-900 placeholder-slate-400 font-semibold"
                          />
                        </td>

                        {/* Diff 3B vs 3B(M) */}
                        <td className="p-2 text-right border-r border-slate-200">{renderVal(diffManIGST, true)}</td>
                        <td className="p-2 text-right border-r border-slate-200">{renderVal(diffManCGST, true)}</td>
                        <td className="p-2 text-right font-extrabold">{renderVal(diffManSGST, true)}</td>
                      </tr>
                    );
                  })}

                  {/* Quarter Total Header Accordion Bar with Rich Defined Frame */}
                  <tr 
                    onClick={() => toggleQuarter(q.id)}
                    className="bg-slate-100 hover:bg-slate-200/80 border-y-2 border-slate-300 font-black cursor-pointer transition-colors shadow-2xs"
                  >
                    <td className="p-2.5 pl-3 border-r-2 border-slate-300 flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 font-mono">{q.short} TOTAL</span>
                      {isCollapsed ? <ChevronRight className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
                    </td>

                    <td className="p-2 text-right border-r border-slate-200">{renderVal(qTotal.two_b.igst)}</td>
                    <td className="p-2 text-right border-r border-slate-200">{renderVal(qTotal.two_b.cgst)}</td>
                    <td className="p-2 text-right border-r-2 border-slate-300 font-black text-sky-700">{renderVal(qTotal.two_b.sgst)}</td>

                    <td className="p-2 text-right border-r border-slate-200">{renderVal(qTotal.books.igst)}</td>
                    <td className="p-2 text-right border-r border-slate-200">{renderVal(qTotal.books.cgst)}</td>
                    <td className="p-2 text-right border-r-2 border-slate-300 font-black text-indigo-700">{renderVal(qTotal.books.sgst)}</td>

                    <td className="p-2 text-right border-r border-slate-200">{renderVal(qTotal.diff_books.igst, true)}</td>
                    <td className="p-2 text-right border-r border-slate-200">{renderVal(qTotal.diff_books.cgst, true)}</td>
                    <td className="p-2 text-right border-r-2 border-slate-300 font-black">{renderVal(qTotal.diff_books.sgst, true)}</td>

                    <td className="p-2 text-right border-r border-slate-200">{renderVal(qTotal.three_b.igst)}</td>
                    <td className="p-2 text-right border-r border-slate-200">{renderVal(qTotal.three_b.cgst)}</td>
                    <td className="p-2 text-right border-r-2 border-slate-300 font-black text-emerald-700">{renderVal(qTotal.three_b.sgst)}</td>

                    <td className="p-2 text-right border-r border-slate-200">{renderVal(qTotal.diff_3b.igst, true)}</td>
                    <td className="p-2 text-right border-r border-slate-200">{renderVal(qTotal.diff_3b.cgst, true)}</td>
                    <td className="p-2 text-right border-r-2 border-slate-300 font-black">{renderVal(qTotal.diff_3b.sgst, true)}</td>

                    <td className="p-2 text-right border-r border-slate-200">{renderVal(qTotal.three_b_manual.igst)}</td>
                    <td className="p-2 text-right border-r border-slate-200">{renderVal(qTotal.three_b_manual.cgst)}</td>
                    <td className="p-2 text-right border-r-2 border-slate-300">{renderVal(qTotal.three_b_manual.sgst)}</td>

                    <td className="p-2 text-right border-r border-slate-200">{renderVal(qTotal.diff_manual.igst, true)}</td>
                    <td className="p-2 text-right border-r border-slate-200">{renderVal(qTotal.diff_manual.cgst, true)}</td>
                    <td className="p-2 text-right font-black">{renderVal(qTotal.diff_manual.sgst, true)}</td>
                  </tr>

                </React.Fragment>
              );
            })}

            {/* Annual Rollup Row with Distinct Slate-900 Bar */}
            <tr className="bg-slate-900 border-t-2 border-slate-950 font-black text-white text-xs shadow-md">
              <td className="p-3 border-r-2 border-slate-800 bg-slate-900 font-black text-sky-300 font-mono tracking-wider">
                FY {selectedFY} TOTAL
              </td>

              <td className="p-2 text-right border-r border-slate-800 font-mono">{renderVal(activeFYTotal.two_b.igst)}</td>
              <td className="p-2 text-right border-r border-slate-800 font-mono">{renderVal(activeFYTotal.two_b.cgst)}</td>
              <td className="p-2 text-right border-r-2 border-slate-700 font-mono text-sky-300 font-black">{renderVal(activeFYTotal.two_b.sgst)}</td>

              <td className="p-2 text-right border-r border-slate-800 font-mono">{renderVal(activeFYTotal.books.igst)}</td>
              <td className="p-2 text-right border-r border-slate-800 font-mono">{renderVal(activeFYTotal.books.cgst)}</td>
              <td className="p-2 text-right border-r-2 border-slate-700 font-mono text-indigo-300 font-black">{renderVal(activeFYTotal.books.sgst)}</td>

              <td className="p-2 text-right border-r border-slate-800 font-mono">{renderVal(activeFYTotal.diff_books.igst, true)}</td>
              <td className="p-2 text-right border-r border-slate-800 font-mono">{renderVal(activeFYTotal.diff_books.cgst, true)}</td>
              <td className="p-2 text-right border-r-2 border-slate-700 font-mono text-amber-300 font-black">{renderVal(activeFYTotal.diff_books.sgst, true)}</td>

              <td className="p-2 text-right border-r border-slate-800 font-mono">{renderVal(activeFYTotal.three_b.igst)}</td>
              <td className="p-2 text-right border-r border-slate-800 font-mono">{renderVal(activeFYTotal.three_b.cgst)}</td>
              <td className="p-2 text-right border-r-2 border-slate-700 font-mono text-emerald-300 font-black">{renderVal(activeFYTotal.three_b.sgst)}</td>

              <td className="p-2 text-right border-r border-slate-800 font-mono">{renderVal(activeFYTotal.diff_3b.igst, true)}</td>
              <td className="p-2 text-right border-r border-slate-800 font-mono">{renderVal(activeFYTotal.diff_3b.cgst, true)}</td>
              <td className="p-2 text-right border-r-2 border-slate-700 font-mono text-purple-300 font-black">{renderVal(activeFYTotal.diff_3b.sgst, true)}</td>

              <td className="p-2 text-right border-r border-slate-800 font-mono">{renderVal(activeFYTotal.three_b_manual.igst)}</td>
              <td className="p-2 text-right border-r border-slate-800 font-mono">{renderVal(activeFYTotal.three_b_manual.cgst)}</td>
              <td className="p-2 text-right border-r-2 border-slate-700 font-mono">{renderVal(activeFYTotal.three_b_manual.sgst)}</td>

              <td className="p-2 text-right border-r border-slate-800 font-mono">{renderVal(activeFYTotal.diff_manual.igst, true)}</td>
              <td className="p-2 text-right border-r border-slate-800 font-mono">{renderVal(activeFYTotal.diff_manual.cgst, true)}</td>
              <td className="p-2 text-right font-mono font-black text-white">{renderVal(activeFYTotal.diff_manual.sgst, true)}</td>
            </tr>

          </tbody>
        </table>
      </div>

    </div>
  );
}
