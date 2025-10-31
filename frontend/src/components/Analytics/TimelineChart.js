import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import useAnalyticsStore from '../../store/analyticsStore';

const TimelineChart = () => {
  const [chartType, setChartType] = useState('line'); // 'line' or 'area'
  const { getTimelineChartData } = useAnalyticsStore();
  const data = getTimelineChartData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              Completed: <span className="font-medium text-green-600">{data.completed}</span>
            </p>
            <p className="text-sm text-gray-600">
              Total: <span className="font-medium">{data.total}</span>
            </p>
            <p className="text-sm text-gray-600">
              Progress: <span className="font-medium text-blue-600">{data.progress}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomDot = ({ cx, cy, payload }) => {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#3B82F6"
        stroke="#ffffff"
        strokeWidth={2}
        className="hover:r-6 transition-all duration-200"
      />
    );
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">📈</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Timeline Data
          </h3>
          <p className="text-gray-600">
            No task completion data available for the selected time period.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Chart Type Toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              chartType === 'line'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              chartType === 'area'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Area
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis 
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                domain={[0, 'dataMax + 2']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={{ 
                  r: 6, 
                  stroke: '#3B82F6', 
                  strokeWidth: 2,
                  fill: '#ffffff'
                }}
                animationBegin={0}
                animationDuration={1000}
              />
            </LineChart>
          ) : (
            <AreaChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis 
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                domain={[0, 'dataMax + 2']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#3B82F6"
                strokeWidth={3}
                fill="url(#colorCompleted)"
                dot={<CustomDot />}
                activeDot={{ 
                  r: 6, 
                  stroke: '#3B82F6', 
                  strokeWidth: 2,
                  fill: '#ffffff'
                }}
                animationBegin={0}
                animationDuration={1000}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Info */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span>Tasks Completed</span>
          </div>
        </div>
        <div className="text-right">
          <p>Total: {data.reduce((sum, item) => sum + item.completed, 0)} tasks</p>
          <p>Average: {Math.round(data.reduce((sum, item) => sum + item.completed, 0) / data.length)} per day</p>
        </div>
      </div>
    </div>
  );
};

export default TimelineChart;
