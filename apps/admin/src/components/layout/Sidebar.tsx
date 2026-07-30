import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderTree,
  Package,
  Boxes,
  ShoppingCart,
  Percent,
  RefreshCw,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Tag
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  screenNum: number;
  badge?: string;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    groupName: 'Overview',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, screenNum: 11 },
    ]
  },
  {
    groupName: 'Catalogue Management',
    items: [
      { title: 'Categories', href: '/categories', icon: FolderTree, screenNum: 3 },
      { title: 'Products', href: '/products', icon: Package, screenNum: 4 },
      { title: 'Image Gallery', href: '/products/images', icon: ImageIcon, screenNum: 6 },
      { title: 'Variant Options', href: '/products/variants', icon: Tag, screenNum: 7 },
      { title: 'Inventory Stock', href: '/inventory', icon: Boxes, screenNum: 8, badge: 'Live' },
    ]
  },
  {
    groupName: 'Commerce & Orders',
    items: [
      { title: 'Orders', href: '/orders', icon: ShoppingCart, screenNum: 9 },
      { title: 'Discounts & Promos', href: '/discounts', icon: Percent, screenNum: 12 },
    ]
  },
  {
    groupName: 'System & POS',
    items: [
      { title: 'POS Sync Monitor', href: '/pos-sync', icon: RefreshCw, screenNum: 13 },
      { title: 'Staff & Roles', href: '/staff', icon: Users, screenNum: 14 },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white leading-tight">Spellbound</span>
              <span className="text-[10px] font-semibold tracking-wider text-indigo-400 uppercase">Admin Portal</span>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {group.groupName}
              </h3>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                  title={collapsed ? `${item.title} (Screen #${item.screenNum})` : undefined}
                >
                  <Icon className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!collapsed && (
                    <span className="flex-1 truncate">{item.title}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        {!collapsed ? (
          <div className="flex items-center justify-between text-xs text-slate-500 px-2 py-1">
            <span>v0.1.0-phase1</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              POS Ready
            </span>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" title="System Online" />
          </div>
        )}
      </div>
    </aside>
  );
};
