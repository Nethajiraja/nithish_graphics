import React, { useState } from 'react';
import { User, Phone, Mail, Lock, CheckCircle2, ArrowRight, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { BusinessInfo, CustomerUser } from '../../types';

interface RegisterPageProps {
  info: BusinessInfo;
  onLoginSuccess: (user: CustomerUser, token: string) => void;
  navigate: (path: string) => void;
  redirectPath?: string;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ info, onLoginSuccess, navigate, redirectPath }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isDuplicateAccount, setIsDuplicateAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsDuplicateAccount(false);

    // Client-side Validation
    if (!name.trim()) {
      setError('Full Name is required.');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 12) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError('Please enter a valid email address.');
        return;
      }
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          mobileNumber: cleanPhone,
          email: email.trim().toLowerCase() || undefined,
          password,
          confirmPassword
        })
      });

      const data = await res.json();
      if (data.success && data.token && data.user) {
        localStorage.setItem('customer_token', data.token);
        localStorage.setItem('customer_user', JSON.stringify(data.user));
        onLoginSuccess(data.user, data.token);
        const target = redirectPath || '/customer/dashboard';
        navigate(target);
      } else {
        if (data.code === 'ACCOUNT_EXISTS' || (data.message && data.message.toLowerCase().includes('already exists'))) {
          setIsDuplicateAccount(true);
          setError('An account already exists with this mobile number. Please login instead.');
        } else {
          setError(data.message || 'Registration failed. Please check your details.');
        }
      }
    } catch (err: any) {
      setError('Network error. Please check your internet connection and try again.');
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
            Create Customer Account
          </h1>
          <p className="text-xs text-slate-600">
            Register with your mobile number to place print orders, upload documents & track order status.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Nithish Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-slate-900 text-xs"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Number (Used for Login) <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-slate-900 text-xs"
                />
              </div>
            </div>

            {/* Email Address (Optional) */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  placeholder="e.g. customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-slate-900 text-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-slate-900 text-xs"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium text-slate-900 text-xs"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-amber-50 border border-amber-300 text-amber-950 rounded-xl text-xs space-y-2.5 shadow-sm">
                <div className="flex items-center space-x-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{error}</span>
                </div>
                {isDuplicateAccount && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => navigate(redirectPath ? `/login?redirect=${encodeURIComponent(redirectPath)}` : '/login')}
                      className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg text-xs shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>Go to Login</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
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
                  <span>Creating Customer Account...</span>
                </>
              ) : (
                <>
                  <span>Register Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="border-t border-slate-100 pt-4 text-center text-xs">
            <span className="text-slate-500">Already have an account? </span>
            <button
              onClick={() => navigate(redirectPath ? `/login?redirect=${encodeURIComponent(redirectPath)}` : '/login')}
              className="font-bold text-blue-900 hover:underline"
            >
              Login Here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
