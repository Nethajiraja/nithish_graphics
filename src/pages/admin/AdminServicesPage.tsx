import React, { useState, useEffect } from 'react';
import { Plus, Edit2, CheckCircle2, XCircle, Trash2, Search, Loader2, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { BusinessInfo } from '../../types';

export interface ServiceRecord {
  id: number | string;
  name: string;
  description: string;
  price: number;
  pricing_unit: string;
  image_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AdminServicesPageProps {
  info: BusinessInfo;
  adminToken: string;
  navigate: (path: string) => void;
}

export const AdminServicesPage: React.FC<AdminServicesPageProps> = ({ info, adminToken, navigate }) => {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
  const [confirmToggleService, setConfirmToggleService] = useState<ServiceRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    pricing_unit: 'Per Page',
    image_url: '',
    is_active: true
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchServices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/services', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.status === 401 || res.status === 403) {
        navigate('/admin/login');
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.services)) {
        setServices(data.services);
      } else {
        setError(data.message || 'Failed to load services.');
      }
    } catch (err: any) {
      setError('Connection error loading services.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [adminToken]);

  const openAddModal = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      pricing_unit: 'Per Page',
      image_url: '',
      is_active: true
    });
    setShowAddModal(true);
  };

  const openEditModal = (service: ServiceRecord) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: String(service.price),
      pricing_unit: service.pricing_unit || 'Per Page',
      image_url: service.image_url || '',
      is_active: service.is_active !== false
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return showToast('error', 'Service name is required.');
    if (isNaN(Number(formData.price)) || Number(formData.price) < 0) return showToast('error', 'Please enter a valid price.');

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          pricing_unit: formData.pricing_unit,
          image_url: formData.image_url,
          is_active: formData.is_active
        })
      });

      const data = await res.json();
      if (data.success && data.service) {
        setShowAddModal(false);
        showToast('success', `Service "${data.service.name}" created successfully!`);
        fetchServices();
      } else {
        showToast('error', data.message || 'Failed to create service.');
      }
    } catch (err: any) {
      showToast('error', 'Connection error creating service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    if (!formData.name.trim()) return showToast('error', 'Service name is required.');
    if (isNaN(Number(formData.price)) || Number(formData.price) < 0) return showToast('error', 'Please enter a valid price.');

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/services/${editingService.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          pricing_unit: formData.pricing_unit,
          image_url: formData.image_url,
          is_active: formData.is_active
        })
      });

      const data = await res.json();
      if (data.success && data.service) {
        setEditingService(null);
        showToast('success', `Service "${data.service.name}" updated successfully!`);
        fetchServices();
      } else {
        showToast('error', data.message || 'Failed to update service.');
      }
    } catch (err: any) {
      showToast('error', 'Connection error updating service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (service: ServiceRecord) => {
    const nextStatus = !service.is_active;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/services/${service.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ isActive: nextStatus })
      });

      const data = await res.json();
      if (data.success) {
        setConfirmToggleService(null);
        showToast('success', `Service "${service.name}" ${nextStatus ? 'activated' : 'deactivated'} successfully.`);
        fetchServices();
      } else {
        showToast('error', data.message || 'Failed to toggle status.');
      }
    } catch (err: any) {
      showToast('error', 'Error toggling service status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.pricing_unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-xl text-xs font-bold shadow-lg flex items-center justify-between animate-in fade-in ${
          notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="font-mono text-base ml-4">&times;</button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Print Business Services Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Add, edit, deactivate, or activate printing services shown on customer storefront.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchServices}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Refresh Services"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Service</span>
          </button>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search services by name, description, or unit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-xs text-slate-900"
        />
      </div>

      {/* Services Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600" />
            <p className="text-xs font-semibold">Loading print services...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 space-y-2">
            <AlertCircle className="w-6 h-6 mx-auto" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <p className="text-sm font-bold">No printing services found.</p>
            <p className="text-xs text-slate-400">Click "+ Add Service" above to add a new service.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-right">Price</th>
                  <th className="py-3.5 px-4">Unit</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredServices.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-extrabold text-slate-900 flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                      <span>{s.name}</span>
                    </td>
                    <td className="py-4 px-4 max-w-xs text-slate-600 truncate" title={s.description}>
                      {s.description || '—'}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-slate-900 text-sm">
                      ₹{s.price}
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-semibold">
                      {s.pricing_unit}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {s.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                          <XCircle className="w-3 h-3 mr-1" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(s)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-all cursor-pointer inline-flex items-center space-x-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => setConfirmToggleService(s)}
                        className={`px-3 py-1.5 font-bold rounded-lg transition-all cursor-pointer inline-flex items-center space-x-1 ${
                          s.is_active
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {s.is_active ? <span>Deactivate</span> : <span>Activate</span>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD SERVICE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">+ Add New Printing Service</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold">&times;</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B/W Printing"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 text-xs focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. High speed black and white document printing"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 text-xs focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    placeholder="e.g. 2"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Pricing Unit *</label>
                  <select
                    value={formData.pricing_unit}
                    onChange={(e) => setFormData({ ...formData, pricing_unit: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Per Page">Per Page</option>
                    <option value="Per Sheet">Per Sheet</option>
                    <option value="Per Book">Per Book</option>
                    <option value="Per Set">Per Set</option>
                    <option value="Per Copy">Per Copy</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  {isSubmitting ? <span>Saving...</span> : <span>Save Service</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SERVICE MODAL */}
      {editingService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Edit Printing Service</h3>
              <button onClick={() => setEditingService(null)} className="text-slate-400 hover:text-slate-700 text-lg font-bold">&times;</button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 text-xs focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 text-xs focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Pricing Unit *</label>
                  <select
                    value={formData.pricing_unit}
                    onChange={(e) => setFormData({ ...formData, pricing_unit: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Per Page">Per Page</option>
                    <option value="Per Sheet">Per Sheet</option>
                    <option value="Per Book">Per Book</option>
                    <option value="Per Set">Per Set</option>
                    <option value="Per Copy">Per Copy</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  {isSubmitting ? <span>Updating...</span> : <span>Update Service</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM TOGGLE STATUS MODAL */}
      {confirmToggleService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-xs text-slate-900">
            <h3 className="font-extrabold text-base border-b border-slate-100 pb-2">
              {confirmToggleService.is_active ? 'Deactivate Service?' : 'Activate Service?'}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {confirmToggleService.is_active
                ? `Deactivating "${confirmToggleService.name}" will hide it from the customer ordering page while retaining historical order records.`
                : `Activating "${confirmToggleService.name}" will make it immediately available to customers on the website.`}
            </p>
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setConfirmToggleService(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleStatus(confirmToggleService)}
                disabled={isSubmitting}
                className={`px-5 py-2 font-bold text-white rounded-xl shadow-md ${
                  confirmToggleService.is_active ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {confirmToggleService.is_active ? 'Yes, Deactivate' : 'Yes, Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
