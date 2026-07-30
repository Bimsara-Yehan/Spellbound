import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  Search,
  LogOut,
  ChevronRight,
  User as UserIcon,
  Shield,
  Menu,
  X
} from 'lucide-react';

export const AppShell: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Generate dynamic breadcrumbs
  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Drawer Overlay & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 bg-slate-900 h-full">
            <Sidebar
              collapsed={false}
              onToggleCollapse={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Topbar Header */}
        <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm text-slate-400">
              <Link to="/dashboard" className="hover:text-slate-200 font-medium">
                Admin
              </Link>
              {pathSegments.map((segment, idx) => {
                const url = `/${pathSegments.slice(0, idx + 1).join('/')}`;
                const isLast = idx === pathSegments.length - 1;
                const formattedName = segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

                return (
                  <React.Fragment key={url}>
                    <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" />
                    {isLast ? (
                      <span className="font-semibold text-indigo-400 capitalize">{formattedName}</span>
                    ) : (
                      <Link to={url} className="hover:text-slate-200 capitalize">
                        {formattedName}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          {/* Right Topbar Actions */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Quick Search */}
            <div className="hidden lg:flex items-center bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-slate-400 w-56 justify-between">
              <span className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5" /> Search admin...
              </span>
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px] text-slate-300 font-mono">⌘K</kbd>
            </div>

            {/* Notifications button */}
            <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-slate-900" />
            </button>

            <div className="h-6 w-px bg-slate-800" />

            {/* User Profile Badge */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="h-9 w-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 p-0.5 shrink-0 overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <UserIcon className="h-full w-full p-1 text-indigo-400" />
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-sm font-semibold text-slate-200 leading-tight">{user.name}</span>
                    <span className="text-[10px] font-bold text-indigo-400 tracking-wider flex items-center gap-1">
                      <Shield className="h-3 w-3 inline" /> {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
