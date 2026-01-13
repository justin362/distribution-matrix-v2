import { X, Store, Calendar, FileText, Save, Package, TrendingUp, User, Phone, Mail, Clock, RefreshCw, Plus, Edit2, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Client, Retailer, Distribution, RetailerContact } from '../types';

interface RetailerDetailPanelProps {
  retailer: Retailer;
  client: Client | null;
  clients: Client[];
  distribution?: Distribution;
  distributions: Distribution[];
  onClose: () => void;
  onUpdate: (clientId: string, retailerId: string, status: string, notes: string) => void;
  onUpdateRetailer?: (retailer: Retailer) => void;
}

export function RetailerDetailPanel({
  retailer,
  client,
  clients,
  distribution,
  distributions,
  onClose,
  onUpdate,
  onUpdateRetailer,
}: RetailerDetailPanelProps) {
  const [status, setStatus] = useState(distribution?.status || '');
  const [notes, setNotes] = useState(distribution?.notes || '');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Retailer-level information
  const [contacts, setContacts] = useState<RetailerContact[]>(retailer.contacts || []);
  const [lineReviewTiming, setLineReviewTiming] = useState(retailer.lineReviewTiming || '');
  const [resetDates, setResetDates] = useState(retailer.resetDates || '');
  const [retailerNotes, setRetailerNotes] = useState(retailer.notes || '');
  const [hasRetailerChanges, setHasRetailerChanges] = useState(false);
  
  // Contact form
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Get all clients for this retailer
  const retailerClients = distributions
    .filter(d => d.retailerId === retailer.id && d.status)
    .map(d => {
      const clientData = clients.find(c => c.id === d.clientId);
      return clientData ? { ...clientData, distribution: d } : null;
    })
    .filter((c): c is Client & { distribution: Distribution } => c !== null);

  useEffect(() => {
    setStatus(distribution?.status || '');
    setNotes(distribution?.notes || '');
    setHasChanges(false);
    setContacts(retailer.contacts || []);
    setLineReviewTiming(retailer.lineReviewTiming || '');
    setResetDates(retailer.resetDates || '');
    setRetailerNotes(retailer.notes || '');
    setHasRetailerChanges(false);
  }, [distribution, retailer]);

  const handleSave = () => {
    onUpdate(client?.id || '', retailer.id, status, notes);
    setHasChanges(false);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setHasChanges(true);
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    setHasChanges(true);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'shelves': return 'Shelves Only';
      case 'shelves-screens': return 'Shelves & Screens';
      case 'x-client': return 'X-Client';
      default: return 'Not Active';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shelves': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shelves-screens': return 'bg-green-100 text-green-800 border-green-300';
      case 'x-client': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleAddContact = () => {
    if (!contactForm.name.trim()) return;
    
    const newContact: RetailerContact = {
      id: crypto.randomUUID(),
      name: contactForm.name,
      role: contactForm.role,
      email: contactForm.email,
      phone: contactForm.phone,
      notes: contactForm.notes,
    };
    
    setContacts(prev => [...prev, newContact]);
    setContactForm({ name: '', role: '', email: '', phone: '', notes: '' });
    setShowContactForm(false);
    setHasRetailerChanges(true);
  };

  const handleUpdateContact = () => {
    if (!editingContactId || !contactForm.name.trim()) return;
    
    setContacts(prev => prev.map(c => 
      c.id === editingContactId 
        ? { ...c, ...contactForm }
        : c
    ));
    
    setContactForm({ name: '', role: '', email: '', phone: '', notes: '' });
    setEditingContactId(null);
    setShowContactForm(false);
    setHasRetailerChanges(true);
  };

  const handleEditContact = (contact: RetailerContact) => {
    setEditingContactId(contact.id);
    setContactForm({
      name: contact.name,
      role: contact.role,
      email: contact.email,
      phone: contact.phone,
      notes: contact.notes,
    });
    setShowContactForm(true);
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts(prev => prev.filter(c => c.id !== contactId));
    setHasRetailerChanges(true);
  };

  const handleSaveRetailerInfo = () => {
    if (onUpdateRetailer) {
      onUpdateRetailer({
        ...retailer,
        contacts,
        lineReviewTiming,
        resetDates,
        notes: retailerNotes,
      });
      setHasRetailerChanges(false);
    }
  };

  // If no specific client is selected, show retailer overview
  if (!client) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>
        <div className="fixed right-0 top-0 bottom-0 w-full max-w-3xl bg-white shadow-2xl z-50 overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-lg z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{retailer.name}</h2>
                  <p className="text-indigo-100 text-sm mt-1">
                    {retailer.category} • {retailer.type}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Key Contacts Section */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Key Contacts</h3>
                  </div>
                  <button
                    onClick={() => {
                      setContactForm({ name: '', role: '', email: '', phone: '', notes: '' });
                      setEditingContactId(null);
                      setShowContactForm(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Contact
                  </button>
                </div>
              </div>

              {showContactForm && (
                <div className="p-4 bg-indigo-50 border-b border-indigo-200">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {editingContactId ? 'Edit Contact' : 'New Contact'}
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Name *"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Role (e.g., Buyer, Category Manager)"
                        value={contactForm.role}
                        onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="email"
                        placeholder="Email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Notes"
                      value={contactForm.notes}
                      onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={editingContactId ? handleUpdateContact : handleAddContact}
                        className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
                      >
                        {editingContactId ? 'Update' : 'Add'} Contact
                      </button>
                      <button
                        onClick={() => {
                          setShowContactForm(false);
                          setEditingContactId(null);
                          setContactForm({ name: '', role: '', email: '', phone: '', notes: '' });
                        }}
                        className="px-4 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {contacts.length === 0 ? (
                <div className="p-8 text-center">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No contacts added yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                            {contact.role && (
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                {contact.role}
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            {contact.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <a href={`mailto:${contact.email}`} className="hover:text-indigo-600">
                                  {contact.email}
                                </a>
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <a href={`tel:${contact.phone}`} className="hover:text-indigo-600">
                                  {contact.phone}
                                </a>
                              </div>
                            )}
                            {contact.notes && (
                              <p className="text-gray-500 italic text-xs mt-1">{contact.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditContact(contact)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete contact ${contact.name}?`)) {
                                handleDeleteContact(contact.id);
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Important Dates Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Important Dates & Timing</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Line Review Timing
                  </label>
                  <input
                    type="text"
                    value={lineReviewTiming}
                    onChange={(e) => {
                      setLineReviewTiming(e.target.value);
                      setHasRetailerChanges(true);
                    }}
                    placeholder="e.g., Quarterly - March, June, September, December"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Reset Dates
                    </div>
                  </label>
                  <input
                    type="text"
                    value={resetDates}
                    onChange={(e) => {
                      setResetDates(e.target.value);
                      setHasRetailerChanges(true);
                    }}
                    placeholder="e.g., Spring: April 1, Fall: October 1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Retailer Notes */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Retailer Notes</h3>
              </div>
              <textarea
                value={retailerNotes}
                onChange={(e) => {
                  setRetailerNotes(e.target.value);
                  setHasRetailerChanges(true);
                }}
                placeholder="Add general notes about this retailer..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={4}
              />
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600">
                  {retailerClients.length}
                </div>
                <div className="text-sm text-blue-900 mt-1 font-medium">Total Products</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600">
                  {contacts.length}
                </div>
                <div className="text-sm text-green-900 mt-1 font-medium">Key Contacts</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-600">
                  {retailer.category}
                </div>
                <div className="text-sm text-purple-900 mt-1 font-medium">Channel Type</div>
              </div>
            </div>

            {/* Products List */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Products at {retailer.name}</h3>
                </div>
              </div>
              
              {retailerClients.length === 0 ? (
                <div className="p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No products currently at this retailer</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {retailerClients.map((clientData) => (
                    <div key={clientData.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{clientData.name}</h4>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                              clientData.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' :
                              clientData.status === 'Live' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              clientData.status === 'Projected' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                              'bg-purple-100 text-purple-800 border-purple-200'
                            }`}>
                              {clientData.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <span className={`px-3 py-1 rounded-full border font-medium ${getStatusColor(clientData.distribution.status)}`}>
                              {getStatusLabel(clientData.distribution.status)}
                            </span>
                            
                            {clientData.distribution.notes && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <FileText className="w-4 h-4" />
                                <span>{clientData.distribution.notes}</span>
                              </div>
                            )}
                          </div>
                          
                          {clientData.statusDate && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                              <Calendar className="w-3 h-3" />
                              <span>{clientData.statusDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Distribution Breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Distribution Breakdown</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="font-medium text-gray-900">Shelves Only</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {retailerClients.filter(c => c.distribution.status === 'shelves').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="font-medium text-gray-900">Shelves & Screens</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {retailerClients.filter(c => c.distribution.status === 'shelves-screens').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="font-medium text-gray-900">X-Client / Conflict</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">
                    {retailerClients.filter(c => c.distribution.status === 'x-client').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {hasRetailerChanges && (
              <div className="sticky bottom-0 -mx-6 -mb-6 p-6 bg-gradient-to-t from-white via-white to-transparent border-t border-gray-200">
                <button
                  onClick={handleSaveRetailerInfo}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-medium"
                >
                  <Save className="w-5 h-5" />
                  Save Retailer Information
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // Original single client-retailer relationship view
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{retailer.name}</h2>
                <p className="text-indigo-100 text-sm mt-1">
                  {retailer.category} • {retailer.type}
                </p>
                <p className="text-indigo-100 text-sm mt-2">
                  Client: <span className="font-semibold">{client?.name || 'None'}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Distribution Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution Status</h3>
            <div className="space-y-3">
              {[
                { value: '', label: 'Not Active', color: 'gray' },
                { value: 'shelves', label: 'Shelves Only', color: 'blue' },
                { value: 'shelves-screens', label: 'Shelves & Screens', color: 'green' },
                { value: 'x-client', label: 'X-Client / Conflict', color: 'red' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    status === option.value
                      ? `border-${option.color}-500 bg-${option.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={status === option.value}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`w-4 h-4 rounded bg-${option.color}-500`}></div>
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Notes & Details</h3>
            </div>
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Add notes about this distribution relationship (e.g., Re-Negosh, Consult, specific terms, etc.)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows={6}
            />
          </div>

          {/* Client Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Client Name:</span>
                <span className="font-medium text-gray-900">{client?.name || 'None'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  client?.status === 'Active' ? 'bg-green-100 text-green-800' :
                  client?.status === 'Live' ? 'bg-blue-100 text-blue-800' :
                  client?.status === 'Projected' ? 'bg-orange-100 text-orange-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {client?.status || 'None'}
                </span>
              </div>
              {client?.statusDate && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status Date:</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{client.statusDate}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-indigo-600">
                  {distribution ? '1' : '0'}
                </div>
                <div className="text-sm text-gray-600 mt-1">Active Distribution</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">
                  {retailer.category}
                </div>
                <div className="text-sm text-gray-600 mt-1">Channel Type</div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {hasChanges && (
            <div className="sticky bottom-0 -mx-6 -mb-6 p-6 bg-gradient-to-t from-white via-white to-transparent border-t border-gray-200">
              <button
                onClick={handleSave}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-medium"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}