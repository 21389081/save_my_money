"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@/lib/format";

const colors = [
  "#5ea8df",
  "#54bea0",
  "#9a8fd3",
  "#efbd62",
  "#e58486",
  "#75b8c4",
  "#8bbd69",
  "#a9b8c5",
];

export function ExpenseChart({
  data,
}: {
  data: { category: string; amount: number }[];
}) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="relative h-[260px] w-full" aria-label="分類支出圓餅圖">
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        initialDimension={{ width: 500, height: 260 }}
      >
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={72}
            outerRadius={105}
            paddingAngle={3}
            stroke="none"
            animationDuration={500}
          >
            {data.map((item, index) => (
              <Cell key={item.category} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{
              borderRadius: 16,
              border: "1px solid #dfeaf2",
              boxShadow: "0 12px 30px rgba(51,105,145,.12)",
              fontSize: 13,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-xs font-semibold text-muted">總支出</p>
          <p className="mt-1 text-xl font-bold tabular-nums">
            {formatCurrency(total)}
          </p>
        </div>
      </div>
    </div>
  );
}

export { colors as expenseChartColors };
