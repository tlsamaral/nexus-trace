"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function FanInChart() {
  const data = [
    { account: "123", value: 5000 },
    { account: "876", value: 7200 },
    { account: "441", value: 3100 },
    { account: "998", value: 8400 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="account" stroke="#888" />
        <YAxis stroke="#888" />
        <Tooltip />
        <Bar dataKey="value" fill="#16a34a" />
      </BarChart>
    </ResponsiveContainer>
  );
}
