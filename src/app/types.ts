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