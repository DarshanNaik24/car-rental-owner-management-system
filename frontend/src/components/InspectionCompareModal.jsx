import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { inspectionApi } from '../api/client';
import { Badge } from './Badge';
import { LoadingSpinner, EmptyState } from './LoadingSpinner';
import { AlertTriangle, CheckCircle, ShieldAlert, Image as ImageIcon } from 'lucide-react';

export const InspectionCompareModal = ({ isOpen, onClose, rentalId }) => {
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    if (isOpen && rentalId) {
      loadComparison();
    }
  }, [isOpen, rentalId]);

  const loadComparison = async () => {
    try {
      setLoading(true);
      const res = await inspectionApi.compare(rentalId);
      setComparison(res.data);
    } catch {
      setComparison(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pickup vs Return Inspection Comparison"
      subtitle="Side-by-side comparison to identify newly occurred scratches, damages, or missing items"
      maxWidth="max-w-4xl"
    >
      {loading ? (
        <LoadingSpinner text="Comparing inspections..." />
      ) : !comparison ? (
        <EmptyState
          icon={AlertTriangle}
          title="Comparison Unavailable"
          description="Could not load inspection data for this rental."
        />
      ) : (
        <div className="space-y-5">
          {/* Status banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80 gap-3">
            <div>
              <span className="text-xs uppercase font-bold text-slate-500 block">Vehicle</span>
              <span className="font-extrabold text-slate-900 text-sm font-mono">
                {comparison.vehicleRegistration} (Rental #{comparison.rentalId})
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-500 block font-medium">New Damage Issues</span>
                <span className={`text-base font-extrabold ${comparison.newIssuesCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {comparison.newIssuesCount} New Issue(s)
                </span>
              </div>
              {comparison.newIssuesCount > 0 ? (
                <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>

          {/* Warning notice if inspections are missing */}
          {(!comparison.hasPickupInspection || !comparison.hasReturnInspection) && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {!comparison.hasPickupInspection && !comparison.hasReturnInspection
                  ? 'Neither pickup nor return inspections have been recorded yet.'
                  : !comparison.hasPickupInspection
                  ? 'Pickup inspection was not recorded for this rental.'
                  : 'Return inspection has not been completed yet.'}
              </span>
            </div>
          )}

          {/* Comparison Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3 w-1/4">Checklist Item</th>
                  <th className="p-3 w-1/3 border-l border-slate-200 bg-sky-50/50">Pickup Inspection</th>
                  <th className="p-3 w-1/3 border-l border-slate-200 bg-amber-50/40">Return Inspection</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparison.items?.map((item) => {
                  const isNewIssue = item.newIssue;
                  return (
                    <tr
                      key={item.checklistItemId}
                      className={`hover:bg-slate-50/80 transition ${isNewIssue ? 'bg-rose-50/60 font-medium' : ''}`}
                    >
                      {/* Item Name */}
                      <td className="p-3 align-top font-semibold text-slate-900">
                        <div>{item.itemName}</div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">{item.category}</span>
                      </td>

                      {/* Pickup Condition */}
                      <td className="p-3 align-top border-l border-slate-200 bg-sky-50/20">
                        {item.pickupStatus ? (
                          <div className="space-y-1">
                            <Badge status={item.pickupStatus} size="xs" />
                            {item.pickupNotes && (
                              <p className="text-[11px] text-slate-600">{item.pickupNotes}</p>
                            )}
                            {item.pickupPhotoUrl && (
                              <a
                                href={item.pickupPhotoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-primary-600 hover:underline"
                              >
                                <ImageIcon className="w-3 h-3" /> View Photo
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not recorded</span>
                        )}
                      </td>

                      {/* Return Condition */}
                      <td className="p-3 align-top border-l border-slate-200 bg-amber-50/10">
                        {item.returnStatus ? (
                          <div className="space-y-1">
                            <Badge status={item.returnStatus} size="xs" />
                            {item.returnNotes && (
                              <p className={`text-[11px] ${isNewIssue ? 'text-rose-700 font-bold' : 'text-slate-600'}`}>
                                {item.returnNotes}
                              </p>
                            )}
                            {item.returnPhotoUrl && (
                              <a
                                href={item.returnPhotoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-primary-600 hover:underline"
                              >
                                <ImageIcon className="w-3 h-3" /> View Photo
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not recorded</span>
                        )}
                      </td>

                      {/* Issue Flag */}
                      <td className="p-3 align-middle text-center">
                        {isNewIssue ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white tracking-wider animate-pulse">
                            NEW DAMAGE
                          </span>
                        ) : item.returnStatus === 'OK' && item.pickupStatus === 'OK' ? (
                          <span className="text-emerald-600 text-xs font-bold">MATCH (OK)</span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Close Comparison
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
