'use client';

import { useState } from 'react';
import { useBillStore } from '@/lib/store';
import { formatCurrency } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import type { Adjustment } from '@/lib/types';

export default function AdjustmentsPanel() {
  const { bill, addAdjustment, updateAdjustment, deleteAdjustment, getBillSummary } = useBillStore();
  const [newAdjustment, setNewAdjustment] = useState({
    type: 'tip' as const,
    description: '',
    value: '',
    isPercentage: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const billSummary = getBillSummary();

  const handleAddAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdjustment.description.trim() && newAdjustment.value) {
      addAdjustment(
        newAdjustment.type,
        newAdjustment.description.trim(),
        parseFloat(newAdjustment.value),
        newAdjustment.isPercentage
      );
      setNewAdjustment({
        type: 'tip',
        description: '',
        value: '',
        isPercentage: true,
      });
    }
  };

  const handleUpdateAdjustment = (id: string, field: keyof Adjustment, value: string | boolean) => {
    if (field === 'description') {
      updateAdjustment(id, { description: value as string });
    } else if (field === 'value') {
      const numValue = parseFloat(value as string);
      if (!isNaN(numValue)) {
        updateAdjustment(id, { value: numValue });
      }
    } else if (field === 'type') {
      updateAdjustment(id, { type: value as 'fee' | 'tip' | 'tax' });
    } else if (field === 'isPercentage') {
      updateAdjustment(id, { isPercentage: value as boolean });
    }
  };

  const getAdjustmentAmount = (adjustment: Adjustment): number => {
    if (adjustment.isPercentage) {
      return (billSummary.subtotal * adjustment.value) / 100;
    }
    return adjustment.value;
  };

  const getTypeIcon = (type: Adjustment['type']): string => {
    switch (type) {
      case 'tip': return '💰';
      case 'tax': return '📊';
      case 'fee': return '📋';
      default: return '💰';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4">Fees & Adjustments</h2>

      <form onSubmit={handleAddAdjustment} className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <select
            value={newAdjustment.type}
            onChange={(e) => setNewAdjustment({ ...newAdjustment, type: e.target.value as 'fee' | 'tip' | 'tax' })}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="tip">Tip</option>
            <option value="tax">Tax</option>
            <option value="fee">Fee</option>
          </select>

          <input
            type="text"
            placeholder="Description"
            value={newAdjustment.description}
            onChange={(e) => setNewAdjustment({ ...newAdjustment, description: e.target.value })}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <div className="flex">
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Amount"
              value={newAdjustment.value}
              onChange={(e) => setNewAdjustment({ ...newAdjustment, value: e.target.value })}
              className="flex-1 px-3 py-2 border border-r-0 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              value={newAdjustment.isPercentage ? 'percentage' : 'fixed'}
              onChange={(e) => setNewAdjustment({ ...newAdjustment, isPercentage: e.target.value === 'percentage' })}
              className="px-2 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              <option value="percentage">%</option>
              <option value="fixed">$</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
      </form>

      {bill.adjustments.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No adjustments added yet. Add tips, taxes, or fees above.
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-3 text-sm font-medium text-gray-700 pb-2 border-b">
            <div className="col-span-1"></div>
            <div className="col-span-1">Type</div>
            <div className="col-span-4">Description</div>
            <div className="col-span-2 text-right">Value</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {bill.adjustments.map((adjustment) => (
            <div
              key={adjustment.id}
              className={cn(
                "grid grid-cols-12 gap-3 items-center py-2 rounded",
                editingId === adjustment.id && "bg-blue-50"
              )}
            >
              <div className="col-span-1 text-center">
                {getTypeIcon(adjustment.type)}
              </div>

              <div className="col-span-1">
                {editingId === adjustment.id ? (
                  <select
                    value={adjustment.type}
                    onChange={(e) => handleUpdateAdjustment(adjustment.id, 'type', e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="tip">Tip</option>
                    <option value="tax">Tax</option>
                    <option value="fee">Fee</option>
                  </select>
                ) : (
                  <span className="text-sm capitalize text-gray-600">
                    {adjustment.type}
                  </span>
                )}
              </div>

              <div className="col-span-4">
                {editingId === adjustment.id ? (
                  <input
                    type="text"
                    value={adjustment.description}
                    onChange={(e) => handleUpdateAdjustment(adjustment.id, 'description', e.target.value)}
                    className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <span
                    onClick={() => setEditingId(adjustment.id)}
                    className="cursor-pointer hover:text-blue-600"
                  >
                    {adjustment.description}
                  </span>
                )}
              </div>

              <div className="col-span-2 text-right">
                {editingId === adjustment.id ? (
                  <div className="flex">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={adjustment.value}
                      onChange={(e) => handleUpdateAdjustment(adjustment.id, 'value', e.target.value)}
                      className="flex-1 px-2 py-1 border border-r-0 rounded-l text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <select
                      value={adjustment.isPercentage ? 'percentage' : 'fixed'}
                      onChange={(e) => handleUpdateAdjustment(adjustment.id, 'isPercentage', e.target.value === 'percentage')}
                      className="px-1 py-1 border rounded-r text-xs bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">$</option>
                    </select>
                  </div>
                ) : (
                  <span
                    onClick={() => setEditingId(adjustment.id)}
                    className="cursor-pointer hover:text-blue-600"
                  >
                    {adjustment.value}{adjustment.isPercentage ? '%' : '$'}
                  </span>
                )}
              </div>

              <div className="col-span-2 text-right font-medium">
                {formatCurrency(getAdjustmentAmount(adjustment))}
              </div>

              <div className="col-span-2 text-right">
                <div className="flex gap-1 justify-end">
                  <button
                    onClick={() => setEditingId(editingId === adjustment.id ? null : adjustment.id)}
                    className="text-gray-500 hover:text-blue-600 transition-colors text-sm"
                    title="Edit adjustment"
                  >
                    {editingId === adjustment.id ? 'Done' : 'Edit'}
                  </button>
                  <button
                    onClick={() => deleteAdjustment(adjustment.id)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                    title="Delete adjustment"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}