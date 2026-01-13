import { X, Plus, Edit2, Trash2, Store } from 'lucide-react';
import { useState } from 'react';
import type { Retailer } from '../types';

interface RetailerManagementProps {
  retailers: Retailer[];
  onClose: () => void;
  onAddRetailer: (name: string, category: Retailer['category'], type: string) => void;
  onUpdateRetailer: (id: string, name: string, category: Retailer['category'], type: string) => void;
  onDeleteRetailer: (id: string) => void;
}

export function RetailerManagement({
  retailers,
  onClose,
  onAddRetailer,
  onUpdateRetailer,
  onDeleteRetailer,
}: RetailerManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Physical' as Retailer['category'],
    type: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.type.trim()) return;

    if (editingId) {
      onUpdateRetailer(editingId, formData.name, formData.category, formData.type);
      setEditingId(null);
    } else {
      onAddRetailer(formData.name, formData.category, formData.type);
      setIsAdding(false);
    }

    setFormData({ name: '', category: 'Physical', type: '' });
  };

  const handleEdit = (retailer: Retailer) => {
    setEditingId(retailer.id);
    setFormData({
      name: retailer.name,
      category: retailer.category,
      type: retailer.type,
    });
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', category: 'Physical', type: '' });
  };

  const physicalRetailers = retailers.filter(r => r.category === 'Physical');
  const digitalRetailers = retailers.filter(r => r.category === 'Digital');

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Manage Retailers</h2>
                <p className="text-indigo-100 text-sm mt-0.5">Add, edit, or remove retailers</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Add Retailer Button */}
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Add New Retailer
            </button>
          )}

          {/* Add/Edit Form */}
          {isAdding && (
            <div className="bg-white border-2 border-indigo-200 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingId ? 'Edit Retailer' : 'New Retailer'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retailer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter retailer name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Retailer['category'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    <option value="Physical">Physical</option>
                    <option value="Digital">Digital</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Mass Merchant, Grocery, E-commerce"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    {editingId ? 'Update Retailer' : 'Add Retailer'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Physical Retailers */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm">Physical</span>
              ({physicalRetailers.length})
            </h3>
            {physicalRetailers.length === 0 ? (
              <p className="text-gray-500 text-sm">No physical retailers</p>
            ) : (
              <div className="space-y-2">
                {physicalRetailers.map((retailer) => (
                  <div
                    key={retailer.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{retailer.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{retailer.type}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(retailer)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit retailer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${retailer.name}"? This will remove all distribution relationships for this retailer.`)) {
                              onDeleteRetailer(retailer.id);
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete retailer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Digital Retailers */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">Digital</span>
              ({digitalRetailers.length})
            </h3>
            {digitalRetailers.length === 0 ? (
              <p className="text-gray-500 text-sm">No digital retailers</p>
            ) : (
              <div className="space-y-2">
                {digitalRetailers.map((retailer) => (
                  <div
                    key={retailer.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{retailer.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{retailer.type}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(retailer)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit retailer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${retailer.name}"? This will remove all distribution relationships for this retailer.`)) {
                              onDeleteRetailer(retailer.id);
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete retailer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
