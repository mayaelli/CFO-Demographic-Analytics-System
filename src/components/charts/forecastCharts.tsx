// src/components/charts/ForecastChart.tsx
import React from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export interface ForecastPoint {
  year: string;
  actual: number | null;
  forecast: number | null;
}

interface ForecastChartProps {
  data: ForecastPoint[];
  category: string; // e.g., "Single" or "Married"
}

const ForecastChart: React.FC<ForecastChartProps> = ({ data, category }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="actual"
          name={`${category} Actual`}
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="forecast"
          name={`${category} Forecast`}
          stroke="#82ca9d"
          strokeWidth={2}
          dot={{ r: 3 }}
          strokeDasharray="5 5"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default ForecastChart;
