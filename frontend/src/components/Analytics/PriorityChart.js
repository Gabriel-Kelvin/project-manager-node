import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useAnalyticsStore from '../../store/analyticsStore';

const PriorityChart = () => {
  const { getPriorityDistributionData } = useAnalyticsStore();
  const data = getPriorityDistributionData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = data.payload.count;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label} Priority</p>
          <p className="text-sm text-gray-600">
            Tasks: <span className="font-medium">{total}</span>
          </p>
          <div 
            className="w-3 h-3 rounded-full mt-1"
            style={{ backgroundColor: data.color }}
          />
        </div>
      );
    }
    return null;
  };

  const CustomBar = (props) => {
    const { fill, payload, ...rest } = props;
    
    return (
      <Bar
        {...rest}
        fill={payload.color}
        radius={[4, 4, 0, 0]}
        className="hover:opacity-80 transition-opacity"
      />
    );
  };

  if (data.length === 0 || data.every(item => item.count === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">📊</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Priority Data
          </h3>
          <p className="text-gray-600">
            No tasks with priority information available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          layout="horizontal"
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#f0f0f0"
            horizontal={false}
          />
          <XAxis 
            type="number" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            domain={[0, 'dataMax + 1']}
          />
          <YAxis 
            type="category" 
            dataKey="priority"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#374151' }}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="count" 
            shape={<CustomBar />}
            animationBegin={0}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-600">
              {item.priority} ({item.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriorityChart;
