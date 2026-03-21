"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ScoreTrendChartProps {
  data: {
    date: string;
    scores: {
      communication: number;
      aesthetic: number;
      drive: number;
      structure: number;
    };
  }[];
}

export default function ScoreTrendChart({ data }: ScoreTrendChartProps) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString(),
    Mercury: item.scores.communication,
    Venus: item.scores.aesthetic,
    Mars: item.scores.drive,
    Saturn: item.scores.structure,
  }));

  return (
    <div style={{ width: "100%", height: 300, marginTop: "2rem" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="var(--text-muted)" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="var(--text-muted)" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "#0a0a1a", border: "1px solid var(--primary)", borderRadius: "8px" }}
            itemStyle={{ fontSize: "12px" }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="Mercury" 
            stroke="#7000ff" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="Venus" 
            stroke="#00d4ff" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="Mars" 
            stroke="#ff0070" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="Saturn" 
            stroke="#ffcc00" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
