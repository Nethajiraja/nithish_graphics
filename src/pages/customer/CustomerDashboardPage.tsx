import React, { useState, useEffect } from 'react';
import { User, ShoppingBag, Clock, CheckCircle2, AlertCircle, FileText, Download, Lock, LogOut, Plus, ShieldCheck, RefreshCw, KeyRound, Save } from 'lucide-react';
import { BusinessInfo, CustomerUser, OrderItem } from '../../types';

interface CustomerDashboardPageProps {
  info: BusinessInfo;
  user: CustomerUser;
  token: string;
  onLogout: () => void;
  onUserUpdated: (user: CustomerUser) => void;
  navigate: (path: string) => void;
  activeTab?: 'dashboard' | 'orders' | 'profile';
}

export const CustomerDashboardPage: React.FC<CustomerDashboardPageProps> = ({
  info,
  user,
  token,
  onLogout,
  onUserUpdated,
  navigate,
  activeTab = 'dashboard'
}) => {
  const [tab, setTab] = useState<'dashboard' | 'orders' | 'profile'>(activeTab);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Profile Form state
  const [profileName, setProfileName] = useState(user.name || '');
  const [profileEmail, setProfileEmail] = useState(user.email || '');
  const [profilePhone, setProfilePhone] = useState(user.phone || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    setTab(activeTab);
  }, [activeTab]);

  const fetchCustomerOrders = () => {
    setIsLoadingOrders(true);
    fetch('/api/customer/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          onLogout();
          throw new Error('Session expired. Please login again.');
        }
        return res.json();
      })
      .then(data => {
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrdersError(data.message || 'Failed to load order history.');
        }
      })
      .catch(err => setOrdersError(err.message))
      .finally(() => setIsLoadingOrders(false));
  };

  useEffect(() => {
    fetchCustomerOrders();
  }, [token]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    setIsUpdatingProfile(true);

    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          phone: profilePhone,
          password: profilePassword.trim() || undefined
        })
      });

      const data = await res.json();
      if (data.success && data.user) {
        onUserUpdated(data.user);
        if (data.token) {
          localStorage.setItem('customer_token', data.token);
        }
        setProfileSuccess('Profile updated successfully!');
        setProfilePassword('');
        setTimeout(() => setProfileSuccess(null), 4000);
      } else {
        setProfileError(data.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setProfileError('Network error updating profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Mobile prompt state for Google users
  const [mobileInput, setMobileInput] = useState('');
  const [isSavingMobile, setIsSavingMobile] = useState(false);
  const [mobileError, setMobileError] = useState<string | null>(null);

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMobileError(null);
    setIsSavingMobile(true);

    try {
      const res = await fetch('/api/customer/mobile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ phone: mobileInput })
      });

      const data = await res.json();
      if (data.success && data.user) {
        onUserUpdated(data.user);
        if (data.token) {
          localStorage.setItem('customer_token', data.token);
        }
      } else {
        setMobileError(data.message || 'Failed to update mobile number.');
      }
    } catch (err: any) {
      setMobileError('Connection error updating mobile number.');
    } finally {
      setIsSavingMobile(false);
    }
  };

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => ['pending', 'confirmed', 'printing'].includes((o.order_status || o.status || '').toLowerCase())).length;
  const completedOrdersCount = orders.filter(o => ['ready', 'completed', 'delivered'].includes((o.order_status || o.status || '').toLowerCase())).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 selection:bg-orange-500 selection:text-white">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-slate-900 via-blue-950 to-orange-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4">
          {user.profile_image_url ? (
            <img
              src={user.profile_image_url}
              alt={user.name}
              className="w-14 h-14 rounded-2xl border-2 border-orange-400 object-cover shadow-md shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-orange-600/40 border border-orange-500/50 flex items-center justify-center text-orange-300 font-extrabold text-xl shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Nithish Graphics Customer Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="text-orange-400">{user.name}</span>!
            </h1>
            <p className="text-xs text-slate-300">
              Account: <span className="font-mono text-slate-200">{user.phone || 'Mobile not set'}</span> ({user.email}) • Provider: <span className="px-2 py-0.5 bg-blue-600/40 text-blue-200 rounded font-bold uppercase">{user.auth_provider || 'LOCAL'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/order')}
            className="px-5 py-3 bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl text-xs shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Place New Order</span>
          </button>

          <button
            onClick={onLogout}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Missing Mobile Number Alert Banner */}
      {(!user.phone || user.phone.trim() === '') && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-6 shadow-md space-y-3 animate-in fade-in">
          <div className="flex items-center space-x-2 text-amber-950 font-bold text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
            <span>Please add your 10-digit mobile number to complete your profile and place print orders:</span>
          </div>
          <form onSubmit={handleMobileSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="tel"
              required
              placeholder="Enter 10-digit mobile number (e.g. 9876543210)"
              value={mobileInput}
              onChange={(e) => setMobileInput(e.target.value)}
              className="w-full sm:w-80 px-4 py-2.5 rounded-xl border border-amber-300 focus:ring-2 focus:ring-orange-500 text-xs font-semibold text-slate-900 bg-white shadow-xs"
            />
            <button
              type="submit"
              disabled={isSavingMobile}
              className="w-full sm:w-auto px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              {isSavingMobile ? <span>Saving...</span> : <span>Save Mobile Number</span>}
            </button>
          </form>
          {mobileError && <p className="text-xs text-red-600 font-semibold">{mobileError}</p>}
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-xs text-xs font-bold">
        <button
          onClick={() => { setTab('dashboard'); navigate('/customer/dashboard'); }}
          className={`flex-1 py-3 px-4 rounded-lg text-center transition-all ${
            tab === 'dashboard' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Overview Dashboard
        </button>
        <button
          onClick={() => { setTab('orders'); navigate('/customer/orders'); }}
          className={`flex-1 py-3 px-4 rounded-lg text-center transition-all ${
            tab === 'orders' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          My Order History ({totalOrdersCount})
        </button>
        <button
          onClick={() => { setTab('profile'); navigate('/customer/profile'); }}
          className={`flex-1 py-3 px-4 rounded-lg text-center transition-all ${
            tab === 'profile' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Account Profile
        </button>
      </div>

      {/* Tab Content 1: OVERVIEW DASHBOARD */}
      {tab === 'dashboard' && (
        <div className="space-y-8">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Orders</span>
                <p className="text-2xl font-extrabold text-slate-900">{totalOrdersCount}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm flex items-center space-x-4">
              <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-amber-800 font-bold uppercase tracking-wider">Active / Pending</span>
                <p className="text-2xl font-extrabold text-amber-900">{pendingOrdersCount}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm flex items-center space-x-4">
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Ready / Completed</span>
                <p className="text-2xl font-extrabold text-emerald-900">{completedOrdersCount}</p>
              </div>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Recent Orders
              </h2>
              <button
                onClick={() => { setTab('orders'); navigate('/customer/orders'); }}
                className="text-xs font-bold text-blue-900 hover:underline"
              >
                View All Orders &rarr;
              </button>
            </div>

            {isLoadingOrders ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading your orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <p className="text-xs text-slate-500">You haven't placed any printing orders yet.</p>
                <button
                  onClick={() => navigate('/order')}
                  className="px-4 py-2 bg-orange-600 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Create Your First Print Order
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Service</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 5).map(ord => {
                      const orderId = ord.order_id || ord.id;
                      const status = (ord.order_status || ord.status || 'Pending').toLowerCase();
                      return (
                        <tr key={orderId} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-900">#{orderId}</td>
                          <td className="p-3 font-semibold text-slate-800">{ord.service || ord.serviceType}</td>
                          <td className="p-3 font-bold text-blue-900">₹{ord.total_price || ord.totalAmount}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                              status === 'pending' ? 'bg-amber-100 text-amber-900' :
                              status === 'confirmed' ? 'bg-blue-100 text-blue-900' :
                              status === 'printing' ? 'bg-indigo-100 text-indigo-900' :
                              status === 'ready' ? 'bg-emerald-100 text-emerald-900' :
                              status === 'completed' ? 'bg-slate-900 text-white' :
                              'bg-red-100 text-red-900'
                            }`}>
                              {status}
                            </span>
                          </td>
                          <td className="p-3 text-right text-slate-500">{new Date(ord.created_at || ord.createdAt || '').toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content 2: ORDER HISTORY */}
      {tab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                My Complete Order History
              </h2>
              <p className="text-xs text-slate-500">
                Track status: <span className="font-semibold text-slate-800">Pending &rarr; Confirmed &rarr; Printing &rarr; Ready &rarr; Completed</span>
              </p>
            </div>
            <button
              onClick={fetchCustomerOrders}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {isLoadingOrders ? (
            <div className="p-12 text-center text-xs text-slate-500">Loading order history...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-3">
              <p>No orders found for your account.</p>
              <button
                onClick={() => navigate('/order')}
                className="px-4 py-2 bg-orange-600 text-white font-bold rounded-xl shadow-md"
              >
                Place New Order Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(ord => {
                const orderId = ord.order_id || ord.id;
                const status = (ord.order_status || ord.status || 'Pending').toLowerCase();
                const docs = ord.documents || [];

                return (
                  <div key={orderId} className="border border-slate-200 rounded-xl p-5 hover:border-orange-300 transition-all space-y-3 bg-slate-50/50">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200/80 pb-3">
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID:</span>
                        <span className="text-sm font-extrabold text-slate-900 ml-2 font-mono">#{orderId}</span>
                        <span className="text-xs text-slate-400 ml-3">{new Date(ord.created_at || ord.createdAt || '').toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-500">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                          status === 'pending' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          status === 'confirmed' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                          status === 'printing' ? 'bg-indigo-100 text-indigo-900 border border-indigo-300' :
                          status === 'ready' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                          status === 'completed' ? 'bg-slate-900 text-white' :
                          'bg-red-100 text-red-900 border border-red-300'
                        }`}>
                          {status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-700">
                      <div>
                        <span className="font-bold block text-slate-900">{ord.service || ord.serviceType}</span>
                        <p className="text-slate-500">
                          {ord.quantity || ord.copies || 1} copies • {(ord.color_type || ord.printType || 'bw').toUpperCase()} • {ord.print_side || ord.sides} • {ord.binding_type || ord.bindingType}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold block text-slate-900">Total Price</span>
                        <p className="text-sm font-extrabold text-orange-600">₹{ord.total_price || ord.totalAmount}</p>
                        <p className="text-[10px] text-slate-500">Payment: {ord.payment_status || 'Unpaid'}</p>
                      </div>

                      <div>
                        <span className="font-bold block text-slate-900 mb-1">Attached Documents ({docs.length})</span>
                        {docs.length === 0 ? (
                          <span className="text-slate-400 italic">No files</span>
                        ) : (
                          <div className="space-y-1">
                            {docs.map((doc, dIdx) => (
                              <a
                                key={dIdx}
                                href={doc.downloadUrl || `/api/documents/download/${doc.download_token}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 text-blue-900 hover:underline font-medium truncate"
                              >
                                <Download className="w-3.5 h-3.5 shrink-0 text-orange-600" />
                                <span className="truncate">{doc.original_filename}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: ACCOUNT PROFILE */}
      {tab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Customer Account Profile
            </h2>
            <p className="text-xs text-slate-500">
              Update your full name, mobile number, email, and password. Account role remains strictly <strong className="text-slate-800">CUSTOMER</strong>.
            </p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 font-semibold text-slate-900 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Number / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 font-semibold text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 font-semibold text-slate-900 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password (leave blank to keep current)
              </label>
              <input
                type="password"
                placeholder="Enter new password (min 6 chars)"
                value={profilePassword}
                onChange={(e) => setProfilePassword(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 font-medium text-slate-900 text-xs"
              />
            </div>

            {profileSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-xs flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isUpdatingProfile ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
