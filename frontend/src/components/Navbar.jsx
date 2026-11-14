import React from 'react';
import { 
  Menu, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  PanelLeft,
  PanelLeftClose,
  KeyRound,
  LogOut,
  Edit3,
  Trash2,
  Loader2
} from 'lucide-react';
import Quick2BLogo from './Quick2BLogo';

export default function Navbar({
  activeClient,
  onOpenMobileSidebar,
  onOpenUploadModal,
  onExportExcel,
  isExporting,
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenSecurityModal,
  onLogout,
  onOpenEditClientModal,
  onOpenDeleteClientModal
}) {
  return (
    <header className="sticky top-0 z-30 px-4 sm:px-6 lg:px-8 h-16 bg-white/95 backdrop-blur-md border-b border-slate-300 shadow-[0_1px_4px_rgba(15,23,42,0.04)] flex items-center justify-between gap-4">
      
      {/* Left: Sidebar Toggle & Client Breadcrumbs */}
      <div className="flex items-center space-x-3 min-w-0">
        
        {/* Mobile Toggle Button */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Open/Close Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex items-center justify-center p-2 rounded-xl text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 shadow-2xs transition-colors"
          title={isSidebarCollapsed ? "Expand Sidebar (or hover over left edge)" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelLeft className="w-5 h-5 text-slate-800" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-slate-500" />
          )}
        </button>

        <div className="h-5 w-px bg-slate-300 hidden lg:block" />

        {/* Entity Title & Status with Quick Edit & Delete */}
        <div className="min-w-0">
          <div className="flex items-center space-x-2 truncate">
            <h1 className="font-sans font-black text-sm sm:text-base text-slate-900 truncate">
              {activeClient ? activeClient.name : 'Shri Mahadev Automobiles'}
            </h1>
            <span className="hidden sm:inline-block bg-blue-50 text-blue-800 text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold border border-blue-300 shadow-2xs">
              FY {activeClient?.fy || '2025-26'}
            </span>
            
            {activeClient && (
              <div className="hidden sm:flex items-center space-x-0.5">
                <button
                  onClick={() => onOpenEditClientModal && onOpenEditClientModal(activeClient)}
                  className="p-1 rounded-md text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                  title="Edit Client Profile"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onOpenDeleteClientModal && onOpenDeleteClientModal(activeClient)}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                  title="Delete Client Profile"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-600 font-mono truncate">
            <span className="truncate">GSTIN: <strong className="text-slate-800">{activeClient?.gstin}</strong></span>
            <span>•</span>
            <span className="text-emerald-700 font-bold flex items-center space-x-1 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>5-Sheet Parity Verified</span>
            </span>
          </div>
        </div>

      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center space-x-2.5 shrink-0">
        
        {/* Upload Shortcut */}
        <button
          onClick={onOpenUploadModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-2xs"
          title="Upload Books & GSTR-2B Files"
        >
          <Upload className="w-3.5 h-3.5 text-blue-600" />
          <span>Upload Dumps</span>
        </button>

        {/* Primary Export Button */}
        <button
          onClick={onExportExcel}
          disabled={isExporting}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-black text-white bg-slate-900 hover:bg-slate-800 border border-slate-950 transition-all disabled:opacity-50 shadow-sm"
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
          ) : (
            <Download className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
          )}
          <span className="whitespace-nowrap">{isExporting ? 'Generating...' : 'Export 5-Sheet Excel'}</span>
        </button>

        {/* Quick2B User Profile Badge & Security Options */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-300 text-xs">
          <div className="hidden sm:flex items-center space-x-2 mr-1">
            <Quick2BLogo size={28} />
            <div className="text-left">
              <div className="text-[11px] font-bold text-slate-900 leading-tight">Quick2B Cloud</div>
              <div className="text-[10px] text-emerald-600 font-mono font-bold leading-tight">Audit Portal</div>
            </div>
          </div>

          {/* Security / Password Button */}
          <button
            onClick={onOpenSecurityModal}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Portal Security & Change Password"
          >
            <KeyRound className="w-4 h-4 text-slate-700" />
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Lock Portal & Log Out"
          >
            <LogOut className="w-4 h-4 text-slate-700 hover:text-rose-600" />
          </button>
        </div>

      </div>

    </header>
  );
}
