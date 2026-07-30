import React, { useState } from 'react';
import { Boxes, Edit, AlertCircle, Save, RotateCcw } from 'lucide-react';

interface StockItem {
  id: string;
  sku: string;
  name: string;
  variant: string;
  stockLevel: number;
  reserved: number;
  available: number;
}

const mockInventory: StockItem[] = [
  { id: 'inv_1', sku: 'SHIRT-WHT-M', name: 'Cotton Oxford Shirt', variant: 'White / M', stockLevel: 24, reserved: 2, available: 22 },
  { id: 'inv_2', sku: 'CHINO-NVY-32', name: 'Slim Fit Chinos', variant: 'Navy / 32', stockLevel: 18, reserved: 1, available: 17 },
  { id: 'inv_3', sku: 'SHOE-MNK-42', name: 'Leather Monk Strap', variant: 'Black / 42', stockLevel: 3, reserved: 0, available: 3 },
];

export const Inventory: React.FC = () => {
  const [items, setItems] = useState<StockItem[]>(mockInventory);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [newQty, setNewQty] = useState(0);
  const [reason, setReason] = useState('');

  const handleAdjust = (item: StockItem) => {
    setEditingItem(item);
    setNewQty(item.stockLevel);
    setReason('');
  };

  const saveAdjustment = () => {
    if (!reason.trim()) return;
    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? { ...i, stockLevel: newQty, available: newQty - i.reserved } : i));
      setEditingItem(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Boxes className="h-6 w-6 text-indigo-400" /> Stock & Inventory Control
        </h1>
        <p className="text-xs text-slate-400 mt-1">Screen #8 · Stock levels, low-stock warnings, manual adjustments with mandatory audit reason</p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Variant</th>
                <th className="py-3 px-4">Total Physical</th>
                <th className="py-3 px-4">Reserved (Cart/Order)</th>
                <th className="py-3 px-4">Available for Sale</th>
                <th className="py-3 px-4 text-right">Stock Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono text-xs text-indigo-400">{item.sku}</td>
                  <td className="py-3 px-4 font-semibold text-white">{item.name}</td>
                  <td className="py-3 px-4 text-slate-400">{item.variant}</td>
                  <td className="py-3 px-4 font-bold text-slate-100">{item.stockLevel}</td>
                  <td className="py-3 px-4 text-amber-400 font-semibold">{item.reserved}</td>
                  <td className="py-3 px-4 font-bold text-emerald-400">{item.available}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleAdjust(item)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 ml-auto"
                    >
                      <Edit className="h-3.5 w-3.5" /> Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal with Mandatory Audit Reason */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Manual Stock Adjustment</h3>
            <p className="text-xs text-slate-400">
              Adjusting stock for <strong className="text-white">{editingItem.name} ({editingItem.variant})</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">New Total Physical Level</label>
              <input
                type="number"
                value={newQty}
                onChange={(e) => setNewQty(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Mandatory Adjustment Reason <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Physical audit discrepancy, Damaged stock, POS sync correction"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 bg-slate-800 text-slate-400 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={saveAdjustment}
                disabled={!reason.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50 flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" /> Commit Audit Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
