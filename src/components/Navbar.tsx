import React, { useState } from 'react';
import { Printer, Phone, MessageSquare, Menu, X, Shield, Search, User, LogIn, UserPlus, LogOut, ShoppingBag } from 'lucide-react';
import { BusinessInfo, CustomerUser } from '../types';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  info: BusinessInfo;
  customerUser?: CustomerUser | null;
  onCustomerLogout?: () => void;
  onOpenSeoInspector: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate, info, customerUser, onCustomerLogout, onOpenSeoInspector }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'Pricing Rates', path: '/pricing' },
    { label: 'Place Order', path: '/order' },
    { label: 'Track Order', path: '/track-order' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs selection:bg-orange-500 selection:text-white">
      {/* Top Banner with Local Contact & SERP Inspector */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
              Open Now
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline">Professional B/W, Color & Record Binding Shop</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenSeoInspector}
              className="flex items-center text-amber-300 hover:text-amber-200 text-xs font-medium bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 transition-colors cursor-pointer"
              title="Inspect Google Search Console & SEO Readiness"
            >
              <Search className="w-3 h-3 mr-1" />
              Google SERP Inspector
            </button>
            <a
              href={`tel:${info.phone}`}
              className="flex items-center text-white hover:text-orange-400 font-semibold"
            >
              <Phone className="w-3 h-3 mr-1 text-orange-500" />
              {info.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo & Name */}
          <div
            onClick={() => handleNav('/')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-orange-600 via-red-600 to-blue-900 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">
                Nithish Graphics
              </span>
              <span className="block text-[10px] font-bold text-orange-600 uppercase tracking-widest -mt-1">
                Printing & Binding
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-orange-50 text-orange-600 font-bold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Customer Auth Actions & Order CTA */}
          <div className="hidden md:flex items-center space-x-2">
            {customerUser ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleNav('/customer/dashboard')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPath.startsWith('/customer')
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                  }`}
                >
                  <User className="w-4 h-4 text-orange-500" />
                  <span className="max-w-[120px] truncate">{customerUser.name}</span>
                </button>
                {onCustomerLogout && (
                  <button
                    onClick={onCustomerLogout}
                    className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-950 text-white shadow-sm transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}

            <button
              onClick={() => handleNav('/order')}
              className="bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all flex items-center space-x-1 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Place Order</span>
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-2 text-xs">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`w-full text-left px-4 py-3 rounded-lg font-bold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-orange-50 text-orange-600 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100 space-y-2">
            {customerUser ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleNav('/customer/dashboard')}
                  className="w-full py-2.5 px-4 bg-orange-600 text-white font-bold rounded-lg flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Dashboard: {customerUser.name}</span>
                </button>
                {onCustomerLogout && (
                  <button
                    onClick={() => { onCustomerLogout(); setMobileMenuOpen(false); }}
                    className="w-full py-2 px-4 bg-red-50 text-red-700 font-bold rounded-lg text-center cursor-pointer"
                  >
                    Logout Account
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 rounded-lg text-center cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="py-2.5 bg-blue-900 text-white font-bold rounded-lg text-center cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

