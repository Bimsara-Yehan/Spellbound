import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, Play } from 'lucide-react';

export const PosSync: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);

  const triggerManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <RefreshCw className="h-6 w-6 text-indigo-400" /> POS Sync & Outbox Monitor
          </h1>
          <p className="text-xs text-slate-400 mt-1">Screen #13 · Transactional outbox sync status, failed payload queue, manual trigger</p>
        </div>
        <button
          onClick={triggerManualSync}
          disabled={isSyncing}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
        >
          <Play className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Executing Re-sync...' : 'Trigger Manual Re-sync'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 uppercase font-semibold">Adapter Status</span>
          <div className="mt-2 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span className="text-xl font-bold text-white">POS Swappable Adapter Connected</span>
          </div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 uppercase font-semibold">Last Catalogue Sync</span>
          <div className="mt-2 text-xl font-bold text-slate-100">4 minutes ago</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <span className="text-xs text-slate-400 uppercase font-semibold">Outbox Failure Queue</span>
          <div className="mt-2 text-xl font-bold text-emerald-400">0 Failed Payloads</div>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4">Reconciliation Logs & Audit History</h3>
        <div className="space-y-3 font-mono text-xs">
          {[
            { time: '19:10:00', type: 'INFO', msg: 'Catalogue Pull completed: 320 items reconciled with web DB.' },
            { time: '19:00:00', type: 'INFO', msg: 'Stock Pull completed: 0 inventory variance detected.' },
            { time: '18:30:12', type: 'INFO', msg: 'Order Push ORD-2026-0089 delivered to POS integration endpoint.' },
          ].map((log, i) => (
            <div key={i} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between">
              <span className="text-slate-500">[{log.time}]</span>
              <span className="text-indigo-400 font-bold">{log.type}</span>
              <span className="text-slate-300 flex-1 ml-4 truncate">{log.msg}</span>
              <span className="text-emerald-400 text-[10px] font-sans font-semibold">SUCCESS</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
