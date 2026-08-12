import React, { useState, useEffect } from 'react';
import { Shield, Download, Search, RefreshCw, CheckCircle, Clock, FileText, Phone, DollarSign, Filter, Eye, AlertTriangle } from 'lucide-react';
import { OrderItem, BusinessInfo } from '../../types';

interface AdminDashboardPageProps {
  info: BusinessInfo;
  token: string;
  onLogout: () => void;
  navigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ info, token, onLogout, navigate }) => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    fetch('/api/admin/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          onLogout();
          throw new Error('Session expired.');
        }
        return res.json();
      })
      .then(data => {
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setError(data.message || 'Failed to load orders.');
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const handleUpdateStatus = (orderId: string, newOrderStatus: string, newPaymentStatus?: string) => {
    fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ orderStatus: newOrderStatus, paymentStatus: newPaymentStatus })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchOrders();
          if (selectedOrder && (selectedOrder.order_id === orderId || selectedOrder.id === orderId)) {
            setSelectedOrder(prev => prev ? { ...prev, order_status: newOrderStatus, payment_status: newPaymentStatus || prev.payment_status } : null);
          }
        }
      })
      .catch(() => {});
  };

  // Filtered orders list
  const filteredOrders = orders.filter(ord => {
    const id = ord.order_id || ord.id || '';
    const name = ord.customer_name || ord.customerName || '';
    const phone = ord.customer_phone || ord.phone || '';
    const status = (ord.order_status || ord.status || '').toLowerCase();

    const matchesSearch = id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics summary
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter(o => (o.order_status || o.status || '').toLowerCase() === 'pending').length;
  const printingCount = orders.filter(o => ['confirmed', 'printing'].includes((o.order_status || o.status || '').toLowerCase())).length;
  const completedCount = orders.filter(o => ['ready', 'completed', 'delivered'].includes((o.order_status || o.status || '').toLowerCase())).length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_price || o.totalAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Navigation Bar */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold">Nithish Graphics Store Admin</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Incoming Orders & Document Management Dashboard
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md"
          >
            Orders
          </button>
          <button
            onClick={() => navigate('/admin/pricing')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Pricing Management
          </button>
          <button
            onClick={() => navigate('/admin/settings')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Store Settings
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-xl text-xs font-semibold transition-colors ml-2"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold uppercase">Total Orders</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalOrdersCount}</p>
        </div>
        <div className="bg-amber-50 p-5 rounded-xl border border-amber-200 shadow-xs">
          <span className="text-xs text-amber-800 font-bold uppercase">Pending</span>
          <p className="text-2xl font-extrabold text-amber-900 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 shadow-xs">
          <span className="text-xs text-blue-800 font-bold uppercase">In Printing</span>
          <p className="text-2xl font-extrabold text-blue-900 mt-1">{printingCount}</p>
        </div>
        <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-xs text-emerald-800 font-bold uppercase">Completed</span>
          <p className="text-2xl font-extrabold text-emerald-900 mt-1">{completedCount}</p>
        </div>
        <div className="bg-slate-900 text-white p-5 rounded-xl col-span-2 md:col-span-1 shadow-xs">
          <span className="text-xs text-slate-400 font-bold uppercase">Total Revenue</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">₹{totalRevenue.toFixed(0)}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Order ID, Name, Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="printing">Printing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={fetchOrders}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No orders match your filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Service & Options</th>
                  <th className="p-4">Original Files</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                {filteredOrders.map((ord) => {
                  const orderId = ord.order_id || ord.id || '';
                  const customerName = ord.customer_name || ord.customerName || 'N/A';
                  const phone = ord.customer_phone || ord.phone || 'N/A';
                  const service = ord.service || ord.serviceType || 'Printing';
                  const price = ord.total_price || ord.totalAmount || 0;
                  const status = (ord.order_status || ord.status || 'Pending').toLowerCase();
                  const docs = ord.documents || [];

                  return (
                    <tr key={orderId} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-900 font-mono">{orderId}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{customerName}</div>
                        <div className="text-slate-500">{phone}</div>
                      </td>
                      <td className="p-4 space-y-0.5">
                        <div className="font-semibold text-slate-800">{service} ({ord.quantity || ord.copies || 1} copies)</div>
                        <div className="text-slate-500">
                          {(ord.color_type || ord.printType || 'bw').toUpperCase()} | {ord.print_side || ord.sides} | {ord.binding_type || ord.bindingType}
                        </div>
                      </td>
                      <td className="p-4">
                        {docs.length === 0 ? (
                          <span className="text-slate-400">No upload</span>
                        ) : (
                          <div className="space-y-1">
                            {docs.map((doc, dIdx) => (
                              <a
                                key={dIdx}
                                href={doc.downloadUrl || `/api/documents/download/${doc.download_token}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 underline font-semibold truncate max-w-xs"
                              >
                                <Download className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{doc.original_filename}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-900 text-sm">₹{price}</td>
                      <td className="p-4">
                        <select
                          value={status}
                          onChange={(e) => handleUpdateStatus(orderId, e.target.value)}
                          className={`py-1 px-2.5 rounded-full text-xs font-bold capitalize border border-transparent ${
                            status === 'pending' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                            status === 'confirmed' ? 'bg-blue-100 text-blue-900 border-blue-300' :
                            status === 'printing' ? 'bg-indigo-100 text-indigo-900 border-indigo-300' :
                            status === 'ready' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                            status === 'completed' ? 'bg-slate-900 text-white' :
                            'bg-red-100 text-red-900 border-red-300'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="printing">Printing</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Order Details #{selectedOrder.order_id || selectedOrder.id}
                </h3>
                <p className="text-xs text-slate-500">Created: {new Date(selectedOrder.created_at || selectedOrder.createdAt || '').toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
                <span className="font-bold text-slate-900 text-sm">Customer Info</span>
                <p><strong>Name:</strong> {selectedOrder.customer_name || selectedOrder.customerName}</p>
                <p><strong>Phone:</strong> {selectedOrder.customer_phone || selectedOrder.phone}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
                <span className="font-bold text-slate-900 text-sm">Print Parameters</span>
                <p><strong>Service:</strong> {selectedOrder.service || selectedOrder.serviceType}</p>
                <p><strong>Quantity:</strong> {selectedOrder.quantity || selectedOrder.copies} copies (Pages: {selectedOrder.pages_per_copy || selectedOrder.pagesPerCopy})</p>
                <p><strong>Print Type:</strong> {(selectedOrder.color_type || selectedOrder.printType || '').toUpperCase()}</p>
                <p><strong>Paper Size & GSM:</strong> {selectedOrder.paper_size || 'A4'} ({selectedOrder.paper_gsm || selectedOrder.paperGsm || '70gsm'})</p>
                <p><strong>Sides:</strong> {selectedOrder.print_side || selectedOrder.sides}</p>
                <p><strong>Binding:</strong> {selectedOrder.binding_type || selectedOrder.bindingType}</p>
                {selectedOrder.additional_instructions && (
                  <p><strong>Notes:</strong> {selectedOrder.additional_instructions}</p>
                )}
                <p className="text-sm font-bold text-blue-600 pt-2 border-t border-slate-200">Total Price: ₹{selectedOrder.total_price || selectedOrder.totalAmount}</p>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl space-y-2 border border-emerald-200">
                <span className="font-bold text-emerald-900 text-sm">Original Uploaded Documents</span>
                {(selectedOrder.documents || []).length === 0 ? (
                  <p className="text-emerald-700">No original documents attached.</p>
                ) : (
                  <div className="space-y-2 pt-1">
                    {(selectedOrder.documents || []).map((doc, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 bg-white border border-emerald-300 rounded-lg">
                        <div className="truncate pr-2">
                          <span className="font-semibold text-slate-900 block truncate">{doc.original_filename}</span>
                          <span className="text-[10px] text-slate-500">{doc.mime_type} • {(Number(doc.file_size || 0) / 1024).toFixed(0)} KB</span>
                        </div>
                        <a
                          href={doc.downloadUrl || `/api/documents/download/${doc.download_token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center space-x-1 shrink-0 shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
