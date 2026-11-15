import React from 'react';
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  KeyRound, 
  CreditCard, 
  ClipboardCheck, 
  BarChart3, 
  Settings,
  ShieldCheck,
  ChevronRight,
  X
} from 'lucide-react';

export const Sidebar = ({ currentTab, setCurrentTab, mobileOpen, setMobileOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cars', label: 'My Cars', icon: Car },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'rentals', label: 'Rentals', icon: KeyRound },
    { id: 'inspections', label: 'Inspections', icon: ClipboardCheck },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight leading-none block">AutoOwner</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">Management</span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group ${
                  active
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {active && <ChevronRight className="w-4 h-4 text-white/70" />}
              </button>
            );
          })}
        </nav>

        {/* Owner business banner */}
        <div className="p-4 m-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Owner Portal</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Single-owner business system. Multi-car tracking & income records.
          </p>
        </div>
      </aside>
    </>
  );
};
