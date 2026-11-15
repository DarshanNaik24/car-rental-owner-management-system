import React, { useState, useEffect } from 'react';
import { customerApi, rentalApi } from '../api/client';
import { AddCustomerModal } from '../components/AddCustomerModal';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSpinner, EmptyState } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { useToast } from '../components/Toast';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  Trash2, 
  KeyRound, 
  Calendar, 
  IndianRupee,
  History
} from 'lucide-react';

export const CustomersPage = ({ onSelectRental }) => {
  const { success, error } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // View Customer Rentals Drawer / Modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerRentals, setCustomerRentals] = useState([]);
  const [loadingRentals, setLoadingRentals] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await customerApi.getAll(search || null);
      setCustomers(res.data || []);
    } catch (err) {
      error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCustomers();
  };

  const handleViewRentals = async (customer) => {
    setSelectedCustomer(customer);
    try {
      setLoadingRentals(true);
      const res = await rentalApi.getByCustomer(customer.id);
      setCustomerRentals(res.data || []);
    } catch {
      setCustomerRentals([]);
    } finally {
      setLoadingRentals(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    try {
      setIsDeleting(true);
      await customerApi.delete(customerToDelete.id);
      success('Customer record deleted');
      setCustomerToDelete(null);
      loadCustomers();
    } catch (err) {
      error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Customer Records</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain customer records, contact info, rental frequency, and outstanding dues
          </p>
        </div>

        <button
          onClick={() => {
            setCustomerToEdit(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm shadow-primary-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by full name, phone number, email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50/50 font-medium"
          />
        </form>
        <span className="text-xs text-slate-400 hidden sm:inline font-medium">
          Total: <strong>{customers.length}</strong> record(s)
        </span>
      </div>

      {/* Customer Table */}
      {loading ? (
        <LoadingSpinner text="Loading customers..." />
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Customer Records Found"
          description={search ? 'No customer matches your search.' : 'Add your first customer record to keep track of clients.'}
          action={
            <button
              onClick={() => {
                setCustomerToEdit(null);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition"
            >
              + Add Customer
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Email / Address</th>
                  <th className="p-4">Total Rentals</th>
                  <th className="p-4">Total Spent</th>
                  <th className="p-4">Outstanding Due</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => {
                  const hasDue = Number(c.outstandingBalance || 0) > 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-4 font-medium">
                        <div className="font-extrabold text-slate-900 text-sm">{c.fullName}</div>
                        {c.notes && (
                          <div className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">"{c.notes}"</div>
                        )}
                      </td>
                      <td className="p-4 font-mono font-medium text-slate-700">
                        <div>{c.primaryPhone}</div>
                        {c.alternatePhone && (
                          <div className="text-[11px] text-slate-400">Alt: {c.alternatePhone}</div>
                        )}
                      </td>
                      <td className="p-4 text-slate-600">
                        {c.email && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-600">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{c.email}</span>
                          </div>
                        )}
                        {c.address && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{c.address}</span>
                          </div>
                        )}
                        {!c.email && !c.address && <span className="text-slate-400 italic">-</span>}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleViewRentals(c)}
                          className="font-mono font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg transition inline-flex items-center gap-1"
                        >
                          <History className="w-3 h-3" />
                          <span>{c.totalRentals} trip(s)</span>
                        </button>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-900">
                        ₹{Number(c.totalSpent || 0).toLocaleString()}
                      </td>
                      <td className="p-4 font-mono">
                        {hasDue ? (
                          <span className="font-bold text-rose-600">₹{Number(c.outstandingBalance).toLocaleString()}</span>
                        ) : (
                          <span className="text-emerald-600 font-bold">Clear</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setCustomerToEdit(c);
                              setIsAddModalOpen(true);
                            }}
                            title="Edit Customer"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {c.totalRentals === 0 && (
                            <button
                              onClick={() => setCustomerToDelete(c)}
                              title="Delete Customer"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>
      )}

      {/* Customer Rentals History Modal */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={`Rental History — ${selectedCustomer?.fullName}`}
        subtitle={`Phone: ${selectedCustomer?.primaryPhone} • Total Trips: ${customerRentals.length}`}
        maxWidth="max-w-3xl"
      >
        {loadingRentals ? (
          <LoadingSpinner text="Loading trips..." />
        ) : customerRentals.length === 0 ? (
          <EmptyState
            icon={KeyRound}
            title="No Rentals Yet"
            description="This customer does not have any recorded rental trips."
          />
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="p-3">Rental ID</th>
                  <th className="p-3">Vehicle</th>
                  <th className="p-3">Trip Dates</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Balance</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerRentals.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="p-3 font-mono font-bold">#{r.id}</td>
                    <td className="p-3 font-medium">
                      <div>{r.vehicle?.name}</div>
                      <div className="font-mono text-[10px] text-slate-500">{r.vehicle?.registrationNumber}</div>
                    </td>
                    <td className="p-3 text-slate-600">
                      <div>{new Date(r.pickupDatetime).toLocaleDateString()}</div>
                      <div className="text-slate-400 text-[10px]">to {new Date(r.expectedReturnDatetime).toLocaleDateString()}</div>
                    </td>
                    <td className="p-3 font-mono font-bold">₹{Number(r.totalRentalAmount).toLocaleString()}</td>
                    <td className="p-3 font-mono">
                      {Number(r.outstandingBalance) > 0 ? (
                        <span className="font-bold text-rose-600">₹{Number(r.outstandingBalance).toLocaleString()}</span>
                      ) : (
                        <span className="text-emerald-600 font-bold">Paid</span>
                      )}
                    </td>
                    <td className="p-3"><Badge status={r.status} /></td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedCustomer(null);
                          onSelectRental?.(r.id);
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg"
                      >
                        View Trip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Add / Edit Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setCustomerToEdit(null);
        }}
        onSuccess={loadCustomers}
        customerToEdit={customerToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer Record"
        message={`Are you sure you want to delete ${customerToDelete?.fullName}? This can only be done for customers without rental history.`}
        confirmText="Delete Customer"
        danger={true}
        loading={isDeleting}
      />
    </div>
  );
};
