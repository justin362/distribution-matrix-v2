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
    // Initialize with sample data
    const sampleClients = [
      { id: '1', name: 'GCC-PvL', status: 'Active', statusDate: null },
      { id: '2', name: 'GCC-IV', status: 'Active', statusDate: null },
      { id: '3', name: 'CRP', status: 'Active', statusDate: null },
      { id: '4', name: 'Purell', status: 'Live', statusDate: 'January 2026' },
      { id: '5', name: 'Hot Logic', status: 'Active', statusDate: null },
    ];

    const sampleRetailers = [
      { id: 'walmart', name: 'Walmart', category: 'Physical', type: 'Mass Merchant', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
      { id: 'target', name: 'Target', category: 'Physical', type: 'Mass Merchant', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
      { id: 'costco', name: 'Costco', category: 'Physical', type: 'Warehouse', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
      { id: 'amazon', name: 'Amazon', category: 'Digital', type: 'E-commerce', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
    ];

    const sampleDistributions = [
      { clientId: '1', retailerId: 'walmart', status: 'shelves', notes: '' },
      { clientId: '1', retailerId: 'target', status: 'shelves', notes: '' },
      { clientId: '2', retailerId: 'costco', status: 'shelves-screens', notes: '' },
      { clientId: '3', retailerId: 'amazon', status: 'shelves-screens', notes: '' },
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
    { id: '1', name: 'GCC-PvL', status: 'Active', statusDate: null },
    { id: '2', name: 'GCC-IV', status: 'Active', statusDate: null },
    { id: '3', name: 'CRP', status: 'Active', statusDate: null },
    { id: '4', name: 'Purell', status: 'Live', statusDate: 'January 2026' },
    { id: '5', name: 'Hot Logic', status: 'Active', statusDate: null },
  ];

  const sampleRetailers = [
    { id: 'walmart', name: 'Walmart', category: 'Physical', type: 'Mass Merchant', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
    { id: 'target', name: 'Target', category: 'Physical', type: 'Mass Merchant', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
    { id: 'costco', name: 'Costco', category: 'Physical', type: 'Warehouse', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
    { id: 'amazon', name: 'Amazon', category: 'Digital', type: 'E-commerce', contacts: [], lineReviewTiming: '', resetDates: '', notes: '' },
  ];

  const sampleDistributions = [
    { clientId: '1', retailerId: 'walmart', status: 'shelves', notes: '' },
    { clientId: '1', retailerId: 'target', status: 'shelves', notes: '' },
    { clientId: '2', retailerId: 'costco', status: 'shelves-screens', notes: '' },
    { clientId: '3', retailerId: 'amazon', status: 'shelves-screens', notes: '' },
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

Deno.serve(app.fetch);