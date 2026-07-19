"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/** Listings per city. Recharts needs the DOM, hence "use client". */
export function CityChart({ data }: { data: { city: string; count: number }[] }) {
  if (data.length === 0) {
    return <p className="py-12 text-center text-sm text-muted">No listings to chart yet.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--line))" vertical={false} />
        <XAxis dataKey="city" stroke="rgb(var(--muted))" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="rgb(var(--muted))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: "rgb(var(--line) / 0.4)" }}
          contentStyle={{
            background: "rgb(var(--surface))",
            border: "1px solid rgb(var(--line))",
            borderRadius: 10,
            fontSize: 12,
            color: "rgb(var(--ink))",
          }}
        />
        <Bar dataKey="count" fill="rgb(var(--brand))" radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
