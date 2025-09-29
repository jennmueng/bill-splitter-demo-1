'use client';

import { useBillStore } from '@/lib/store';
import { formatCurrency } from '@/lib/calculations';
import { cn } from '@/lib/utils';

export default function AssignmentMatrix() {
  const {
    bill,
    togglePersonAssignment,
    assignAllPeopleToItem,
    clearItemAssignments
  } = useBillStore();

  if (bill.items.length === 0 || bill.people.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Item Assignments</h2>
        <div className="text-gray-500 text-center py-8">
          {bill.items.length === 0 && bill.people.length === 0
            ? "Add items and people to start assigning."
            : bill.items.length === 0
            ? "Add some items to assign to people."
            : "Add some people to assign items to."
          }
        </div>
      </div>
    );
  }

  const getAssignment = (itemId: string) => {
    return bill.assignments.find(a => a.itemId === itemId);
  };

  const isPersonAssigned = (itemId: string, personId: string) => {
    const assignment = getAssignment(itemId);
    return assignment ? assignment.personIds.includes(personId) : false;
  };

  const getAssignedCount = (itemId: string) => {
    const assignment = getAssignment(itemId);
    return assignment ? assignment.personIds.length : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Item Assignments</h2>
      <p className="text-gray-600 text-sm mb-6">
        Click to assign/unassign people to items. Items are split equally among assigned people.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 pr-4 font-medium">Item</th>
              <th className="text-right py-3 px-2 font-medium">Total</th>
              {bill.people.map((person) => (
                <th key={person.id} className="text-center py-3 px-2 font-medium">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-3 h-3 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: person.color }}
                    />
                    <span className="text-xs">{person.name}</span>
                  </div>
                </th>
              ))}
              <th className="text-center py-3 pl-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item) => {
              const assignedCount = getAssignedCount(item.id);
              const itemTotal = item.price * item.quantity;
              const sharePerPerson = assignedCount > 0 ? itemTotal / assignedCount : 0;

              return (
                <tr key={item.id} className="border-b last:border-b-0">
                  <td className="py-3 pr-4">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(item.price)} × {item.quantity}
                      </div>
                    </div>
                  </td>

                  <td className="text-right py-3 px-2 font-medium">
                    {formatCurrency(itemTotal)}
                  </td>

                  {bill.people.map((person) => {
                    const isAssigned = isPersonAssigned(item.id, person.id);
                    return (
                      <td key={person.id} className="text-center py-3 px-2">
                        <button
                          onClick={() => togglePersonAssignment(item.id, person.id)}
                          className={cn(
                            "w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center",
                            isAssigned
                              ? "border-white shadow-md text-white text-sm font-bold"
                              : "border-gray-300 hover:border-gray-400"
                          )}
                          style={{
                            backgroundColor: isAssigned ? person.color : 'transparent',
                          }}
                          title={`${isAssigned ? 'Remove' : 'Assign'} ${person.name} ${isAssigned ? 'from' : 'to'} ${item.name}`}
                        >
                          {isAssigned && '✓'}
                        </button>
                        {isAssigned && (
                          <div className="text-xs text-gray-500 mt-1">
                            {formatCurrency(sharePerPerson)}
                          </div>
                        )}
                      </td>
                    );
                  })}

                  <td className="text-center py-3 pl-4">
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={() => assignAllPeopleToItem(item.id)}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        title="Assign all people"
                      >
                        All
                      </button>
                      <button
                        onClick={() => clearItemAssignments(item.id)}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        title="Clear assignments"
                      >
                        None
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Assigned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-gray-300"></div>
            <span>Unassigned</span>
          </div>
        </div>
      </div>
    </div>
  );
}