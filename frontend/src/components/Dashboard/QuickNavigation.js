import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  ListTodo, 
  BarChart3, 
  Settings,
  FolderKanban,
  Users,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Card from '../ui/Card';

const QuickNavigation = () => {
  const navigate = useNavigate();

  const navigationItems = [
    {
      id: 'create-project',
      title: 'Create New Project',
      description: 'Start a new project and invite your team',
      icon: Plus,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      hoverColor: 'hover:bg-blue-100',
      onClick: () => navigate('/projects/create')
    },
    {
      id: 'view-tasks',
      title: 'View All Tasks',
      description: 'See all your assigned tasks and manage them',
      icon: ListTodo,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
      hoverColor: 'hover:bg-green-100',
      onClick: () => navigate('/tasks')
    },
    {
      id: 'analytics',
      title: 'Team Analytics',
      description: 'View project insights and team performance',
      icon: BarChart3,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      hoverColor: 'hover:bg-purple-100',
      onClick: () => navigate('/analytics')
    },
    {
      id: 'manage-team',
      title: 'Manage Team',
      description: 'Add members and manage project permissions',
      icon: Users,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200',
      hoverColor: 'hover:bg-orange-100',
      onClick: () => navigate('/projects')
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.id}
            className={`
              p-6 cursor-pointer transition-all duration-300 
              hover:shadow-lg hover:scale-105 
              ${item.bgColor} ${item.borderColor} border-l-4
              ${item.hoverColor}
              group
            `}
            onClick={item.onClick}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${item.bgColor}`}>
                <Icon className={`w-6 h-6 ${item.iconColor}`} />
              </div>
              <ArrowRight className={`w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors`} />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
              <div className={`w-full h-full bg-gradient-to-br ${item.iconColor.replace('text-', 'bg-')} rounded-full transform translate-x-8 -translate-y-8`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default QuickNavigation;
