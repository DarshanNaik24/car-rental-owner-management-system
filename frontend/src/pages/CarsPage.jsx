import React, { useState, useEffect } from 'react';
import { vehicleApi } from '../api/client';
import { Badge } from '../components/Badge';
import { LoadingSpinner, EmptyState } from '../components/LoadingSpinner';
import { AddCarModal } from '../components/AddCarModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { 
  Car, 
  Plus, 
  Search, 
  Gauge, 
  Fuel, 
  Wrench, 
  KeyRound, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const CarsPage = ({ onSelectCar, onStartRentalForCar }) => {
  const { success, error } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [carToEdit, setCarToEdit] = useState(null);
  const [carToDelete, setCarToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, [statusFilter]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const res = await vehicleApi.getAll(search || null, statusFilter || null);
      setVehicles(res.data || []);
    } catch (err) {
      error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadVehicles();
  };

  const handleStatusChange = async (carId, newStatus) => {
    try {
      await vehicleApi.updateStatus(carId, newStatus);
      success(`Vehicle status changed to ${newStatus}`);
      loadVehicles();
    } catch (err) {
      error(err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!carToDelete) return;
    try {
      setIsDeleting(true);
      await vehicleApi.delete(carToDelete.id);
      success('Vehicle removed from fleet');
      setCarToDelete(null);
      loadVehicles();
    } catch (err) {
      error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">My Cars (Fleet)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your rental vehicles, track odometer mileage, and monitor maintenance status
          </p>
        </div>

        <button
          onClick={() => {
            setCarToEdit(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm shadow-primary-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Car</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: '', label: 'All Cars' },
            { id: 'AVAILABLE', label: 'Available' },
            { id: 'RENTED', label: 'Rented' },
            { id: 'MAINTENANCE', label: 'Maintenance' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
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

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reg #, model, brand..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50/50"
          />
        </form>
      </div>

      {/* Car Cards Grid */}
      {loading ? (
        <LoadingSpinner text="Loading fleet..." />
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No Vehicles Found"
          description={search || statusFilter ? 'Try clearing your filters or search terms.' : 'Add your first vehicle to start tracking rentals.'}
          action={
            <button
              onClick={() => {
                setCarToEdit(null);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition"
            >
              + Add First Car
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((car) => {
            const isAvailable = car.status === 'AVAILABLE';
            const isRented = car.status === 'RENTED';
            const isMaintenance = car.status === 'MAINTENANCE';

            return (
              <div
                key={car.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Top Image or Placeholder */}
                  <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    {car.imageUrl ? (
                      <img
                        src={car.imageUrl}
                        alt={car.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-300">
                        <Car className="w-16 h-16 stroke-[1.2]" />
                        <span className="text-[11px] font-semibold text-slate-400 mt-1">No Image Uploaded</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge status={car.status} />
                    </div>
                    <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white font-mono font-extrabold text-xs px-2.5 py-1 rounded-lg">
                      {car.registrationNumber}
                    </div>
                  </div>

                  {/* Car Specs */}
                  <div className="p-5 space-y-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        {car.manufacturer}
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                        {car.name} {car.variant ? `(${car.variant})` : ''}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Gauge className="w-3.5 h-3.5 text-primary-600" />
                        <span className="font-mono font-bold text-slate-900">{car.currentOdometer.toLocaleString()} km</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Fuel className="w-3.5 h-3.5 text-amber-600" />
                        <span>{car.fuelType}</span>
                      </div>
                      <div className="text-slate-500">
                        Transmission: <strong className="text-slate-700">{car.transmission}</strong>
                      </div>
                      <div className="text-slate-500">
                        Year: <strong className="text-slate-700">{car.manufacturingYear || 'N/A'}</strong>
                      </div>
                    </div>

                    {car.notes && (
                      <p className="text-xs text-slate-500 line-clamp-2 italic">
                        "{car.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectCar?.(car.id)}
                      title="View Details & History"
                      className="p-2 text-slate-600 hover:text-primary-700 hover:bg-slate-200/70 rounded-lg transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setCarToEdit(car);
                        setIsAddModalOpen(true);
                      }}
                      title="Edit Car"
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {!isRented && (
                      <button
                        onClick={() => setCarToDelete(car)}
                        title="Delete Car"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Status Toggle Button */}
                    {isAvailable && (
                      <button
                        onClick={() => handleStatusChange(car.id, 'MAINTENANCE')}
                        className="px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition"
                      >
                        Set Maintenance
                      </button>
                    )}
                    {isMaintenance && (
                      <button
                        onClick={() => handleStatusChange(car.id, 'AVAILABLE')}
                        className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition"
                      >
                        Set Available
                      </button>
                    )}

                    {/* Rental Action */}
                    {isAvailable ? (
                      <button
                        onClick={() => onStartRentalForCar?.(car.id)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm shadow-primary-600/20 transition flex items-center gap-1"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Rent Out</span>
                      </button>
                    ) : isRented ? (
                      <button
                        onClick={() => onSelectCar?.(car.id)}
                        className="px-3 py-1.5 text-xs font-bold text-sky-700 bg-sky-100 hover:bg-sky-200 rounded-lg transition"
                      >
                        Active Trip
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Car Modal */}
      <AddCarModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setCarToEdit(null);
        }}
        onSuccess={loadVehicles}
        carToEdit={carToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!carToDelete}
        onClose={() => setCarToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Vehicle"
        message={`Are you sure you want to remove ${carToDelete?.manufacturer} ${carToDelete?.name} (${carToDelete?.registrationNumber})? This can only be done if there are no active rentals.`}
        confirmText="Remove Car"
        danger={true}
        loading={isDeleting}
      />
    </div>
  );
};

