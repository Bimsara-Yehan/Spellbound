import React from 'react';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  ArrowUpRight,
  AlertTriangle,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900/50 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="h-4 w-4" /> Admin Command Center — Screen #11
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Welcome back, Rashmika</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Here is the live store performance overview. All data models are ready for catalogue entry and order processing.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Revenue', value: 'LKR 452,800', change: '+12.5%', icon: TrendingUp, color: 'emerald' },
          { title: 'Total Orders', value: '148', change: '+8.2%', icon: ShoppingCart, color: 'indigo' },
          { title: 'Active Products', value: '320 SKUs', change: '+15 new', icon: Package, color: 'violet' },
          { title: 'Registered Customers', value: '890', change: '+24 this week', icon: Users, color: 'amber' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
                <div className="p-2 rounded-xl bg-slate-800 text-indigo-400">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white">{card.value}</span>
                <span className="text-xs font-semibold text-emerald-400 flex items-center">
                  {card.change} <ArrowUpRight className="h-3 w-3 inline ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Quick Checks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* POS Status widget */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-indigo-400" /> POS Integration Status
            </h3>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Synced 4 mins ago
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Catalogue and stock reconciliation worker is running via the transactional outbox layer.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-300 font-medium">Last Catalogue Sync</span>
              <span className="text-slate-400 font-mono">Today, 19:10:00</span>
            </div>
            <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-300 font-medium">Failed Items Queue</span>
              <span className="text-emerald-400 font-semibold">0 items</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" /> Low Stock Alerts
            </h3>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              2 SKUs Needing Attention
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <div className="font-semibold text-slate-200">Cotton Oxford Shirt - White (M)</div>
                <div className="text-[11px] text-slate-500">SKU: SHIRT-WHT-M</div>
              </div>
              <span className="text-xs font-bold text-amber-400 px-2 py-1 rounded bg-amber-500/10">3 left</span>
            </div>
            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <div className="font-semibold text-slate-200">Slim Fit Chinos - Navy (32)</div>
                <div className="text-[11px] text-slate-500">SKU: CHINO-NVY-32</div>
              </div>
              <span className="text-xs font-bold text-amber-400 px-2 py-1 rounded bg-amber-500/10">1 left</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
