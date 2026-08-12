import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, KeyRound, AlertCircle, Phone } from 'lucide-react';
import { BusinessInfo, CustomerUser } from '../../types';

interface LoginPageProps {
  info: BusinessInfo;
  onLoginSuccess: (user: CustomerUser, token: string) => void;
  navigate: (path: string) => void;
  redirectPath?: string;
  noticeMessage?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ info, onLoginSuccess, navigate, redirectPath, noticeMessage }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError('Please enter your email or mobile number and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password })
      });

      const data = await res.json();
      if (data.success && data.token && data.user) {
        localStorage.setItem('customer_token', data.token);
        localStorage.setItem('customer_user', JSON.stringify(data.user));
        onLoginSuccess(data.user, data.token);
        const target = redirectPath || '/customer/dashboard';
        navigate(target);
      } else {
        setError(data.message || 'Invalid email/mobile or password.');
      }
    } catch (err: any) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-slate-50 selection:bg-orange-500 selection:text-white">
      <div className="max-w-md w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-linear-to-tr from-orange-600 to-blue-900 rounded-2xl flex items-center justify-center mx-auto shadow-lg text-white font-black text-2xl tracking-tighter">
            NG
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Customer Login
          </h1>
          <p className="text-xs text-slate-600">
            Sign in to access your dashboard, track print orders, and upload new documents.
          </p>
        </div>

        {noticeMessage && (
          <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{noticeMessage}</span>
          </div>
        )}

        {/* Card Form */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email or Mobile Number */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address or Mobile Number <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210 or name@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-slate-900 text-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block font-bold text-slate-700 uppercase tracking-wider">
                  Password <span className="text-orange-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-blue-900 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-slate-900 text-xs"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all text-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Login to Customer Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="border-t border-slate-100 pt-4 text-center text-xs space-y-2">
            <div>
              <span className="text-slate-500">Don't have an account? </span>
              <button
                onClick={() => navigate(redirectPath ? `/register?redirect=${encodeURIComponent(redirectPath)}` : '/register')}
                className="font-bold text-blue-900 hover:underline"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-xs">
              <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-base border-b border-slate-100 pb-3">
                <KeyRound className="w-5 h-5 text-orange-600" />
                <span>Reset Password Support</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                To reset your Nithish Graphics customer password, please call or WhatsApp shop support directly with your registered mobile number:
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center font-bold text-slate-900">
                📞 Hotline: {info.phone}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
