
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Result, StressLevel } from '../types';

interface StressLevelChartProps {
  data: Result[];
}

const levelToNumber = (level: StressLevel) => {
    switch(level) {
        case StressLevel.HIGH: return 3;
        case StressLevel.MEDIUM: return 2;
        case StressLevel.LOW: return 1;
        default: return 0;
    }
}

const StressLevelChart: React.FC<StressLevelChartProps> = ({ data }) => {
  const chartData = data.map(result => ({
    name: new Date(result.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
    'ストレスレベル': levelToNumber(result.stressLevel),
    'スコア': result.score,
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis 
            tickFormatter={(value) => ['', '低', '中', '高'][value] || ''} 
            domain={[0, 4]} 
            ticks={[1, 2, 3]}
            />
          <Tooltip 
            formatter={(value, name) => {
                if (name === 'ストレスレベル') {
                    return [['', '低', '中', '高'][value as number] || '不明', name];
                }
                return [value, name];
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="ストレスレベル" stroke="#07575B" activeDot={{ r: 8 }} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StressLevelChart;
