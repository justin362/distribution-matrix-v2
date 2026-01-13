import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kvStore from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client with service role key for admin operations
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

// Initialize database tables on startup
async function initializeDatabase() {
  console.log('Initializing database...');
  
  try {
    // Check if tables are already initialized
    const initialized = await kvStore.get('db_initialized');
    if (initialized) {
      console.log('Database already initialized');
      return;
    }
  } catch (error) {
    console.error('Database connection error during initialization check:', error);
    console.log('Will retry initialization on next request');
    return;
  }

  try {
    // Initialize with generic sample data
    const sampleClients = [
      { id: '1', name: 'Sample Client A', status: 'Active', statusDate: null },
      { id: '2', name: 'Sample Client B', status: 'Active', statusDate: null },
      { id: '3', name: 'Sample Client C', status: 'Live', statusDate: 'Q1 2026' },
      { id: '4', name: 'Sample Client D', status: 'Projected', statusDate: 'Q2 2026' },
      { id: '5', name: 'Sample Client E', status: 'Recruiting', statusDate: null },
    ];

    const sampleRetailers = [
      { id: 'retailer-1', name: 'Retailer 1', category: 'Physical', type: 'Mass Merchant', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
      { id: 'retailer-2', name: 'Retailer 2', category: 'Physical', type: 'Warehouse', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
      { id: 'retailer-3', name: 'Retailer 3', category: 'Physical', type: 'Grocery', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
      { id: 'retailer-4', name: 'Retailer 4', category: 'Digital', type: 'E-commerce', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
    ];

    const sampleDistributions = [
      { clientId: '1', retailerId: 'retailer-1', status: 'shelves', notes: '' },
      { clientId: '1', retailerId: 'retailer-2', status: 'shelves', notes: '' },
      { clientId: '2', retailerId: 'retailer-1', status: 'shelves-screens', notes: '' },
      { clientId: '2', retailerId: 'retailer-3', status: 'shelves-screens', notes: '' },
      { clientId: '3', retailerId: 'retailer-4', status: 'shelves-screens', notes: '' },
    ];

    // Store initial data
    await kvStore.set('clients', sampleClients);
    await kvStore.set('retailers', sampleRetailers);
    await kvStore.set('distributions', sampleDistributions);
    await kvStore.set('db_initialized', true);
    
    console.log('Database initialized with sample data');
  } catch (error) {
    console.error('Error initializing database:', error);
    console.log('Will retry initialization on next request');
  }
}

// Initialize database on startup
initializeDatabase().catch(error => {
  console.error('Failed to initialize database on startup:', error);
});

// Helper function to initialize sample data for new users
async function initializeSampleDataForUser(userId: string) {
  const sampleClients = [
    { id: '1', name: 'Sample Client A', status: 'Active', statusDate: null },
    { id: '2', name: 'Sample Client B', status: 'Active', statusDate: null },
    { id: '3', name: 'Sample Client C', status: 'Live', statusDate: 'Q1 2026' },
    { id: '4', name: 'Sample Client D', status: 'Projected', statusDate: 'Q2 2026' },
    { id: '5', name: 'Sample Client E', status: 'Recruiting', statusDate: null },
  ];

  const sampleRetailers = [
    { id: 'retailer-1', name: 'Retailer 1', category: 'Physical', type: 'Mass Merchant', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
    { id: 'retailer-2', name: 'Retailer 2', category: 'Physical', type: 'Warehouse', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
    { id: 'retailer-3', name: 'Retailer 3', category: 'Physical', type: 'Grocery', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
    { id: 'retailer-4', name: 'Retailer 4', category: 'Digital', type: 'E-commerce', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  ];

  const sampleDistributions = [
    { clientId: '1', retailerId: 'retailer-1', status: 'shelves', notes: '' },
    { clientId: '1', retailerId: 'retailer-2', status: 'shelves', notes: '' },
    { clientId: '2', retailerId: 'retailer-1', status: 'shelves-screens', notes: '' },
    { clientId: '2', retailerId: 'retailer-3', status: 'shelves-screens', notes: '' },
    { clientId: '3', retailerId: 'retailer-4', status: 'shelves-screens', notes: '' },
  ];

  // For now, use global keys (would be user-specific in production)
  const clients = await kvStore.get('clients') || [];
  const retailers = await kvStore.get('retailers') || [];
  const distributions = await kvStore.get('distributions') || [];

  if (clients.length === 0) {
    await kvStore.set('clients', sampleClients);
  }
  if (retailers.length === 0) {
    await kvStore.set('retailers', sampleRetailers);
  }
  if (distributions.length === 0) {
    await kvStore.set('distributions', sampleDistributions);
  }
}

// Routes
app.get('/make-server-27d977d5/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/make-server-27d977d5/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true, // Auto-confirm since email server isn't configured
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Initialize sample data for new user
    const userId = data.user.id;
    await initializeSampleDataForUser(userId);

    // Sign in the user to get access token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: sessionData, error: sessionError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (sessionError) {
      return c.json({ error: sessionError.message }, 400);
    }

    return c.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
      },
      accessToken: sessionData.session.access_token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

app.post('/make-server-27d977d5/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      return c.json({ error: error.message }, 401);
    }

    return c.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
      },
      accessToken: data.session.access_token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Failed to sign in' }, 500);
  }
});

app.get('/make-server-27d977d5/auth/session', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return c.json({ user: null }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return c.json({ user: null }, 401);
    }

    return c.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
      },
      accessToken: token,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return c.json({ user: null }, 401);
  }
});

app.post('/make-server-27d977d5/auth/logout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (token) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      );
      await supabase.auth.signOut();
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ error: 'Failed to sign out' }, 500);
  }
});

// Get all clients
app.get('/make-server-27d977d5/clients', async (c) => {
  try {
    const clients = await kvStore.get('clients') || [];
    return c.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return c.json({ error: 'Failed to fetch clients', details: error.message }, 500);
  }
});

// Get all retailers
app.get('/make-server-27d977d5/retailers', async (c) => {
  try {
    const retailers = await kvStore.get('retailers') || [];
    return c.json(retailers);
  } catch (error) {
    console.error('Error fetching retailers:', error);
    return c.json({ error: 'Failed to fetch retailers', details: error.message }, 500);
  }
});

// Get all distributions
app.get('/make-server-27d977d5/distributions', async (c) => {
  try {
    const distributions = await kvStore.get('distributions') || [];
    return c.json(distributions);
  } catch (error) {
    console.error('Error fetching distributions:', error);
    return c.json({ error: 'Failed to fetch distributions', details: error.message }, 500);
  }
});

// Update or create distribution
app.post('/make-server-27d977d5/distributions', async (c) => {
  try {
    const { clientId, retailerId, status, notes } = await c.req.json();
    
    if (!clientId || !retailerId) {
      return c.json({ error: 'clientId and retailerId are required' }, 400);
    }

    const distributions = await kvStore.get('distributions') || [];
    const existingIndex = distributions.findIndex(
      (d: any) => d.clientId === clientId && d.retailerId === retailerId
    );

    const timestamp = new Date().toISOString();
    const updatedDistribution = {
      clientId,
      retailerId,
      status: status || '',
      notes: notes || '',
      updatedAt: timestamp,
    };

    if (existingIndex >= 0) {
      distributions[existingIndex] = updatedDistribution;
    } else {
      distributions.push({ ...updatedDistribution, createdAt: timestamp });
    }

    await kvStore.set('distributions', distributions);

    // Log the change for activity tracking
    const activityLog = await kvStore.get('activity_log') || [];
    activityLog.unshift({
      id: crypto.randomUUID(),
      type: 'distribution_update',
      clientId,
      retailerId,
      status,
      notes,
      timestamp,
    });
    // Keep only last 100 activities
    if (activityLog.length > 100) activityLog.pop();
    await kvStore.set('activity_log', activityLog);

    return c.json(updatedDistribution);
  } catch (error) {
    console.error('Error updating distribution:', error);
    return c.json({ error: 'Failed to update distribution' }, 500);
  }
});

// Create new client
app.post('/make-server-27d977d5/clients', async (c) => {
  try {
    const { name, status, statusDate } = await c.req.json();
    
    if (!name || !status) {
      return c.json({ error: 'name and status are required' }, 400);
    }

    const clients = await kvStore.get('clients') || [];
    const newClient = {
      id: crypto.randomUUID(),
      name,
      status,
      statusDate: statusDate || null,
      createdAt: new Date().toISOString(),
    };

    clients.push(newClient);
    await kvStore.set('clients', clients);

    return c.json(newClient);
  } catch (error) {
    console.error('Error creating client:', error);
    return c.json({ error: 'Failed to create client' }, 500);
  }
});

// Update client
app.put('/make-server-27d977d5/clients/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { name, status, statusDate } = await c.req.json();

    const clients = await kvStore.get('clients') || [];
    const clientIndex = clients.findIndex((client: any) => client.id === id);

    if (clientIndex === -1) {
      return c.json({ error: 'Client not found' }, 404);
    }

    clients[clientIndex] = {
      ...clients[clientIndex],
      name: name ?? clients[clientIndex].name,
      status: status ?? clients[clientIndex].status,
      statusDate: statusDate !== undefined ? statusDate : clients[clientIndex].statusDate,
      updatedAt: new Date().toISOString(),
    };

    await kvStore.set('clients', clients);

    return c.json(clients[clientIndex]);
  } catch (error) {
    console.error('Error updating client:', error);
    return c.json({ error: 'Failed to update client' }, 500);
  }
});

// Delete client
app.delete('/make-server-27d977d5/clients/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const clients = await kvStore.get('clients') || [];
    const filteredClients = clients.filter((client: any) => client.id !== id);

    if (clients.length === filteredClients.length) {
      return c.json({ error: 'Client not found' }, 404);
    }

    await kvStore.set('clients', filteredClients);

    // Also delete associated distributions
    const distributions = await kvStore.get('distributions') || [];
    const filteredDistributions = distributions.filter(
      (d: any) => d.clientId !== id
    );
    await kvStore.set('distributions', filteredDistributions);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return c.json({ error: 'Failed to delete client' }, 500);
  }
});

// Create new retailer
app.post('/make-server-27d977d5/retailers', async (c) => {
  try {
    const { name, category, type } = await c.req.json();
    
    if (!name || !category || !type) {
      return c.json({ error: 'name, category, and type are required' }, 400);
    }

    const retailers = await kvStore.get('retailers') || [];
    const newRetailer = {
      id: name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now(),
      name,
      category,
      type,
      contacts: [],
      lineReviewTiming: '',
      resetDates: '',
      notes: '',
      createdAt: new Date().toISOString(),
    };

    retailers.push(newRetailer);
    await kvStore.set('retailers', retailers);

    return c.json(newRetailer);
  } catch (error) {
    console.error('Error creating retailer:', error);
    return c.json({ error: 'Failed to create retailer' }, 500);
  }
});

// Update retailer
app.put('/make-server-27d977d5/retailers/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { name, category, type, contacts, lineReviewTiming, resetDates, notes } = await c.req.json();

    const retailers = await kvStore.get('retailers') || [];
    const retailerIndex = retailers.findIndex((retailer: any) => retailer.id === id);

    if (retailerIndex === -1) {
      return c.json({ error: 'Retailer not found' }, 404);
    }

    retailers[retailerIndex] = {
      ...retailers[retailerIndex],
      name: name ?? retailers[retailerIndex].name,
      category: category ?? retailers[retailerIndex].category,
      type: type ?? retailers[retailerIndex].type,
      contacts: contacts !== undefined ? contacts : retailers[retailerIndex].contacts,
      lineReviewTiming: lineReviewTiming !== undefined ? lineReviewTiming : retailers[retailerIndex].lineReviewTiming,
      resetDates: resetDates !== undefined ? resetDates : retailers[retailerIndex].resetDates,
      notes: notes !== undefined ? notes : retailers[retailerIndex].notes,
      updatedAt: new Date().toISOString(),
    };

    await kvStore.set('retailers', retailers);

    return c.json(retailers[retailerIndex]);
  } catch (error) {
    console.error('Error updating retailer:', error);
    return c.json({ error: 'Failed to update retailer' }, 500);
  }
});

// Delete retailer
app.delete('/make-server-27d977d5/retailers/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const retailers = await kvStore.get('retailers') || [];
    const filteredRetailers = retailers.filter((retailer: any) => retailer.id !== id);

    if (retailers.length === filteredRetailers.length) {
      return c.json({ error: 'Retailer not found' }, 404);
    }

    await kvStore.set('retailers', filteredRetailers);

    // Also delete associated distributions
    const distributions = await kvStore.get('distributions') || [];
    const filteredDistributions = distributions.filter(
      (d: any) => d.retailerId !== id
    );
    await kvStore.set('distributions', filteredDistributions);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting retailer:', error);
    return c.json({ error: 'Failed to delete retailer' }, 500);
  }
});

// Clear all data
app.post('/make-server-27d977d5/clear-all-data', async (c) => {
  try {
    await kvStore.set('clients', []);
    await kvStore.set('retailers', []);
    await kvStore.set('distributions', []);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error clearing data:', error);
    return c.json({ error: 'Failed to clear data' }, 500);
  }
});

// Get activity log
app.get('/make-server-27d977d5/activity', async (c) => {
  try {
    const activityLog = await kvStore.get('activity_log') || [];
    return c.json(activityLog);
  } catch (error) {
    console.error('Error fetching activity log:', error);
    return c.json({ error: 'Failed to fetch activity log' }, 500);
  }
});

// Get analytics data
app.get('/make-server-27d977d5/analytics', async (c) => {
  try {
    const clients = await kvStore.get('clients') || [];
    const retailers = await kvStore.get('retailers') || [];
    const distributions = await kvStore.get('distributions') || [];
    const analyticsHistory = await kvStore.get('analytics_history') || [];

    // Calculate current metrics
    const totalClients = clients.length;
    const totalRetailers = retailers.length;
    const activeDistributions = distributions.filter((d: any) => d.status && d.status !== '');
    const totalDistributions = activeDistributions.length;

    // Calculate distribution coverage (% of possible client-retailer pairs that have a distribution)
    const possibleDistributions = totalClients * totalRetailers;
    const distributionCoverage = possibleDistributions > 0
      ? Math.round((totalDistributions / possibleDistributions) * 100)
      : 0;

    // Calculate clients by status
    const clientsByStatus: Record<string, number> = {};
    clients.forEach((client: any) => {
      clientsByStatus[client.status] = (clientsByStatus[client.status] || 0) + 1;
    });

    return c.json({
      current: {
        totalClients,
        totalRetailers,
        totalDistributions,
        distributionCoverage,
      },
      clientsByStatus,
      history: analyticsHistory.slice(0, 30), // Return last 30 days
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// Create/update analytics snapshot (called when data changes)
app.post('/make-server-27d977d5/analytics/snapshot', async (c) => {
  try {
    const clients = await kvStore.get('clients') || [];
    const retailers = await kvStore.get('retailers') || [];
    const distributions = await kvStore.get('distributions') || [];
    const analyticsHistory = await kvStore.get('analytics_history') || [];

    const today = new Date().toISOString().split('T')[0];

    // Calculate metrics
    const totalClients = clients.length;
    const totalRetailers = retailers.length;
    const activeDistributions = distributions.filter((d: any) => d.status && d.status !== '');
    const totalDistributions = activeDistributions.length;
    const possibleDistributions = totalClients * totalRetailers;
    const distributionCoverage = possibleDistributions > 0
      ? Math.round((totalDistributions / possibleDistributions) * 100)
      : 0;

    // Calculate clients by status
    const clientsByStatus: Record<string, number> = {};
    clients.forEach((client: any) => {
      clientsByStatus[client.status] = (clientsByStatus[client.status] || 0) + 1;
    });

    const snapshot = {
      date: today,
      totalClients,
      totalRetailers,
      totalDistributions,
      clientsByStatus,
      distributionCoverage,
    };

    // Update or add today's snapshot
    const existingIndex = analyticsHistory.findIndex((s: any) => s.date === today);
    if (existingIndex >= 0) {
      analyticsHistory[existingIndex] = snapshot;
    } else {
      analyticsHistory.unshift(snapshot);
    }

    // Keep only last 90 days
    if (analyticsHistory.length > 90) {
      analyticsHistory.length = 90;
    }

    await kvStore.set('analytics_history', analyticsHistory);

    return c.json(snapshot);
  } catch (error) {
    console.error('Error creating analytics snapshot:', error);
    return c.json({ error: 'Failed to create analytics snapshot' }, 500);
  }
});

// ===== ORGANIZATION MANAGEMENT =====

// Helper to verify user token and get user info
async function verifyUser(c: any) {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }

  return data.user;
}

// Get user profile with organizations
app.get('/make-server-27d977d5/user/profile', async (c) => {
  try {
    const user = await verifyUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profileKey = `user:${user.id}:profile`;
    let profile = await kvStore.get(profileKey);

    // Create profile if doesn't exist
    if (!profile) {
      profile = {
        userId: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
        currentOrgId: null,
        organizations: [],
      };
      await kvStore.set(profileKey, profile);
    }

    return c.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Create a new organization
app.post('/make-server-27d977d5/organizations', async (c) => {
  try {
    const user = await verifyUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name } = await c.req.json();
    if (!name) {
      return c.json({ error: 'Organization name is required' }, 400);
    }

    const orgId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const organization = {
      id: orgId,
      name,
      createdAt: timestamp,
      createdBy: user.id,
    };

    // Save organization
    await kvStore.set(`org:${orgId}:info`, organization);

    // Add creator as admin member
    const members = [{
      userId: user.id,
      email: user.email,
      name: user.user_metadata?.name || '',
      role: 'admin',
      joinedAt: timestamp,
    }];
    await kvStore.set(`org:${orgId}:members`, members);

    // Initialize empty data for the org
    await kvStore.set(`org:${orgId}:clients`, []);
    await kvStore.set(`org:${orgId}:retailers`, []);
    await kvStore.set(`org:${orgId}:distributions`, []);
    await kvStore.set(`org:${orgId}:analytics_history`, []);

    // Update user profile
    const profileKey = `user:${user.id}:profile`;
    let profile = await kvStore.get(profileKey) || {
      userId: user.id,
      email: user.email,
      name: user.user_metadata?.name || '',
      currentOrgId: null,
      organizations: [],
    };

    profile.organizations.push({ orgId, role: 'admin' });
    profile.currentOrgId = orgId;
    await kvStore.set(profileKey, profile);

    return c.json({ organization, role: 'admin' });
  } catch (error) {
    console.error('Error creating organization:', error);
    return c.json({ error: 'Failed to create organization' }, 500);
  }
});

// Get user's organizations
app.get('/make-server-27d977d5/organizations', async (c) => {
  try {
    const user = await verifyUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profileKey = `user:${user.id}:profile`;
    const profile = await kvStore.get(profileKey);

    if (!profile || !profile.organizations.length) {
      return c.json([]);
    }

    const organizations = [];
    for (const membership of profile.organizations) {
      const org = await kvStore.get(`org:${membership.orgId}:info`);
      if (org) {
        organizations.push({ ...org, role: membership.role });
      }
    }

    return c.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return c.json({ error: 'Failed to fetch organizations' }, 500);
  }
});

// Switch active organization
app.post('/make-server-27d977d5/organizations/switch', async (c) => {
  try {
    const user = await verifyUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { orgId } = await c.req.json();

    const profileKey = `user:${user.id}:profile`;
    const profile = await kvStore.get(profileKey);

    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Verify user is member of the organization
    const membership = profile.organizations.find((o: any) => o.orgId === orgId);
    if (!membership) {
      return c.json({ error: 'Not a member of this organization' }, 403);
    }

    profile.currentOrgId = orgId;
    await kvStore.set(profileKey, profile);

    return c.json({ success: true, currentOrgId: orgId, role: membership.role });
  } catch (error) {
    console.error('Error switching organization:', error);
    return c.json({ error: 'Failed to switch organization' }, 500);
  }
});

// Get organization members
app.get('/make-server-27d977d5/organizations/:orgId/members', async (c) => {
  try {
    const user = await verifyUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const orgId = c.req.param('orgId');
    const profileKey = `user:${user.id}:profile`;
    const profile = await kvStore.get(profileKey);

    // Verify user is member of this org
    if (!profile?.organizations.some((o: any) => o.orgId === orgId)) {
      return c.json({ error: 'Not a member of this organization' }, 403);
    }

    const members = await kvStore.get(`org:${orgId}:members`) || [];
    return c.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    return c.json({ error: 'Failed to fetch members' }, 500);
  }
});

// Invite user to organization (admin only)
app.post('/make-server-27d977d5/organizations/:orgId/invite', async (c) => {
  try {
    const user = await verifyUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const orgId = c.req.param('orgId');
    const { email, role } = await c.req.json();

    if (!email || !role) {
      return c.json({ error: 'Email and role are required' }, 400);
    }

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return c.json({ error: 'Invalid role' }, 400);
    }

    const profileKey = `user:${user.id}:profile`;
    const profile = await kvStore.get(profileKey);

    // Verify user is admin of this org
    const membership = profile?.organizations.find((o: any) => o.orgId === orgId);
    if (!membership || membership.role !== 'admin') {
      return c.json({ error: 'Only admins can invite users' }, 403);
    }

    const invites = await kvStore.get(`org:${orgId}:invites`) || [];
    const invite = {
      id: crypto.randomUUID(),
      orgId,
      email: email.toLowerCase(),
      role,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    invites.push(invite);
    await kvStore.set(`org:${orgId}:invites`, invites);

    return c.json(invite);
  } catch (error) {
    console.error('Error creating invite:', error);
    return c.json({ error: 'Failed to create invite' }, 500);
  }
});

// Accept organization invite
app.post('/make-server-27d977d5/organizations/accept-invite', async (c) => {
  try {
    const user = await verifyUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { inviteId, orgId } = await c.req.json();

    const invites = await kvStore.get(`org:${orgId}:invites`) || [];
    const invite = invites.find((i: any) => i.id === inviteId && i.email === user.email?.toLowerCase());

    if (!invite || invite.status !== 'pending') {
      return c.json({ error: 'Invalid or expired invite' }, 400);
    }

    // Update invite status
    invite.status = 'accepted';
    await kvStore.set(`org:${orgId}:invites`, invites);

    // Add user to org members
    const members = await kvStore.get(`org:${orgId}:members`) || [];
    members.push({
      userId: user.id,
      email: user.email,
      name: user.user_metadata?.name || '',
      role: invite.role,
      joinedAt: new Date().toISOString(),
    });
    await kvStore.set(`org:${orgId}:members`, members);

    // Update user profile
    const profileKey = `user:${user.id}:profile`;
    let profile = await kvStore.get(profileKey) || {
      userId: user.id,
      email: user.email,
      name: user.user_metadata?.name || '',
      currentOrgId: null,
      organizations: [],
    };

    profile.organizations.push({ orgId, role: invite.role });
    if (!profile.currentOrgId) {
      profile.currentOrgId = orgId;
    }
    await kvStore.set(profileKey, profile);

    return c.json({ success: true, role: invite.role });
  } catch (error) {
    console.error('Error accepting invite:', error);
    return c.json({ error: 'Failed to accept invite' }, 500);
  }
});

// Update member role (admin only)
app.put('/make-server-27d977d5/organizations/:orgId/members/:userId', async (c) => {
  try {
    const user = await verifyUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const orgId = c.req.param('orgId');
    const targetUserId = c.req.param('userId');
    const { role } = await c.req.json();

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return c.json({ error: 'Invalid role' }, 400);
    }

    const profileKey = `user:${user.id}:profile`;
    const profile = await kvStore.get(profileKey);

    // Verify user is admin
    const membership = profile?.organizations.find((o: any) => o.orgId === orgId);
    if (!membership || membership.role !== 'admin') {
      return c.json({ error: 'Only admins can update roles' }, 403);
    }

    // Update member role
    const members = await kvStore.get(`org:${orgId}:members`) || [];
    const memberIndex = members.findIndex((m: any) => m.userId === targetUserId);
    if (memberIndex === -1) {
      return c.json({ error: 'Member not found' }, 404);
    }

    members[memberIndex].role = role;
    await kvStore.set(`org:${orgId}:members`, members);

    // Update target user's profile
    const targetProfileKey = `user:${targetUserId}:profile`;
    const targetProfile = await kvStore.get(targetProfileKey);
    if (targetProfile) {
      const orgIndex = targetProfile.organizations.findIndex((o: any) => o.orgId === orgId);
      if (orgIndex >= 0) {
        targetProfile.organizations[orgIndex].role = role;
        await kvStore.set(targetProfileKey, targetProfile);
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating member role:', error);
    return c.json({ error: 'Failed to update role' }, 500);
  }
});

// Remove member from organization (admin only)
app.delete('/make-server-27d977d5/organizations/:orgId/members/:userId', async (c) => {
  try {
    const user = await verifyUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const orgId = c.req.param('orgId');
    const targetUserId = c.req.param('userId');

    const profileKey = `user:${user.id}:profile`;
    const profile = await kvStore.get(profileKey);

    // Verify user is admin
    const membership = profile?.organizations.find((o: any) => o.orgId === orgId);
    if (!membership || membership.role !== 'admin') {
      return c.json({ error: 'Only admins can remove members' }, 403);
    }

    // Can't remove yourself if you're the only admin
    if (targetUserId === user.id) {
      const members = await kvStore.get(`org:${orgId}:members`) || [];
      const adminCount = members.filter((m: any) => m.role === 'admin').length;
      if (adminCount <= 1) {
        return c.json({ error: 'Cannot remove the only admin' }, 400);
      }
    }

    // Remove from members
    const members = await kvStore.get(`org:${orgId}:members`) || [];
    const filteredMembers = members.filter((m: any) => m.userId !== targetUserId);
    await kvStore.set(`org:${orgId}:members`, filteredMembers);

    // Update target user's profile
    const targetProfileKey = `user:${targetUserId}:profile`;
    const targetProfile = await kvStore.get(targetProfileKey);
    if (targetProfile) {
      targetProfile.organizations = targetProfile.organizations.filter((o: any) => o.orgId !== orgId);
      if (targetProfile.currentOrgId === orgId) {
        targetProfile.currentOrgId = targetProfile.organizations[0]?.orgId || null;
      }
      await kvStore.set(targetProfileKey, targetProfile);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return c.json({ error: 'Failed to remove member' }, 500);
  }
});

// Get pending invites for user
app.get('/make-server-27d977d5/user/invites', async (c) => {
  try {
    const user = await verifyUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Search all orgs for invites to this user
    // In a real app, you'd have a more efficient index
    const allOrgKeys = await kvStore.keys('org:*:invites');
    const pendingInvites = [];

    for (const key of allOrgKeys || []) {
      const invites = await kvStore.get(key);
      if (invites) {
        for (const invite of invites) {
          if (invite.email === user.email?.toLowerCase() && invite.status === 'pending') {
            const org = await kvStore.get(`org:${invite.orgId}:info`);
            pendingInvites.push({ ...invite, organizationName: org?.name || 'Unknown' });
          }
        }
      }
    }

    return c.json(pendingInvites);
  } catch (error) {
    console.error('Error fetching invites:', error);
    return c.json({ error: 'Failed to fetch invites' }, 500);
  }
});

Deno.serve(app.fetch);