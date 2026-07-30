import React, { useState } from 'react';
import { Tag, Plus } from 'lucide-react';

interface VariantOption {
  type: string;
  values: string[];
}

export const Variants: React.FC = () => {
  const [options] = useState<VariantOption[]>([
    { type: 'Size', values: ['S', 'M', 'L', 'XL'] },
    { type: 'Colour', values: ['White', 'Navy', 'Olive'] },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Tag className="h-6 w-6 text-indigo-400" /> Variant & SKU Matrix Generator
        </h1>
        <p className="text-xs text-slate-400 mt-1">Screen #7 · Option types, generated combinations, per-variant SKU & pricing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Option Configuration */}
        <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white mb-2">Option Attributes</h3>
          {options.map((opt, i) => (
            <div key={i} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                <span>{opt.type}</span>
                <span className="text-[10px] text-indigo-400">{opt.values.length} values</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {opt.values.map((val, vi) => (
                  <span key={vi} className="px-2 py-0.5 bg-slate-800 text-slate-200 text-xs font-medium rounded-md border border-slate-700">
                    {val}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" /> Add Option Type
          </button>
        </div>

        {/* Matrix Preview */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4">Generated SKU Matrix (12 Combinations)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Variant</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Price override</th>
                  <th className="py-2.5 px-3">Initial Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {(options[0]?.values ?? []).flatMap(size =>
                  (options[1]?.values ?? []).map(colour => (
                    <tr key={`${size}-${colour}`} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-white">{size} / {colour}</td>
                      <td className="py-2.5 px-3 font-mono text-indigo-400">SHIRT-{colour.substring(0,3).toUpperCase()}-{size}</td>
                      <td className="py-2.5 px-3 text-slate-400">LKR 8,500</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">10 units</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
