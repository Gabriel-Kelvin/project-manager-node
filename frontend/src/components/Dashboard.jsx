import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowDownIcon, 
  ArrowUpIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/20/solid';
import { 
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dashboardService from '../services/dashboardService';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    leads: { total: 0, new: 0, qualified: 0 },
    deals: { total: 0, total_value: 0, closed_won: 0 },
    tasks: { total: 0, pending: 0, completed: 0 }
  });
  const [revenueData, setRevenueData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [statsResult, revenueResult, activityResult] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getMonthlyRevenue(6),
        dashboardService.getRecentActivities(5)
      ]);

      if (statsResult.success) {
        setStats(statsResult.data);
      }

      if (revenueResult.success) {
        setRevenueData(revenueResult.data);
      }

      if (activityResult.success) {
        setRecentActivity(activityResult.data.activities || []);
      }

    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data fetch error:', error);
    } finally {
      setIsLoading(false);
    }
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
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (action) => {
    switch (action) {
      case 'create':
        return '➕';
      case 'update':
        return '✏️';
      case 'delete':
        return '🗑️';
      case 'assign':
        return '👤';
      default:
        return '📝';
    }
  };

  const getActivityColor = (entityType) => {
    switch (entityType) {
      case 'lead':
        return 'bg-blue-100 text-blue-800';
      case 'deal':
        return 'bg-green-100 text-green-800';
      case 'task':
        return 'bg-yellow-100 text-yellow-800';
      case 'user':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      id: 1,
      name: 'Total Leads',
      stat: stats.leads.total.toLocaleString(),
      icon: UsersIcon,
      change: stats.leads.qualified || 0,
      changeType: 'increase',
      color: 'bg-blue-500',
      link: '/leads'
    },
    {
      id: 2,
      name: 'Total Deals',
      stat: stats.deals.total.toLocaleString(),
      icon: CurrencyDollarIcon,
      change: formatCurrency(stats.deals.total_value || 0),
      changeType: 'increase',
      color: 'bg-green-500',
      link: '/deals'
    },
    {
      id: 3,
      name: 'Total Tasks',
      stat: stats.tasks.total.toLocaleString(),
      icon: ClipboardDocumentListIcon,
      change: stats.tasks.completed || 0,
      changeType: 'increase',
      color: 'bg-yellow-500',
      link: '/tasks'
    },
    {
      id: 4,
      name: 'Revenue',
      stat: formatCurrency(stats.deals.total_value || 0),
      icon: ChartBarIcon,
      change: stats.deals.closed_won || 0,
      changeType: 'increase',
      color: 'bg-purple-500',
      link: '/deals'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening with your CRM today.
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((item) => (
          <div key={item.name} className="card hover:shadow-md transition-shadow">
            <div className="card-body">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${item.color}`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">{item.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                    <div className={`ml-2 flex items-baseline text-sm font-medium ${
                      item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.changeType === 'increase' ? (
                        <ArrowUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 flex-shrink-0 self-center" />
                      )}
                      <span className="sr-only">
                        {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                      </span>
                      {item.change}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Link to={item.link} className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  View all {item.name.toLowerCase()} →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Monthly Revenue</h3>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#6B7280' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#6B7280' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Revenue']}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="revenue" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
                name="Revenue"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="card-body">
            {recentActivity.length > 0 ? (
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentActivity.map((activity, activityIdx) => (
                    <li key={activityIdx}>
                      <div className="relative pb-8">
                        {activityIdx !== recentActivity.length - 1 ? (
                          <span
                            className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center ring-8 ring-white">
                              <span className="text-lg">
                                {getActivityIcon(activity.action)}
                              </span>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5">
                            <div>
                              <p className="text-sm text-gray-900">
                                <span className="font-medium capitalize">{activity.action}</span> {activity.entity_type}
                              </p>
                              {activity.details?.description && (
                                <p className="text-sm text-gray-500">{activity.details.description}</p>
                              )}
                              <div className="mt-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActivityColor(activity.entity_type)}`}>
                                  {activity.entity_type}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              <time>{formatDate(activity.timestamp)}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
            <div className="mt-4 text-center">
              <Link to="/activity" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                View all activity →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Link to="/leads" className="btn-primary text-center">
                <UsersIcon className="h-5 w-5 mr-2" />
                Add Lead
              </Link>
              <Link to="/deals" className="btn-secondary text-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Create Deal
              </Link>
              <Link to="/tasks" className="btn-secondary text-center">
                <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                New Task
              </Link>
              <Link to="/analytics" className="btn-secondary text-center">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                View Reports
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Recent Leads</h3>
        </div>
        <div className="card-body p-0">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    John Smith
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Acme Corp
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      New
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Website
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    2 minutes ago
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Sarah Johnson
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Tech Solutions
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Contacted
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Referral
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    1 hour ago
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Mike Wilson
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Global Inc
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Qualified
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Email Campaign
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    3 hours ago
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}