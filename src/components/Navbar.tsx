import React, { useState } from 'react';
import { Shield, Menu, X, LogIn, LogOut, LayoutDashboard, UserCheck } from 'lucide-react';
import type { AuthUser } from '../lib/supabase';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  navigate,
  currentUser,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Beranda', route: '/' },
    { label: 'Laporkan', route: '/laporkan' },
    { label: 'Chat', route: '/chat' },
    { label: 'Solusi & Tracking', route: '/solusi' },
  ];

  const handleNav = (route: string) => {
    navigate(route);
    setMobileMenuOpen(false);
  };

  const isActive = (route: string) => {
    if (route === '/' && currentRoute === '/') return true;
    if (route !== '/' && currentRoute.startsWith(route)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <button
          onClick={() => handleNav('/')}
          className="flex items-center gap-3 text-left group transition shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003B73] to-[#00254A] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6 text-[#F58220]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#003B73] leading-tight">
              BINUS <span className="text-[#F58220]">Anti-Bullying Center</span>
            </span>
            <span className="text-[11px] font-medium text-slate-500 tracking-wide uppercase">
              Kampus Aman & Bebas Bullying
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <button
              key={link.route}
              onClick={() => handleNav(link.route)}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                isActive(link.route)
                  ? 'bg-sky-50 text-[#003B73] shadow-xs'
                  : 'text-slate-600 hover:text-[#003B73] hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}

          {currentUser && (
            <button
              onClick={() => handleNav('/admin/dashboard')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isActive('/admin')
                  ? 'bg-amber-50 text-amber-900 shadow-xs'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#F58220]" />
              Dashboard Admin
            </button>
          )}
        </nav>

        {/* Right CTA Action Zone */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 pl-3 py-1 text-xs font-medium text-slate-600 border-l border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-800">{currentUser.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNav('/admin/login')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-[#003B73] bg-slate-100 hover:bg-slate-200 transition"
            >
              <LogIn className="w-4 h-4 text-[#003B73]" />
              Login Admin
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-xl animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <button
              key={link.route}
              onClick={() => handleNav(link.route)}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold transition ${
                isActive(link.route)
                  ? 'bg-sky-50 text-[#003B73]'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}

          {currentUser && (
            <button
              onClick={() => handleNav('/admin/dashboard')}
              className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold text-amber-900 bg-amber-50 flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4 text-[#F58220]" />
              Dashboard Admin
            </button>
          )}

          <div className="pt-3 border-t border-slate-100">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">
                  Login: <strong className="text-slate-800">{currentUser.name}</strong>
                </span>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav('/admin/login')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#003B73]"
              >
                <LogIn className="w-4 h-4" />
                Login Admin
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
