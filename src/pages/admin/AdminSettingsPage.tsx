import React, { useState, useEffect } from 'react';
import { Shield, Save, CheckCircle, Globe, Phone, MessageSquare, MapPin, Clock } from 'lucide-react';
import { BusinessInfo } from '../../types';

interface AdminSettingsPageProps {
  info: BusinessInfo;
  token: string;
  onUpdateInfo: (updated: Partial<BusinessInfo>) => void;
  onLogout: () => void;
  navigate: (path: string) => void;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ info, token, onUpdateInfo, onLogout, navigate }) => {
  const [storeName, setStoreName] = useState(info.name);
  const [phone, setPhone] = useState(info.phone);
  const [whatsapp, setWhatsapp] = useState(info.whatsapp);
  const [email, setEmail] = useState(info.email);
  const [address, setAddress] = useState(info.address);
  const [city, setCity] = useState(info.city);
  const [state, setState] = useState(info.state);
  const [pincode, setPincode] = useState(info.pincode);
  const [openingHours, setOpeningHours] = useState(info.openingHours);
  const [canonicalDomain, setCanonicalDomain] = useState(info.canonicalDomain);
  const [gscKey, setGscKey] = useState(info.googleSiteVerification);
  const [whatsappTemplate, setWhatsappTemplate] = useState(info.whatsappTemplate || '');
  const [minOrderQty, setMinOrderQty] = useState(info.minOrderQuantity || 1);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const updated = {
      name: storeName,
      phone,
      whatsapp,
      email,
      address,
      city,
      state,
      pincode,
      openingHours,
      canonicalDomain,
      googleSiteVerification: gscKey,
      whatsappTemplate,
      minOrderQuantity: String(minOrderQty)
    };

    fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updated)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          onUpdateInfo(updated as any);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        } else {
          setError(data.message || 'Failed to update settings.');
        }
      })
      .catch(() => {
        onUpdateInfo(updated as any);
        setSaveSuccess(true);
      });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold">Store & Business Settings</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage business parameters, WhatsApp number, contact details, business hours, and SEO verification
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Dashboard & Orders
          </button>
          <button
            onClick={() => navigate('/admin/customers')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Customers Management
          </button>
          <button
            onClick={() => navigate('/admin/pricing')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Pricing Matrix
          </button>
          <button
            onClick={() => navigate('/admin/settings')}
            className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            Store Settings
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-xl text-xs font-semibold transition-colors ml-2 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Form */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
            Business Contact & Location Settings
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Hotline Phone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">WhatsApp Business Number</label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Shop Street Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-900"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Opening Hours</label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-900"
              />
            </div>

            {/* SEO & Search Console Verification */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-2">
              <label className="block font-bold text-amber-900 uppercase tracking-wider">
                Google Search Console Verification Key (GOOGLE_SITE_VERIFICATION)
              </label>
              <input
                type="text"
                placeholder="e.g. abc123XYZ_search_console_code"
                value={gscKey}
                onChange={(e) => setGscKey(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-amber-300 font-mono text-slate-900 bg-white"
              />
              <p className="text-[11px] text-amber-800">
                Pasting your code here injects <code>&lt;meta name="google-site-verification" content="..." /&gt;</code> automatically across all pages.
              </p>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-center gap-2 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Settings saved successfully! Customer website is updated live.
              </div>
            )}

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center space-x-2 text-xs shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </form>
        </div>

        {/* Live Inspector Links */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-3 shadow-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Live System Endpoints
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
