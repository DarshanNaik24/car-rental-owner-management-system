import React, { useState, useEffect } from 'react';
import { rentalApi, paymentApi, inspectionApi, photoApi } from '../api/client';
import { Badge } from '../components/Badge';
import { LoadingSpinner, EmptyState } from '../components/LoadingSpinner';
import { CompleteRentalModal } from '../components/CompleteRentalModal';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { InspectionFormModal } from '../components/InspectionFormModal';
import { InspectionCompareModal } from '../components/InspectionCompareModal';
import { useToast } from '../components/Toast';
import { 
  ArrowLeft, 
  KeyRound, 
  Car, 
  User, 
  Calendar, 
  Gauge, 
  Fuel, 
  IndianRupee, 
  CreditCard, 
  ClipboardCheck, 
  AlertTriangle, 
  Image as ImageIcon,
  CheckCircle2, 
  Upload,
  Plus,
  Scale
} from 'lucide-react';

export const RentalDetailPage = ({ rentalId, onBack, onSelectCar }) => {
  const { success, error } = useToast();
  const [rental, setRental] = useState(null);
  const [payments, setPayments] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [inspectionTypeToRecord, setInspectionTypeToRecord] = useState('PICKUP');
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (rentalId) {
      loadRentalData();
    }
  }, [rentalId]);

  const loadRentalData = async () => {
    try {
      setLoading(true);
      const [rRes, pRes, iRes, phRes] = await Promise.all([
        rentalApi.getById(rentalId),
        paymentApi.getByRental(rentalId),
        inspectionApi.getByRental(rentalId),
        photoApi.getByRental(rentalId),
      ]);
      setRental(rRes.data);
      setPayments(pRes.data || []);
      setInspections(iRes.data || []);
      setPhotos(phRes.data || []);
    } catch (err) {
      error('Failed to load rental details');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e, photoType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      const data = new FormData();
      data.append('file', file);
      data.append('rentalId', rentalId);
      data.append('photoType', photoType || 'DAMAGE');
      data.append('notes', 'Attached rental photo');
      await photoApi.upload(data);
      success('Photo uploaded successfully');
      loadRentalData();
    } catch (err) {
      error(err.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading rental details..." />;
  }

  if (!rental) {
    return (
      <EmptyState
        icon={KeyRound}
        title="Rental Record Not Found"
        description="Could not find rental record."
        action={
          <button onClick={onBack} className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl">
            Back to Rentals
          </button>
        }
      />
    );
  }

  const pickupInspection = inspections.find((i) => i.type === 'PICKUP');
  const returnInspection = inspections.find((i) => i.type === 'RETURN');
  const isActive = rental.status === 'ACTIVE';

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Rentals List</span>
        </button>

        <div className="flex items-center gap-2">
          {isActive && (
            <button
              onClick={() => setIsCompleteModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Return</span>
            </button>
          )}

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Scale className="w-3.5 h-3.5 text-primary-600" />
            <span>Compare Inspections</span>
          </button>
        </div>
      </div>

      {/* Main Rental Summary Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Rental Record</span>
              <span className="font-mono font-black text-slate-900 text-lg">#{rental.id}</span>
              <Badge status={rental.status} />
            </div>
            <p className="text-xs text-slate-500">
              Created on {new Date(rental.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Quick Balance Status */}
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 self-start sm:self-auto">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Rental</span>
              <span className="text-base font-extrabold text-slate-900 font-mono">
                ₹{Number(rental.totalRentalAmount).toLocaleString()}
              </span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Paid</span>
              <span className="text-base font-extrabold text-emerald-600 font-mono">
                ₹{Number(rental.totalPaid).toLocaleString()}
              </span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Outstanding Due</span>
              <span className={`text-base font-extrabold font-mono ${Number(rental.outstandingBalance) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ₹{Number(rental.outstandingBalance).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle & Customer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Car Card */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                <Car className="w-4 h-4 text-primary-600" />
                <span>Assigned Vehicle</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {rental.vehicle?.manufacturer} {rental.vehicle?.name}
              </h3>
              <p className="text-xs font-mono font-bold text-slate-700 mt-0.5">
                Reg: {rental.vehicle?.registrationNumber}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {rental.vehicle?.fuelType} • {rental.vehicle?.transmission} • Current Odo: {rental.vehicle?.currentOdometer} km
              </p>
            </div>
            <button
              onClick={() => onSelectCar?.(rental.vehicle?.id)}
              className="text-xs font-bold text-primary-600 hover:text-primary-800 transition underline"
            >
              View Car Profile
            </button>
          </div>

          {/* Customer Card */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              <User className="w-4 h-4 text-primary-600" />
              <span>Customer Information</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">{rental.customer?.fullName}</h3>
            <p className="text-xs font-mono font-bold text-slate-700 mt-0.5">
              Phone: {rental.customer?.primaryPhone}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {rental.customer?.email || 'No email'} • {rental.customer?.address || 'No address'}
            </p>
          </div>
        </div>

        {/* Trip Logistics (Dates, Odometers, Fuel) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Pickup Schedule</span>
            <p className="font-bold text-slate-900">{new Date(rental.pickupDatetime).toLocaleString()}</p>
            <p className="text-slate-500 mt-0.5 font-mono">Odometer: {rental.pickupOdometer} km</p>
            <p className="text-slate-500 font-medium">Fuel: {rental.pickupFuelLevel}</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Expected Return</span>
            <p className="font-bold text-slate-900">{new Date(rental.expectedReturnDatetime).toLocaleString()}</p>
            <p className="text-slate-500 mt-0.5 italic">Schedule set at pickup</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Actual Return</span>
            {rental.actualReturnDatetime ? (
              <>
                <p className="font-bold text-slate-900">{new Date(rental.actualReturnDatetime).toLocaleString()}</p>
                <p className="text-slate-500 mt-0.5 font-mono">Odometer: {rental.returnOdometer} km</p>
                <p className="text-slate-500 font-medium">Fuel: {rental.returnFuelLevel}</p>
              </>
            ) : (
              <p className="text-sky-600 font-bold italic">Currently on trip (Active)</p>
            )}
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Distance Travelled</span>
            {rental.totalKilometers !== null && rental.totalKilometers !== undefined ? (
              <p className="text-base font-extrabold text-purple-600 font-mono">{rental.totalKilometers} km</p>
            ) : (
              <p className="text-slate-400 italic">Calculated upon return</p>
            )}
          </div>
        </div>

        {/* Financial Breakdown Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Financial Calculation</span>
            <span className="text-xs text-slate-400">Using accurate decimal ledger calculations</span>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Agreed Rent</span>
              <span className="text-sm font-bold text-slate-900 font-mono">₹{Number(rental.agreedRentalAmount).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Additional Charges</span>
              <span className="text-sm font-bold text-amber-600 font-mono">+₹{Number(rental.additionalCharges || 0).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Discounts</span>
              <span className="text-sm font-bold text-slate-600 font-mono">-₹{Number(rental.discountAmount || 0).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Amount</span>
              <span className="text-sm font-black text-slate-900 font-mono">₹{Number(rental.totalRentalAmount).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Outstanding</span>
              <span className={`text-sm font-black font-mono ${Number(rental.outstandingBalance) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ₹{Number(rental.outstandingBalance).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Damages & Missing Accessories Alerts if present */}
        {(rental.damageNotes || rental.missingAccessories) && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Reported Damages / Missing Accessories</span>
            </div>
            {rental.damageNotes && (
              <p className="text-rose-900">
                <strong>Damage details:</strong> {rental.damageNotes}
              </p>
            )}
            {rental.missingAccessories && (
              <p className="text-rose-900">
                <strong>Missing items:</strong> {rental.missingAccessories}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Inspections Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Vehicle Inspections</h3>
            <p className="text-xs text-slate-500">Document car condition before handover and upon return</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setInspectionTypeToRecord('PICKUP');
                setIsInspectionModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition"
            >
              {pickupInspection ? 'Edit Pickup Inspection' : '+ Record Pickup Inspection'}
            </button>
            <button
              onClick={() => {
                setInspectionTypeToRecord('RETURN');
                setIsInspectionModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
            >
              {returnInspection ? 'Edit Return Inspection' : '+ Record Return Inspection'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pickup Inspection Box */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Pickup Inspection</span>
              <Badge status={pickupInspection ? 'OK' : 'NA'}>
                {pickupInspection ? 'Completed' : 'Not Recorded'}
              </Badge>
            </div>
            {pickupInspection ? (
              <div className="text-xs text-slate-600 space-y-1">
                <p>Checked: {new Date(pickupInspection.inspectionDatetime).toLocaleString()}</p>
                <p>Results: {pickupInspection.results?.length || 0} checklist items recorded</p>
                {pickupInspection.inspectorNotes && (
                  <p className="italic text-slate-500">"{pickupInspection.inspectorNotes}"</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No pickup inspection recorded for this rental.</p>
            )}
          </div>

          {/* Return Inspection Box */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Return Inspection</span>
              <Badge status={returnInspection ? 'OK' : 'NA'}>
                {returnInspection ? 'Completed' : 'Not Recorded'}
              </Badge>
            </div>
            {returnInspection ? (
              <div className="text-xs text-slate-600 space-y-1">
                <p>Checked: {new Date(returnInspection.inspectionDatetime).toLocaleString()}</p>
                <p>Results: {returnInspection.results?.length || 0} checklist items recorded</p>
                {returnInspection.inspectorNotes && (
                  <p className="italic text-slate-500">"{returnInspection.inspectorNotes}"</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No return inspection recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Ledger Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Payment Transactions</h3>
            <p className="text-xs text-slate-500">Recorded payments, advances, and return balance settlements</p>
          </div>
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Payment</span>
          </button>
        </div>

        {payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No Payments Recorded"
            description="Record upfront advances or return payments for this rental."
          />
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="p-3">Payment ID</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Reference / Txn #</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 font-medium">
                    <td className="p-3 font-mono font-bold text-slate-900">#{p.id}</td>
                    <td className="p-3 font-mono font-black text-emerald-600 text-sm">₹{Number(p.amount).toLocaleString()}</td>
                    <td className="p-3 text-slate-600">{new Date(p.paymentDatetime).toLocaleString()}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">{p.referenceNumber || '-'}</td>
                    <td className="p-3 text-slate-500 italic">{p.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Photos & Damage Documentation Gallery */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Photos & Damage Documentation</h3>
            <p className="text-xs text-slate-500">Inspection photos, scratch records, or rental handover receipts</p>
          </div>
          <label className="cursor-pointer px-3.5 py-1.5 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-xl border border-primary-200 inline-flex items-center gap-1.5 transition">
            <Upload className="w-4 h-4" />
            <span>{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoUpload(e, 'DAMAGE')}
              disabled={uploadingPhoto}
              className="hidden"
            />
          </label>
        </div>

        {photos.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="No Photos Attached"
            description="Upload photos of vehicle condition, inspection findings, or receipts."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {photos.map((p) => (
              <div key={p.id} className="group relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                <img src={p.photoUrl} alt="Rental" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2 text-center">
                  <a href={p.photoUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-white underline">
                    View Full Image
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

      {/* Complete Rental Modal */}
      {isCompleteModalOpen && (
        <CompleteRentalModal
          isOpen={isCompleteModalOpen}
          onClose={() => setIsCompleteModalOpen(false)}
          onSuccess={loadRentalData}
          rental={rental}
        />
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && (
        <RecordPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={loadRentalData}
          rental={rental}
        />
      )}

      {/* Inspection Modal */}
      {isInspectionModalOpen && (
        <InspectionFormModal
          isOpen={isInspectionModalOpen}
          onClose={() => setIsInspectionModalOpen(false)}
          onSuccess={loadRentalData}
          rental={rental}
          type={inspectionTypeToRecord}
        />
      )}

      {/* Inspection Compare Modal */}
      {isCompareModalOpen && (
        <InspectionCompareModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          rentalId={rental.id}
        />
      )}
    </div>
  );
};
