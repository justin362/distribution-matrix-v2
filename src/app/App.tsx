import { useState, useEffect } from 'react';
import { MatrixView } from './components/MatrixView';
import { RetailerDetailPanel } from './components/RetailerDetailPanel';
import { ClientDetailPanel } from './components/ClientDetailPanel';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { ActivityFeed } from './components/ActivityFeed';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ClientManagement } from './components/ClientManagement';
import { RetailerManagement } from './components/RetailerManagement';
import { OfflineBanner } from './components/OfflineBanner';
import { Login } from './components/Login';
import { SettingsPanel } from './components/SettingsPanel';
import { Dashboard } from './components/Dashboard';
import { OrganizationSelector } from './components/OrganizationSelector';
import { CreateOrganizationModal } from './components/CreateOrganizationModal';
import { UserManagementPanel } from './components/UserManagementPanel';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import type { Client, Retailer, Distribution, AnalyticsData, Organization, UserRole, UserProfile } from './types';

interface OrganizationWithRole extends Organization {
  role: UserRole;
}

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-27d977d5`;

// Fallback data in case server isn't ready - generic sample data
const fallbackClients: Client[] = [
  { id: '1', name: 'Sample Client A', status: 'Active', statusDate: null },
  { id: '2', name: 'Sample Client B', status: 'Active', statusDate: null },
  { id: '3', name: 'Sample Client C', status: 'Live', statusDate: 'Q1 2026' },
  { id: '4', name: 'Sample Client D', status: 'Projected', statusDate: 'Q2 2026' },
  { id: '5', name: 'Sample Client E', status: 'Recruiting', statusDate: null },
];

const fallbackRetailers: Retailer[] = [
  { id: 'retailer-1', name: 'Retailer 1', category: 'Physical', type: 'Mass Merchant', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  { id: 'retailer-2', name: 'Retailer 2', category: 'Physical', type: 'Warehouse', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  { id: 'retailer-3', name: 'Retailer 3', category: 'Physical', type: 'Grocery', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  { id: 'retailer-4', name: 'Retailer 4', category: 'Digital', type: 'E-commerce', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
];

const fallbackDistributions: Distribution[] = [
  { clientId: '1', retailerId: 'retailer-1', status: 'shelves', notes: '' },
  { clientId: '1', retailerId: 'retailer-2', status: 'shelves', notes: '' },
  { clientId: '2', retailerId: 'retailer-1', status: 'shelves-screens', notes: '' },
  { clientId: '2', retailerId: 'retailer-3', status: 'shelves-screens', notes: '' },
  { clientId: '3', retailerId: 'retailer-4', status: 'shelves-screens', notes: '' },
];

export default function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActivityFeed, setShowActivityFeed] = useState(false);
  const [useLocalData, setUseLocalData] = useState(false);
  const [showClientManagement, setShowClientManagement] = useState(false);
  const [showRetailerManagement, setShowRetailerManagement] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [accessToken, setAccessToken] = useState('');

  // Organization state
  const [organizations, setOrganizations] = useState<OrganizationWithRole[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('admin'); // Default to admin for users without orgs
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);

  // Fetch data from Supabase
  useEffect(() => {
    // Check for existing session
    checkSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchUserProfile(); // Fetch organization data
      fetchAllData();
      // Only poll if using server data - reduce polling frequency
      const interval = setInterval(() => {
        if (!useLocalData) {
          fetchAllData();
        }
      }, 10000); // Poll every 10 seconds
      return () => clearInterval(interval);
    }
  }, [useLocalData, isAuthenticated, accessToken]);

  const checkSession = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/session`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setIsAuthenticated(true);
          setUserEmail(data.user.email);
          setUserName(data.user.name || '');
          setAccessToken(data.accessToken);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.log('No active session');
    }
    
    setLoading(false);
  };

  const handleLogin = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setIsAuthenticated(true);
    setUserEmail(data.user.email);
    setUserName(data.user.name || '');
    setAccessToken(data.accessToken);
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    const data = await response.json();
    setIsAuthenticated(true);
    setUserEmail(data.user.email);
    setUserName(data.user.name || '');
    setAccessToken(data.accessToken);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken || publicAnonKey}` },
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    setIsAuthenticated(false);
    setUserEmail('');
    setUserName('');
    setAccessToken('');
    setClients([]);
    setRetailers([]);
    setDistributions([]);
  };

  const handleClearAllData = async () => {
    if (useLocalData) {
      setClients([]);
      setRetailers([]);
      setDistributions([]);
      setShowSettings(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/clear-all-data`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken || publicAnonKey}` },
      });

      if (!response.ok) throw new Error('Failed to clear data');
      
      await fetchAllData();
      setShowSettings(false);
    } catch (err) {
      console.error('Error clearing data:', err);
      alert('Failed to clear data. You may be in offline mode.');
    }
  };

  const fetchAllData = async () => {
    // Need accessToken for user-scoped data - don't fetch without it
    if (!accessToken) {
      console.log('No access token yet, skipping data fetch');
      setLoading(false);
      return;
    }

    try {
      const [clientsRes, retailersRes, distributionsRes] = await Promise.all([
        fetch(`${API_URL}/clients`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }).catch(() => null),
        fetch(`${API_URL}/retailers`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }).catch(() => null),
        fetch(`${API_URL}/distributions`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }).catch(() => null),
      ]);

      if (!clientsRes || !retailersRes || !distributionsRes || 
          !clientsRes.ok || !retailersRes.ok || !distributionsRes.ok) {
        throw new Error('Server unavailable');
      }

      const [clientsData, retailersData, distributionsData] = await Promise.all([
        clientsRes.json(),
        retailersRes.json(),
        distributionsRes.json(),
      ]);

      setClients(clientsData);
      setRetailers(retailersData);
      setDistributions(distributionsData);
      setError(null);
      setUseLocalData(false);

      // Fetch analytics data
      fetchAnalytics();
    } catch (err) {
      // Silently fall back to local data - this is expected behavior
      if (!useLocalData) {
        console.log('📦 Using offline mode with local data');
      }
      setClients(fallbackClients);
      setRetailers(fallbackRetailers);
      setDistributions(fallbackDistributions);
      setError('Running in offline mode - changes will not be saved');
      setUseLocalData(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_URL}/analytics`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.log('Could not fetch analytics data');
    }
  };

  const createAnalyticsSnapshot = async () => {
    if (useLocalData || !accessToken) return;
    try {
      await fetch(`${API_URL}/analytics/snapshot`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (err) {
      // Silently fail - analytics snapshot is not critical
    }
  };

  // Organization management functions
  const fetchUserProfile = async () => {
    if (!accessToken) return; // Skip if not authenticated with user token

    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const profile: UserProfile = await response.json();
        setCurrentOrgId(profile.currentOrgId);

        // Convert organizations to OrganizationWithRole format
        const orgsWithRoles: OrganizationWithRole[] = [];
        for (const orgMembership of profile.organizations) {
          try {
            const orgResponse = await fetch(`${API_URL}/organizations`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (orgResponse.ok) {
              const orgs: Organization[] = await orgResponse.json();
              const org = orgs.find(o => o.id === orgMembership.orgId);
              if (org) {
                orgsWithRoles.push({ ...org, role: orgMembership.role });
              }
            }
          } catch (err) {
            console.log('Could not fetch organization details');
          }
        }
        setOrganizations(orgsWithRoles);

        // Set current user role based on current org
        const currentOrgMembership = profile.organizations.find(o => o.orgId === profile.currentOrgId);
        if (currentOrgMembership) {
          setUserRole(currentOrgMembership.role);
        }
      }
    } catch (err) {
      console.log('Could not fetch user profile');
    }
  };

  const fetchOrganizations = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_URL}/organizations`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const orgs = await response.json();
        // Fetch user profile to get roles
        await fetchUserProfile();
      }
    } catch (err) {
      console.log('Could not fetch organizations');
    }
  };

  const handleCreateOrganization = async (name: string) => {
    if (!accessToken) {
      throw new Error('Please log in again to create an organization');
    }

    const response = await fetch(`${API_URL}/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to create organization');
    }

    const newOrg = await response.json();
    // Refresh organizations and switch to new org
    await fetchUserProfile();
    setCurrentOrgId(newOrg.id);
    setUserRole('admin'); // Creator is always admin
    await fetchAllData();
  };

  const handleSwitchOrganization = async (orgId: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_URL}/organizations/switch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ orgId }),
      });

      if (response.ok) {
        setCurrentOrgId(orgId);
        // Update user role for the new org
        const org = organizations.find(o => o.id === orgId);
        if (org) {
          setUserRole(org.role);
        }
        // Refresh data for the new organization
        await fetchAllData();
      }
    } catch (err) {
      console.error('Error switching organization:', err);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCellClick = (client: Client, retailer: Retailer) => {
    setSelectedRetailer(retailer);
    setSelectedClient(client);
  };

  const handleRetailerClick = (retailer: Retailer) => {
    setSelectedRetailer(retailer);
    setSelectedClient(null);
  };

  const handleDistributionUpdate = async (clientId: string, retailerId: string, status: string, notes: string) => {
    if (useLocalData) {
      // Update locally
      setDistributions(prev => {
        const existing = prev.find(d => d.clientId === clientId && d.retailerId === retailerId);
        if (existing) {
          return prev.map(d =>
            d.clientId === clientId && d.retailerId === retailerId
              ? { ...d, status, notes }
              : d
          );
        } else {
          return [...prev, { clientId, retailerId, status, notes }];
        }
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/distributions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ clientId, retailerId, status, notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to update distribution');
      }

      // Refresh data immediately after update
      await fetchAllData();
      // Create analytics snapshot after data change
      createAnalyticsSnapshot();
    } catch (err) {
      console.error('Error updating distribution:', err);
      alert('Failed to save changes. Please try again.');
    }
  };

  // Client management functions
  const handleAddClient = async (name: string, status: Client['status'], statusDate: string | null) => {
    if (useLocalData) {
      setClients(prev => [...prev, {
        id: crypto.randomUUID(),
        name,
        status,
        statusDate,
      }]);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name, status, statusDate }),
      });

      if (!response.ok) throw new Error('Failed to add client');
      await fetchAllData();
    } catch (err) {
      console.error('Error adding client:', err);
      alert('Failed to add client. You may be in offline mode.');
    }
  };

  const handleUpdateClient = async (id: string, name: string, status: Client['status'], statusDate: string | null) => {
    if (useLocalData) {
      setClients(prev => prev.map(c => c.id === id ? { ...c, name, status, statusDate } : c));
      return;
    }

    try {
      const response = await fetch(`${API_URL}/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name, status, statusDate }),
      });

      if (!response.ok) throw new Error('Failed to update client');
      await fetchAllData();
    } catch (err) {
      console.error('Error updating client:', err);
      alert('Failed to update client. You may be in offline mode.');
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (useLocalData) {
      setClients(prev => prev.filter(c => c.id !== id));
      setDistributions(prev => prev.filter(d => d.clientId !== id));
      return;
    }

    try {
      const response = await fetch(`${API_URL}/clients/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error('Failed to delete client');
      await fetchAllData();
    } catch (err) {
      console.error('Error deleting client:', err);
      alert('Failed to delete client. You may be in offline mode.');
    }
  };

  // Retailer management functions
  const handleAddRetailer = async (name: string, category: Retailer['category'], type: string) => {
    if (useLocalData) {
      setRetailers(prev => [...prev, {
        id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name,
        category,
        type,
        contacts: [],
        lineReviewTiming: '',
        resetDates: '',
        notes: '',
      }]);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/retailers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name, category, type }),
      });

      if (!response.ok) throw new Error('Failed to add retailer');
      await fetchAllData();
    } catch (err) {
      console.error('Error adding retailer:', err);
      alert('Failed to add retailer. You may be in offline mode.');
    }
  };

  const handleUpdateRetailer = async (id: string, name: string, category: Retailer['category'], type: string) => {
    if (useLocalData) {
      setRetailers(prev => prev.map(r => r.id === id ? { ...r, name, category, type } : r));
      return;
    }

    try {
      const response = await fetch(`${API_URL}/retailers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name, category, type }),
      });

      if (!response.ok) throw new Error('Failed to update retailer');
      await fetchAllData();
    } catch (err) {
      console.error('Error updating retailer:', err);
      alert('Failed to update retailer. You may be in offline mode.');
    }
  };

  const handleDeleteRetailer = async (id: string) => {
    if (useLocalData) {
      setRetailers(prev => prev.filter(r => r.id !== id));
      setDistributions(prev => prev.filter(d => d.retailerId !== id));
      return;
    }

    try {
      const response = await fetch(`${API_URL}/retailers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error('Failed to delete retailer');
      await fetchAllData();
    } catch (err) {
      console.error('Error deleting retailer:', err);
      alert('Failed to delete retailer. You may be in offline mode.');
    }
  };

  const handleUpdateRetailerFull = async (updatedRetailer: Retailer) => {
    if (useLocalData) {
      setRetailers(prev => prev.map(r => r.id === updatedRetailer.id ? updatedRetailer : r));
      setSelectedRetailer(updatedRetailer);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/retailers/${updatedRetailer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: updatedRetailer.name,
          category: updatedRetailer.category,
          type: updatedRetailer.type,
          contacts: updatedRetailer.contacts,
          lineReviewTiming: updatedRetailer.lineReviewTiming,
          resetDates: updatedRetailer.resetDates,
          notes: updatedRetailer.notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to update retailer');
      await fetchAllData();
    } catch (err) {
      console.error('Error updating retailer:', err);
      alert('Failed to update retailer information. You may be in offline mode.');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} onSignup={handleSignup} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onToggleActivity={() => setShowActivityFeed(!showActivityFeed)}
        onManageClients={() => setShowClientManagement(true)}
        onManageRetailers={() => setShowRetailerManagement(true)}
        onDashboard={() => setShowDashboard(true)}
        onSettings={() => setShowSettings(true)}
        onManageUsers={() => setShowUserManagement(true)}
        onLogout={handleLogout}
        userEmail={userEmail}
        userRole={userRole}
        organizations={organizations}
        currentOrgId={currentOrgId}
        onSwitchOrg={handleSwitchOrganization}
        onCreateOrg={() => setShowCreateOrg(true)}
      />
      
      {useLocalData && (
        <OfflineBanner
          onRetry={() => {
            setLoading(true);
            setUseLocalData(false);
            fetchAllData();
          }}
        />
      )}
      
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
        <MatrixView
          clients={filteredClients}
          retailers={retailers}
          distributions={distributions}
          onCellClick={handleCellClick}
          onRetailerClick={handleRetailerClick}
        />
      </div>
      
      {selectedRetailer && (
        <RetailerDetailPanel
          retailer={selectedRetailer}
          client={selectedClient}
          clients={clients}
          distribution={selectedClient ? distributions.find(
            d => d.clientId === selectedClient.id && d.retailerId === selectedRetailer.id
          ) : undefined}
          distributions={distributions}
          onClose={() => {
            setSelectedRetailer(null);
            setSelectedClient(null);
          }}
          onUpdate={handleDistributionUpdate}
          onUpdateRetailer={async (updatedRetailer) => {
            if (useLocalData) {
              setRetailers(prev => prev.map(r => r.id === updatedRetailer.id ? updatedRetailer : r));
              setSelectedRetailer(updatedRetailer);
            } else {
              await handleUpdateRetailerFull(updatedRetailer);
            }
          }}
        />
      )}

      {showActivityFeed && !useLocalData && (
        <ActivityFeed onClose={() => setShowActivityFeed(false)} />
      )}

      {showClientManagement && (
        <ClientManagement
          clients={clients}
          onClose={() => setShowClientManagement(false)}
          onAddClient={handleAddClient}
          onUpdateClient={handleUpdateClient}
          onDeleteClient={handleDeleteClient}
        />
      )}

      {showRetailerManagement && (
        <RetailerManagement
          retailers={retailers}
          onClose={() => setShowRetailerManagement(false)}
          onAddRetailer={handleAddRetailer}
          onUpdateRetailer={handleUpdateRetailer}
          onDeleteRetailer={handleDeleteRetailer}
        />
      )}

      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          userEmail={userEmail}
          userName={userName}
          onClearAllData={handleClearAllData}
          onLogout={handleLogout}
          totalClients={clients.length}
          totalRetailers={retailers.length}
          totalDistributions={distributions.length}
        />
      )}

      {showDashboard && (
        <Dashboard
          onClose={() => setShowDashboard(false)}
          clients={clients}
          retailers={retailers}
          distributions={distributions}
          analyticsData={analyticsData}
        />
      )}

      {showCreateOrg && (
        <CreateOrganizationModal
          onClose={() => setShowCreateOrg(false)}
          onCreate={handleCreateOrganization}
        />
      )}

      {showUserManagement && currentOrgId && (
        <UserManagementPanel
          orgId={currentOrgId}
          currentUserRole={userRole}
          onClose={() => setShowUserManagement(false)}
        />
      )}
    </div>
  );
}