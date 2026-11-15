import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { rentalApi } from '../api/client';
import { useToast } from './Toast';
import { Gauge, Fuel, IndianRupee, AlertCircle, Wrench, CheckCircle2 } from 'lucide-react';

export const CompleteRentalModal = ({ isOpen, onClose, onSuccess, rental }) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const formatDatetime = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const [formData, setFormData] = useState({
    actualReturnDatetime: formatDatetime(new Date()),
    returnOdometer: '',
    returnFuelLevel: '100% (Full)',
    additionalCharges: 0,
    discountAdjustment: 0,
    damageNotes: '',
    missingAccessories: '',
    returnNotes: '',
    markVehicleMaintenance: false,
    paymentReceived: '',
    paymentMethod: 'UPI',
    paymentReference: '',
  });

  useEffect(() => {
    if (rental) {
      setFormData({
        actualReturnDatetime: formatDatetime(new Date()),
        returnOdometer: rental.pickupOdometer || '',
        returnFuelLevel: rental.pickupFuelLevel || '100% (Full)',
        additionalCharges: 0,
        discountAdjustment: 0,
        damageNotes: '',
        missingAccessories: '',
        returnNotes: '',
        markVehicleMaintenance: false,
        paymentReceived: '',
        paymentMethod: 'UPI',
        paymentReference: '',
      });
    }
  }, [rental, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  if (!rental) return null;

  // Real-time calculations
  const pickupOdo = Number(rental.pickupOdometer || 0);
  const returnOdo = Number(formData.returnOdometer || pickupOdo);
  const kmTravelled = Math.max(0, returnOdo - pickupOdo);

  const agreed = Number(rental.agreedRentalAmount || 0);
  const currentDiscount = Number(rental.discountAmount || 0);
  const addedDiscount = Number(formData.discountAdjustment || 0);
  const additional = Number(formData.additionalCharges || 0);
  const newTotalRental = Math.max(0, agreed + additional - (currentDiscount + addedDiscount));

  const prevPaid = Number(rental.totalPaid || 0);
  const nowPaid = Number(formData.paymentReceived || 0);
  const totalPaid = prevPaid + nowPaid;
  const balance = Math.max(0, newTotalRental - totalPaid);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (returnOdo < pickupOdo) {
      error(`Return odometer (${returnOdo}) cannot be less than pickup odometer (${pickupOdo}).`);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        actualReturnDatetime: formData.actualReturnDatetime,
        returnOdometer: returnOdo,
        returnFuelLevel: formData.returnFuelLevel,
        additionalCharges: Number(formData.additionalCharges || 0),
        discountAdjustment: Number(formData.discountAdjustment || 0),
        damageNotes: formData.damageNotes,
        missingAccessories: formData.missingAccessories,
        returnNotes: formData.returnNotes,
        markVehicleMaintenance: formData.markVehicleMaintenance,
      };

      if (nowPaid > 0) {
        payload.paymentReceived = nowPaid;
        payload.paymentMethod = formData.paymentMethod;
        payload.paymentReference = formData.paymentReference;
      }

      await rentalApi.complete(rental.id, payload);
      success('Vehicle return completed! Car odometer updated and rental marked COMPLETED.');
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
      title="Complete Rental / Return Vehicle"
      subtitle={`Return of ${rental.vehicle?.name} (${rental.vehicle?.registrationNumber}) by ${rental.customer?.fullName}`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Realtime summary stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-primary-50/60 rounded-xl border border-primary-100 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500">Distance Travelled</span>
            <p className="text-base font-extrabold text-primary-700 font-mono">{kmTravelled} km</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500">Total Rental</span>
            <p className="text-base font-extrabold text-slate-900 font-mono">₹{newTotalRental.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500">Total Paid</span>
            <p className="text-base font-extrabold text-emerald-600 font-mono">₹{totalPaid.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500">Balance Due</span>
            <p className={`text-base font-extrabold font-mono ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              ₹{balance.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Actual Return Date & Time *
            </label>
            <input
              type="datetime-local"
              name="actualReturnDatetime"
              value={formData.actualReturnDatetime}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Return Odometer (km) * (Pickup: {pickupOdo} km)
            </label>
            <input
              type="number"
              name="returnOdometer"
              value={formData.returnOdometer}
              onChange={handleChange}
              min={pickupOdo}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Return Fuel Level *
            </label>
            <select
              name="returnFuelLevel"
              value={formData.returnFuelLevel}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="100% (Full)">100% (Full Tank)</option>
              <option value="85%">85%</option>
              <option value="75%">75% (3/4)</option>
              <option value="50%">50% (Half)</option>
              <option value="25%">25% (1/4)</option>
              <option value="Reserve">Reserve / Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Additional Charges (₹)
            </label>
            <input
              type="number"
              name="additionalCharges"
              value={formData.additionalCharges}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="e.g. Extra km, fuel fine, late fee"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
            />
          </div>
        </div>

        {/* Damages and Missing Accessories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Damage Details (if any)
            </label>
            <textarea
              name="damageNotes"
              value={formData.damageNotes}
              onChange={handleChange}
              rows={2}
              placeholder="Scratches on bumper, dent on right door, tire puncture, etc."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Missing Accessories (if any)
            </label>
            <textarea
              name="missingAccessories"
              value={formData.missingAccessories}
              onChange={handleChange}
              rows={2}
              placeholder="Charging cable, neck pillow, boot mat, toolkit, etc."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Settlement Payment Section */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Settlement Payment at Return
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Outstanding: <strong className="text-rose-600 font-mono">₹{balance.toLocaleString()}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Amount Received (₹)</label>
              <input
                type="number"
                name="paymentReceived"
                value={formData.paymentReceived}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder={balance > 0 ? `${balance}` : '0'}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Reference / Txn ID</label>
              <input
                type="text"
                name="paymentReference"
                value={formData.paymentReference}
                onChange={handleChange}
                placeholder="Optional Ref No"
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Maintenance toggle */}
        <label className="flex items-center gap-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200 cursor-pointer">
          <input
            type="checkbox"
            name="markVehicleMaintenance"
            checked={formData.markVehicleMaintenance}
            onChange={handleChange}
            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
          />
          <div className="flex-1 text-xs">
            <span className="font-bold text-amber-900 block">Mark car for MAINTENANCE after return</span>
            <span className="text-amber-700">Check this if the vehicle requires cleaning, detailing, or mechanical repair before next rental.</span>
          </div>
        </label>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            General Return Remarks
          </label>
          <input
            type="text"
            name="returnNotes"
            value={formData.returnNotes}
            onChange={handleChange}
            placeholder="Cleanliness upon return, customer feedback, overall trip condition"
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
            className="px-6 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm shadow-primary-600/20 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Complete & Return Vehicle'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
