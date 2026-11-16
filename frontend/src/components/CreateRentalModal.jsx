import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { rentalApi, vehicleApi, customerApi } from '../api/client';
import { useToast } from './Toast';
import { Car, User, Calendar, Gauge, Fuel, IndianRupee, Plus, Check } from 'lucide-react';

export const CreateRentalModal = ({ isOpen, onClose, onSuccess, initialVehicleId }) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  // Default dates: now and +24 hours
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const formatDatetime = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const [formData, setFormData] = useState({
    vehicleId: initialVehicleId || '',
    customerId: '',
    newCustomer: {
      fullName: '',
      primaryPhone: '',
      alternatePhone: '',
      email: '',
      address: '',
      notes: '',
    },
    pickupDatetime: formatDatetime(now),
    expectedReturnDatetime: formatDatetime(tomorrow),
    pickupOdometer: 0,
    pickupFuelLevel: '100% (Full)',
    agreedRentalAmount: '',
    discountAmount: 0,
    notes: '',
    initialPayment: '',
    initialPaymentMethod: 'UPI',
    initialPaymentReference: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadPrerequisites();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialVehicleId) {
      setFormData((prev) => ({ ...prev, vehicleId: initialVehicleId }));
    }
  }, [initialVehicleId]);

  const loadPrerequisites = async () => {
    try {
      const [vRes, cRes] = await Promise.all([
        vehicleApi.getAll(null, null),
        customerApi.getAll(null),
      ]);
      setVehicles(vRes.data || []);
      setCustomers(cRes.data || []);

      // If initial vehicle provided, set its odometer
      if (initialVehicleId && vRes.data) {
        const found = vRes.data.find((v) => v.id === Number(initialVehicleId));
        if (found) {
          setFormData((prev) => ({ ...prev, pickupOdometer: found.currentOdometer }));
        }
      }
    } catch (err) {
      error('Failed to load cars or customers');
    }
  };

  const handleVehicleChange = (e) => {
    const vId = e.target.value;
    const selected = vehicles.find((v) => v.id === Number(vId));
    setFormData((prev) => ({
      ...prev,
      vehicleId: vId,
      pickupOdometer: selected ? selected.currentOdometer : 0,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      newCustomer: { ...prev.newCustomer, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = {
        vehicleId: Number(formData.vehicleId),
        pickupDatetime: formData.pickupDatetime,
        expectedReturnDatetime: formData.expectedReturnDatetime,
        pickupOdometer: Number(formData.pickupOdometer),
        pickupFuelLevel: formData.pickupFuelLevel,
        agreedRentalAmount: Number(formData.agreedRentalAmount),
        discountAmount: Number(formData.discountAmount || 0),
        notes: formData.notes,
      };

      if (isNewCustomer) {
        payload.newCustomer = formData.newCustomer;
      } else {
        if (!formData.customerId) {
          throw new Error('Please select an existing customer or switch to Create New Customer.');
        }
        payload.customerId = Number(formData.customerId);
      }

      if (formData.initialPayment && Number(formData.initialPayment) > 0) {
        payload.initialPayment = Number(formData.initialPayment);
        payload.initialPaymentMethod = formData.initialPaymentMethod;
        payload.initialPaymentReference = formData.initialPaymentReference;
      }

      const res = await rentalApi.create(payload);
      success('Rental record created successfully! Vehicle marked as RENTED.');
      onSuccess?.(res.data);
      onClose();
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const availableCars = vehicles.filter((v) => v.status === 'AVAILABLE' || v.id === Number(formData.vehicleId));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Rental"
      subtitle="Issue vehicle, record pickup odometer and fuel, and assign customer"
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: Vehicle Selection */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Car className="w-4 h-4 text-primary-600" />
            <span>Select Vehicle *</span>
          </div>
          <select
            value={formData.vehicleId}
            onChange={handleVehicleChange}
            required
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white font-medium"
          >
            <option value="">-- Choose an Available Car --</option>
            {availableCars.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registrationNumber} — {v.manufacturer} {v.name} ({v.transmission}, {v.fuelType}) • Current: {v.currentOdometer} km
              </option>
            ))}
          </select>
          {availableCars.length === 0 && (
            <p className="text-xs text-rose-600 mt-1 font-medium">
              No cars currently available. Please check My Cars or complete an active rental first.
            </p>
          )}
        </div>

        {/* Step 2: Customer Selection */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <User className="w-4 h-4 text-primary-600" />
              <span>Customer Details *</span>
            </div>
            <button
              type="button"
              onClick={() => setIsNewCustomer(!isNewCustomer)}
              className="text-xs font-semibold text-primary-600 hover:text-primary-800 transition flex items-center gap-1"
            >
              {isNewCustomer ? 'Select Existing Customer' : '+ New Customer'}
            </button>
          </div>

          {!isNewCustomer ? (
            <div>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                required={!isNewCustomer}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white font-medium"
              >
                <option value="">-- Choose Existing Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} • {c.primaryPhone} {c.address ? `(${c.address})` : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  name="fullName"
                  value={formData.newCustomer.fullName}
                  onChange={handleNewCustomerChange}
                  placeholder="Full Name *"
                  required={isNewCustomer}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                />
                <input
                  type="tel"
                  name="primaryPhone"
                  value={formData.newCustomer.primaryPhone}
                  onChange={handleNewCustomerChange}
                  placeholder="Primary Phone *"
                  required={isNewCustomer}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="email"
                  name="email"
                  value={formData.newCustomer.email}
                  onChange={handleNewCustomerChange}
                  placeholder="Email (Optional)"
                  className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                />
                <input
                  type="text"
                  name="address"
                  value={formData.newCustomer.address}
                  onChange={handleNewCustomerChange}
                  placeholder="City / Address"
                  className="px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Dates & Readings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Pickup Date & Time *
            </label>
            <input
              type="datetime-local"
              name="pickupDatetime"
              value={formData.pickupDatetime}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Expected Return Date & Time *
            </label>
            <input
              type="datetime-local"
              name="expectedReturnDatetime"
              value={formData.expectedReturnDatetime}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Pickup Odometer (km) *
            </label>
            <input
              type="number"
              name="pickupOdometer"
              value={formData.pickupOdometer}
              onChange={handleChange}
              min="0"
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Pickup Fuel Level *
            </label>
            <select
              name="pickupFuelLevel"
              value={formData.pickupFuelLevel}
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
        </div>

        {/* Step 4: Financials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Agreed Rental Amount (₹) *
            </label>
            <input
              type="number"
              name="agreedRentalAmount"
              value={formData.agreedRentalAmount}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="e.g. 3500"
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Discount (₹)
            </label>
            <input
              type="number"
              name="discountAmount"
              value={formData.discountAmount}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Advance / Upfront Payment (Optional)
            </label>
            <input
              type="number"
              name="initialPayment"
              value={formData.initialPayment}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Amount received now"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Payment Method
            </label>
            <select
              name="initialPaymentMethod"
              value={formData.initialPaymentMethod}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Pickup Notes & Instructions
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            placeholder="Trip destination, security deposit details, expected return conditions, etc."
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
            disabled={loading || availableCars.length === 0}
            className="px-6 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm shadow-primary-600/20 transition disabled:opacity-50"
          >
            {loading ? 'Creating Rental...' : 'Confirm & Handover Car'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

