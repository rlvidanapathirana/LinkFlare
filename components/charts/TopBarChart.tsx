"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

interface Props {
  data: { name: string; value: number }[];
  color?: string;
}

const COLORS = ["#6366f1", "#818cf8", "#a78bfa", "#c4b5fd", "#7c3aed", "#8b5cf6", "#9333ea", "#a855f7"];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number; name: string }[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 text-sm">
        <p style={{ color: "var(--text)" }}>{payload[0].name}</p>
        <p className="font-bold mt-0.5" style={{ color: "var(--accent)" }}>{payload[0].value} clicks</p>
      </div>
    );
  }
  return null;
};

export default function TopBarChart({ data, color }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
        barCategoryGap="25%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--accent-subtle)" }} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={color || COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
