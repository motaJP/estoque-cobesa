"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Product } from "@/lib/types";

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface StockByCategoryChartProps {
    products: Product[];
}

export function StockByCategoryChart({ products }: StockByCategoryChartProps) {
    const categoryData = products.reduce((acc, product) => {
        if (!acc[product.category]) {
            acc[product.category] = 0;
        }
        acc[product.category] += product.quantity;
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(categoryData).map(([name, total]) => ({
        name,
        total,
    }));

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[350px]">
        <BarChart accessibilityLayer data={chartData}>
            <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis />
            <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
        </BarChart>
    </ChartContainer>
  );
}
