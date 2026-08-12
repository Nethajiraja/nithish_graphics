import React, { useState } from 'react';
import { Printer, Phone, MessageSquare, Menu, X, Shield, Search } from 'lucide-react';
import { BusinessInfo } from '../types';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  info: BusinessInfo;
  onOpenSeoInspector: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate, info, onOpenSeoInspector }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'Pricing Rates', path: '/pricing' },
    { label: 'Order Online', path: '/order' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner with Local Contact & SEO Verification Indicator */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
              Open Now
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline">Professional B/W, Color & Record Binding Shop</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenSeoInspector}
              className="flex items-center text-amber-300 hover:text-amber-200 text-xs font-medium bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 transition-colors"
              title="Inspect Google Search Console & SEO Readiness"
            >
              <Search className="w-3 h-3 mr-1" />
              Google SERP Inspector
            </button>
            <a
              href={`tel:${info.phone}`}
              className="flex items-center text-white hover:text-blue-300 font-semibold"
            >
              <Phone className="w-3 h-3 mr-1 text-blue-400" />
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                Nithish Graphics
              </span>
              <span className="block text-[10px] font-semibold text-blue-600 uppercase tracking-widest -mt-1">
                Printing & Binding
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* CTA Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <a
              href={`https://wa.me/${info.whatsapp}?text=Hi%20Nithish%20Graphics,%20I%20need%20printing%20services.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Order</span>
            </a>
            <button
              onClick={() => handleNav('/order')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Calculate Cost
            </button>
          </div>

          {/* Mobile menu trigger button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <a
              href={`tel:${info.phone}`}
              className="flex items-center justify-center space-x-2 w-full bg-slate-900 text-white text-sm font-semibold py-2.5 rounded-lg"
            >
              <Phone className="w-4 h-4 text-blue-400" />
              <span>Call Shop: {info.phone}</span>
            </a>
            <a
              href={`https://wa.me/${info.whatsapp}?text=Hi%20Nithish%20Graphics,%20I%20need%20printing%20services.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 w-full bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-lg"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send PDF via WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
