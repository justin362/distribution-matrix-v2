import { X, Users, UserPlus, Shield, Edit2, Trash2, Mail, Crown, Eye } from 'lucide-react';
import { useState } from 'react';
import type { OrganizationMember, UserRole } from '../types';

interface UserManagementPanelProps {
  onClose: () => void;
  members: OrganizationMember[];
  currentUserId: string;
  userRole: UserRole;
  organizationName: string;
  onInviteUser: (email: string, role: UserRole) => Promise<void>;
  onUpdateRole: (userId: string, role: UserRole) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Full access + manage users',
  editor: 'View + edit data',
  viewer: 'View only',
};

const ROLE_ICONS: Record<UserRole, typeof Crown> = {
  admin: Crown,
  editor: Edit2,
  viewer: Eye,
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-800 border-purple-200',
  editor: 'bg-blue-100 text-blue-800 border-blue-200',
  viewer: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function UserManagementPanel({
  onClose,
  members,
  currentUserId,
  userRole,
  organizationName,
  onInviteUser,
  onUpdateRole,
  onRemoveMember,
}: UserManagementPanelProps) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('viewer');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = userRole === 'admin';

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      await onInviteUser(inviteEmail.trim(), inviteRole);
      setInviteEmail('');
      setInviteRole('viewer');
      setShowInviteForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setIsLoading(true);
    setError(null);
    try {
      await onUpdateRole(userId, newRole);
      setEditingUserId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (userId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the organization?`)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onRemoveMember(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-[#34A16E] to-[#2d8a5e] text-white p-6 shadow-lg z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Team Members</h2>
                <p className="text-emerald-100 text-sm mt-0.5">{organizationName}</p>
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
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Invite Button */}
          {isAdmin && !showInviteForm && (
            <button
              onClick={() => setShowInviteForm(true)}
              className="w-full bg-gradient-to-r from-[#34A16E] to-[#2d8a5e] text-white py-3 px-4 rounded-lg hover:from-[#2d8a5e] hover:to-[#246b4a] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-medium"
            >
              <UserPlus className="w-5 h-5" />
              Invite Team Member
            </button>
          )}

          {/* Invite Form */}
          {showInviteForm && (
            <div className="bg-white border-2 border-emerald-200 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite New Member</h3>
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34A16E] focus:border-transparent"
                    placeholder="colleague@company.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <div className="space-y-2">
                    {(['admin', 'editor', 'viewer'] as UserRole[]).map((role) => {
                      const Icon = ROLE_ICONS[role];
                      return (
                        <label
                          key={role}
                          className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            inviteRole === role
                              ? 'border-[#34A16E] bg-emerald-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={role}
                            checked={inviteRole === role}
                            onChange={() => setInviteRole(role)}
                            className="w-4 h-4 text-[#34A16E]"
                          />
                          <Icon className="w-4 h-4 text-gray-600" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{ROLE_LABELS[role]}</div>
                            <div className="text-sm text-gray-500">{ROLE_DESCRIPTIONS[role]}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-[#34A16E] text-white py-2 px-4 rounded-lg hover:bg-[#2d8a5e] transition-colors font-medium disabled:opacity-50"
                  >
                    {isLoading ? 'Sending...' : 'Send Invite'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteForm(false);
                      setInviteEmail('');
                      setInviteRole('viewer');
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Role Legend */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Role Permissions</h4>
            <div className="grid grid-cols-3 gap-3">
              {(['admin', 'editor', 'viewer'] as UserRole[]).map((role) => {
                const Icon = ROLE_ICONS[role];
                return (
                  <div key={role} className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${ROLE_COLORS[role]}`}>
                      <Icon className="w-3 h-3 inline mr-1" />
                      {ROLE_LABELS[role]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Members ({members.length})
            </h3>
            {members.length === 0 ? (
              <p className="text-gray-500 text-sm">No members yet</p>
            ) : (
              <div className="space-y-2">
                {members.map((member) => {
                  const Icon = ROLE_ICONS[member.role];
                  const isCurrentUser = member.userId === currentUserId;
                  const isEditing = editingUserId === member.userId;

                  return (
                    <div
                      key={member.userId}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">
                              {member.name || 'Unknown User'}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-gray-500">(You)</span>
                              )}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Mail className="w-4 h-4" />
                            <span>{member.email}</span>
                          </div>
                          <div className="mt-2">
                            {isEditing && isAdmin ? (
                              <div className="flex items-center gap-2">
                                <select
                                  value={member.role}
                                  onChange={(e) => handleRoleChange(member.userId, e.target.value as UserRole)}
                                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#34A16E]"
                                  disabled={isLoading}
                                >
                                  <option value="admin">Admin</option>
                                  <option value="editor">Editor</option>
                                  <option value="viewer">Viewer</option>
                                </select>
                                <button
                                  onClick={() => setEditingUserId(null)}
                                  className="text-gray-500 hover:text-gray-700 text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${ROLE_COLORS[member.role]}`}>
                                <Icon className="w-3 h-3" />
                                {ROLE_LABELS[member.role]}
                              </span>
                            )}
                          </div>
                        </div>
                        {isAdmin && !isEditing && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingUserId(member.userId)}
                              className="p-2 text-[#34A16E] hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Change role"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                            {!isCurrentUser && (
                              <button
                                onClick={() => handleRemove(member.userId, member.name || member.email)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove member"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
