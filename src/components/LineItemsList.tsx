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
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Line Items</h2>

      <form onSubmit={handleAddItem} className="mb-6">
        <div className="flex flex-col sm:grid sm:grid-cols-12 gap-3">
          <input
            type="text"
            placeholder="Item name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="sm:col-span-5 px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Price"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            className="sm:col-span-3 px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <input
            type="number"
            min="1"
            placeholder="Qty"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            className="sm:col-span-2 px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="sm:col-span-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Add Item
          </button>
        </div>
      </form>

      {bill.items.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No items added yet. Add your first item above.
        </div>
      ) : (
        <div className="space-y-2">
          <div className="hidden sm:grid grid-cols-12 gap-3 text-sm font-medium text-gray-900 pb-2 border-b bg-gray-50 px-3 py-2 rounded-t-md">
            <div className="col-span-5">Item</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>

          {bill.items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex flex-col sm:grid sm:grid-cols-12 gap-3 items-start sm:items-center py-3 px-3 border rounded-md",
                editingId === item.id ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200 hover:bg-gray-50"
              )}
            >
              <div className="w-full sm:col-span-5">
                <div className="sm:hidden text-xs font-medium text-gray-600 mb-1">Item Name</div>
                {editingId === item.id ? (
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => setEditingId(item.id)}
                    className="cursor-pointer hover:text-blue-600 text-gray-900 font-medium"
                  >
                    {item.name}
                  </span>
                )}
              </div>

              <div className="w-full sm:col-span-2 sm:text-right">
                <div className="sm:hidden text-xs font-medium text-gray-600 mb-1">Price</div>
                {editingId === item.id ? (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.price}
                    onChange={(e) => handleUpdateItem(item.id, 'price', e.target.value)}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 sm:text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <span
                    onClick={() => setEditingId(item.id)}
                    className="cursor-pointer hover:text-blue-600 text-gray-900"
                  >
                    {formatCurrency(item.price)}
                  </span>
                )}
              </div>

              <div className="w-full sm:col-span-2 sm:text-center">
                <div className="sm:hidden text-xs font-medium text-gray-600 mb-1">Quantity</div>
                {editingId === item.id ? (
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 sm:text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <span
                    onClick={() => setEditingId(item.id)}
                    className="cursor-pointer hover:text-blue-600 text-gray-900"
                  >
                    {item.quantity}
                  </span>
                )}
              </div>

              <div className="w-full sm:col-span-2 sm:text-right">
                <div className="sm:hidden text-xs font-medium text-gray-600 mb-1">Total</div>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>

              <div className="w-full sm:col-span-1 sm:text-center">
                <button
                  onClick={() => deleteLineItem(item.id)}
                  className="w-full sm:w-auto px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors text-sm font-medium"
                  title="Delete item"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}