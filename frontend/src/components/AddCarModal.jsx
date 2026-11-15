import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { vehicleApi } from '../api/client';
import { useToast } from './Toast';
import { Upload, Car } from 'lucide-react';

export const AddCarModal = ({ isOpen, onClose, onSuccess, carToEdit }) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    registrationNumber: '',
    name: '',
    manufacturer: '',
    variant: '',
    fuelType: 'PETROL',
    transmission: 'MANUAL',
    currentOdometer: 0,
    manufacturingYear: new Date().getFullYear(),
    notes: '',
    imageUrl: '',
    status: 'AVAILABLE',
  });

  useEffect(() => {
    if (carToEdit) {
      setFormData({
        registrationNumber: carToEdit.registrationNumber || '',
        name: carToEdit.name || '',
        manufacturer: carToEdit.manufacturer || '',
        variant: carToEdit.variant || '',
        fuelType: carToEdit.fuelType || 'PETROL',
        transmission: carToEdit.transmission || 'MANUAL',
        currentOdometer: carToEdit.currentOdometer ?? 0,
        manufacturingYear: carToEdit.manufacturingYear || new Date().getFullYear(),
        notes: carToEdit.notes || '',
        imageUrl: carToEdit.imageUrl || '',
        status: carToEdit.status || 'AVAILABLE',
      });
    } else {
      setFormData({
        registrationNumber: '',
        name: '',
        manufacturer: '',
        variant: '',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        currentOdometer: 0,
        manufacturingYear: new Date().getFullYear(),
        notes: '',
        imageUrl: '',
        status: 'AVAILABLE',
      });
    }
  }, [carToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'currentOdometer' || name === 'manufacturingYear' ? (value ? parseInt(value, 10) : '') : value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const data = new FormData();
      data.append('file', file);
      const res = await vehicleApi.uploadImage(data);
      setFormData((prev) => ({ ...prev, imageUrl: res.data }));
      success('Image uploaded successfully');
    } catch (err) {
      error(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (carToEdit) {
        await vehicleApi.update(carToEdit.id, formData);
        success('Car details updated successfully');
      } else {
        await vehicleApi.create(formData);
        success('New car added successfully');
      }
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
      title={carToEdit ? 'Edit Car Details' : 'Add New Car'}
      subtitle="Enter vehicle specifications, registration, and initial odometer"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Car Image Preview & Upload */}
        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="w-20 h-20 rounded-lg bg-slate-200 overflow-hidden flex items-center justify-center shrink-0 border border-slate-300">
            {formData.imageUrl ? (
              <img src={formData.imageUrl} alt="Car" className="w-full h-full object-cover" />
            ) : (
              <Car className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Image (Optional)</label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer px-3 py-1.5 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 inline-flex items-center gap-1.5 transition">
                <Upload className="w-3.5 h-3.5" />
                {uploadingImage ? 'Uploading...' : 'Choose Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
              {formData.imageUrl && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">PNG, JPG or WEBP up to 20MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Registration Number *
            </label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              placeholder="e.g. KA-01-AB-1234"
              required
              className="w-full px-3 py-2 text-sm uppercase rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Car Model / Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Swift, Innova Crysta, Thar"
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Manufacturer *
            </label>
            <input
              type="text"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              placeholder="e.g. Maruti Suzuki, Toyota, Hyundai"
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Variant
            </label>
            <input
              type="text"
              name="variant"
              value={formData.variant}
              onChange={handleChange}
              placeholder="e.g. ZXi+, 2.4 VX, Diesel"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Fuel Type *
            </label>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="PETROL">Petrol</option>
              <option value="DIESEL">Diesel</option>
              <option value="CNG">CNG</option>
              <option value="ELECTRIC">Electric (EV)</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Transmission *
            </label>
            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="MANUAL">Manual</option>
              <option value="AUTOMATIC">Automatic</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Current Odometer (km) *
            </label>
            <input
              type="number"
              name="currentOdometer"
              value={formData.currentOdometer}
              onChange={handleChange}
              min="0"
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Year of Manufacture
            </label>
            <input
              type="number"
              name="manufacturingYear"
              value={formData.manufacturingYear}
              onChange={handleChange}
              min="1990"
              max={new Date().getFullYear() + 1}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="AVAILABLE">Available</option>
            <option value="RENTED">Rented</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Notes / Vehicle Details
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            placeholder="Special instructions, insurance renewal date, FASTag details, etc."
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
            disabled={loading || uploadingImage}
            className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm shadow-primary-600/20 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : carToEdit ? 'Save Changes' : 'Add Vehicle'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
