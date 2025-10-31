import React, { useState } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  User, 
  Clock,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import useAnalyticsStore from '../../store/analyticsStore';
import Badge from '../ui/Badge';
import { formatDate, getRoleColor } from '../../utils/helpers';

const TeamPerformanceTable = ({ onMemberClick }) => {
  const [sortField, setSortField] = useState('completionRate');
  const [sortDirection, setSortDirection] = useState('desc');
  const { getTeamPerformanceData } = useAnalyticsStore();
  
  const data = getTeamPerformanceData();

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-gray-600" />
      : <ChevronDown className="w-4 h-4 text-gray-600" />;
  };

  const getPerformanceColor = (rate) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBg = (rate) => {
    if (rate >= 80) return 'bg-green-100';
    if (rate >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getTrendIcon = (rate) => {
    if (rate >= 80) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (rate >= 50) {
      return <Minus className="w-4 h-4 text-yellow-500" />;
    } else {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Team Data
          </h3>
          <p className="text-gray-600">
            No team performance data available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('username')}
            >
              <div className="flex items-center gap-2">
                Member
                {getSortIcon('username')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('role')}
            >
              <div className="flex items-center gap-2">
                Role
                {getSortIcon('role')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('tasksAssigned')}
            >
              <div className="flex items-center gap-2">
                Assigned
                {getSortIcon('tasksAssigned')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('tasksCompleted')}
            >
              <div className="flex items-center gap-2">
                Completed
                {getSortIcon('tasksCompleted')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('completionRate')}
            >
              <div className="flex items-center gap-2">
                Completion Rate
                {getSortIcon('completionRate')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('averageCompletionTime')}
            >
              <div className="flex items-center gap-2">
                Avg. Time
                {getSortIcon('averageCompletionTime')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('lastActive')}
            >
              <div className="flex items-center gap-2">
                Last Active
                {getSortIcon('lastActive')}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((member, index) => (
            <tr 
              key={member.username}
              className="hover:bg-blue-50 cursor-pointer transition-colors"
              onClick={() => onMemberClick(member)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {member.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {member.username}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={getRoleColor(member.role)} size="sm">
                  {member.role}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {member.tasksAssigned}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {member.tasksCompleted}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-medium ${getPerformanceColor(member.completionRate)}`}>
                        {member.completionRate}%
                      </span>
                      {getTrendIcon(member.completionRate)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getPerformanceBg(member.completionRate)}`}
                        style={{ width: `${Math.min(member.completionRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {member.averageCompletionTime} days
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(member.lastActive, 'short')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeamPerformanceTable;
