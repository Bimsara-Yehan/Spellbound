import React from 'react';
import { ShoppingCart, Search, Eye } from 'lucide-react';

interface Order {
  id: string;
  orderNo: string;
  customer: string;
  total: string;
  payment: 'PAID' | 'COD' | 'PENDING';
  status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  date: string;
}

const mockOrders: Order[] = [
  { id: 'ord_1', orderNo: 'ORD-2026-0089', customer: 'Kavinda Perera', total: 'LKR 17,700', payment: 'PAID', status: 'PROCESSING', date: 'Today, 18:30' },
  { id: 'ord_2', orderNo: 'ORD-2026-0088', customer: 'Nimali Jayasinghe', total: 'LKR 9,200', payment: 'COD', status: 'SHIPPED', date: 'Today, 14:15' },
  { id: 'ord_3', orderNo: 'ORD-2026-0087', customer: 'Dinesh Fernando', total: 'LKR 35,300', payment: 'PAID', status: 'DELIVERED', date: 'Yesterday' },
];

export const Orders: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-indigo-400" /> Order Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">Screen #9 & #10 · Order processing list, status transitions, line items, refund state</p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search orders by number, customer name..."
            className="bg-transparent border-none focus:outline-none w-full text-slate-200 placeholder-slate-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">View Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {mockOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-400">{ord.orderNo}</td>
                  <td className="py-3 px-4 font-semibold text-white">{ord.customer}</td>
                  <td className="py-3 px-4 text-xs text-slate-400">{ord.date}</td>
                  <td className="py-3 px-4 font-bold text-slate-100">{ord.total}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {ord.payment}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
