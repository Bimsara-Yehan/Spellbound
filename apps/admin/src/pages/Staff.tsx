import React from 'react';
import { Users, UserPlus, Shield } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
  status: 'ACTIVE' | 'INVITED';
}

const mockStaff: StaffMember[] = [
  { id: 'st_1', name: 'Bimsara', email: 'bimsara@spellbound.lk', role: 'OWNER', status: 'ACTIVE' },
  { id: 'st_2', name: 'Rashmika', email: 'rashmika@spellbound.lk', role: 'MANAGER', status: 'ACTIVE' },
  { id: 'st_3', name: 'Shanuka', email: 'shanuka@spellbound.lk', role: 'STAFF', status: 'ACTIVE' },
];

export const Staff: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-400" /> Staff & Role Administration
          </h1>
          <p className="text-xs text-slate-400 mt-1">Screen #14 · Staff invites, role assignments (Owner, Manager, Staff), deactivation</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center gap-2">
          <UserPlus className="h-4 w-4" /> Invite Staff Member
        </button>
      </div>

      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Staff Member</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Assigned Role</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {mockStaff.map((st) => (
              <tr key={st.id} className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-semibold text-white">{st.name}</td>
                <td className="py-3 px-4 text-slate-400">{st.email}</td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 w-max">
                    <Shield className="h-3 w-3" /> {st.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {st.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
