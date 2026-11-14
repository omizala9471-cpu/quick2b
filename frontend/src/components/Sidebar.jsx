import React, { useState } from 'react';
import { 
  Building2, 
  ChevronDown, 
  Plus, 
  Download, 
  Upload, 
  RotateCcw, 
  Search, 
  Check, 
  LayoutDashboard, 
  Table as TableIcon, 
  Layers, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  X,
  KeyRound,
  LogOut,
  Edit3,
  Trash2,
  Loader2
} from 'lucide-react';
import Quick2BLogo from './Quick2BLogo';

export default function Sidebar({
  clients = [],
  activeClient,
  onSwitchClient,
  onOpenNewClientModal,
  onOpenEditClientModal,
  onOpenDeleteClientModal,
  onOpenUploadModal,
  onExportExcel,
  isExporting = false,
  activeTab,
  onSelectTab,
  defaultersCount = 0,
  totalVouchers = 0,
  isOpenMobile,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
  onOpenSecurityModal,
  onLogout
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  // When collapsed, hovering over the sidebar expands it temporarily
  const isExpanded = !isCollapsed || isHovered;

  const filteredClients = clients.filter(c => 
    (c.name || '').toLowerCase().includes(clientSearch.toLowerCase()) ||
    (c.gstin || '').toLowerCase().includes(clientSearch.toLowerCase())
  );

  const navItems = [
    {
      id: 'overview',
      label: 'Reconciliation Overview',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
      badge: 'Main',
      badgeClass: 'bg-slate-100 text-slate-800 border border-slate-300'
    },
    {
      id: 'matrix',
      label: '3B vs 2B Parity Matrix',
      shortLabel: '3B vs 2B',
      icon: TableIcon,
      badge: 'Audit',
      badgeClass: 'bg-sky-50 text-sky-800 border border-sky-300'
    },
    {
      id: 'grid',
      label: 'Master Audit Ledger',
      shortLabel: 'Ledger',
      icon: Layers,
      badge: `${totalVouchers}`,
      badgeClass: 'bg-slate-100 text-slate-800 border border-slate-300'
    },
    {
      id: 'defaulters',
      label: 'Blocked ITC Leaks',
      shortLabel: 'Blocked ITC',
      icon: AlertCircle,
      badge: `${defaultersCount}`,
      badgeClass: 'bg-rose-100 text-rose-800 border border-rose-300 font-bold',
      isDanger: true
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Rail / Drawer with Defined Right Border */}
      <aside 
        onMouseEnter={() => {
          if (isCollapsed) setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setDropdownOpen(false);
        }}
        className={`
          fixed top-0 left-0 z-50 h-screen bg-white border-r border-slate-300 flex flex-col justify-between 
          transition-all duration-300 ease-in-out shrink-0 shadow-[2px_0_12px_rgba(15,23,42,0.04)]
          ${isOpenMobile ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
          ${!isOpenMobile && (isExpanded ? 'w-72 shadow-xl lg:shadow-none' : 'w-16')}
          ${isCollapsed && isHovered ? 'shadow-2xl ring-1 ring-slate-900/15' : ''}
        `}
      >
        
        {/* Top Section: Brand & Controls */}
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          
          {/* Brand Header */}
          <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center space-x-3 overflow-hidden">
              <Quick2BLogo size={32} />
              
              {isExpanded && (
                <div className="min-w-0 transition-opacity duration-200">
                  <div className="font-sans font-extrabold text-sm text-slate-900 tracking-tight flex items-center space-x-1.5 truncate">
                    <span>Quick2B</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-800 font-mono font-bold rounded border border-blue-200">v2.4</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium truncate">
                    GST ITC Audit Suite
                  </div>
                </div>
              )}
            </div>

            {/* Toggle Open/Close Button */}
            {isExpanded && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 transition-colors border border-transparent hover:border-slate-300"
                title={isCollapsed ? "Pin Sidebar Open" : "Collapse Sidebar (hover to peek)"}
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Collapsed Open Button (visible only when collapsed and NOT hovered) */}
          {!isExpanded && (
            <div className="py-2.5 flex justify-center border-b border-slate-200 bg-slate-50/50">
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors"
                title="Expand Sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Client Profile Section with Edit & Delete Options */}
          <div className="p-3 border-b border-slate-200 relative bg-slate-50/50">
            {isExpanded ? (
              <>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>Client Profile</span>
                  </span>
                  
                  {/* Action pill: Edit & Delete for Active Client */}
                  {activeClient && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEditClientModal(activeClient);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                        title="Edit active client profile"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDeleteClientModal(activeClient);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Delete active client profile"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Client Profile Box */}
                <div className="rounded-xl bg-white border border-slate-300 shadow-2xs overflow-hidden">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full flex items-center justify-between p-2.5 hover:bg-slate-50 text-left transition-colors group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        {activeClient?.name?.substring(0, 2).toUpperCase() || 'CA'}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {activeClient ? activeClient.name : 'Select Client'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          {activeClient?.gstin} • <span className="font-bold text-blue-700">FY {activeClient?.fy}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Quick Edit/Delete toolbar below active client */}
                  <div className="px-2.5 py-1.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono truncate">
                      {activeClient?.contact_person || 'Active Audit'}
                    </span>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={() => onOpenEditClientModal(activeClient)}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs flex items-center space-x-1"
                        title="Edit Profile"
                      >
                        <Edit3 className="w-2.5 h-2.5 text-amber-600" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => onOpenDeleteClientModal(activeClient)}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 shadow-2xs flex items-center space-x-1"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-2.5 h-2.5 text-rose-600" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Switcher Dropdown */}
                {dropdownOpen && (
                  <div className="absolute left-3 right-3 mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-300 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2 border-b border-slate-200">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          placeholder="Search client profile..."
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          className="w-full pl-8 pr-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="max-h-52 overflow-y-auto py-1 divide-y divide-slate-100">
                      {filteredClients.map((c) => (
                        <div
                          key={c.id}
                          className={`w-full px-2.5 py-2 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors ${
                            c.id === activeClient?.id ? 'bg-blue-50/80 font-bold text-blue-900' : 'text-slate-700'
                          }`}
                        >
                          <button
                            onClick={() => {
                              onSwitchClient(c.id);
                              setDropdownOpen(false);
                            }}
                            className="flex-1 text-left truncate pr-2 group"
                          >
                            <div className="truncate font-semibold text-slate-900 group-hover:text-blue-700">{c.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono truncate">{c.gstin} • FY {c.fy || '2025-26'}</div>
                          </button>

                          <div className="flex items-center space-x-1 shrink-0">
                            {c.id === activeClient?.id && (
                              <Check className="w-3.5 h-3.5 text-blue-600 mr-1" />
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDropdownOpen(false);
                                onOpenEditClientModal(c);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-amber-700 hover:bg-amber-100 transition-colors"
                              title={`Edit ${c.name}`}
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDropdownOpen(false);
                                onOpenDeleteClientModal(c);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-rose-700 hover:bg-rose-100 transition-colors"
                              title={`Delete ${c.name}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-2 border-t border-slate-200">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenNewClientModal();
                        }}
                        className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-bold text-blue-700 transition-colors border border-dashed border-blue-400"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Client</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Compact Icon Avatar when collapsed */
              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={onToggleCollapse}
                  className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm border border-blue-700 hover:ring-2 hover:ring-blue-300 transition-all"
                  title={`${activeClient?.name || 'Client'} (${activeClient?.gstin}) - Click to expand`}
                >
                  {activeClient?.name?.substring(0, 2).toUpperCase() || 'CA'}
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions: Upload Dumps & Export (Prominently featured in Sidebar) */}
          <div className="p-2.5 border-b border-slate-200 bg-white">
            {isExpanded && (
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                <span>Quick Actions</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">Live Engine</span>
              </div>
            )}

            <div className={`space-y-1.5 ${!isExpanded ? 'flex flex-col items-center' : ''}`}>
              {/* Upload Dumps Action */}
              <button
                onClick={onOpenUploadModal}
                className={`w-full flex items-center rounded-xl text-xs font-bold text-slate-900 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 shadow-2xs transition-all ${
                  isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5 w-10 h-10'
                }`}
                title="Upload Books & GSTR-2B Dumps"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                  </div>
                  {isExpanded && (
                    <div className="truncate text-left">
                      <div className="font-extrabold text-blue-950 truncate">Upload Dumps</div>
                      <div className="text-[10px] text-blue-700/80 font-mono font-medium truncate">Books + 2B XLSX</div>
                    </div>
                  )}
                </div>
                {isExpanded && (
                  <span className="text-[10px] font-bold text-blue-700 bg-white px-1.5 py-0.5 rounded border border-blue-200">
                    Import
                  </span>
                )}
              </button>

              {/* Export 5-Sheet Excel Action */}
              <button
                onClick={onExportExcel}
                disabled={isExporting}
                className={`w-full flex items-center rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-950 shadow-sm transition-all disabled:opacity-50 ${
                  isExpanded ? 'justify-between px-3 py-2' : 'justify-center p-2.5 w-10 h-10'
                }`}
                title="Export 5-Sheet Consolidated Audit Excel"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    {isExporting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                  </div>
                  {isExpanded && (
                    <div className="truncate text-left">
                      <div className="font-extrabold text-white truncate">Export Excel</div>
                      <div className="text-[10px] text-emerald-300 font-mono font-medium truncate">5-Sheet Parity</div>
                    </div>
                  )}
                </div>
                {isExpanded && (
                  <span className="text-[10px] font-bold font-mono text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                    {isExporting ? 'Building...' : '.XLSX'}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Navigation Links with Defined Borders */}
          <div className="p-2.5 space-y-1.5">
            {isExpanded && (
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1">
                Audit Views
              </div>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all ${
                    isExpanded 
                      ? 'justify-between px-3 py-2.5' 
                      : 'justify-center p-2.5'
                  } ${
                    isActive
                      ? 'bg-slate-900 text-white font-bold shadow-sm border border-slate-900'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-300'
                  }`}
                  title={!isExpanded ? `${item.label} (${item.badge})` : undefined}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.isDanger ? 'text-rose-600' : 'text-slate-600'}`} />
                    {isExpanded && <span className="truncate">{item.label}</span>}
                  </div>
                  
                  {isExpanded && (
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono shrink-0 ${
                      isActive 
                        ? 'bg-slate-800 text-slate-200 border border-slate-700' 
                        : item.badgeClass
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Bottom Auditor Stamp with Defined Border */}
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          {isExpanded ? (
            <div className="flex items-center justify-between p-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-sm border border-slate-800">
                  KS
                </div>
                <div className="truncate min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    CA Kanhaiya Soni
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    Chartered Accountant
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1 shrink-0 pr-1">
                <button
                  onClick={onOpenSecurityModal}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Security & Password"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onLogout}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div 
                className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-sm border border-slate-800 cursor-help"
                title="Auditor: CA Kanhaiya Soni"
              >
                KS
              </div>
            </div>
          )}
        </div>

      </aside>
    </>
  );
}
