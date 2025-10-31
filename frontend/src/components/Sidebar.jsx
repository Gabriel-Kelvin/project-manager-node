import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  UsersIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggle }) => {
  const location = useLocation();
  const { user, canManageUsers, canViewReports } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['user', 'manager', 'admin'] },
    { name: 'Leads', href: '/leads', icon: UsersIcon, roles: ['user', 'manager', 'admin'] },
    { name: 'Deals', href: '/deals', icon: BriefcaseIcon, roles: ['user', 'manager', 'admin'] },
    { name: 'Tasks', href: '/tasks', icon: CheckCircleIcon, roles: ['user', 'manager', 'admin'] },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, roles: ['manager', 'admin'] },
    { name: 'Users', href: '/users', icon: UserGroupIcon, roles: ['admin'] },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, roles: ['user', 'manager', 'admin'] },
  ];

  // Filter navigation based on user role
  const userRole = user?.role || 'user'; // Default to 'user' role if not specified
  const filteredNavigation = user ? 
    navigation.filter(item => item.roles.includes(userRole)) :
    navigation; // Show all navigation if no user (for testing)

  // Debug logging
  console.log('Sidebar Debug:', {
    user,
    userRole,
    filteredNavigation: filteredNavigation.length,
    navigation: navigation.length
  });

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col h-full w-full">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center justify-between h-16 border-b border-gray-200 transition-all duration-300 ${
            isCollapsed ? 'px-3' : 'px-6'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CRM</span>
                </div>
              </div>
              {!isCollapsed && (
                <div className="ml-3 transition-opacity duration-300">
                  <h1 className="text-lg font-semibold text-gray-900">CRM System</h1>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 py-4 space-y-1 overflow-y-auto transition-all duration-300 ${
            isCollapsed ? 'px-2' : 'px-4'
          }`}>
            {filteredNavigation.length > 0 ? filteredNavigation.map((item) => {
              const isActive = isCurrentPath(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center rounded-lg transition-all duration-200
                    ${isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2'}
                    ${isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={onClose}
                  title={isCollapsed ? item.name : ''}
                >
                  <item.icon
                    className={`
                      flex-shrink-0 transition-colors duration-200
                      ${isCollapsed ? 'h-6 w-6' : 'mr-3 h-5 w-5'}
                      ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  {!isCollapsed && (
                    <span className="text-sm font-medium transition-opacity duration-300">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            }) : (
              // Fallback: show all navigation items if filtered navigation is empty
              navigation.map((item) => {
                const isActive = isCurrentPath(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center rounded-lg transition-all duration-200
                      ${isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2'}
                      ${isActive
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                    onClick={onClose}
                    title={isCollapsed ? item.name : ''}
                  >
                    <item.icon
                      className={`
                        flex-shrink-0 transition-colors duration-200
                        ${isCollapsed ? 'h-6 w-6' : 'mr-3 h-5 w-5'}
                        ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}
                      `}
                    />
                    {!isCollapsed && (
                      <span className="text-sm font-medium transition-opacity duration-300">
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })
            )}
          </nav>

          {/* User info */}
          <div className={`border-t border-gray-200 transition-all duration-300 ${
            isCollapsed ? 'px-2 py-4' : 'px-4 py-4'
          }`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              {!isCollapsed && (
                <div className="ml-3 flex-1 min-w-0 transition-opacity duration-300">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.full_name || 'User'}
                  </p>
                  <div className="flex items-center">
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role || 'user'}
                    </p>
                    {user?.role === 'admin' && (
                      <ShieldCheckIcon className="ml-1 h-3 w-3 text-red-500" />
                    )}
                    {user?.role === 'manager' && (
                      <ShieldCheckIcon className="ml-1 h-3 w-3 text-purple-500" />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};

export default Sidebar;

