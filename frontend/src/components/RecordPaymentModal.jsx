import React, { useState } from 'react';
import { Modal } from './Modal';
import { paymentApi } from '../api/client';
import { useToast } from './Toast';

export const RecordPaymentModal = ({ isOpen, onClose, onSuccess, rental }) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const formatDatetime = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const [formData, setFormData] = useState({
    amount: '',
    paymentDatetime: formatDatetime(new Date()),
    paymentMethod: 'UPI',
    referenceNumber: '',
    notes: '',
  });

  if (!rental) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await paymentApi.record({
        rentalId: rental.id,
        amount: Number(formData.amount),
        paymentDatetime: formData.paymentDatetime,
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber,
        notes: formData.notes,
      });
      success('Payment recorded successfully');
      onSuccess?.();
      onClose();
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment"
      subtitle={`Rental #${rental.id} • ${rental.vehicle?.name} (${rental.vehicle?.registrationNumber}) • ${rental.customer?.fullName}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Outstanding Balance:</span>
          <span className="font-extrabold text-rose-600 font-mono text-sm">
            ₹{rental.outstandingBalance ? Number(rental.outstandingBalance).toLocaleString() : '0'}
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Payment Amount (₹) *
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            placeholder={rental.outstandingBalance ? `${rental.outstandingBalance}` : 'e.g. 2000'}
            required
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono font-bold text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Payment Method *
          </label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer / IMPS / NEFT</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Payment Date & Time
          </label>
          <input
            type="datetime-local"
            name="paymentDatetime"
            value={formData.paymentDatetime}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Reference / Transaction Number
          </label>
          <input
            type="text"
            name="referenceNumber"
            value={formData.referenceNumber}
            onChange={handleChange}
            placeholder="e.g. UPI Ref ID / Receipt #"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Notes
          </label>
          <input
            type="text"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="e.g. Second installment, advance, balance clearance"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm shadow-primary-600/20 transition disabled:opacity-50"
          >
            {loading ? 'Recording...' : 'Save Payment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

