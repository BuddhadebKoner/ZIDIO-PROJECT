import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatIndianCurrency } from '../../utils/amountFormater';

const MonthlyRevenueChart = ({ data }) => {
  const formatTooltip = (value, name) => {
    if (name === 'revenue') {
      return [formatIndianCurrency(value), 'Revenue'];
    }
    return [value, 'Orders'];
  };

  const formatXAxisLabel = (tickItem) => {
    const [year, month] = tickItem.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-IN', { 
      month: 'short',
      year: '2-digit'
    });
  };

  return (
    <div className="bg-surface p-6 rounded-lg glass-morphism">
      <h3 className="text-xl font-semibold text-text mb-4">Monthly Revenue (Last 6 Months)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              tickFormatter={formatXAxisLabel}
              stroke="#9CA3AF"
            />
            <YAxis 
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
              stroke="#9CA3AF"
            />
            <Tooltip 
              formatter={formatTooltip}
              labelFormatter={formatXAxisLabel}
              labelStyle={{ color: '#1F2937' }}
              contentStyle={{ 
                backgroundColor: '#F9FAFB', 
                border: '1px solid #E5E7EB',
                borderRadius: '6px'
              }}
            />
            <Bar 
              dataKey="revenue" 
              fill="#8B5CF6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyRevenueChart;
