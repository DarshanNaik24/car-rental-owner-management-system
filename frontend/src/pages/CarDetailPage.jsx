import React, { useState, useEffect } from 'react';
import { vehicleApi, rentalApi, inspectionApi, photoApi } from '../api/client';
import { Badge } from '../components/Badge';
import { LoadingSpinner, EmptyState } from '../components/LoadingSpinner';
import { AddCarModal } from '../components/AddCarModal';
import { useToast } from '../components/Toast';
import { 
  ArrowLeft, 
  Car, 
  Gauge, 
  Fuel, 
  IndianRupee, 
  Calendar, 
  KeyRound, 
  ClipboardCheck, 
  Image as ImageIcon, 
  Edit, 
  CheckCircle2, 
  AlertTriangle,
  Upload
} from 'lucide-react';

export const CarDetailPage = ({ carId, onBack, onSelectRental, onStartRental }) => {
  const { success, error } = useToast();
  const [vehicle, setVehicle] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rentals'); // 'rentals', 'inspections', 'photos'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (carId) {
      loadCarData();
    }
  }, [carId]);

  const loadCarData = async () => {
    try {
      setLoading(true);
      const [vRes, rRes, iRes, pRes] = await Promise.all([
        vehicleApi.getById(carId),
        rentalApi.getByVehicle(carId),
        inspectionApi.getByVehicle(carId),
        photoApi.getByVehicle(carId),
      ]);
      setVehicle(vRes.data);
      setRentals(rRes.data || []);
      setInspections(iRes.data || []);
      setPhotos(pRes.data || []);
    } catch (err) {
      error('Failed to load car details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await vehicleApi.updateStatus(carId, newStatus);
      success(`Status updated to ${newStatus}`);
      loadCarData();
    } catch (err) {
      error(err.message);
    }
  };

  const handleCarPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      const data = new FormData();
      data.append('file', file);
      data.append('vehicleId', carId);
      data.append('photoType', 'CAR_IMAGE');
      data.append('notes', 'Car gallery photo');
      await photoApi.upload(data);
      success('Car photo uploaded');
      loadCarData();
    } catch (err) {
      error(err.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading car profile..." />;
  }

  if (!vehicle) {
    return (
      <EmptyState
        icon={Car}
        title="Vehicle Not Found"
        description="The requested car could not be located."
        action={
          <button
            onClick={onBack}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
          >
            Back to Cars
          </button>
        }
      />
    );
  }

  // Calculate stats for this car
  let totalRevenue = 0;
  let totalPaid = 0;
  let totalKm = 0;

  rentals.forEach((r) => {
    if (r.status !== 'CANCELLED') {
      totalRevenue += Number(r.totalRentalAmount || 0);
      totalPaid += Number(r.totalPaid || 0);
      totalKm += Number(r.totalKilometers || 0);
    }
  });

  const totalOutstanding = Math.max(0, totalRevenue - totalPaid);
  const activeRental = rentals.find((r) => r.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* Back button & top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Cars</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Car</span>
          </button>

          {vehicle.status === 'AVAILABLE' && (
            <button
              onClick={() => onStartRental?.(vehicle.id)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm shadow-primary-600/20 transition"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Create Rental</span>
            </button>
          )}
        </div>
      </div>

      {/* Car Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Image */}
          <div className="lg:w-2/5 h-64 lg:h-auto bg-slate-100 relative overflow-hidden flex items-center justify-center">
            {vehicle.imageUrl ? (
              <img
                src={vehicle.imageUrl}
                alt={vehicle.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-300">
                <Car className="w-20 h-20 stroke-[1.2]" />
                <span className="text-xs font-semibold text-slate-400 mt-2">No Image Uploaded</span>
              </div>
            )}
            <div className="absolute top-4 left-4">
              <Badge status={vehicle.status} />
            </div>
            <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md text-white font-mono font-extrabold text-sm px-3 py-1.5 rounded-xl">
              {vehicle.registrationNumber}
            </div>
          </div>

          {/* Details */}
          <div className="lg:w-3/5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                {vehicle.manufacturer}
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                {vehicle.name} {vehicle.variant ? `(${vehicle.variant})` : ''}
              </h2>
              {vehicle.notes && (
                <p className="text-xs text-slate-500 mt-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  "{vehicle.notes}"
                </p>
              )}
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Odometer</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{vehicle.currentOdometer.toLocaleString()} km</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Fuel</span>
                <span className="font-bold text-slate-900 text-sm">{vehicle.fuelType}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Transmission</span>
                <span className="font-bold text-slate-900 text-sm">{vehicle.transmission}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Year</span>
                <span className="font-bold text-slate-900 text-sm">{vehicle.manufacturingYear || 'N/A'}</span>
              </div>
            </div>

            {/* Status Switcher */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-600">Change Status:</span>
              {vehicle.status !== 'AVAILABLE' && (
                <button
                  onClick={() => handleStatusChange('AVAILABLE')}
                  className="px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                >
                  Set Available
                </button>
              )}
              {vehicle.status !== 'MAINTENANCE' && (
                <button
                  onClick={() => handleStatusChange('MAINTENANCE')}
                  className="px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition"
                >
                  Set Maintenance
                </button>
              )}
              {vehicle.status === 'RENTED' && (
                <span className="text-xs text-slate-500 italic ml-2">
                  (Currently locked on rental)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Car Performance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-500 block mb-1">Total Rentals</span>
          <p className="text-2xl font-black text-slate-900 font-mono">{rentals.length}</p>
          <span className="text-xs text-slate-400">Lifetime trips</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-500 block mb-1">Total Revenue</span>
          <p className="text-2xl font-black text-emerald-600 font-mono">₹{totalRevenue.toLocaleString()}</p>
          <span className="text-xs text-slate-400">Total agreed rent</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-500 block mb-1">Outstanding Balance</span>
          <p className={`text-2xl font-black font-mono ${totalOutstanding > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            ₹{totalOutstanding.toLocaleString()}
          </p>
          <span className="text-xs text-slate-400">Pending collections</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-500 block mb-1">Km Driven</span>
          <p className="text-2xl font-black text-purple-600 font-mono">{totalKm.toLocaleString()} km</p>
          <span className="text-xs text-slate-400">Rental mileage</span>
        </div>
      </div>

      {/* Tabs navigation: Rentals, Inspections, Photos */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-4 border-b border-slate-100">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('rentals')}
              className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'rentals'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Rental History ({rentals.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('inspections')}
              className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'inspections'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Inspections ({inspections.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('photos')}
              className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'photos'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Gallery & Photos ({photos.length})</span>
            </button>
          </div>

          {activeTab === 'photos' && (
            <label className="cursor-pointer mb-2 px-3 py-1.5 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 inline-flex items-center gap-1.5 transition">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCarPhotoUpload}
                disabled={uploadingPhoto}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Tab 1: Rentals */}
        {activeTab === 'rentals' && (
          <div>
            {rentals.length === 0 ? (
              <EmptyState
                icon={KeyRound}
                title="No Rental Records For This Car"
                description="This car has not been rented out yet."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="p-4">Rental ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Trip Period</th>
                      <th className="p-4">Odometer</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Balance</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rentals.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-4 font-mono font-bold text-slate-900">#{r.id}</td>
                        <td className="p-4 font-medium">
                          <div className="font-bold text-slate-900">{r.customer?.fullName}</div>
                          <div className="font-mono text-slate-500 text-[11px]">{r.customer?.primaryPhone}</div>
                        </td>
                        <td className="p-4 text-slate-600">
                          <div>{new Date(r.pickupDatetime).toLocaleDateString()}</div>
                          <div className="text-slate-400 text-[11px]">to {new Date(r.expectedReturnDatetime).toLocaleDateString()}</div>
                        </td>
                        <td className="p-4 font-mono">
                          {r.returnOdometer ? (
                            <span>{r.pickupOdometer} → {r.returnOdometer} ({r.totalKilometers} km)</span>
                          ) : (
                            <span>Pickup: {r.pickupOdometer} km</span>
                          )}
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-900">
                          ₹{Number(r.totalRentalAmount).toLocaleString()}
                        </td>
                        <td className="p-4 font-mono">
                          {Number(r.outstandingBalance) > 0 ? (
                            <span className="font-bold text-rose-600">₹{Number(r.outstandingBalance).toLocaleString()}</span>
                          ) : (
                            <span className="text-emerald-600 font-bold">Paid</span>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge status={r.status} />
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => onSelectRental?.(r.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 transition"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Inspections */}
        {activeTab === 'inspections' && (
          <div>
            {inspections.length === 0 ? (
              <EmptyState
                icon={ClipboardCheck}
                title="No Inspections Recorded"
                description="Inspections are linked to rentals when cars are picked up or returned."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {inspections.map((insp) => (
                  <div key={insp.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge status={insp.type} />
                        <span className="text-xs font-bold text-slate-900">Inspection #{insp.id}</span>
                        <span className="text-xs text-slate-400">• Rental #{insp.rentalId}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {new Date(insp.inspectionDatetime).toLocaleString()} • {insp.results?.length || 0} checklist items checked
                      </p>
                      {insp.inspectorNotes && (
                        <p className="text-xs text-slate-600 mt-1 italic">"{insp.inspectorNotes}"</p>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectRental?.(insp.rentalId)}
                      className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition self-start sm:self-auto"
                    >
                      View in Rental #{insp.rentalId}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Photos */}
        {activeTab === 'photos' && (
          <div className="p-6">
            {photos.length === 0 ? (
              <EmptyState
                icon={ImageIcon}
                title="No Vehicle Photos"
                description="Upload exterior, interior, or maintenance photos for this car."
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map((p) => (
                  <div key={p.id} className="group relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                    <img src={p.photoUrl} alt="Car" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2 text-center">
                      <a
                        href={p.photoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-white underline"
                      >
                        View Full Size
                      </a>
                    </div>
                    <div className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded">
                      {p.photoType}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Car Modal */}
      <AddCarModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={loadCarData}
        carToEdit={vehicle}
      />
    </div>
  );
};

