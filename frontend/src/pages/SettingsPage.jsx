import React, { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';
import { Settings, ShieldCheck, CheckCircle2, Server, Save, RefreshCw } from 'lucide-react';
import api from '../api/client';

export const SettingsPage = () => {
  const { success, error } = useToast();
  const [businessName, setBusinessName] = useState('AutoOwner Rental Services');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [defaultFuelRule, setDefaultFuelRule] = useState('SAME_LEVEL');
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [checkingBackend, setCheckingBackend] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('autoowner_business_name');
    const savedCurrency = localStorage.getItem('autoowner_currency');
    const savedFuel = localStorage.getItem('autoowner_fuel_rule');
    if (savedName) setBusinessName(savedName);
    if (savedCurrency) setCurrencySymbol(savedCurrency);
    if (savedFuel) setDefaultFuelRule(savedFuel);

    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      setCheckingBackend(true);
      await api.get('/vehicles');
      setBackendStatus('Connected & Operational');
    } catch {
      setBackendStatus('Connection Error (Check Spring Boot backend port 8080)');
    } finally {
      setCheckingBackend(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('autoowner_business_name', businessName);
    localStorage.setItem('autoowner_currency', currencySymbol);
    localStorage.setItem('autoowner_fuel_rule', defaultFuelRule);
    success('Settings and preferences saved locally');
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">System & Business Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Owner preferences, branding label, and system connection diagnostics
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Business / Fleet Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. My Personal Car Rental Business"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
            />
            <p className="text-[11px] text-slate-400 mt-1">Displayed on receipts and header.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Currency Symbol
              </label>
              <select
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white font-medium"
              >
                <option value="₹">₹ (INR - Indian Rupee)</option>
                <option value="$">$ (USD - US Dollar)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - British Pound)</option>
                <option value="AED">AED (UAE Dirham)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Fuel Policy Rule
              </label>
              <select
                value={defaultFuelRule}
                onChange={(e) => setDefaultFuelRule(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white font-medium"
              >
                <option value="SAME_LEVEL">Same-to-Same (Return with pickup fuel)</option>
                <option value="FULL_TO_FULL">Full-to-Full Tank</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backend & Deployment Status */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-primary-600" />
            <h3 className="text-base font-extrabold text-slate-900">System Diagnostics</h3>
          </div>
          <button
            onClick={checkBackendHealth}
            disabled={checkingBackend}
            className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingBackend ? 'animate-spin' : ''}`} />
            <span>Test Connection</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600">Backend API (Spring Boot):</span>
            <span className={`font-bold font-mono ${backendStatus.includes('Connected') ? 'text-emerald-600' : 'text-rose-600'}`}>
              {backendStatus}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600">Database Engine:</span>
            <span className="font-bold text-slate-800 font-mono">PostgreSQL / Flyway Migrations Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600">Application Architecture:</span>
            <span className="font-bold text-slate-800">Single-Owner Direct Ledger (No Auth Overhead)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

