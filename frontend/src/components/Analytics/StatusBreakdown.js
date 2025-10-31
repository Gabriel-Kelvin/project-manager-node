import React from 'react';
import { CheckCircle, PlayCircle, Circle, TrendingUp, TrendingDown } from 'lucide-react';
import useAnalyticsStore from '../../store/analyticsStore';
import Card from '../ui/Card';

const StatusBreakdown = () => {
  const { getKPIMetrics } = useAnalyticsStore();
  const metrics = getKPIMetrics();

  if (!metrics) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Status Breakdown
        </h3>
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      </Card>
    );
  }

  const { taskBreakdown } = metrics;
  const total = taskBreakdown.completed + taskBreakdown.inProgress + taskBreakdown.todo;

  const statusData = [
    {
      status: 'Completed',
      count: taskBreakdown.completed,
      percentage: total > 0 ? Math.round((taskBreakdown.completed / total) * 100) : 0,
      color: 'green',
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200'
    },
    {
      status: 'In Progress',
      count: taskBreakdown.inProgress,
      percentage: total > 0 ? Math.round((taskBreakdown.inProgress / total) * 100) : 0,
      color: 'blue',
      icon: PlayCircle,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    },
    {
      status: 'To Do',
      count: taskBreakdown.todo,
      percentage: total > 0 ? Math.round((taskBreakdown.todo / total) * 100) : 0,
      color: 'gray',
      icon: Circle,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200'
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Status Breakdown
      </h3>
      
      <div className="space-y-4">
        {statusData.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.status}
              className={`p-4 rounded-lg border ${item.bgColor} ${item.borderColor} transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <Icon className={`w-5 h-5 ${item.textColor}`} />
                  </div>
                  <div>
                    <h4 className={`font-medium ${item.textColor}`}>
                      {item.status}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {item.count} tasks
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-2xl font-bold ${item.textColor}`}>
                    {item.percentage}%
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    {item.percentage > 50 ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-gray-400" />
                    )}
                    <span>of total</span>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    item.color === 'green' ? 'bg-green-500' :
                    item.color === 'blue' ? 'bg-blue-500' :
                    'bg-gray-400'
                  }`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Tasks</span>
          <span className="font-semibold text-gray-900">{total}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-600">Completion Rate</span>
          <span className="font-semibold text-green-600">
            {total > 0 ? Math.round((taskBreakdown.completed / total) * 100) : 0}%
          </span>
        </div>
      </div>
    </Card>
  );
};

export default StatusBreakdown;
