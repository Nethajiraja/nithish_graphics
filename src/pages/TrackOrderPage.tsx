import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, Clock, CheckCircle, Printer, Truck, XCircle, RefreshCw, AlertCircle, ArrowRight, MapPin } from 'lucide-react';
import { BusinessInfo } from '../types';

interface TrackOrderPageProps {
  info: BusinessInfo;
  navigate: (path: string) => void;
}

interface OrderStatus {
  order_id: string;
  order_number: string;
  customer_name: string;
  service: string;
  quantity: number;
  total_price: number;
  payment_status: string;
  order_status: string;
  created_at: string;
  updated_at: string;
}

interface StatusHistory {
  id: number;
  order_id: string;
  previous_status: string | null;
  new_status: string;
  changed_by: string;
  changed_at: string;
}

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Printing', 'Ready', 'Completed'];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.FC<any>; description: string }> = {
  pending: {
    label: 'Pending',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    icon: Clock,
    description: 'Your order has been received and is awaiting confirmation.'
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    icon: CheckCircle,
    description: 'Your order has been confirmed and will be processed shortly.'
  },
  printing: {
    label: 'Printing',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-300',
    icon: Printer,
    description: 'Your documents are currently being printed.'
  },
  ready: {
    label: 'Ready for Pickup',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    icon: Truck,
    description: 'Your order is ready! Please come to the store to collect it.'
  },
  completed: {
    label: 'Completed',
    color: 'text-slate-700',
    bg: 'bg-slate-900',
    border: 'border-slate-700',
    icon: CheckCircle,
    description: 'Your order has been completed. Thank you for choosing Nithish Graphics!'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-300',
    icon: XCircle,
    description: 'This order has been cancelled. Please contact us for assistance.'
  }
};

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ info, navigate }) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderStatus | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const searchedRef = useRef<{ orderNumber: string; phone: string } | null>(null);

  // Pre-fill from URL query params (e.g. coming from order success page)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('orderId') || params.get('orderNumber') || '';
    const phoneParam = params.get('phone') || '';
    if (idParam) setOrderNumber(idParam.toUpperCase());
    if (phoneParam) setPhone(phoneParam);
    if (idParam && phoneParam) {
      // Auto-submit if both are pre-filled
      setTimeout(() => {
        fetchOrder(idParam.toUpperCase(), phoneParam);
      }, 500);
    }
  }, []);

  const fetchOrder = async (num: string, ph: string, silent = false) => {
    if (!num.trim() || !ph.trim()) return;
    if (!silent) setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(num.trim().toUpperCase())}&phone=${encodeURIComponent(ph.trim())}`
      );
      const data = await res.json();

      if (data.success && data.order) {
        setOrderData(data.order);
        setStatusHistory(data.history || []);
        setLastRefreshed(new Date());
        searchedRef.current = { orderNumber: num, phone: ph };
      } else {
        if (!silent) {
          setError(data.message || 'Order not found. Please verify your Order ID and mobile number.');
          setOrderData(null);
          setStatusHistory([]);
        }
      }
    } catch (err: any) {
      if (!silent) {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderNumber, phone);
  };

  // Start polling after successful search
  useEffect(() => {
    if (orderData && searchedRef.current) {
      // Poll every 15 seconds
      pollingRef.current = setInterval(() => {
        if (searchedRef.current) {
          fetchOrder(searchedRef.current.orderNumber, searchedRef.current.phone, true);
        }
      }, 15000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [orderData?.order_number]);

  const currentStatusKey = (orderData?.order_status || '').toLowerCase();
  const isCancelled = currentStatusKey === 'cancelled';
  const currentStatusIndex = ORDER_STATUSES.findIndex(s => s.toLowerCase() === currentStatusKey);
  const statusCfg = STATUS_CONFIG[currentStatusKey] || STATUS_CONFIG['pending'];
  const StatusIcon = statusCfg.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-orange-600/20 border border-orange-500/30 rounded-full px-4 py-1.5 text-orange-300 text-xs font-bold uppercase tracking-wider">
            <Package className="w-3.5 h-3.5" />
            <span>Real-Time Order Tracking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Track Your <span className="text-orange-400">Print Order</span>
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Enter your Order ID and registered mobile number to see the current status of your print order at Nithish Graphics.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
          <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center space-x-2">
            <Search className="w-4 h-4 text-orange-600" />
            <span>Track Your Order</span>
          </h2>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Order ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. NG-2026-00001"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
                <p className="text-[10px] text-slate-500 mt-1">Format: NG-YYYY-NNNNN</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
                <p className="text-[10px] text-slate-500 mt-1">Registered mobile number for verification</p>
              </div>
            </div>

            {error && (
              <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Track Order</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Result */}
        {orderData && (
          <div className="space-y-6 animate-[fadeIn_0.4s_ease-in]">
            {/* Current Status Banner */}
            <div className={`rounded-2xl border-2 p-6 shadow-sm ${isCancelled ? 'bg-red-50 border-red-300' : currentStatusKey === 'completed' ? 'bg-slate-900 border-slate-700' : `${statusCfg.bg} ${statusCfg.border}`}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${currentStatusKey === 'completed' ? 'bg-orange-600' : 'bg-white shadow-sm'}`}>
                    <StatusIcon className={`w-6 h-6 ${currentStatusKey === 'completed' ? 'text-white' : statusCfg.color}`} />
                  </div>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${currentStatusKey === 'completed' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Current Status
                    </p>
                    <p className={`text-xl font-extrabold ${currentStatusKey === 'completed' ? 'text-white' : statusCfg.color}`}>
                      {statusCfg.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${currentStatusKey === 'completed' ? 'text-slate-300' : 'text-slate-600'}`}>
                      {statusCfg.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-bold ${currentStatusKey === 'completed' ? 'text-slate-400' : 'text-slate-500'}`}>Order ID</p>
                  <p className={`text-base font-mono font-extrabold ${currentStatusKey === 'completed' ? 'text-orange-400' : 'text-slate-900'}`}>
                    {orderData.order_number}
                  </p>
                  {lastRefreshed && (
                    <p className={`text-[10px] mt-1 ${currentStatusKey === 'completed' ? 'text-slate-500' : 'text-slate-400'}`}>
                      Updated: {lastRefreshed.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            {!isCancelled && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Order Progress</h3>
                <div className="relative">
                  {/* Progress Line */}
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
                      const isPending = idx > currentStatusIndex;
                      const cfg = STATUS_CONFIG[status.toLowerCase()];

                      return (
                        <div key={status} className="flex flex-col items-center text-center gap-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                            isDone
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                              : isCurrent
                              ? 'bg-orange-500 border-orange-500 text-white shadow-lg ring-4 ring-orange-200 animate-pulse'
                              : 'bg-white border-slate-300 text-slate-400'
                          }`}>
                            {isDone ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : isCurrent ? (
                              <cfg.icon className="w-5 h-5" />
                            ) : (
                              <span className="text-xs font-bold">{idx + 1}</span>
                            )}
                          </div>
                          <div>
                            <p className={`text-[10px] font-bold leading-tight ${isCurrent ? 'text-orange-600' : isDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                              {status}
                            </p>
                            {isDone && <p className="text-[9px] text-emerald-600 font-semibold">✓ Done</p>}
                            {isCurrent && <p className="text-[9px] text-orange-600 font-semibold animate-pulse">● Active</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Cancelled State */}
            {isCancelled && (
              <div className="bg-red-50 rounded-2xl border border-red-300 p-6 flex items-center space-x-4">
                <XCircle className="w-8 h-8 text-red-600 shrink-0" />
                <div>
                  <p className="font-bold text-red-800 text-sm">Order Cancelled</p>
                  <p className="text-xs text-red-600 mt-1">This order has been cancelled. Please contact our store for assistance.</p>
                  <a
                    href={`tel:${info.phone}`}
                    className="inline-flex items-center space-x-1 mt-2 text-xs font-bold text-red-700 hover:text-red-900"
                  >
                    <span>Call {info.phone}</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Order Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">Order Information</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Order ID</span>
                    <span className="font-mono font-bold text-slate-900">{orderData.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer</span>
                    <span className="font-semibold text-slate-900">{orderData.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service</span>
                    <span className="font-semibold text-slate-900">{orderData.service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quantity</span>
                    <span className="font-semibold text-slate-900">{orderData.quantity} {orderData.quantity === 1 ? 'copy' : 'copies'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Order Date</span>
                    <span className="font-semibold text-slate-900">
                      {new Date(orderData.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">Payment & Amount</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Amount</span>
                    <span className="font-bold text-lg text-blue-600">₹{Number(orderData.total_price).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Payment Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      (orderData.payment_status || '').toLowerCase() === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {orderData.payment_status || 'Unpaid'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Order Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      currentStatusKey === 'completed' ? 'bg-slate-900 text-white' :
                      currentStatusKey === 'cancelled' ? 'bg-red-100 text-red-800' :
                      currentStatusKey === 'ready' ? 'bg-emerald-100 text-emerald-800' :
                      currentStatusKey === 'printing' ? 'bg-indigo-100 text-indigo-800' :
                      currentStatusKey === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {statusCfg.label}
                    </span>
                  </div>
                </div>

                {/* Store Info */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-start space-x-2 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-orange-500" />
                    <span>{info.address}, {info.city}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status History Timeline */}
            {statusHistory.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Status History</h3>
                <div className="space-y-3">
                  {statusHistory.map((entry, idx) => (
                    <div key={entry.id} className="flex items-start space-x-3 text-xs">
                      <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-[10px] font-bold ${
                        idx === statusHistory.length - 1 ? 'bg-orange-500' : 'bg-slate-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex justify-between items-start">
                          <div>
                            {entry.previous_status && (
                              <span className="text-slate-500">{entry.previous_status} →&nbsp;</span>
                            )}
                            <span className={`font-bold ${idx === statusHistory.length - 1 ? 'text-orange-700' : 'text-slate-700'}`}>
                              {entry.new_status}
                            </span>
                          </div>
                          <span className="text-slate-400 text-[10px]">
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

            {/* Auto-refresh Notice */}
            <div className="flex items-center justify-between text-xs text-slate-500 bg-white rounded-xl border border-slate-200 px-4 py-3">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" style={{ animationDuration: '3s' }} />
                <span>Status refreshes automatically every 15 seconds</span>
              </div>
              <button
                onClick={() => searchedRef.current && fetchOrder(searchedRef.current.orderNumber, searchedRef.current.phone)}
                className="text-orange-600 hover:text-orange-800 font-semibold"
              >
                Refresh Now
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/order')}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                Place New Order
              </button>
              <button
                onClick={() => navigate('/customer/orders')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                My Order History
              </button>
              <a
                href={`tel:${info.phone}`}
                className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-all"
              >
                Call Store: {info.phone}
              </a>
            </div>
          </div>
        )}

        {/* Help Section (shown when no result yet) */}
        {!orderData && !isLoading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Where to find your Order ID?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
              <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                <div>
                  <p className="font-semibold text-slate-800 mb-0.5">Order Confirmation Page</p>
                  <p>Your Order ID (e.g. NG-2026-00001) was shown after placing your order successfully.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                <div>
                  <p className="font-semibold text-slate-800 mb-0.5">Customer Dashboard</p>
                  <p>Login to your account and visit <button onClick={() => navigate('/customer/orders')} className="text-orange-600 underline">My Orders</button> to find all your order IDs.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                <div>
                  <p className="font-semibold text-slate-800 mb-0.5">WhatsApp Message</p>
                  <p>The Order ID was included in the WhatsApp message sent when you placed your order.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">4</div>
                <div>
                  <p className="font-semibold text-slate-800 mb-0.5">Call Us</p>
                  <p>Can't find your Order ID? Call us at <a href={`tel:${info.phone}`} className="text-orange-600 font-bold">{info.phone}</a> for help.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
