import React, { useState, useEffect } from 'react';
import { BusinessInfo, OrderItem } from '../types';
import { Shield, Save, CheckCircle, RefreshCw, Eye, Lock, FileText, Globe } from 'lucide-react';

interface AdminPageProps {
  info: BusinessInfo;
  onUpdateInfo: (updated: Partial<BusinessInfo>) => void;
  navigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ info, onUpdateInfo, navigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Form states
  const [address, setAddress] = useState(info.address);
  const [city, setCity] = useState(info.city);
  const [state, setState] = useState(info.state);
  const [pincode, setPincode] = useState(info.pincode);
  const [hours, setHours] = useState(info.openingHours);
  const [phone, setPhone] = useState(info.phone);
  const [whatsapp, setWhatsapp] = useState(info.whatsapp);
  const [gscKey, setGscKey] = useState(info.googleSiteVerification);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [orders, setOrders] = useState<OrderItem[]>([]);

  useEffect(() => {
    // Fetch orders from API
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(() => {});
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123' || password === 'nithish') {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      address,
      city,
      state,
      pincode,
      openingHours: hours,
      phone,
      whatsapp,
      googleSiteVerification: gscKey
    };

    // Save to Express API
    fetch('/api/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          onUpdateInfo(updated);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      })
      .catch(() => {
        onUpdateInfo(updated);
        setSaveSuccess(true);
      });
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Nithish Graphics Staff Admin</h1>
          <p className="text-xs text-slate-500">Private Portal (Not Indexed by Search Engines)</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Admin Access Password
            </label>
            <input
              type="password"
              placeholder="Enter admin password (e.g. nithish)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
            />
          </div>

          {loginError && (
            <p className="text-red-600 font-medium">Incorrect password. Please try again.</p>
          )}

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors text-xs"
          >
            Access Admin Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl font-bold">Nithish Graphics Admin Portal</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Private Store Management & Google Search Console Verification Settings
          </p>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Store Settings Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
            Update Store Location & Verification Info
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Shop Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-300 font-medium text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-300 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-300 font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-300 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Hotline</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-300 font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Store Opening Hours</label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-300 font-medium text-slate-900"
              />
            </div>

            {/* GOOGLE_SITE_VERIFICATION Field */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-2">
              <label className="block font-bold text-amber-900 uppercase tracking-wider">
                Google Search Console Verification Code (GOOGLE_SITE_VERIFICATION)
              </label>
              <input
                type="text"
                placeholder="e.g. abc123XYZ_search_console_code"
                value={gscKey}
                onChange={(e) => setGscKey(e.target.value)}
                className="w-full p-3 rounded-lg border border-amber-300 font-mono text-slate-900 bg-white"
              />
              <p className="text-[11px] text-amber-800">
                Pasting your code here injects <code>&lt;meta name="google-site-verification" content="..." /&gt;</code> automatically across all public pages.
              </p>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-2 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Settings & Verification code saved successfully!
              </div>
            )}

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center space-x-2 text-xs shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Save Admin Settings</span>
            </button>
          </form>
        </div>

        {/* Right: Recent Orders & SEO Endpoint Inspector */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
              Incoming Customer Orders
            </h2>
            {orders.length === 0 ? (
              <p className="text-xs text-slate-500">No active orders yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{ord.id} - {ord.customerName}</span>
                      <span className="text-blue-600">₹{ord.totalAmount}</span>
                    </div>
                    <p className="text-slate-600">{ord.serviceType} ({ord.copies} copies, {ord.pagesPerCopy} pages)</p>
                    <p className="text-[10px] text-slate-400">Phone: {ord.phone} | File: {ord.fileName || 'N/A'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Live Technical Endpoints
            </h3>
            <div className="space-y-2 text-xs">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-200"
              >
                <span>/sitemap.xml</span>
                <Globe className="w-4 h-4 text-blue-400" />
              </a>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-200"
              >
                <span>/robots.txt</span>
                <Globe className="w-4 h-4 text-blue-400" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
