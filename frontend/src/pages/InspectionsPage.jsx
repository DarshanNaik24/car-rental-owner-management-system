import React, { useState, useEffect } from 'react';
import { inspectionApi } from '../api/client';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { LoadingSpinner, EmptyState } from '../components/LoadingSpinner';
import { InspectionCompareModal } from '../components/InspectionCompareModal';
import { useToast } from '../components/Toast';
import { 
  ClipboardCheck, 
  Plus, 
  Scale, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Trash2, 
  Car, 
  FileText 
} from 'lucide-react';

export const InspectionsPage = ({ onSelectRental }) => {
  const { success, error } = useToast();
  const [checklistItems, setChecklistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Custom checklist modal
  const [isAddChecklistModalOpen, setIsAddChecklistModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('ACCESSORIES');
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);

  // Compare Inspection Modal
  const [compareRentalId, setCompareRentalId] = useState('');
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  useEffect(() => {
    loadChecklistItems();
  }, []);

  const loadChecklistItems = async () => {
    try {
      setLoading(true);
      const res = await inspectionApi.getChecklistItems();
      setChecklistItems(res.data || []);
    } catch {
      error('Failed to load checklist');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChecklistItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      setIsSubmittingItem(true);
      await inspectionApi.createChecklistItem({
        itemName: newItemName.trim(),
        category: newItemCategory,
      });
      success('Checklist item added');
      setNewItemName('');
      setIsAddChecklistModalOpen(false);
      loadChecklistItems();
    } catch (err) {
      error(err.message);
    } finally {
      setIsSubmittingItem(false);
    }
  };

  const handleDeleteChecklistItem = async (id) => {
    try {
      await inspectionApi.deleteChecklistItem(id);
      success('Checklist item removed');
      loadChecklistItems();
    } catch (err) {
      error(err.message);
    }
  };

  const categories = ['INTERIOR', 'EXTERIOR', 'MECHANICAL', 'ACCESSORIES', 'OTHER'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Vehicle Inspections</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure inspection checklists, compare pickup vs return condition, and track vehicle wear
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddChecklistModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Checklist Item</span>
          </button>
        </div>
      </div>

      {/* Compare launcher box */}
      <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>Condition Comparison Tool</span>
          </div>
          <h3 className="text-lg font-bold">Side-by-Side Damage & Wear Inspector</h3>
          <p className="text-xs text-slate-300 max-w-lg">
            Instantly compare pickup inspection with return inspection for any rental ID to automatically highlight newly sustained scratches or missing items.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-2xl border border-slate-700 shrink-0">
          <input
            type="number"
            value={compareRentalId}
            onChange={(e) => setCompareRentalId(e.target.value)}
            placeholder="Enter Rental ID #"
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-900 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono w-40"
          />
          <button
            onClick={() => {
              if (!compareRentalId) {
                error('Please enter a Rental ID');
                return;
              }
              setIsCompareOpen(true);
            }}
            className="px-4 py-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition shadow-sm"
          >
            Compare
          </button>
        </div>
      </div>

      {/* Inspection Checklist Categories */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Active Checklist Templates</h3>
            <p className="text-xs text-slate-500">
              These items appear automatically when recording pickup and return inspections
            </p>
          </div>
          <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg">
            {checklistItems.length} Checklist Items
          </span>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading checklist..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const items = checklistItems.filter((i) => i.category === cat);
              if (items.length === 0) return null;

              return (
                <div key={cat} className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/40">
                  <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      {cat}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 font-mono">
                      {items.length}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 p-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="py-2 px-2.5 flex items-center justify-between text-xs hover:bg-white rounded-lg transition"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="font-semibold text-slate-800">{item.itemName}</span>
                          {!item.isDefault && (
                            <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.2 rounded">
                              Custom
                            </span>
                          )}
                        </div>

                        {!item.isDefault && (
                          <button
                            onClick={() => handleDeleteChecklistItem(item.id)}
                            title="Remove checklist item"
                            className="text-slate-400 hover:text-rose-600 p-1 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Custom Checklist Item Modal */}
      <Modal
        isOpen={isAddChecklistModalOpen}
        onClose={() => setIsAddChecklistModalOpen(false)}
        title="Add Custom Checklist Item"
        subtitle="Add a new accessory, check area, or condition item to your inspections"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateChecklistItem} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Checklist Item Name *
            </label>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="e.g. Roof carrier, Sunroof, Tool kit, Fire extinguisher"
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Category *
            </label>
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="ACCESSORIES">Accessories</option>
              <option value="INTERIOR">Interior</option>
              <option value="EXTERIOR">Exterior</option>
              <option value="MECHANICAL">Mechanical</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddChecklistModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingItem}
              className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {isSubmittingItem ? 'Saving...' : 'Add Item'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Comparison Modal */}
      {isCompareOpen && (
        <InspectionCompareModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          rentalId={Number(compareRentalId)}
        />
      )}
    </div>
  );
};
