import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  ListTodo, 
  CheckCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import Card from '../ui/Card';

const QuickStats = () => {
  const navigate = useNavigate();
  const { userStats, loading } = useDashboardStore();
  const [animatedValues, setAnimatedValues] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedToday: 0,
    inProgress: 0
  });

  // Animate counters on load
  useEffect(() => {
    if (userStats && !loading) {
      const duration = 1000; // 1 second
      const steps = 60;
      const stepDuration = duration / steps;

      const animateValue = (key, targetValue) => {
        const stepValue = targetValue / steps;
        let currentStep = 0;
        
        const timer = setInterval(() => {
          currentStep++;
          setAnimatedValues(prev => ({
            ...prev,
            [key]: Math.min(stepValue * currentStep, targetValue)
          }));
          
          if (currentStep >= steps) {
            clearInterval(timer);
            setAnimatedValues(prev => ({
              ...prev,
              [key]: targetValue
            }));
          }
        }, stepDuration);
      };

      // Animate each value
      animateValue('totalProjects', userStats.totalProjects);
      animateValue('totalTasks', userStats.totalTasks);
      animateValue('completedToday', userStats.completedToday);
      animateValue('inProgress', userStats.inProgress);
    }
  }, [userStats, loading]);

  const stats = [
    {
      key: 'totalProjects',
      title: 'My Projects',
      value: animatedValues.totalProjects,
      icon: FolderKanban,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:bg-blue-100',
      onClick: () => navigate('/projects')
    },
    {
      key: 'totalTasks',
      title: 'My Tasks',
      value: animatedValues.totalTasks,
      icon: ListTodo,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      hoverColor: 'hover:bg-purple-100',
      onClick: () => navigate('/tasks')
    },
    {
      key: 'completedToday',
      title: 'Completed Today',
      value: animatedValues.completedToday,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
      hoverColor: 'hover:bg-green-100',
      onClick: () => navigate('/tasks?status=completed')
    },
    {
      key: 'inProgress',
      title: 'In Progress',
      value: animatedValues.inProgress,
      icon: Clock,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200',
      hoverColor: 'hover:bg-orange-100',
      onClick: () => navigate('/tasks?status=in_progress')
    }
  ];

  const getTrendIcon = (value, previousValue = 0) => {
    if (value > previousValue) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (value < previousValue) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg" />
              <div className="w-6 h-6 bg-gray-200 rounded" />
            </div>
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.key}
            className={`
              p-6 cursor-pointer transition-all duration-300 
              hover:shadow-lg hover:scale-105 
              ${stat.bgColor} ${stat.borderColor} border-l-4
              ${stat.hoverColor}
            `}
            onClick={stat.onClick}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              {getTrendIcon(stat.value)}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                {stat.title}
              </h3>
              
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {Math.round(stat.value)}
                </span>
              </div>

              {/* Progress indicator for completion rate */}
              {stat.key === 'completedToday' && userStats?.totalTasks > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Completion Rate</span>
                    <span>{userStats.completionRate}%</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                    <div 
                      className="h-2 bg-green-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${userStats.completionRate}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
              <div className={`w-full h-full bg-gradient-to-br ${stat.iconColor.replace('text-', 'bg-')} rounded-full transform translate-x-8 -translate-y-8`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default QuickStats;
