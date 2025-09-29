'use client';

import { useBillStore } from '@/lib/store';
import { formatCurrency } from '@/lib/calculations';

export default function BillSummary() {
  const { bill, getBillSummary } = useBillStore();
  const summary = getBillSummary();

  if (bill.items.length === 0 && bill.people.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Bill Summary</h2>
        <div className="text-gray-500 text-center py-8">
          Add items and people to see the summary
        </div>
      </div>
    );
  }

  const hasAssignments = bill.assignments.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Bill Summary</h2>

      {/* Bill Totals */}
      <div className="space-y-3 mb-6 pb-6 border-b">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatCurrency(summary.subtotal)}</span>
        </div>

        {summary.adjustmentsTotal > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Adjustments</span>
            <span className="font-medium">{formatCurrency(summary.adjustmentsTotal)}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-lg font-bold border-t pt-3">
          <span>Total</span>
          <span>{formatCurrency(summary.grandTotal)}</span>
        </div>
      </div>

      {/* Individual Totals */}
      {bill.people.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Individual Totals</h3>

          {!hasAssignments && (
            <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-md">
              💡 Assign people to items to see individual totals
            </div>
          )}

          <div className="space-y-3">
            {summary.personTotals.map((personTotal) => {
              const person = bill.people.find(p => p.id === personTotal.personId);
              if (!person) return null;

              return (
                <div key={person.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: person.color }}
                      />
                      <span className="font-medium">{person.name}</span>
                    </div>
                    <span className="text-lg font-bold">
                      {formatCurrency(personTotal.total)}
                    </span>
                  </div>

                  {personTotal.total > 0 && (
                    <div className="space-y-2 text-sm">
                      {/* Item breakdown */}
                      {personTotal.itemBreakdown.length > 0 && (
                        <div>
                          <div className="text-gray-600 mb-1">Items:</div>
                          {personTotal.itemBreakdown.map((item) => (
                            <div key={item.itemId} className="flex justify-between ml-2">
                              <span className="text-gray-700">{item.itemName}</span>
                              <span>{formatCurrency(item.share)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between font-medium border-t pt-1 mt-1">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(personTotal.subtotal)}</span>
                          </div>
                        </div>
                      )}

                      {/* Adjustment breakdown */}
                      {personTotal.adjustmentBreakdown.length > 0 && (
                        <div>
                          <div className="text-gray-600 mb-1">Adjustments:</div>
                          {personTotal.adjustmentBreakdown.map((adj) => (
                            <div key={adj.adjustmentId} className="flex justify-between ml-2">
                              <span className="text-gray-700">{adj.adjustmentDescription}</span>
                              <span>{formatCurrency(adj.share)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {personTotal.total === 0 && hasAssignments && (
                    <div className="text-sm text-gray-500">
                      Not assigned to any items
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Verification */}
          {hasAssignments && summary.personTotals.length > 0 && (
            <div className="mt-4 pt-4 border-t text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sum of individual totals:</span>
                <span>
                  {formatCurrency(
                    summary.personTotals.reduce((sum, pt) => sum + pt.total, 0)
                  )}
                </span>
              </div>
              {Math.abs(
                summary.grandTotal -
                summary.personTotals.reduce((sum, pt) => sum + pt.total, 0)
              ) > 0.01 && (
                <div className="text-red-600 text-xs mt-1">
                  ⚠️ Totals don&apos;t match - some items may not be assigned
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}