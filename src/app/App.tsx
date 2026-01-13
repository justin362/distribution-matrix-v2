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
import { projectId, publicAnonKey } from '/utils/supabase/info';
import type { Client, Retailer, Distribution } from './types';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-27d977d5`;

// Fallback data in case server isn't ready
const fallbackClients: Client[] = [
  { id: '1', name: 'GCC-PvL', status: 'Active', statusDate: null },
  { id: '2', name: 'GCC-IV', status: 'Active', statusDate: null },
  { id: '3', name: 'CRP', status: 'Active', statusDate: null },
  { id: '4', name: 'Purell', status: 'Live', statusDate: 'January 2026' },
  { id: '5', name: 'Hot Logic', status: 'Active', statusDate: null },
  { id: '6', name: 'Nisa', status: 'Active', statusDate: null },
  { id: '7', name: 'KOM', status: 'Active', statusDate: null },
  { id: '8', name: 'Eternal Scents', status: 'Active', statusDate: null },
  { id: '9', name: 'Koozie', status: 'Projected', statusDate: 'January 2026' },
  { id: '10', name: 'Clavel', status: 'Projected', statusDate: 'February 2026' },
  { id: '11', name: 'Seven Week Coffee', status: 'Projected', statusDate: 'February 2026' },
  { id: '12', name: 'Glia Coffee', status: 'Recruiting', statusDate: null },
];

const fallbackRetailers: Retailer[] = [
  { id: 'walmart', name: 'Walmart', category: 'Physical', type: 'Mass Merchant', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  { id: 'sams', name: "Sam's Club", category: 'Physical', type: 'Warehouse', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  { id: 'costco', name: 'Costco', category: 'Physical', type: 'Warehouse', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  { id: 'target', name: 'Target', category: 'Physical', type: 'Mass Merchant', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  { id: 'bjs', name: "BJ's", category: 'Physical', type: 'Warehouse', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  { id: 'kroger', name: 'Kroger', category: 'Physical', type: 'Grocery', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  { id: 'safeway', name: 'Safeway', category: 'Physical', type: 'Grocery', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  { id: 'publix', name: 'Publix', category: 'Physical', type: 'Grocery', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  { id: 'hyvee', name: 'Hy-Vee', category: 'Physical', type: 'Grocery', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  { id: 'meijer', name: 'Meijer', category: 'Physical', type: 'Grocery', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  { id: 'heb', name: 'HEB', category: 'Physical', type: 'Grocery', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  { id: 'homedepot', name: 'Home Depot', category: 'Physical', type: 'Home Improvement', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  { id: 'lowes', name: 'Lowes', category: 'Physical', type: 'Home Improvement', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  { id: 'walgreens', name: 'Walgreens', category: 'Physical', type: 'Pharmacy', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  { id: 'cvs', name: 'CVS', category: 'Physical', type: 'Pharmacy', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  { id: 'other', name: 'Other', category: 'Physical', type: 'Other', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  { id: 'wayfair', name: 'Wayfair', category: 'Digital', type: 'E-commerce', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  { id: 'amazon', name: 'Amazon', category: 'Digital', type: 'E-commerce', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  { id: 'shopify', name: 'Shopify', category: 'Digital', type: 'E-commerce', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
];

const fallbackDistributions: Distribution[] = [
  { clientId: '1', retailerId: 'walmart', status: 'shelves', notes: '' },
  { clientId: '1', retailerId: 'sams', status: 'shelves', notes: '' },
  { clientId: '1', retailerId: 'costco', status: 'shelves', notes: '' },
  { clientId: '1', retailerId: 'target', status: 'shelves', notes: '' },
  { clientId: '1', retailerId: 'bjs', status: 'shelves', notes: '' },
  { clientId: '1', retailerId: 'kroger', status: 'shelves', notes: '' },
  { clientId: '1', retailerId: 'safeway', status: 'shelves', notes: '' },
  { clientId: '1', retailerId: 'publix', status: 'shelves', notes: '' },
  { clientId: '1', retailerId: 'hyvee', status: 'shelves', notes: '' },
  { clientId: '1', retailerId: 'meijer', status: 'shelves', notes: '' },
  { clientId: '1', retailerId: 'heb', status: 'shelves', notes: '' },
  { clientId: '1', retailerId: 'other', status: 'shelves', notes: '' },
  { clientId: '2', retailerId: 'walmart', status: 'shelves-screens', notes: '' },
  { clientId: '2', retailerId: 'sams', status: 'shelves-screens', notes: '' },
  { clientId: '2', retailerId: 'costco', status: 'shelves-screens', notes: 'Re-Negosh' },
  { clientId: '2', retailerId: 'target', status: 'shelves-screens', notes: '' },
  { clientId: '2', retailerId: 'bjs', status: 'shelves-screens', notes: '' },
  { clientId: '3', retailerId: 'walmart', status: 'shelves-screens', notes: '' },
  { clientId: '3', retailerId: 'sams', status: 'shelves-screens', notes: '' },
  { clientId: '3', retailerId: 'costco', status: 'shelves-screens', notes: '' },
  { clientId: '3', retailerId: 'target', status: 'shelves-screens', notes: '' },
  { clientId: '3', retailerId: 'kroger', status: 'shelves-screens', notes: '' },
  { clientId: '3', retailerId: 'hyvee', status: 'shelves-screens', notes: '' },
  { clientId: '3', retailerId: 'meijer', status: 'shelves-screens', notes: '' },
  { clientId: '3', retailerId: 'homedepot', status: 'shelves-screens', notes: '' },
  { clientId: '3', retailerId: 'lowes', status: 'shelves-screens', notes: '' },
  { clientId: '3', retailerId: 'walgreens', status: 'shelves-screens', notes: '' },
  { clientId: '3', retailerId: 'cvs', status: 'shelves-screens', notes: '' },
  { clientId: '3', retailerId: 'other', status: 'shelves-screens', notes: '' },
  { clientId: '3', retailerId: 'amazon', status: 'x-client', notes: 'Conflict' },
  { clientId: '3', retailerId: 'shopify', status: 'shelves-screens', notes: '' },
  { clientId: '5', retailerId: 'costco', status: 'shelves-screens', notes: 'Re-Negosh' },
  { clientId: '7', retailerId: 'target', status: 'shelves-screens', notes: '' },
  { clientId: '7', retailerId: 'kroger', status: 'shelves-screens', notes: '' },
  { clientId: '7', retailerId: 'hyvee', status: 'shelves-screens', notes: '' },
  { clientId: '7', retailerId: 'meijer', status: 'shelves-screens', notes: '' },
  { clientId: '7', retailerId: 'heb', status: 'shelves-screens', notes: '' },
  { clientId: '9', retailerId: 'target', status: 'shelves-screens', notes: '' },
  { clientId: '9', retailerId: 'kroger', status: 'shelves-screens', notes: '' },
  { clientId: '9', retailerId: 'safeway', status: 'shelves-screens', notes: '' },
  { clientId: '9', retailerId: 'homedepot', status: 'shelves-screens', notes: '' },
  { clientId: '9', retailerId: 'lowes', status: 'shelves-screens', notes: '' },
  { clientId: '9', retailerId: 'walgreens', status: 'shelves-screens', notes: '' },
  { clientId: '9', retailerId: 'other', status: 'shelves-screens', notes: '' },
  { clientId: '10', retailerId: 'target', status: 'shelves-screens', notes: 'Consult' },
  { clientId: '11', retailerId: 'target', status: 'shelves-screens', notes: '' },
  { clientId: '11', retailerId: 'kroger', status: 'shelves-screens', notes: '' },
  { clientId: '11', retailerId: 'shopify', status: 'x-client', notes: '' },
  { clientId: '12', retailerId: 'walmart', status: 'shelves-screens', notes: '' },
  { clientId: '12', retailerId: 'target', status: 'shelves-screens', notes: '' },
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
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [accessToken, setAccessToken] = useState('');

  // Fetch data from Supabase
  useEffect(() => {
    // Check for existing session
    checkSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
      // Only poll if using server data - reduce polling frequency
      const interval = setInterval(() => {
        if (!useLocalData) {
          fetchAllData();
        }
      }, 10000); // Poll every 10 seconds
      return () => clearInterval(interval);
    }
  }, [useLocalData, isAuthenticated]);

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
    try {
      const [clientsRes, retailersRes, distributionsRes] = await Promise.all([
        fetch(`${API_URL}/clients`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }).catch(() => null),
        fetch(`${API_URL}/retailers`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }).catch(() => null),
        fetch(`${API_URL}/distributions`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
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
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ clientId, retailerId, status, notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to update distribution');
      }

      // Refresh data immediately after update
      await fetchAllData();
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
          Authorization: `Bearer ${publicAnonKey}`,
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
          Authorization: `Bearer ${publicAnonKey}`,
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
        headers: { Authorization: `Bearer ${publicAnonKey}` },
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
          Authorization: `Bearer ${publicAnonKey}`,
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
          Authorization: `Bearer ${publicAnonKey}`,
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
        headers: { Authorization: `Bearer ${publicAnonKey}` },
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
          Authorization: `Bearer ${publicAnonKey}`,
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
        onSettings={() => setShowSettings(true)}
        onLogout={handleLogout}
        userEmail={userEmail}
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
    </div>
  );
}