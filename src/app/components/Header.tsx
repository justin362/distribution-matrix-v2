import { Network, Activity, Users, Store, LogOut, Settings, BarChart3, UserCog, Eye } from 'lucide-react';
import type { Organization, UserRole } from '../types';
import { OrganizationSelector } from './OrganizationSelector';

interface OrganizationWithRole extends Organization {
  role: UserRole;
}

interface HeaderProps {
  onToggleActivity: () => void;
  onManageClients: () => void;
  onManageRetailers: () => void;
  onDashboard?: () => void;
  onSettings?: () => void;
  onManageUsers?: () => void;
  onLogout?: () => void;
  userEmail?: string;
  userRole?: UserRole;
  organizations?: OrganizationWithRole[];
  currentOrgId?: string | null;
  onSwitchOrg?: (orgId: string) => void;
  onCreateOrg?: () => void;
}

export function Header({
  onToggleActivity,
  onManageClients,
  onManageRetailers,
  onDashboard,
  onSettings,
  onManageUsers,
  onLogout,
  userEmail,
  userRole,
  organizations,
  currentOrgId,
  onSwitchOrg,
  onCreateOrg,
}: HeaderProps) {
  const isViewer = userRole === 'viewer';
  return (
    <header className="bg-gradient-to-r from-[#34A16E] to-[#2d8a5e] text-white shadow-lg">
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
              <Network className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Triive Distribution Matrix</h1>
              <p className="text-emerald-100 text-sm mt-1">
                Manage client-retailer relationships across channels
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Organization Selector */}
            {organizations && onSwitchOrg && onCreateOrg && (
              <OrganizationSelector
                organizations={organizations}
                currentOrgId={currentOrgId || null}
                onSwitch={onSwitchOrg}
                onCreateNew={onCreateOrg}
              />
            )}

            {/* View Only Badge for Viewers */}
            {isViewer && (
              <div className="flex items-center gap-1 bg-gray-500/50 px-3 py-1.5 rounded-lg">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">View Only</span>
              </div>
            )}

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
            {onDashboard && (
              <button
                onClick={onDashboard}
                className="flex items-center gap-2 bg-[#F19C6B]/90 hover:bg-[#F19C6B] px-4 py-2 rounded-lg transition-colors"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </button>
            )}
            {/* Team Management - Admin only */}
            {onManageUsers && userRole === 'admin' && (
              <button
                onClick={onManageUsers}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                <UserCog className="w-5 h-5" />
                <span className="font-medium">Team</span>
              </button>
            )}
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
                  <div className="text-xs text-emerald-200">Signed in as</div>
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