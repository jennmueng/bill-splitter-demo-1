'use client';

import { useEffect, useState } from 'react';
import { useBillStore } from '@/lib/store';
import LineItemsList from './LineItemsList';
import PeopleManager from './PeopleManager';
import AdjustmentsPanel from './AdjustmentsPanel';
import AssignmentMatrix from './AssignmentMatrix';
import BillSummary from './BillSummary';

export default function BillEditor() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { bill, updateBillName, resetBill } = useBillStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={bill.name}
            onChange={(e) => updateBillName(e.target.value)}
            className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none focus:bg-white focus:px-2 focus:py-1 rounded transition-colors"
            placeholder="Bill Name"
          />
        </div>
        <button
          onClick={resetBill}
          className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
        >
          Reset Bill
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <LineItemsList />
          <PeopleManager />
          <AdjustmentsPanel />
          <AssignmentMatrix />
        </div>
        <div className="lg:col-span-1">
          <BillSummary />
        </div>
      </div>
    </div>
  );
}