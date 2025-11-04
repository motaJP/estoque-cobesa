"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import {
  ChartTooltipContent,
  ChartTooltip,
  ChartContainer,
} from "@/components/ui/chart";
import type { Product } from "@/lib/types";

interface OverviewChartProps {
    products: Product[];
}

export function OverviewChart({ products }: OverviewChartProps) {
  const chartData = products
    .slice(0, 7)
    .sort((a,b) => b.quantity - a.quantity)
    .map((p) => ({ name: p.name.split(" ").slice(0, 2).join(" "), total: p.quantity }));

  return (
    <ResponsiveContainer width="100%" height={350}>
       <ChartContainer config={{
        total: {
          label: 'Total',
          color: 'hsl(var(--chart-1))',
        },
      }}>
        <BarChart data={chartData}>
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
           <Tooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar
            dataKey="total"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            
          />
        </BarChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
}
