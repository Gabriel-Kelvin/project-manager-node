import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatDate, getPriorityColor } from '../../utils/helpers';

const TaskCalendar = ({ tasks, onTaskClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get calendar data
  const getCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.created_at);
        return taskDate.toDateString() === current.toDateString();
      });
      
      days.push({
        date: new Date(current),
        tasks: dayTasks,
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === new Date().toDateString(),
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarData = getCalendarData();

  return (
    <Card className="p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="flex items-center gap-2"
          >
            <CalendarIcon className="w-4 h-4" />
            Today
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth(-1)}
            className="p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth(1)}
            className="p-2"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarData.map((day, index) => (
          <div
            key={index}
            className={`
              min-h-24 p-2 border border-gray-200 rounded-lg
              ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
              ${day.isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
              hover:bg-gray-50 transition-colors cursor-pointer
            `}
            onClick={() => {
              if (day.tasks.length > 0) {
                // Show tasks for this day
                console.log('Tasks for', day.date.toDateString(), day.tasks);
              }
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`
                text-sm font-medium
                ${day.isToday ? 'text-blue-600' : ''}
                ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
              `}>
                {day.date.getDate()}
              </span>
              
              {day.tasks.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                  {day.tasks.length}
                </span>
              )}
            </div>

            {/* Task Indicators */}
            <div className="space-y-1">
              {day.tasks.slice(0, 2).map((task, taskIndex) => (
                <div
                  key={taskIndex}
                  className="text-xs p-1 rounded truncate cursor-pointer hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(task);
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'high' ? 'bg-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-400' :
                      'bg-green-400'
                    }`} />
                    <span className="truncate">{task.title}</span>
                  </div>
                </div>
              ))}
              
              {day.tasks.length > 2 && (
                <div className="text-xs text-gray-500 text-center">
                  +{day.tasks.length - 2} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-400 rounded-full" />
          <span className="text-gray-600">High Priority</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full" />
          <span className="text-gray-600">Medium Priority</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full" />
          <span className="text-gray-600">Low Priority</span>
        </div>
      </div>
    </Card>
  );
};

export default TaskCalendar;
