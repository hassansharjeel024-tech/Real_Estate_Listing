"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", properties: 5 },
  { month: "Feb", properties: 8 },
  { month: "Mar", properties: 12 },
  { month: "Apr", properties: 16 },
  { month: "May", properties: 20 },
  { month: "Jun", properties: 25 },
];

export default function DashboardChart() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-[400px]">

      <h2 className="text-2xl font-bold mb-6">
        Property Growth
      </h2>

      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="properties"
            stroke="#2563eb"
            strokeWidth={4}
          />

        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}