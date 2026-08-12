import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, Download, Search, RefreshCw, CheckCircle, Clock, FileText, Phone, Filter, Eye, AlertTriangle, Printer, TrendingUp, Package, XCircle, History, ChevronDown, ChevronUp } from 'lucide-react';
import { OrderItem, BusinessInfo } from '../../types';

interface AdminDashboardPageProps {
  info: BusinessInfo;
  token: string;
  onLogout: () => void;
  navigate: (path: string) => void;
}

interface DashboardStats {
  totalOrders: number;
  pendingCount: number;
  confirmedCount: number;
  printingCount: number;
  readyCount: number;
  completedCount: number;
  cancelledCount: number;
  newOrdersCount: number;
  totalRevenue: number;
}

interface StatusHistoryEntry {
  id: number;
  order_id: string;
  previous_status: string | null;
  new_status: string;
  changed_by: string;
  changed_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900 border-amber-300',
  confirmed: 'bg-blue-100 text-blue-900 border-blue-300',
  printing: 'bg-indigo-100 text-indigo-900 border-indigo-300',
  ready: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  completed: 'bg-slate-900 text-white border-slate-700',
  cancelled: 'bg-red-100 text-red-900 border-red-300'
};

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ info, token, onLogout, navigate }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderHistory, setOrderHistory] = useState<StatusHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Debounce for search
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStats = useCallback(() => {
    setStatsLoading(true);
    fetch('/api/admin/dashboard/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stats) setStats(data.stats);
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [token]);

  const fetchOrders = useCallback((search: string, status: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (status && status !== 'all') params.set('status', status);
    params.set('limit', '200');

    fetch(`/api/admin/orders?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) { onLogout(); throw new Error('Session expired.'); }
        return res.json();
      })
      .then(data => {
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
          setError(null);
        } else {
          setError(data.message || 'Failed to load orders.');
        }
      })
      .catch(err => { if (err.message !== 'Session expired.') setError(err.message); })
      .finally(() => setLoading(false));
  }, [token, onLogout]);

  const handleRefresh = () => {
    fetchOrders(searchQuery, statusFilter);
    fetchStats();
    showToast('Dashboard refreshed');
  };

  useEffect(() => {
    fetchOrders('', 'all');
    fetchStats();
  }, [token]);

  // Debounced search
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchOrders(val, statusFilter);
    }, 400);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    fetchOrders(searchQuery, val);
  };

  const handleUpdateStatus = (orderId: string, newOrderStatus: string) => {
    fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ orderStatus: newOrderStatus })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Use the actual updated order from the API response (reflects DB truth)
          const updatedOrder = data.order;
          const savedStatus = updatedOrder?.order_status || newOrderStatus;
          setOrders(prev => prev.map(o =>
            (o.order_id === orderId || o.id === orderId)
              ? { ...o, ...(updatedOrder || {}), order_status: savedStatus }
              : o
          ));
          if (selectedOrder && (selectedOrder.order_id === orderId || selectedOrder.id === orderId)) {
            setSelectedOrder((prev: any) => prev ? { ...prev, ...(updatedOrder || {}), order_status: savedStatus } : null);
            fetchOrderHistory(orderId);
          }
          fetchStats();
          showToast(`Status updated to "${savedStatus}"`);
        } else {
          showToast('Failed to update status: ' + (data.message || 'Unknown error'));
        }
      })
      .catch(() => showToast('Network error updating status'));
  };


  const fetchOrderHistory = (orderId: string) => {
    setHistoryLoading(true);
    // Try to get the order_number from loaded orders
    const ord = orders.find(o => o.order_id === orderId || o.id === orderId);
    const lookupId = ord?.order_number || orderId;

    fetch(`/api/orders/${encodeURIComponent(lookupId)}/status-history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrderHistory(data.history || []);
      })
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  };

  const openOrderDetail = (ord: any) => {
    setSelectedOrder(ord);
    setOrderHistory([]);
    fetchOrderHistory(ord.order_id || ord.id);
  };

  const toggleRowExpand = (orderId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const getEmptyMessage = () => {
    if (searchQuery.trim()) return `No orders found matching "${searchQuery}".`;
    if (statusFilter !== 'all') return `No ${statusFilter} orders yet.`;
    return 'No orders found. Orders will appear here once customers place them.';
  };

  const statCards = [
    { label: 'Total Orders', value: stats?.totalOrders ?? '—', color: 'bg-white border-slate-200', textColor: 'text-slate-900', labelColor: 'text-slate-500' },
    { label: 'New Orders', value: stats?.newOrdersCount ?? '—', color: 'bg-amber-50 border-amber-200', textColor: 'text-amber-900', labelColor: 'text-amber-700' },
    { label: 'Pending', value: stats?.pendingCount ?? '—', color: 'bg-amber-100/60 border-amber-300', textColor: 'text-amber-950', labelColor: 'text-amber-900' },
    { label: 'Confirmed', value: stats?.confirmedCount ?? '—', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-900', labelColor: 'text-blue-700' },
    { label: 'Printing', value: stats?.printingCount ?? '—', color: 'bg-indigo-50 border-indigo-200', textColor: 'text-indigo-900', labelColor: 'text-indigo-700' },
    { label: 'Ready', value: stats?.readyCount ?? '—', color: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-900', labelColor: 'text-emerald-700' },
    { label: 'Completed', value: stats?.completedCount ?? '—', color: 'bg-teal-50 border-teal-200', textColor: 'text-teal-900', labelColor: 'text-teal-700' },
    { label: 'Total Sales', value: stats ? `₹${Number(stats.totalRevenue).toFixed(0)}` : '—', color: 'bg-slate-900 border-slate-700', textColor: 'text-orange-400', labelColor: 'text-slate-400', wide: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 selection:bg-orange-500 selection:text-white">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl text-xs font-bold animate-[slideIn_0.3s_ease-out]">
          {toast}
        </div>
      )}

      {/* Admin Navigation Bar */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold">Nithish Graphics Admin</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Print-Order Workflow & Document Management System</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: 'Dashboard', path: '/admin/dashboard', active: true },
            { label: 'Services', path: '/admin/services' },
            { label: 'Pricing', path: '/admin/pricing' },
            { label: 'Customers', path: '/admin/customers' },
            { label: 'Settings', path: '/admin/settings' },
          ].map(({ label, path, active }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${active ? 'bg-orange-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-xl text-xs font-semibold transition-colors ml-2 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
        {statCards.map(({ label, value, color, textColor, labelColor, wide }) => (
          <div key={label} className={`p-4 rounded-xl border shadow-xs ${color} ${wide ? 'col-span-2 sm:col-span-1' : ''}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${labelColor}`}>{label}</span>
            <p className={`text-xl font-extrabold mt-1 ${textColor} ${statsLoading ? 'animate-pulse' : ''}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            id="admin-order-search"
            type="text"
            placeholder="Search by Order ID, Name, Phone, Email..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 font-medium text-slate-900"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-xs font-bold text-slate-700 shrink-0">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-orange-500"
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
            onClick={handleRefresh}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders Count */}
      {!loading && !error && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{orders.length}</strong> orders
            {statusFilter !== 'all' && ` · Filtered: ${statusFilter}`}
            {searchQuery.trim() && ` · Search: "${searchQuery}"`}
          </span>
          {(searchQuery || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); fetchOrders('', 'all'); }}
              className="text-orange-600 hover:text-orange-800 font-semibold"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-xs">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-red-600 text-xs font-semibold">{error}</p>
            <button onClick={handleRefresh} className="text-xs text-orange-600 underline">Try again</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-500 text-sm font-semibold">{getEmptyMessage()}</p>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); fetchOrders('', 'all'); }}
                className="text-xs text-orange-600 underline"
              >
                Clear filters to see all orders
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Service & Options</th>
                  <th className="p-4">Files</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Change Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                {orders.map((ord) => {
                  const orderId = ord.order_id || ord.id || '';
                  const orderNum = ord.order_number || orderId;
                  const customerName = ord.customer_name || ord.customerName || 'N/A';
                  const phone = ord.customer_phone || ord.phone || 'N/A';
                  const email = ord.customer_email || '—';
                  const service = ord.service || ord.serviceType || 'Printing';
                  const price = ord.total_price || ord.totalAmount || 0;
                  const status = (ord.order_status || ord.status || 'Pending').toLowerCase();
                  const docs = ord.documents || [];
                  const isExpanded = expandedRows.has(orderId);

                  return (
                    <React.Fragment key={orderId}>
                      <tr className={`hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50/70' : ''}`}>
                        <td className="p-4">
                          <div className="font-bold text-slate-900 font-mono text-xs">{orderNum}</div>
                          {orderNum !== orderId && (
                            <div className="text-[10px] text-slate-400 font-mono">{orderId}</div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{customerName}</div>
                          <div className="text-slate-500">{phone}</div>
                          {email !== '—' && <div className="text-slate-400 text-[10px]">{email}</div>}
                        </td>
                        <td className="p-4 space-y-0.5">
                          <div className="font-semibold text-slate-800">{service} ({ord.quantity || 1} copies)</div>
                          <div className="text-slate-500">
                            {(ord.color_type || 'bw').toUpperCase()} | {ord.print_side || ''} | {ord.binding_type || ''}
                          </div>
                        </td>
                        <td className="p-4">
                          {docs.length === 0 ? (
                            <span className="text-slate-400">No upload</span>
                          ) : (
                            <div className="space-y-1">
                              {docs.slice(0, isExpanded ? docs.length : 2).map((doc: any, dIdx: number) => (
                                <a
                                  key={dIdx}
                                  href={doc.downloadUrl || `/api/documents/download/${doc.download_token}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 underline font-semibold truncate max-w-[150px]"
                                >
                                  <Download className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{doc.original_filename}</span>
                                </a>
                              ))}
                              {docs.length > 2 && !isExpanded && (
                                <button
                                  onClick={() => toggleRowExpand(orderId)}
                                  className="text-[10px] text-slate-500 hover:text-orange-600"
                                >
                                  +{docs.length - 2} more
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-slate-500">
                          {ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                        </td>
                        <td className="p-4 font-bold text-slate-900 text-sm">₹{price}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            (ord.payment_status || '').toLowerCase() === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}>
                            {ord.payment_status || 'Unpaid'}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={status}
                            onChange={(e) => handleUpdateStatus(orderId, e.target.value)}
                            className={`py-1 px-2.5 rounded-full text-xs font-bold capitalize border cursor-pointer ${STATUS_COLORS[status] || STATUS_COLORS.pending}`}
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
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => openOrderDetail(ord)}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs inline-flex items-center space-x-1"
                              title="View order detail"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => navigate(`/track-order?orderNumber=${orderNum}`)}
                              className="px-2.5 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg font-semibold text-xs"
                              title="Track order"
                            >
                              Track
                            </button>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Order Details
                </h3>
                <p className="text-xs font-mono text-orange-600 font-bold mt-0.5">
                  {selectedOrder.order_number || selectedOrder.order_id || selectedOrder.id}
                </p>
                <p className="text-xs text-slate-500">
                  Placed: {new Date(selectedOrder.created_at || selectedOrder.createdAt || '').toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Customer Info */}
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
                <span className="font-bold text-slate-900 text-sm">Customer Information</span>
                <p><strong>Name:</strong> {selectedOrder.customer_name || selectedOrder.customerName}</p>
                <p><strong>Phone:</strong> {selectedOrder.customer_phone || selectedOrder.phone}</p>
                {selectedOrder.customer_email && <p><strong>Email:</strong> {selectedOrder.customer_email}</p>}
              </div>

              {/* Print Parameters */}
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
                <span className="font-bold text-slate-900 text-sm">Print Parameters</span>
                <p><strong>Service:</strong> {selectedOrder.service || selectedOrder.serviceType}</p>
                <p><strong>Quantity:</strong> {selectedOrder.quantity || selectedOrder.copies} copies (Pages: {selectedOrder.pages_per_copy || selectedOrder.pagesPerCopy})</p>
                <p><strong>Print Type:</strong> {(selectedOrder.color_type || selectedOrder.printType || '').toUpperCase()}</p>
                <p><strong>Paper:</strong> {selectedOrder.paper_size || 'A4'} ({selectedOrder.paper_gsm || '70gsm'})</p>
                <p><strong>Sides:</strong> {selectedOrder.print_side || selectedOrder.sides}</p>
                <p><strong>Binding:</strong> {selectedOrder.binding_type || selectedOrder.bindingType}</p>
                {selectedOrder.additional_instructions && (
                  <p><strong>Notes:</strong> {selectedOrder.additional_instructions}</p>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <p className="text-sm font-bold text-blue-600">Total: ₹{selectedOrder.total_price || selectedOrder.totalAmount}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500">Status:</span>
                    <select
                      value={(selectedOrder.order_status || 'pending').toLowerCase()}
                      onChange={(e) => handleUpdateStatus(selectedOrder.order_id || selectedOrder.id, e.target.value)}
                      className={`py-1 px-2.5 rounded-full text-xs font-bold border cursor-pointer ${STATUS_COLORS[(selectedOrder.order_status || 'pending').toLowerCase()] || STATUS_COLORS.pending}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="printing">Printing</option>
                      <option value="ready">Ready</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-emerald-50 p-4 rounded-xl space-y-2 border border-emerald-200">
                <span className="font-bold text-emerald-900 text-sm">Uploaded Documents</span>
                {(selectedOrder.documents || []).length === 0 ? (
                  <p className="text-emerald-700">No documents attached.</p>
                ) : (
                  <div className="space-y-2 pt-1">
                    {(selectedOrder.documents || []).map((doc: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 bg-white border border-emerald-300 rounded-lg">
                        <div className="truncate pr-2">
                          <span className="font-semibold text-slate-900 block truncate">{doc.original_filename}</span>
                          <span className="text-[10px] text-slate-500">{doc.mime_type} · {(Number(doc.file_size || 0) / 1024).toFixed(0)} KB</span>
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

              {/* Status History */}
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
                <span className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <History className="w-4 h-4 text-slate-600" />
                  <span>Status History</span>
                </span>
                {historyLoading ? (
                  <p className="text-slate-500 text-xs">Loading history...</p>
                ) : orderHistory.length === 0 ? (
                  <p className="text-slate-500 text-xs">No status changes recorded yet.</p>
                ) : (
                  <div className="space-y-2 pt-1">
                    {orderHistory.map((entry, idx) => (
                      <div key={entry.id} className="flex items-start space-x-2 text-xs">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 ${
                          idx === orderHistory.length - 1 ? 'bg-orange-500' : 'bg-emerald-500'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 bg-white rounded-lg p-2 border border-slate-200">
                          <div className="flex justify-between">
                            <span>
                              {entry.previous_status && <span className="text-slate-500">{entry.previous_status} → </span>}
                              <span className="font-bold text-slate-800">{entry.new_status}</span>
                              <span className="text-slate-400 ml-1">· {entry.changed_by}</span>
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              {new Date(entry.changed_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
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
