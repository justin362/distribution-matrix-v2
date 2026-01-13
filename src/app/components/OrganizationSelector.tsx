import { Building2, ChevronDown, Plus, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Organization, UserRole } from '../types';

interface OrganizationWithRole extends Organization {
  role: UserRole;
}

interface OrganizationSelectorProps {
  organizations: OrganizationWithRole[];
  currentOrgId: string | null;
  onSwitch: (orgId: string) => void;
  onCreateNew: () => void;
}

export function OrganizationSelector({
  organizations,
  currentOrgId,
  onSwitch,
  onCreateNew,
}: OrganizationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOrg = organizations.find(o => o.id === currentOrgId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (organizations.length === 0) {
    return (
      <button
        onClick={onCreateNew}
        className="flex items-center gap-2 bg-[#F19C6B]/90 hover:bg-[#F19C6B] px-4 py-2 rounded-lg transition-colors text-white"
      >
        <Plus className="w-4 h-4" />
        <span className="font-medium">Create Organization</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
      >
        <Building2 className="w-5 h-5" />
        <span className="font-medium max-w-[150px] truncate">
          {currentOrg?.name || 'Select Organization'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase">Organizations</p>
          </div>

          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => {
                onSwitch(org.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors ${
                org.id === currentOrgId ? 'bg-emerald-50' : ''
              }`}
            >
              <Building2 className={`w-4 h-4 ${org.id === currentOrgId ? 'text-[#34A16E]' : 'text-gray-400'}`} />
              <div className="flex-1 text-left">
                <div className={`font-medium ${org.id === currentOrgId ? 'text-[#34A16E]' : 'text-gray-900'}`}>
                  {org.name}
                </div>
                <div className="text-xs text-gray-500 capitalize">{org.role}</div>
              </div>
              {org.id === currentOrgId && (
                <Check className="w-4 h-4 text-[#34A16E]" />
              )}
            </button>
          ))}

          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              onClick={() => {
                onCreateNew();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-[#34A16E]"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Create New Organization</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
