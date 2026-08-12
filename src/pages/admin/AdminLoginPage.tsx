import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { BusinessInfo } from '../../types';

interface AdminLoginPageProps {
  info: BusinessInfo;
  onLoginSuccess: (token: string) => void;
  navigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ info, onLoginSuccess, navigate }) => {
  const [email, setEmail] = useState('nithishgraphics@admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('admin_token', data.token);
        onLoginSuccess(data.token);
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Invalid admin credentials.');
      }
    } catch (err: any) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-slate-900 text-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Nithish Graphics Staff Admin
          </h1>
          <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Protected Management Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Admin ID / Email
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. nithishgraphics@admin"
              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Admin Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900 text-xs"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all text-xs flex items-center justify-center space-x-2 shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Login to Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-slate-200 pt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-slate-500 hover:text-slate-800 underline"
          >
            &larr; Back to Nithish Graphics Store
          </button>
        </div>
      </div>
    </div>
  );
};
