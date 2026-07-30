import React from 'react';
import { Percent, Plus, Tag } from 'lucide-react';

export const Discounts: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Percent className="h-6 w-6 text-indigo-400" /> Discount Codes & Promotions
          </h1>
          <p className="text-xs text-slate-400 mt-1">Screen #12 · Coupon creation, usage constraints, percentage & fixed amount discounts</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create Coupon
        </button>
      </div>

      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="space-y-4">
          {[
            { code: 'WELCOME10', type: 'Percentage (10% OFF)', usage: '48 / 100 used', status: 'ACTIVE' },
            { code: 'NEWYEAR2026', type: 'Fixed (LKR 1,500 OFF)', usage: '120 / 500 used', status: 'ACTIVE' },
          ].map((promo, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-mono font-bold text-white text-base">{promo.code}</h3>
                  <p className="text-xs text-slate-400">{promo.type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-slate-400">{promo.usage}</span>
                <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {promo.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
