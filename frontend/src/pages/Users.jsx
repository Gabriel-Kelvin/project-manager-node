import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  UserIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  UserMinusIcon,
  UserPlusIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { usersService } from '../services/usersService';
import { useAuth } from '../contexts/AuthContext';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modal states
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    role: 'user'
  });
  const [formErrors, setFormErrors] = useState({});

  // User role options
  const roleOptions = [
    { value: 'user', label: 'User', color: 'bg-blue-100 text-blue-800', icon: UserIcon },
    { value: 'manager', label: 'Manager', color: 'bg-purple-100 text-purple-800', icon: ShieldCheckIcon },
    { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-800', icon: ShieldExclamationIcon }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'active', label: 'Active Only' },
    { value: 'inactive', label: 'Inactive Only' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterRole !== 'all') params.role = filterRole;
      if (filterStatus === 'active') params.is_active = true;
      if (filterStatus === 'inactive') params.is_active = false;
      
      const result = await usersService.getUsers(params);
      if (result.success) {
        setUsers(result.data.users || []);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (user) => {
    setSelectedUser(user);
    setFormData({
      role: user.role || 'user'
    });
    setFormErrors({});
    setIsRoleModalOpen(true);
  };

  const handleDeactivateUser = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user account?')) {
      return;
    }

    try {
      const result = await usersService.deactivateUser(userId);
      if (result.success) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, is_active: false }
            : user
        ));
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to deactivate user');
    }
  };

  const handleActivateUser = async (userId) => {
    if (!window.confirm('Are you sure you want to activate this user account?')) {
      return;
    }

    try {
      const result = await usersService.activateUser(userId);
      if (result.success) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, is_active: true }
            : user
        ));
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to activate user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await usersService.deleteUser(userId);
      if (result.success) {
        setUsers(users.filter(user => user.id !== userId));
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to delete user');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.role) {
      errors.role = 'Role is required';
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
      const result = await usersService.updateUserRole(selectedUser.id, formData.role);
      
      if (result.success) {
        setIsRoleModalOpen(false);
        setUsers(users.map(user => 
          user.id === selectedUser.id 
            ? { ...user, role: formData.role }
            : user
        ));
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

  const getRoleColor = (role) => {
    const roleOption = roleOptions.find(option => option.value === role);
    return roleOption ? roleOption.color : 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role) => {
    const roleOption = roleOptions.find(option => option.value === role);
    return roleOption ? roleOption.icon : UserIcon;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const canManageUsers = () => {
    return currentUser?.role === 'admin';
  };

  const canChangeRole = (targetUser) => {
    if (!canManageUsers()) return false;
    if (targetUser.id === currentUser?.id) return false; // Can't change own role
    return true;
  };

  const canDeactivateUser = (targetUser) => {
    if (!canManageUsers()) return false;
    if (targetUser.id === currentUser?.id) return false; // Can't deactivate self
    return true;
  };

  const canDeleteUser = (targetUser) => {
    if (!canManageUsers()) return false;
    if (targetUser.id === currentUser?.id) return false; // Can't delete self
    return true;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        {canManageUsers() && (
          <button className="btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add User
          </button>
        )}
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
                  placeholder="Search users..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="input"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                className="input"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <tr key={user.id} className={`hover:bg-gray-50 ${!user.is_active ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-gray-500" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name}
                              {user.id === currentUser?.id && (
                                <span className="ml-2 text-xs text-primary-600 font-medium">(You)</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <RoleIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_login ? formatDate(user.last_login) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {canChangeRole(user) && (
                            <button
                              onClick={() => handleRoleChange(user)}
                              className="text-primary-600 hover:text-primary-900"
                              title="Change Role"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          )}
                          {canDeactivateUser(user) && (
                            <>
                              {user.is_active ? (
                                <button
                                  onClick={() => handleDeactivateUser(user.id)}
                                  className="text-orange-600 hover:text-orange-900"
                                  title="Deactivate User"
                                >
                                  <UserMinusIcon className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivateUser(user.id)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Activate User"
                                >
                                  <UserPlusIcon className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          )}
                          {canDeleteUser(user) && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete User"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
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

      {/* Role Change Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsRoleModalOpen(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Change User Role
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsRoleModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Changing role for <span className="font-medium">{selectedUser?.full_name}</span>
                    </p>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-4">
                    {/* Role Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Role *
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className={`input ${formErrors.role ? 'border-red-300' : ''}`}
                      >
                        {roleOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {formErrors.role && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
                      )}
                    </div>

                    {/* Role Description */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Role Permissions:</h4>
                      <div className="text-sm text-gray-600">
                        {formData.role === 'user' && (
                          <ul className="list-disc list-inside space-y-1">
                            <li>View and manage own leads, deals, and tasks</li>
                            <li>Basic CRM functionality</li>
                          </ul>
                        )}
                        {formData.role === 'manager' && (
                          <ul className="list-disc list-inside space-y-1">
                            <li>All user permissions</li>
                            <li>View team members' data</li>
                            <li>Assign leads, deals, and tasks</li>
                            <li>Generate reports</li>
                          </ul>
                        )}
                        {formData.role === 'admin' && (
                          <ul className="list-disc list-inside space-y-1">
                            <li>All manager permissions</li>
                            <li>Manage user accounts and roles</li>
                            <li>System administration</li>
                            <li>Full access to all data</li>
                          </ul>
                        )}
                      </div>
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
                        Updating...
                      </div>
                    ) : (
                      'Update Role'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRoleModalOpen(false)}
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

export default Users;