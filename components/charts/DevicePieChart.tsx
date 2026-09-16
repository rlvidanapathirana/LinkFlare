"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface Props {
  data: { name: string; value: number }[];
}

const COLORS = ["#6366f1", "#a78bfa", "#38bdf8", "#34d399", "#f472b6", "#fb923c"];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; percent: number }[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 text-sm">
        <p style={{ color: "var(--text)" }}>{payload[0].name}</p>
        <p className="font-bold mt-0.5" style={{ color: "var(--accent)" }}>
          {payload[0].value} ({(payload[0].percent * 100).toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

export default function DevicePieChart({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
