export interface Client {
  id: string;
  name: string;
  status: 'Active' | 'Live' | 'Projected' | 'Recruiting';
  statusDate: string | null;
}

export interface RetailerContact {
  id: string;
  name: string;
  role: string; // e.g., "Buyer", "Category Manager", "VP Merchandising"
  email: string;
  phone: string;
  notes: string;
}

export interface Retailer {
  id: string;
  name: string;
  category: 'Physical' | 'Digital';
  type: string;
  contacts?: RetailerContact[];
  lineReviewTiming?: string; // e.g., "Quarterly - March, June, Sept, Dec"
  resetDates?: string; // e.g., "Spring: April 1, Fall: October 1"
  notes?: string;
}

export interface Distribution {
  clientId: string;
  retailerId: string;
  status: 'shelves' | 'shelves-screens' | 'x-client' | '';
  notes: string;
}

// Analytics types
export interface DailySnapshot {
  date: string;
  totalClients: number;
  totalRetailers: number;
  totalDistributions: number;
  clientsByStatus: Record<string, number>;
  distributionCoverage: number;
}

export interface AnalyticsData {
  current: {
    totalClients: number;
    totalRetailers: number;
    totalDistributions: number;
    distributionCoverage: number;
  };
  clientsByStatus: Record<string, number>;
  history: DailySnapshot[];
}

// Multi-User Organization types
export type UserRole = 'admin' | 'editor' | 'viewer';

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
}

export interface OrganizationMember {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  joinedAt: string;
}

export interface OrganizationInvite {
  id: string;
  orgId: string;
  email: string;
  role: UserRole;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  currentOrgId: string | null;
  organizations: { orgId: string; role: UserRole }[];
}