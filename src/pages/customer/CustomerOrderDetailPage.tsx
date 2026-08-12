import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Package, CheckCircle, Clock, Printer, Truck, XCircle, Download, FileText, RefreshCw, Phone as PhoneIcon } from 'lucide-react';
import { BusinessInfo, CustomerUser } from '../../types';

interface CustomerOrderDetailPageProps {
  info: BusinessInfo;
  user: CustomerUser;
  token: string;
  orderNumber: string;
  navigate: (path: string) => void;
  onLogout: () => void;
}

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Printing', 'Ready', 'Completed'];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.FC<any> }> = {
  pending:   { label: 'Pending',           color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-300',  icon: Clock },
  confirmed: { label: 'Confirmed',          color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-300',   icon: CheckCircle },
  printing:  { label: 'Printing',           color: 'text-indigo-700',  bg: 'bg-indigo-50',  border: 'border-indigo-300', icon: Printer },
  ready:     { label: 'Ready for Pickup',   color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300',icon: Truck },
  completed: { label: 'Completed',          color: 'text-white',       bg: 'bg-slate-900',  border: 'border-slate-700',  icon: CheckCircle },
  cancelled: { label: 'Cancelled',          color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-300',    icon: XCircle }
};

export const CustomerOrderDetailPage: React.FC<CustomerOrderDetailPageProps> = ({
  info, user, token, orderNumber, navigate, onLogout
}) => {
  const [order, setOrder] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrderDetail = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await fetch(`/api/customer/orders/${encodeURIComponent(orderNumber)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setHistory(data.history || []);
        setLastRefreshed(new Date());
        if (!silent) setError(null);
      } else {
        if (!silent) setError(data.message || 'Failed to load order details.');
      }
    } catch (err: any) {
      if (!silent) setError(err.message || 'Network error.');
    } finally {
      if (!silent) setLoading(false);
      else setIsRefreshing(false);
    }
  }, [orderNumber, token, onLogout]);

  // Initial load
  useEffect(() => {
    fetchOrderDetail(false);
  }, [fetchOrderDetail]);

  // Real-time status polling: poll lightweight status endpoint every 20 seconds
  // When admin changes status, customer sees it within 20s without full reload
  useEffect(() => {
    if (!order) return;
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/status`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.order_status && order) {
          // Only re-fetch full order if status changed (to update history too)
          if (data.order_status !== order.order_status) {
            fetchOrderDetail(true);
          } else {
            setLastRefreshed(new Date());
          }
        }
      } catch (_) {}
    }, 20000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [order?.order_number, order?.order_status, fetchOrderDetail, orderNumber]);

  const handleRefresh = () => fetchOrderDetail(true);

  const currentStatusKey = (order?.order_status || '').toLowerCase();
  const currentStatusIndex = ORDER_STATUSES.findIndex(s => s.toLowerCase() === currentStatusKey);
  const isCancelled = currentStatusKey === 'cancelled';
  const statusCfg = STATUS_CONFIG[currentStatusKey] || STATUS_CONFIG['pending'];
  const StatusIcon = statusCfg.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
          <p className="text-sm text-slate-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md text-center space-y-4">
          <XCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="font-bold text-slate-900">Order Not Found</h2>
          <p className="text-sm text-slate-600">{error || 'This order could not be found or you do not have permission to view it.'}</p>
          <button
            onClick={() => navigate('/customer/orders')}
            className="px-6 py-2.5 bg-orange-600 text-white font-bold rounded-xl text-sm hover:bg-orange-700 transition-all"
          >
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/customer/orders')}
            className="flex items-center space-x-2 text-slate-300 hover:text-white text-xs font-semibold mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Orders</span>
          </button>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Order Details</p>
              <h1 className="text-xl font-extrabold text-white font-mono">{order.order_number}</h1>
              <p className="text-xs text-slate-300 mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={`px-4 py-2 rounded-xl border text-sm font-bold ${statusCfg.bg} ${statusCfg.border} ${statusCfg.color}`}>
                {statusCfg.label}
              </div>
              {/* Refresh Status button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-all"
                title="Refresh order status from database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh Status'}</span>
              </button>
              {lastRefreshed && (
                <span className="text-[10px] text-slate-400">
                  Updated: {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Status Timeline — always generated from actual DB status */}
        {!isCancelled ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-6">Order Progress</h2>
            <div className="relative">
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200 z-0 hidden sm:block" />
              <div
                className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-orange-500 to-emerald-500 z-0 hidden sm:block transition-all duration-700"
                style={{
                  width: currentStatusIndex >= 0
                    ? `${(currentStatusIndex / (ORDER_STATUSES.length - 1)) * (100 - (10 / ORDER_STATUSES.length))}%`
                    : '0%'
                }}
              />
              <div className="grid grid-cols-5 gap-2 relative z-10">
                {ORDER_STATUSES.map((status, idx) => {
                  const isDone = idx < currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;
                  const cfg = STATUS_CONFIG[status.toLowerCase()];
                  return (
                    <div key={status} className="flex flex-col items-center text-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isDone    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                        : isCurrent ? 'bg-orange-500 border-orange-500 text-white shadow-lg ring-4 ring-orange-200 animate-pulse'
                        : 'bg-white border-slate-300 text-slate-400'
                      }`}>
                        {isDone ? <CheckCircle className="w-5 h-5" />
                          : isCurrent ? <cfg.icon className="w-5 h-5" />
                          : <span className="text-xs font-bold">{idx + 1}</span>}
                      </div>
                      <p className={`text-[10px] font-bold ${isCurrent ? 'text-orange-600' : isDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {status}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Cancelled order timeline */
          <div className="bg-red-50 rounded-2xl border-2 border-red-300 p-6">
            <div className="flex items-center space-x-3 text-red-700">
              <XCircle className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold text-sm">Order Cancelled</p>
                <p className="text-xs text-red-600 mt-0.5">This order has been cancelled. Please contact the store for assistance.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">Order Information</h2>
            <div className="space-y-2.5 text-xs">
              {[
                ['Order ID',       order.order_number,                                                      'font-mono font-bold text-orange-700'],
                ['Customer',       order.customer_name,                                                      'font-semibold'],
                ['Mobile',         order.customer_phone,                                                     'font-mono'],
                ['Service',        order.service,                                                            'font-semibold'],
                ['Quantity',       `${order.quantity} ${order.quantity === 1 ? 'copy' : 'copies'}`,          ''],
                ['Pages per Copy', order.pages_per_copy,                                                     ''],
                ['Print Type',     (order.color_type || '').toUpperCase(),                                   'uppercase'],
                ['Paper Size',     `${order.paper_size || 'A4'} (${order.paper_gsm || '70gsm'})`,           ''],
                ['Print Side',     order.print_side === 'double' ? 'Double Sided' : 'Single Sided',         ''],
                ['Binding',        order.binding_type,                                                       ''],
              ].map(([label, value, cls]) => (
                <div key={String(label)} className="flex justify-between items-baseline gap-2">
                  <span className="text-slate-500 shrink-0">{label}</span>
                  <span className={`text-slate-900 text-right ${cls}`}>{String(value || '—')}</span>
                </div>
              ))}
              {order.additional_instructions && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-slate-500 mb-1">Special Instructions</p>
                  <p className="text-slate-800 bg-slate-50 rounded-lg p-2 border border-slate-200">{order.additional_instructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment & Status */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">Payment Details</h2>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Total Amount</span>
                  <span className="text-2xl font-extrabold text-blue-600">₹{Number(order.total_price).toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Payment Status</span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    (order.payment_status || '').toLowerCase() === 'paid'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {order.payment_status || 'Unpaid'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Order Status</span>
                  {/* Status badge — always reads from order.order_status from backend */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusCfg.bg} ${statusCfg.border} border ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                </div>
                {lastRefreshed && (
                  <p className="text-[10px] text-slate-400 text-right">
                    Status synced: {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quick Actions</h2>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Status</span>
              </button>
              <button
                onClick={() => navigate(`/track-order?orderNumber=${order.order_number}&phone=${user.phone || ''}`)}
                className="w-full px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-300 font-bold rounded-xl text-xs transition-all flex items-center justify-center space-x-2"
              >
                <Package className="w-4 h-4" />
                <span>Track This Order</span>
              </button>
              <button
                onClick={() => navigate('/order')}
                className="w-full px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all"
              >
                Place New Order
              </button>
              <a
                href={`tel:${info.phone}`}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 hover:bg-slate-50 transition-all"
              >
                <PhoneIcon className="w-3.5 h-3.5" />
                <span>Call Store: {info.phone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Uploaded Documents */}
        {(order.documents || []).length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
              Uploaded Documents ({order.documents.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {order.documents.map((doc: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{doc.original_filename}</p>
                      <p className="text-[10px] text-slate-500">{doc.mime_type} · {(Number(doc.file_size || 0) / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                  <a
                    href={doc.downloadUrl || `/api/documents/download/${doc.download_token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shrink-0"
                    title="Download file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status History — shows the complete audit trail from order_status_history table */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
              Status History
            </h2>
            <div className="space-y-2">
              {history.map((entry: any, idx: number) => (
                <div key={entry.id} className="flex items-start space-x-3 text-xs">
                  <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-white text-[9px] font-bold mt-0.5 ${
                    idx === history.length - 1 ? 'bg-orange-500' : 'bg-emerald-500'
                  }`}>
                    {idx === history.length - 1 ? '●' : '✓'}
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        {entry.previous_status && (
                          <span className="text-slate-500 capitalize">{entry.previous_status} → </span>
                        )}
                        <span className={`font-bold capitalize ${idx === history.length - 1 ? 'text-orange-700' : 'text-emerald-700'}`}>
                          {entry.new_status}
                        </span>
                        {entry.changed_by && (
                          <span className="text-slate-400 ml-1.5">by {entry.changed_by}</span>
                        )}
                      </div>
                      <span className="text-slate-400 text-[10px] shrink-0">
                        {new Date(entry.changed_at).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
