import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  Circle,
  TrendingUp,
  Calendar,
  Award
} from 'lucide-react';
import useAnalyticsStore from '../../store/analyticsStore';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatDate, getRoleColor } from '../../utils/helpers';

const MemberAnalyticsModal = ({ 
  isOpen, 
  onClose, 
  member, 
  projectId 
}) => {
  const [memberDetails, setMemberDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { 
    fetchMemberAnalytics, 
    getMemberAnalytics,
    loading: storeLoading 
  } = useAnalyticsStore();

  // Fetch detailed member analytics when modal opens
  useEffect(() => {
    if (isOpen && member && projectId) {
      setLoading(true);
      fetchMemberAnalytics(projectId, member.username)
        .then(() => {
          const details = getMemberAnalytics(member.username);
          setMemberDetails(details);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, member, projectId, fetchMemberAnalytics, getMemberAnalytics]);

  if (!isOpen || !member) return null;

  const details = memberDetails || member;
  const completionRate = details.completionRate || member.completionRate || 0;
  const tasksAssigned = details.total_assigned || member.tasksAssigned || 0;
  const tasksCompleted = details.completed || member.tasksCompleted || 0;
  const tasksInProgress = details.in_progress || 0;
  const tasksTodo = details.todo || 0;

  // Calculate progress ring
  const radius = 60;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  const getPerformanceColor = (rate) => {
    if (rate >= 80) return '#10B981'; // green
    if (rate >= 50) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  const getPerformanceBg = (rate) => {
    if (rate >= 80) return 'bg-green-50 border-green-200';
    if (rate >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-lg font-medium text-gray-700">
                {member.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {member.username}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getRoleColor(member.role)} size="sm">
                  {member.role}
                </Badge>
                <span className="text-sm text-gray-500">
                  Team Member
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {loading || storeLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse mx-auto mb-2" />
                <p className="text-sm text-gray-500">Loading member analytics...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Key Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Completion Rate with Progress Ring */}
                <div className={`p-6 rounded-lg border ${getPerformanceBg(completionRate)}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Completion Rate</h3>
                    <Award className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative">
                      <svg
                        height={radius * 2}
                        width={radius * 2}
                        className="transform -rotate-90"
                      >
                        <circle
                          stroke="#E5E7EB"
                          fill="transparent"
                          strokeWidth={strokeWidth}
                          r={normalizedRadius}
                          cx={radius}
                          cy={radius}
                        />
                        <circle
                          stroke={getPerformanceColor(completionRate)}
                          fill="transparent"
                          strokeWidth={strokeWidth}
                          strokeDasharray={strokeDasharray}
                          style={{ strokeDashoffset }}
                          strokeLinecap="round"
                          r={normalizedRadius}
                          cx={radius}
                          cy={radius}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">
                          {Math.round(completionRate)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      {tasksCompleted} of {tasksAssigned} tasks completed
                    </p>
                  </div>
                </div>

                {/* Tasks Breakdown */}
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Task Breakdown</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Completed</span>
                      </div>
                      <span className="font-medium text-gray-900">{tasksCompleted}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">In Progress</span>
                      </div>
                      <span className="font-medium text-gray-900">{tasksInProgress}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">To Do</span>
                      </div>
                      <span className="font-medium text-gray-900">{tasksTodo}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Total Assigned</span>
                      <span className="text-lg font-bold text-gray-900">{tasksAssigned}</span>
                    </div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Performance</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Average Completion Time</span>
                        <span className="text-sm font-medium text-gray-900">
                          {details.average_completion_time || member.averageCompletionTime || 0} days
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: '60%' }} // Mock progress
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Last Active</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(member.lastActive, 'short')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        {completionRate >= 80 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-600">
                          {completionRate >= 80 ? 'Excellent Performance' : 
                           completionRate >= 50 ? 'Good Performance' : 'Needs Improvement'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Distribution Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Task Distribution</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { status: 'Completed', count: tasksCompleted, color: 'bg-green-500', icon: CheckCircle },
                    { status: 'In Progress', count: tasksInProgress, color: 'bg-blue-500', icon: PlayCircle },
                    { status: 'To Do', count: tasksTodo, color: 'bg-gray-400', icon: Circle }
                  ].map((item) => {
                    const Icon = item.icon;
                    const percentage = tasksAssigned > 0 ? Math.round((item.count / tasksAssigned) * 100) : 0;
                    
                    return (
                      <div key={item.status} className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                        <div className="text-sm text-gray-600">{item.status}</div>
                        <div className="text-xs text-gray-500">{percentage}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Member Since:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {formatDate(member.lastActive, 'long')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Role:</span>
                    <span className="ml-2 font-medium text-gray-900 capitalize">
                      {member.role}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tasks Completed:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {tasksCompleted} tasks
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Completion Rate:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {Math.round(completionRate)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MemberAnalyticsModal;
