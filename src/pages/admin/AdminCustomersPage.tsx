import React, { useState, useEffect } from 'react';
import { Shield, Search, RefreshCw, Users, ShoppingBag, DollarSign, Ban, CheckCircle, Eye, Calendar, Phone, Mail } from 'lucide-react';
import { BusinessInfo, CustomerDetail } from '../../types';

interface AdminCustomersPageProps {
  info: BusinessInfo;
  token: string;
  onLogout: () => void;
  navigate: (path: string) => void;
}

export const AdminCustomersPage: React.FC<AdminCustomersPageProps> = ({ info, token, onLogout, navigate }) => {
  const [customers, setCustomers] = useState<CustomerDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);

  const fetchCustomers = () => {
    setLoading(true);
    fetch('/api/admin/customers', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          onLogout();
          throw new Error('Session expired.');
        }
        return res.json();
      })
      .then(data => {
        if (data.success && Array.isArray(data.customers)) {
          setCustomers(data.customers);
        } else {
          setError(data.message || 'Failed to load customers.');
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, [token]);

  const handleToggleStatus = (id: number | string, currentStatus?: boolean) => {
    const nextStatus = currentStatus === false ? true : false;
    fetch(`/api/admin/customers/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ isActive: nextStatus })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchCustomers();
        }
      });
  };

  const filteredCustomers = customers.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(query) ||
      (c.email || '').toLowerCase().includes(query) ||
      (c.phone || '').includes(query)
    );
  });

  const totalCustomersCount = customers.length;
  const activeCustomersCount = customers.filter(c => c.is_active !== false).length;
  const totalCustomerRevenue = customers.reduce((sum, c) => sum + Number(c.totalSpend || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 selection:bg-orange-500 selection:text-white">
      {/* Admin Navigation Bar */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold">Nithish Graphics Print Business Admin</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Customer Directory & Account Authorization Management
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
          >
            Dashboard & Orders
          </button>
          <button
            onClick={() => navigate('/admin/customers')}
            className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md"
          >
            Customers Management
          </button>
          <button
            onClick={() => navigate('/admin/pricing')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
          >
            Pricing Matrix
          </button>
          <button
            onClick={() => navigate('/admin/settings')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-900 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase">Total Customers</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalCustomersCount}</p>
          </div>
        </div>

        <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-emerald-800 font-bold uppercase">Active Accounts</span>
            <p className="text-2xl font-extrabold text-emerald-900 mt-0.5">{activeCustomersCount}</p>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-xl shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-orange-600 text-white rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Total Customer Spend</span>
            <p className="text-2xl font-extrabold text-orange-400 mt-0.5">₹{totalCustomerRevenue.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Search & Refresh Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search customer by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 font-medium text-slate-900"
          />
        </div>

        <button
          onClick={fetchCustomers}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Customers</span>
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No registered customers match your search query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Contact Phone</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Total Orders</th>
                  <th className="p-4">Total Spending</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                {filteredCustomers.map(cust => (
                  <tr key={cust.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{cust.name}</td>
                    <td className="p-4 font-mono">{cust.phone}</td>
                    <td className="p-4 text-slate-600">{cust.email}</td>
                    <td className="p-4 font-bold text-slate-900">{cust.orderCount || 0} orders</td>
                    <td className="p-4 font-bold text-orange-600">₹{Number(cust.totalSpend || 0).toFixed(0)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        cust.is_active !== false ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
                      }`}>
                        {cust.is_active !== false ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>History</span>
                      </button>

                      <button
                        onClick={() => handleToggleStatus(cust.id, cust.is_active)}
                        className={`px-2.5 py-1 rounded-lg font-semibold text-xs inline-flex items-center space-x-1 cursor-pointer ${
                          cust.is_active !== false
                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>{cust.is_active !== false ? 'Disable' : 'Enable'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail & Order History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Customer Profile: {selectedCustomer.name}
                </h3>
                <p className="text-slate-500">Registered: {new Date(selectedCustomer.created_at || '').toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <p><strong>Mobile / WhatsApp:</strong> {selectedCustomer.phone}</p>
              <p><strong>Email Address:</strong> {selectedCustomer.email}</p>
              <p><strong>Total Orders Placed:</strong> {selectedCustomer.orderCount || 0}</p>
              <p className="text-orange-600 font-bold text-sm">Total Spend: ₹{selectedCustomer.totalSpend || 0}</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase text-[11px]">Recent Orders</h4>
              {(!selectedCustomer.recentOrders || selectedCustomer.recentOrders.length === 0) ? (
                <p className="text-slate-500">No orders recorded for this customer.</p>
              ) : (
                <div className="space-y-2">
                  {selectedCustomer.recentOrders.map(ord => (
                    <div key={ord.order_id || ord.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                      <div>
                        <span className="font-bold font-mono text-slate-900">#{ord.order_id || ord.id}</span>
                        <p className="text-slate-500">{ord.service || ord.serviceType} • ₹{ord.total_price || ord.totalAmount}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-bold uppercase text-[10px]">
                        {ord.order_status || ord.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
