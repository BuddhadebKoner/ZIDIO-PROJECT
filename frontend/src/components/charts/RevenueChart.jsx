import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatIndianCurrency } from '../../utils/amountFormater';

const RevenueChart = ({ data }) => {
  const formatTooltip = (value, name) => {
    if (name === 'revenue') {
      return [formatIndianCurrency(value), 'Revenue'];
    }
    return [value, name];
  };

  const formatXAxisLabel = (tickItem) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-surface p-6 rounded-lg  glass-morphism">
      <h3 className="text-xl font-semibold text-text mb-4">Revenue Trend (Last 7 Days)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              stroke="#9CA3AF"
            />
            <YAxis 
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              stroke="#9CA3AF"
            />
            <Tooltip 
              formatter={formatTooltip}
              labelStyle={{ color: '#1F2937' }}
              contentStyle={{ 
                backgroundColor: '#F9FAFB', 
                border: '1px solid #E5E7EB',
                borderRadius: '6px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
