import { X, Settings, User, Mail, LogOut } from 'lucide-react';
import { DataManagement } from './DataManagement';

interface SettingsPanelProps {
  onClose: () => void;
  userEmail: string;
  userName?: string;
  onClearAllData: () => void;
  onLogout: () => void;
  totalClients: number;
  totalRetailers: number;
  totalDistributions: number;
}

export function SettingsPanel({
  onClose,
  userEmail,
  userName,
  onClearAllData,
  onLogout,
  totalClients,
  totalRetailers,
  totalDistributions,
}: SettingsPanelProps) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-[#34A16E] to-[#2d8a5e] text-white p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Settings</h2>
                <p className="text-emerald-100 text-sm mt-0.5">Manage your account and data</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onLogout}
                className="flex items-center gap-2 bg-red-500/80 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <User className="w-5 h-5 text-[#34A16E]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
            </div>
            <div className="space-y-3">
              {userName && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Name</div>
                    <div className="font-medium text-gray-900">{userName}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Email</div>
                  <div className="font-medium text-gray-900">{userEmail}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <DataManagement
            onClearAllData={onClearAllData}
            totalClients={totalClients}
            totalRetailers={totalRetailers}
            totalDistributions={totalDistributions}
          />
        </div>
      </div>
    </>
  );
}