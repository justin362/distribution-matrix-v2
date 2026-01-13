import { Network, Activity, Users, Store, LogOut, Settings } from 'lucide-react';

interface HeaderProps {
  onToggleActivity: () => void;
  onManageClients: () => void;
  onManageRetailers: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  userEmail?: string;
}

export function Header({ 
  onToggleActivity, 
  onManageClients, 
  onManageRetailers,
  onSettings,
  onLogout,
  userEmail,
}: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
              <Network className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Triive Distribution Matrix</h1>
              <p className="text-indigo-100 text-sm mt-1">
                Manage client-retailer relationships across channels
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onManageClients}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Clients</span>
            </button>
            <button
              onClick={onManageRetailers}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              <Store className="w-5 h-5" />
              <span className="font-medium">Retailers</span>
            </button>
            <button
              onClick={onToggleActivity}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              <Activity className="w-5 h-5" />
              <span className="font-medium">Activity</span>
            </button>
            {onSettings && (
              <button
                onClick={onSettings}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </button>
            )}
            {onLogout && userEmail && (
              <div className="flex items-center gap-2">
                <div className="text-right mr-2">
                  <div className="text-xs text-indigo-200">Signed in as</div>
                  <div className="text-sm font-medium">{userEmail}</div>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 bg-white/10 hover:bg-red-500/80 px-4 py-2 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}