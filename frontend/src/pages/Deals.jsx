import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { dealsService } from '../services/dealsService';

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterAssignedTo, setFilterAssignedTo] = useState('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    stage: 'prospecting',
    close_date: '',
    lead_id: '',
    assigned_to: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Deal stage options
  const stageOptions = [
    { value: 'prospecting', label: 'Prospecting', color: 'bg-gray-100 text-gray-800' },
    { value: 'qualification', label: 'Qualification', color: 'bg-blue-100 text-blue-800' },
    { value: 'proposal', label: 'Proposal', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-800' },
    { value: 'closed_won', label: 'Closed Won', color: 'bg-green-100 text-green-800' },
    { value: 'closed_lost', label: 'Closed Lost', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    fetchDeals();
    fetchUsers();
    fetchLeads();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDeals();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterStage, filterAssignedTo]);

  const fetchDeals = async () => {
    try {
      const params = { include_lead: true };
      if (searchTerm) params.search = searchTerm;
      if (filterStage !== 'all') params.stage = filterStage;
      if (filterAssignedTo !== 'all') params.assigned_to = filterAssignedTo;
      
      const result = await dealsService.getDeals(params);
      if (result.success) {
        setDeals(result.data.deals || []);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to fetch deals');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const result = await dealsService.getUsers();
      if (result.success) {
        setUsers(result.data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchLeads = async () => {
    try {
      const result = await dealsService.getLeads();
      if (result.success) {
        setLeads(result.data.leads || []);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    }
  };

  const handleAddDeal = () => {
    setIsEditMode(false);
    setSelectedDeal(null);
    setFormData({
      title: '',
      value: '',
      stage: 'prospecting',
      close_date: '',
      lead_id: '',
      assigned_to: '',
      notes: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEditDeal = (deal) => {
    setIsEditMode(true);
    setSelectedDeal(deal);
    setFormData({
      title: deal.title || '',
      value: deal.value || '',
      stage: deal.stage || 'prospecting',
      close_date: deal.close_date ? deal.close_date.split('T')[0] : '',
      lead_id: deal.lead_id || '',
      assigned_to: deal.assigned_to || '',
      notes: deal.notes || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDeleteDeal = async (dealId) => {
    if (!window.confirm('Are you sure you want to delete this deal?')) {
      return;
    }

    try {
      const result = await dealsService.deleteDeal(dealId);
      if (result.success) {
        setDeals(deals.filter(deal => deal.id !== dealId));
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to delete deal');
    }
  };

  const handleAssignDeal = async (dealId, userId) => {
    try {
      const result = await dealsService.assignDeal(dealId, userId);
      if (result.success) {
        setDeals(deals.map(deal => 
          deal.id === dealId 
            ? { ...deal, assigned_to: userId }
            : deal
        ));
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to assign deal');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.value || formData.value <= 0) {
      errors.value = 'Value must be greater than 0';
    }
    
    if (!formData.stage) {
      errors.stage = 'Stage is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        value: parseFloat(formData.value)
      };
      
      let result;
      if (isEditMode) {
        result = await dealsService.updateDeal(selectedDeal.id, submitData);
      } else {
        result = await dealsService.createDeal(submitData);
      }
      
      if (result.success) {
        setIsModalOpen(false);
        fetchDeals();
      } else {
        setFormErrors({ submit: result.error });
      }
    } catch (error) {
      setFormErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getStageColor = (stage) => {
    const stageOption = stageOptions.find(option => option.value === stage);
    return stageOption ? stageOption.color : 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilClose = (closeDate) => {
    if (!closeDate) return null;
    const today = new Date();
    const close = new Date(closeDate);
    const diffTime = close - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCloseDateIndicator = (closeDate) => {
    const days = getDaysUntilClose(closeDate);
    if (days === null) return null;
    
    if (days < 0) {
      return { text: 'Overdue', color: 'text-red-600 bg-red-50' };
    } else if (days === 0) {
      return { text: 'Due Today', color: 'text-orange-600 bg-orange-50' };
    } else if (days <= 7) {
      return { text: `${days} days left`, color: 'text-yellow-600 bg-yellow-50' };
    } else {
      return { text: `${days} days left`, color: 'text-green-600 bg-green-50' };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading deals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your sales pipeline and manage deal progress
          </p>
        </div>
        <button 
          onClick={handleAddDeal}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Deal
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and search */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search deals..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="input"
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
              >
                <option value="all">All Stages</option>
                {stageOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                className="input"
                value={filterAssignedTo}
                onChange={(e) => setFilterAssignedTo(e.target.value)}
              >
                <option value="all">All Users</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Deals table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Close Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deals.map((deal) => {
                  const closeDateIndicator = getCloseDateIndicator(deal.close_date);
                  return (
                    <tr key={deal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                          <div className="text-sm text-gray-500">{formatDate(deal.created_at)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(deal.value)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(deal.stage)}`}>
                          {deal.stage.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <div>
                            <div className="text-sm text-gray-900">{formatDate(deal.close_date)}</div>
                            {closeDateIndicator && (
                              <div className={`text-xs px-1 py-0.5 rounded ${closeDateIndicator.color}`}>
                                {closeDateIndicator.text}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {deal.lead ? deal.lead.name : 'No lead'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={deal.assigned_to || ''}
                          onChange={(e) => handleAssignDeal(deal.id, e.target.value)}
                          className="text-sm border-0 bg-transparent focus:ring-0 focus:outline-none"
                        >
                          <option value="">Unassigned</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.full_name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditDeal(deal)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDeal(deal.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Deal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {isEditMode ? 'Edit Deal' : 'Add New Deal'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deal Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={`input ${formErrors.title ? 'border-red-300' : ''}`}
                        placeholder="Enter deal title"
                      />
                      {formErrors.title && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                      )}
                    </div>

                    {/* Value */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deal Value *
                      </label>
                      <div className="relative">
                        <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          name="value"
                          value={formData.value}
                          onChange={handleInputChange}
                          className={`input pl-10 ${formErrors.value ? 'border-red-300' : ''}`}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      {formErrors.value && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.value}</p>
                      )}
                    </div>

                    {/* Stage and Close Date */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stage *
                        </label>
                        <select
                          name="stage"
                          value={formData.stage}
                          onChange={handleInputChange}
                          className={`input ${formErrors.stage ? 'border-red-300' : ''}`}
                        >
                          {stageOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {formErrors.stage && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.stage}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Close Date
                        </label>
                        <input
                          type="date"
                          name="close_date"
                          value={formData.close_date}
                          onChange={handleInputChange}
                          className="input"
                        />
                      </div>
                    </div>

                    {/* Lead and Assigned To */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Related Lead
                        </label>
                        <select
                          name="lead_id"
                          value={formData.lead_id}
                          onChange={handleInputChange}
                          className="input"
                        >
                          <option value="">No lead</option>
                          {leads.map(lead => (
                            <option key={lead.id} value={lead.id}>
                              {lead.name} - {lead.company}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Assign To
                        </label>
                        <select
                          name="assigned_to"
                          value={formData.assigned_to}
                          onChange={handleInputChange}
                          className="input"
                        >
                          <option value="">Unassigned</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.full_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="input"
                        placeholder="Enter any additional notes"
                      />
                    </div>

                    {/* Submit error */}
                    {formErrors.submit && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">{formErrors.submit}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : (
                      isEditMode ? 'Update Deal' : 'Create Deal'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deals;