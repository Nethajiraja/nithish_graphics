import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, Save, CheckCircle, RefreshCw, X, DollarSign } from 'lucide-react';
import { PricingRate, BusinessInfo } from '../../types';

interface AdminPricingPageProps {
  info: BusinessInfo;
  token: string;
  onLogout: () => void;
  navigate: (path: string) => void;
}

export const AdminPricingPage: React.FC<AdminPricingPageProps> = ({ info, token, onLogout, navigate }) => {
  const [rates, setRates] = useState<PricingRate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState<PricingRate | null>(null);
  const [isNew, setIsNew] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchRates = () => {
    setLoading(true);
    fetch('/api/pricing')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRates(data);
      })
      .catch(() => setError('Failed to fetch pricing rates.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleOpenAdd = () => {
    setIsNew(true);
    setEditingRate({
      id: `p_${Date.now()}`,
      category: 'B/W Printing',
      name: '',
      unit: 'per page',
      priceSingle: 2.0,
      priceDouble: 1.5,
      description: '',
      isActive: true
    });
  };

  const handleOpenEdit = (rate: PricingRate) => {
    setIsNew(false);
    setEditingRate({ ...rate });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRate) return;

    const endpoint = isNew ? '/api/admin/pricing' : `/api/admin/pricing/${editingRate.id}`;
    const method = isNew ? 'POST' : 'PUT';

    fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(editingRate)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchRates();
          setEditingRate(null);
          setSuccessMessage('Pricing rate saved successfully!');
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          setError(data.message || 'Failed to save rate.');
        }
      })
      .catch(() => setError('Server error saving pricing rate.'));
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this pricing rate?')) return;

    fetch(`/api/admin/pricing/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchRates();
        }
      });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold">Dynamic Pricing Management</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Add, Edit, and Update print rates & binding services across Nithish Graphics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
          >
            Orders
          </button>
          <button
            onClick={() => navigate('/admin/pricing')}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md"
          >
            Pricing Management
          </button>
          <button
            onClick={() => navigate('/admin/settings')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
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

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Header & Add Button */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Active Services & Rate Matrix
        </h2>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Rate</span>
        </button>
      </div>

      {/* Rates Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading rates...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase text-[11px]">
                  <th className="p-4">Category</th>
                  <th className="p-4">Service Name</th>
                  <th className="p-4">Unit</th>
                  <th className="p-4">Single Side</th>
                  <th className="p-4">Double Side</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                {rates.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{r.category}</td>
                    <td className="p-4 font-semibold text-slate-800">{r.name}</td>
                    <td className="p-4 text-slate-500">{r.unit}</td>
                    <td className="p-4 font-bold text-blue-600">₹{r.priceSingle.toFixed(2)}</td>
                    <td className="p-4 font-bold text-blue-600">₹{(r.priceDouble || r.priceSingle).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${r.isActive !== false ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-600'}`}>
                        {r.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                        title="Edit Rate"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg"
                        title="Delete Rate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      {editingRate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                {isNew ? 'Add New Pricing Rate' : `Edit Rate: ${editingRate.name}`}
              </h3>
              <button onClick={() => setEditingRate(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={editingRate.category}
                  onChange={(e) => setEditingRate({ ...editingRate, category: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-900"
                >
                  <option value="B/W Printing">B/W Printing</option>
                  <option value="Color Printing">Color Printing</option>
                  <option value="Binding Services">Binding Services</option>
                  <option value="Lamination">Lamination</option>
                  <option value="Photo Printing">Photo Printing</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={editingRate.name}
                  onChange={(e) => setEditingRate({ ...editingRate, name: e.target.value })}
                  placeholder="e.g. A4 B/W Printing (70 GSM)"
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Single Side Price (₹)</label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    value={editingRate.priceSingle}
                    onChange={(e) => setEditingRate({ ...editingRate, priceSingle: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Double Side Price (₹)</label>
                  <input
                    type="number"
                    step="0.10"
                    value={editingRate.priceDouble || editingRate.priceSingle}
                    onChange={(e) => setEditingRate({ ...editingRate, priceDouble: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={editingRate.description || ''}
                  onChange={(e) => setEditingRate({ ...editingRate, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active-toggle"
                  checked={editingRate.isActive !== false}
                  onChange={(e) => setEditingRate({ ...editingRate, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="active-toggle" className="font-bold text-slate-800">
                  Enable service on customer website
                </label>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingRate(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md flex items-center space-x-1"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
