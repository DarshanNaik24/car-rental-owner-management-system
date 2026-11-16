import React, { useState, useEffect } from 'react';
import { paymentApi } from '../api/client';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner, EmptyState } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';
import { 
  CreditCard, 
  IndianRupee, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const PaymentsPage = ({ onSelectRental }) => {
  const { error } = useToast();
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    loadPayments();
  }, [page, methodFilter]);

  const loadSummary = async () => {
    try {
      const res = await paymentApi.getSummary();
      setSummary(res.data);
    } catch {
      // Ignore
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 10,
        sortBy: 'paymentDatetime',
        direction: 'desc',
        search: search || null,
        method: methodFilter || null,
      };
      const res = await paymentApi.search(params);
      setPayments(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 0);
      setTotalElements(res.data?.totalElements || 0);
    } catch (err) {
      error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadPayments();
  };

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Payment Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor incoming cash, UPI, and bank transfers, calculate outstanding balances, and audit payment receipts
          </p>
        </div>
      </div>

      {/* Summary Cards (Section 10 requirement: Fully paid, Partially paid, Outstanding rentals) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Payments Received"
          value={formatCurrency(summary?.totalPaymentsReceived)}
          subtext="Total collected into accounts"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Outstanding Balance"
          value={formatCurrency(summary?.totalOutstanding)}
          subtext="Pending payment from clients"
          icon={AlertTriangle}
          color={Number(summary?.totalOutstanding || 0) > 0 ? 'rose' : 'slate'}
        />
        <StatCard
          title="Fully Paid Rentals"
          value={summary?.fullyPaidRentalsCount || 0}
          subtext="Clear accounts"
          icon={CreditCard}
          color="blue"
        />
        <StatCard
          title="Partially / Unpaid Trips"
          value={`${summary?.partiallyPaidRentalsCount || 0} partial • ${summary?.unpaidRentalsCount || 0} unpaid`}
          subtext="Require payment collection"
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Method Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: '', label: 'All Methods' },
              { id: 'UPI', label: 'UPI' },
              { id: 'CASH', label: 'Cash' },
              { id: 'BANK_TRANSFER', label: 'Bank Transfer' },
              { id: 'OTHER', label: 'Other' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setMethodFilter(tab.id);
                  setPage(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  methodFilter === tab.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Total Transactions: <strong>{totalElements}</strong>
          </span>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone, car registration, or transaction ref number..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50/50 font-medium"
          />
        </form>
      </div>

      {/* Payment Transactions Table */}
      {loading ? (
        <LoadingSpinner text="Loading payment ledger..." />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No Payment Records Found"
          description={search || methodFilter ? 'No transactions match your search.' : 'Payments recorded during bookings or returns appear here.'}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4">Payment ID</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Rental & Car</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Ref Number</th>
                  <th className="p-4">Trip Remaining</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 font-mono font-bold text-slate-900">#{p.id}</td>
                    <td className="p-4 font-mono font-black text-emerald-600 text-sm">
                      ₹{Number(p.amount).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 tracking-wider">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div>{new Date(p.paymentDatetime).toLocaleDateString()}</div>
                      <div className="text-slate-400 text-[11px]">{new Date(p.paymentDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="p-4 font-medium">
                      <div className="font-bold text-slate-900">{p.vehicleName}</div>
                      <div className="font-mono text-slate-500 text-[11px]">Rental #{p.rentalId} • {p.vehicleRegistration}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{p.customerName}</div>
                      <div className="font-mono text-slate-500 text-[11px]">{p.customerPhone}</div>
                    </td>
                    <td className="p-4 font-mono text-slate-600">
                      {p.referenceNumber || <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="p-4 font-mono">
                      {Number(p.remainingRentalBalance || 0) > 0 ? (
                        <span className="text-rose-600 font-bold">₹{Number(p.remainingRentalBalance).toLocaleString()} due</span>
                      ) : (
                        <span className="text-emerald-600 font-bold">Fully Settled</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onSelectRental?.(p.rentalId)}
                        className="px-3 py-1 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition"
                      >
                        Trip #{p.rentalId}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

