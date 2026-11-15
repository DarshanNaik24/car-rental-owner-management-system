import React, { useState, useEffect } from 'react';
import { rentalApi, vehicleApi } from '../api/client';
import { Badge } from '../components/Badge';
import { LoadingSpinner, EmptyState } from '../components/LoadingSpinner';
import { CompleteRentalModal } from '../components/CompleteRentalModal';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { InspectionFormModal } from '../components/InspectionFormModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { 
  KeyRound, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  IndianRupee, 
  Gauge, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  CreditCard,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const RentalsPage = ({ onSelectRental, onNewRental }) => {
  const { success, error } = useToast();
  const [rentals, setRentals] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Action Modals
  const [rentalToComplete, setRentalToComplete] = useState(null);
  const [rentalToPay, setRentalToPay] = useState(null);
  const [rentalToInspect, setRentalToInspect] = useState(null);
  const [inspectionType, setInspectionType] = useState('PICKUP');
  const [rentalToCancel, setRentalToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    loadRentals();
  }, [page, statusFilter, vehicleFilter]);

  const loadVehicles = async () => {
    try {
      const res = await vehicleApi.getAll(null, null);
      setVehicles(res.data || []);
    } catch {
      // Ignore
    }
  };

  const loadRentals = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: 10,
        sortBy: 'pickupDatetime',
        direction: 'desc',
        search: search || null,
        status: statusFilter || null,
        vehicleId: vehicleFilter || null,
      };
      const res = await rentalApi.search(params);
      setRentals(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 0);
      setTotalElements(res.data?.totalElements || 0);
    } catch (err) {
      error('Failed to load rentals');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadRentals();
  };

  const handleCancelConfirm = async () => {
    if (!rentalToCancel) return;
    try {
      setIsCancelling(true);
      await rentalApi.cancel(rentalToCancel.id, 'Cancelled by owner');
      success('Rental cancelled. Car is now available.');
      setRentalToCancel(null);
      loadRentals();
    } catch (err) {
      error(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Rentals & Trips</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create bookings, monitor active trips, record returns, inspections, and payments
          </p>
        </div>

        <button
          onClick={onNewRental}
          className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm shadow-primary-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Rental</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: '', label: 'All Trips' },
              { id: 'ACTIVE', label: 'Active Rentals' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'CANCELLED', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  statusFilter === tab.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Car Filter Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={vehicleFilter}
              onChange={(e) => {
                setVehicleFilter(e.target.value);
                setPage(0);
              }}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Cars</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber} ({v.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone number, vehicle registration..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50/50 font-medium"
          />
        </form>
      </div>

      {/* Rentals Table */}
      {loading ? (
        <LoadingSpinner text="Loading trips and rentals..." />
      ) : rentals.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="No Rentals Found"
          description={search || statusFilter || vehicleFilter ? 'No trips match your filters.' : 'Create a rental record to get started.'}
          action={
            <button
              onClick={onNewRental}
              className="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition"
            >
              + Create Rental
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4">Rental ID</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Trip Timeline</th>
                  <th className="p-4">Odometer (km)</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Balance Due</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rentals.map((r) => {
                  const isActive = r.status === 'ACTIVE';
                  const hasBalance = Number(r.outstandingBalance || 0) > 0;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-4 font-mono font-bold text-slate-900">#{r.id}</td>
                      <td className="p-4 font-medium">
                        <div className="font-extrabold text-slate-900">{r.vehicle?.name}</div>
                        <div className="font-mono text-slate-500 text-[11px]">{r.vehicle?.registrationNumber}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{r.customer?.fullName}</div>
                        <div className="font-mono text-slate-500 text-[11px]">{r.customer?.primaryPhone}</div>
                      </td>
                      <td className="p-4 text-slate-600">
                        <div>Pickup: {new Date(r.pickupDatetime).toLocaleDateString()}</div>
                        <div className="text-slate-400 text-[11px]">
                          {r.actualReturnDatetime
                            ? `Returned: ${new Date(r.actualReturnDatetime).toLocaleDateString()}`
                            : `Due: ${new Date(r.expectedReturnDatetime).toLocaleDateString()}`}
                        </div>
                      </td>
                      <td className="p-4 font-mono">
                        {r.returnOdometer ? (
                          <div>
                            <span>{r.pickupOdometer} → {r.returnOdometer}</span>
                            <span className="block font-bold text-purple-600 text-[11px]">{r.totalKilometers} km</span>
                          </div>
                        ) : (
                          <span>Pickup: {r.pickupOdometer} km</span>
                        )}
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-900">
                        ₹{Number(r.totalRentalAmount).toLocaleString()}
                      </td>
                      <td className="p-4 font-mono">
                        {hasBalance ? (
                          <span className="font-bold text-rose-600">₹{Number(r.outstandingBalance).toLocaleString()}</span>
                        ) : (
                          <span className="text-emerald-600 font-bold">Paid</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge status={r.status} />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isActive && (
                            <button
                              onClick={() => setRentalToComplete(r)}
                              title="Complete Return"
                              className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition"
                            >
                              Return
                            </button>
                          )}

                          {hasBalance && r.status !== 'CANCELLED' && (
                            <button
                              onClick={() => setRentalToPay(r)}
                              title="Record Payment"
                              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}

                          {isActive && (
                            <button
                              onClick={() => {
                                setRentalToInspect(r);
                                setInspectionType('RETURN');
                              }}
                              title="Return Inspection"
                              className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition"
                            >
                              <ClipboardCheck className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => onSelectRental?.(r.id)}
                            title="View Trip Details"
                            className="p-1.5 text-slate-600 hover:text-primary-700 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isActive && (
                            <button
                              onClick={() => setRentalToCancel(r)}
                              title="Cancel Rental"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} total trips)
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

      {/* Complete Rental Modal */}
      {rentalToComplete && (
        <CompleteRentalModal
          isOpen={!!rentalToComplete}
          onClose={() => setRentalToComplete(null)}
          onSuccess={loadRentals}
          rental={rentalToComplete}
        />
      )}

      {/* Record Payment Modal */}
      {rentalToPay && (
        <RecordPaymentModal
          isOpen={!!rentalToPay}
          onClose={() => setRentalToPay(null)}
          onSuccess={loadRentals}
          rental={rentalToPay}
        />
      )}

      {/* Inspection Modal */}
      {rentalToInspect && (
        <InspectionFormModal
          isOpen={!!rentalToInspect}
          onClose={() => setRentalToInspect(null)}
          onSuccess={loadRentals}
          rental={rentalToInspect}
          type={inspectionType}
        />
      )}

      {/* Cancel Rental Dialog */}
      <ConfirmDialog
        isOpen={!!rentalToCancel}
        onClose={() => setRentalToCancel(null)}
        onConfirm={handleCancelConfirm}
        title="Cancel Active Rental"
        message={`Are you sure you want to cancel rental #${rentalToCancel?.id}? The car (${rentalToCancel?.vehicle?.registrationNumber}) will immediately become AVAILABLE.`}
        confirmText="Cancel Rental"
        danger={true}
        loading={isCancelling}
      />
    </div>
  );
};
