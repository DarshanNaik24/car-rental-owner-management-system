import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { inspectionApi } from '../api/client';
import { useToast } from './Toast';
import { CheckCircle2, XCircle, MinusCircle, Camera, Upload } from 'lucide-react';

export const InspectionFormModal = ({ isOpen, onClose, onSuccess, rental, type = 'PICKUP' }) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [checklistItems, setChecklistItems] = useState([]);
  const [uploadingItemId, setUploadingItemId] = useState(null);

  const formatDatetime = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const [inspectorNotes, setInspectorNotes] = useState('');
  const [inspectionDatetime, setInspectionDatetime] = useState(formatDatetime(new Date()));
  const [results, setResults] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadChecklist();
    }
  }, [isOpen, rental, type]);

  const loadChecklist = async () => {
    try {
      const res = await inspectionApi.getChecklistItems();
      const items = res.data || [];
      setChecklistItems(items);

      // Check if this inspection already exists for this rental to prepopulate
      if (rental) {
        try {
          const inspRes = await inspectionApi.getByRental(rental.id);
          const existing = (inspRes.data || []).find((i) => i.type === type);
          if (existing) {
            setInspectorNotes(existing.inspectorNotes || '');
            if (existing.inspectionDatetime) {
              setInspectionDatetime(existing.inspectionDatetime.substring(0, 16));
            }
            const initialMap = {};
            existing.results?.forEach((r) => {
              initialMap[r.checklistItemId] = {
                status: r.status,
                notes: r.notes || '',
                photoUrl: r.photoUrl || '',
              };
            });
            setResults(initialMap);
            return;
          }
        } catch {
          // No existing inspection
        }
      }

      // Default all items to OK
      const defaultMap = {};
      items.forEach((item) => {
        defaultMap[item.id] = {
          status: 'OK',
          notes: '',
          photoUrl: '',
        };
      });
      setResults(defaultMap);
    } catch (err) {
      error('Failed to load checklist items');
    }
  };

  const setItemStatus = (itemId, status) => {
    setResults((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], status },
    }));
  };

  const setItemNotes = (itemId, notes) => {
    setResults((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], notes },
    }));
  };

  const handlePhotoUpload = async (itemId, file) => {
    if (!file) return;
    try {
      setUploadingItemId(itemId);
      const data = new FormData();
      data.append('file', file);
      const res = await inspectionApi.uploadPhoto(data);
      setResults((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], photoUrl: res.data },
      }));
      success('Inspection photo uploaded');
    } catch (err) {
      error(err.message || 'Failed to upload photo');
    } finally {
      setUploadingItemId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rental) return;

    try {
      setLoading(true);
      const formattedResults = Object.entries(results).map(([itemId, val]) => ({
        checklistItemId: Number(itemId),
        status: val.status || 'OK',
        notes: val.notes || '',
        photoUrl: val.photoUrl || null,
      }));

      await inspectionApi.save({
        rentalId: rental.id,
        type: type,
        inspectionDatetime: inspectionDatetime,
        inspectorNotes: inspectorNotes,
        results: formattedResults,
      });

      success(`${type === 'PICKUP' ? 'Pickup' : 'Return'} inspection recorded successfully!`);
      onSuccess?.();
      onClose();
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Group checklist items by category
  const categories = ['INTERIOR', 'EXTERIOR', 'MECHANICAL', 'ACCESSORIES', 'OTHER'];
  const groupedItems = categories.map((cat) => ({
    category: cat,
    items: checklistItems.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);

  if (!rental) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${type === 'PICKUP' ? 'Pickup' : 'Return'} Vehicle Inspection`}
      subtitle={`Rental #${rental.id} • ${rental.vehicle?.name} (${rental.vehicle?.registrationNumber})`}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Inspection Date & Time
            </label>
            <input
              type="datetime-local"
              value={inspectionDatetime}
              onChange={(e) => setInspectionDatetime(e.target.value)}
              required
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              General Inspection Notes
            </label>
            <input
              type="text"
              value={inspectorNotes}
              onChange={(e) => setInspectorNotes(e.target.value)}
              placeholder="Overall condition remarks, weather, lighting"
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            />
          </div>
        </div>

        {/* Checklist Groups */}
        <div className="space-y-5">
          {groupedItems.map((group) => (
            <div key={group.category} className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {group.category} Checklist
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {group.items.map((item) => {
                  const state = results[item.id] || { status: 'OK', notes: '', photoUrl: '' };
                  const isNotOk = state.status === 'NOT_OK';

                  return (
                    <div key={item.id} className={`p-3.5 space-y-2 transition ${isNotOk ? 'bg-rose-50/40' : ''}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-900">{item.itemName}</span>

                        {/* Status Buttons */}
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setItemStatus(item.id, 'OK')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition ${
                              state.status === 'OK'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>OK</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setItemStatus(item.id, 'NOT_OK')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition ${
                              state.status === 'NOT_OK'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-rose-600'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>NOT OK</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setItemStatus(item.id, 'NOT_APPLICABLE')}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition ${
                              state.status === 'NOT_APPLICABLE'
                                ? 'bg-slate-400 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <MinusCircle className="w-3.5 h-3.5" />
                            <span>N/A</span>
                          </button>
                        </div>
                      </div>

                      {/* Detail row for notes and photo */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={state.notes}
                          onChange={(e) => setItemNotes(item.id, e.target.value)}
                          placeholder={isNotOk ? 'Describe damage, scratches, warning light details...' : 'Optional notes...'}
                          className={`flex-1 px-3 py-1 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-primary-500 ${
                            isNotOk ? 'border-rose-300 bg-white placeholder-rose-400' : 'border-slate-200'
                          }`}
                        />

                        {/* Photo attachment */}
                        <div className="flex items-center gap-2 shrink-0">
                          {state.photoUrl ? (
                            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg text-emerald-800 text-xs">
                              <a href={state.photoUrl} target="_blank" rel="noreferrer" className="underline font-medium">
                                View Photo
                              </a>
                              <button
                                type="button"
                                onClick={() =>
                                  setResults((prev) => ({
                                    ...prev,
                                    [item.id]: { ...prev[item.id], photoUrl: '' },
                                  }))
                                }
                                className="text-rose-600 font-bold ml-1 hover:text-rose-800"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <label className="cursor-pointer px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 inline-flex items-center gap-1 transition">
                              <Camera className="w-3.5 h-3.5 text-slate-500" />
                              <span>{uploadingItemId === item.id ? 'Uploading...' : 'Attach Photo'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handlePhotoUpload(item.id, e.target.files?.[0])}
                                disabled={uploadingItemId === item.id}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 sticky bottom-0 bg-white py-2">
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
            {loading ? 'Saving Inspection...' : `Save ${type === 'PICKUP' ? 'Pickup' : 'Return'} Inspection`}
          </button>
        </div>
      </form>
    </Modal>
  );
};
