import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import KPICards from './components/KPICards';
import SummaryMatrix from './components/SummaryMatrix';
import MasterGrid from './components/MasterGrid';
import VendorDefaulterHub from './components/VendorDefaulterHub';
import UploadModal from './components/UploadModal';
import ClientModal from './components/ClientModal';
import SlideOverDrawer from './components/SlideOverDrawer';
import { 
  CheckCircle2, 
  RefreshCw,
  FileSpreadsheet,
  Upload
} from 'lucide-react';
import { API_BASE } from './config';

export default function App() {
  const [clients, setClients] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [recoData, setRecoData] = useState({ items: [], summary_matrix: {}, kpis: {} });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, matrix, grid, defaulters
  const [gridFilter, setGridFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Modals & Drawer
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const clientsRes = await fetch(`${API_BASE}/clients`);
      if (clientsRes.ok) {
        const clientsList = await clientsRes.json();
        setClients(clientsList);
        const active = clientsList.find(c => c.is_active) || clientsList[0];
        setActiveClient(active);
      }

      const recoRes = await fetch(`${API_BASE}/reconciliation`);
      if (recoRes.ok) {
        const data = await recoRes.json();
        setRecoData({
          items: data.items || [],
          summary_matrix: data.summary_matrix || {},
          kpis: data.kpis || {}
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSwitchClient = async (clientId) => {
    try {
      const res = await fetch(`${API_BASE}/clients/${clientId}/switch`, { method: 'POST' });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error switching client:', err);
    }
  };

  const handleExportExcel = async () => {
    if (!recoData.items || recoData.items.length === 0) {
      alert("No reconciliation data available. Please upload your Books and GSTR-2B dump files first.");
      setUploadModalOpen(true);
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch(`${API_BASE}/export`);
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const clientName = activeClient?.name || 'Client';
      const fy = activeClient?.fy || '2025-26';
      a.download = `GST_Recon_${fy} - ${clientName}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert(`Export error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSelectKPICard = (cardId) => {
    setGridFilter(cardId);
    if (cardId === 'not_in_2b') {
      setActiveTab('defaulters');
    } else {
      setActiveTab('grid');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      
      {/* 1. Left Elegant Sidebar with Open/Close Button & Hover to Peek */}
      <Sidebar
        clients={clients}
        activeClient={activeClient}
        onSwitchClient={handleSwitchClient}
        onOpenNewClientModal={() => setClientModalOpen(true)}
        onOpenUploadModal={() => setUploadModalOpen(true)}
        onExportExcel={handleExportExcel}
        isExporting={isExporting}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        defaultersCount={recoData.kpis.not_in_2b_count || 0}
        totalVouchers={recoData.kpis.total_rows || 0}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* 2. Main Right Content Area (Smoothly adjusts to sidebar width) */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-72'
      }`}>
        
        {/* Top Header */}
        <Navbar
          activeClient={activeClient}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenUploadModal={() => setUploadModalOpen(true)}
          onExportExcel={handleExportExcel}
          isExporting={isExporting}
          isSidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Parity Metric Cards */}
          <KPICards 
            kpis={recoData.kpis} 
            activeTab={gridFilter}
            onSelectTab={handleSelectKPICard}
          />

          {/* Loading or Tab Views */}
          {loading ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-slate-300 shadow-sm">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-3" />
              <span className="font-sans font-bold text-sm text-slate-700">
                Loading Reconciliation Data...
              </span>
            </div>
          ) : recoData.items.length === 0 ? (
            /* Clean Empty State when sample data is removed */
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-300 shadow-sm max-w-xl mx-auto my-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-200 shadow-2xs">
                <Upload className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">
                Ready for GST Reconciliation
              </h3>
              <p className="text-xs text-slate-500 mb-6 font-mono leading-relaxed">
                Upload your Books Purchase Register and GSTR-2B Statement to run automated parity checks, monthly comparative matrices, and Section 16(2)(aa) audit notices.
              </p>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
              >
                Upload Dumps Now
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <SummaryMatrix matrixData={recoData.summary_matrix} />
                  <MasterGrid
                    items={recoData.items}
                    onEditRow={(r) => setEditRow(r)}
                    activeFilter={gridFilter}
                    onSelectFilter={(f) => setGridFilter(f)}
                  />
                </div>
              )}

              {activeTab === 'matrix' && (
                <SummaryMatrix matrixData={recoData.summary_matrix} />
              )}

              {activeTab === 'grid' && (
                <MasterGrid
                  items={recoData.items}
                  onEditRow={(r) => setEditRow(r)}
                  activeFilter={gridFilter}
                  onSelectFilter={(f) => setGridFilter(f)}
                />
              )}

              {activeTab === 'defaulters' && (
                <VendorDefaulterHub
                  items={recoData.items}
                  clientName={activeClient?.name}
                />
              )}
            </>
          )}

        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-300 text-slate-500 text-xs py-3.5 px-4 text-center mt-auto">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-slate-800">GST Reco Pro • Professional Reconciliation Suite</span>
            <span>Auditor: <strong className="text-slate-900 font-mono">CA Kanhaiya Soni</strong></span>
            <span className="text-emerald-700 font-bold font-mono">100% Bit-Perfect 5-Sheet Excel Engine</span>
          </div>
        </footer>

      </div>

      {/* Modals & Slide-over Drawer */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={(data) => {
          fetchData();
        }}
      />

      <ClientModal
        isOpen={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onClientCreated={(newClient) => {
          handleSwitchClient(newClient.id);
        }}
      />

      <SlideOverDrawer
        isOpen={!!editRow}
        row={editRow}
        onClose={() => setEditRow(null)}
        onSaveOverride={(data) => {
          fetchData();
        }}
      />

    </div>
  );
}
