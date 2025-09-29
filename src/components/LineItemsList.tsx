'use client';

import { useState } from 'react';
import { useBillStore } from '@/lib/store';
import { formatCurrency } from '@/lib/calculations';
import { cn } from '@/lib/utils';

export default function LineItemsList() {
  const { bill, addLineItem, updateLineItem, deleteLineItem } = useBillStore();
  const [newItem, setNewItem] = useState({ name: '', price: '', quantity: '1' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.name.trim() && newItem.price) {
      addLineItem(
        newItem.name.trim(),
        parseFloat(newItem.price),
        parseInt(newItem.quantity) || 1
      );
      setNewItem({ name: '', price: '', quantity: '1' });
    }
  };

  const handleUpdateItem = (id: string, field: string, value: string) => {
    if (field === 'name') {
      updateLineItem(id, { name: value });
    } else if (field === 'price') {
      const price = parseFloat(value);
      if (!isNaN(price)) {
        updateLineItem(id, { price });
      }
    } else if (field === 'quantity') {
      const quantity = parseInt(value);
      if (!isNaN(quantity) && quantity > 0) {
        updateLineItem(id, { quantity });
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold mb-4">Line Items</h2>

      <form onSubmit={handleAddItem} className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Item name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="col-span-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Price"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              placeholder="Qty"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </form>

      {bill.items.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No items added yet. Add your first item above.
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-3 text-sm font-medium text-gray-700 pb-2 border-b">
            <div className="col-span-5">Item</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1"></div>
          </div>

          {bill.items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "grid grid-cols-12 gap-3 items-center py-2 rounded",
                editingId === item.id && "bg-blue-50"
              )}
            >
              <div className="col-span-5">
                {editingId === item.id ? (
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                    className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => setEditingId(item.id)}
                    className="cursor-pointer hover:text-blue-600"
                  >
                    {item.name}
                  </span>
                )}
              </div>

              <div className="col-span-2 text-right">
                {editingId === item.id ? (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.price}
                    onChange={(e) => handleUpdateItem(item.id, 'price', e.target.value)}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                    className="w-full px-2 py-1 border rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <span
                    onClick={() => setEditingId(item.id)}
                    className="cursor-pointer hover:text-blue-600"
                  >
                    {formatCurrency(item.price)}
                  </span>
                )}
              </div>

              <div className="col-span-2 text-center">
                {editingId === item.id ? (
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                    className="w-full px-2 py-1 border rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <span
                    onClick={() => setEditingId(item.id)}
                    className="cursor-pointer hover:text-blue-600"
                  >
                    {item.quantity}
                  </span>
                )}
              </div>

              <div className="col-span-2 text-right font-medium">
                {formatCurrency(item.price * item.quantity)}
              </div>

              <div className="col-span-1 text-right">
                <button
                  onClick={() => deleteLineItem(item.id)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                  title="Delete item"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}