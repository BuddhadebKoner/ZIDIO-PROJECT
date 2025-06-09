import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatIndianCurrency } from '../../utils/amountFormater';

const TopProductsChart = ({ data }) => {
  const formatTooltip = (value, name, props) => {
    if (name === 'totalSold') {
      return [value, 'Units Sold'];
    }
    if (name === 'revenue') {
      return [formatIndianCurrency(value), 'Revenue'];
    }
    return [value, name];
  };

  const truncateTitle = (title, maxLength = 15) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  return (
    <div className="bg-surface p-6 rounded-lg glass-morphism">
      <h3 className="text-xl font-semibold text-text mb-4">Top Selling Products</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              type="number"
              tickFormatter={(value) => value.toString()}
              stroke="#9CA3AF"
            />
            <YAxis 
              type="category"
              dataKey="title"
              tickFormatter={truncateTitle}
              stroke="#9CA3AF"
              width={80}
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
            <Bar 
              dataKey="totalSold" 
              fill="#10B981"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TopProductsChart;
