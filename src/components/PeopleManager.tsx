'use client';

import { useState } from 'react';
import { useBillStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function PeopleManager() {
  const { bill, addPerson, updatePerson, deletePerson } = useBillStore();
  const [newPersonName, setNewPersonName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPersonName.trim()) {
      addPerson(newPersonName.trim());
      setNewPersonName('');
    }
  };

  const handleUpdatePerson = (id: string, name: string) => {
    if (name.trim()) {
      updatePerson(id, { name: name.trim() });
    }
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">People</h2>

      <form onSubmit={handleAddPerson} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Person's name"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Person
          </button>
        </div>
      </form>

      {bill.people.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No people added yet. Add the first person above.
        </div>
      ) : (
        <div className="space-y-3">
          {bill.people.map((person) => (
            <div
              key={person.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                editingId === person.id && "bg-blue-50 border-blue-200"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: person.color }}
                />
                {editingId === person.id ? (
                  <input
                    type="text"
                    value={person.name}
                    onChange={(e) => updatePerson(person.id, { name: e.target.value })}
                    onBlur={() => handleUpdatePerson(person.id, person.name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdatePerson(person.id, person.name);
                      } else if (e.key === 'Escape') {
                        setEditingId(null);
                      }
                    }}
                    className="px-2 py-1 border rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => setEditingId(person.id)}
                    className="font-medium cursor-pointer hover:text-blue-600"
                  >
                    {person.name}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingId(editingId === person.id ? null : person.id)}
                  className="text-gray-500 hover:text-blue-600 transition-colors text-sm"
                  title="Edit name"
                >
                  Edit
                </button>
                <button
                  onClick={() => deletePerson(person.id)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                  title="Remove person"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {bill.people.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Total: {bill.people.length} {bill.people.length === 1 ? 'person' : 'people'}
        </div>
      )}
    </div>
  );
}