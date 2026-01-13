import { X, User, Calendar, Activity } from 'lucide-react';
import type { Client } from '../types';

interface ClientDetailPanelProps {
  client: Client;
  onClose: () => void;
}

export function ClientDetailPanel({ client, onClose }: ClientDetailPanelProps) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-[#34A16E] to-[#2d8a5e] text-white p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{client.name}</h2>
                <p className="text-emerald-100 text-sm mt-1">Client Profile</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Client Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Current Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  client.status === 'Active' ? 'bg-green-100 text-green-800' :
                  client.status === 'Live' ? 'bg-blue-100 text-blue-800' :
                  client.status === 'Projected' ? 'bg-orange-100 text-orange-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {client.status}
                </span>
              </div>
              {client.statusDate && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status Date:</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{client.statusDate}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
