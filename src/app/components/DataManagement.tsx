import { Trash2, AlertTriangle, Database, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface DataManagementProps {
  onClearAllData: () => void;
  totalClients: number;
  totalRetailers: number;
  totalDistributions: number;
}

export function DataManagement({
  onClearAllData,
  totalClients,
  totalRetailers,
  totalDistributions,
}: DataManagementProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleClear = () => {
    if (confirmText === 'DELETE ALL') {
      onClearAllData();
      setShowConfirm(false);
      setConfirmText('');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-red-100 p-2 rounded-lg">
          <Database className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
          <p className="text-sm text-gray-500">Manage your distribution data</p>
        </div>
      </div>

      {/* Current Data Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalClients}</div>
          <div className="text-xs text-blue-900 mt-1">Clients</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">{totalRetailers}</div>
          <div className="text-xs text-purple-900 mt-1">Retailers</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{totalDistributions}</div>
          <div className="text-xs text-green-900 mt-1">Distributions</div>
        </div>
      </div>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Trash2 className="w-5 h-5" />
          Clear All Data & Start Fresh
        </button>
      ) : (
        <div className="border-2 border-red-300 bg-red-50 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Are you absolutely sure?</h4>
              <p className="text-sm text-red-700 mb-3">
                This will permanently delete all {totalClients} clients, {totalRetailers} retailers, 
                and {totalDistributions} distribution relationships. This action cannot be undone.
              </p>
              <p className="text-sm font-medium text-red-900 mb-2">
                Type <span className="bg-red-200 px-2 py-0.5 rounded font-mono">DELETE ALL</span> to confirm:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                placeholder="DELETE ALL"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              disabled={confirmText !== 'DELETE ALL'}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Confirm Delete
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                setConfirmText('');
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-[#34A16E] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-900">
            <strong>Tip:</strong> You can clear the sample data when you're ready to add your own clients and retailers. 
            This gives you a clean slate to build your custom distribution matrix.
          </p>
        </div>
      </div>
    </div>
  );
}
