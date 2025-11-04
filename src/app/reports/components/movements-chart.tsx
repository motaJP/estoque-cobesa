"use client";

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { StockMovement } from "@/lib/types";
import { Timestamp } from "firebase/firestore";

const chartConfig = {
  Entrada: {
    label: "Entradas",
    color: "hsl(var(--chart-2))",
  },
  Saída: {
    label: "Saídas",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface MovementsChartProps {
    stockMovements: StockMovement[];
}

const getMovementDate = (timestamp: StockMovement['timestamp']): string => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString().split('T')[0];
  }
  return new Date(timestamp as string).toISOString().split('T')[0];
}


export function MovementsChart({ stockMovements }: MovementsChartProps) {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const movementsData = last7Days.map(day => {
        const movements = stockMovements.filter(m => getMovementDate(m.timestamp) === day);
        return {
            date: new Date(day).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
            Entrada: movements.filter(m => m.type === 'Entrada').reduce((acc, m) => acc + m.quantity, 0),
            Saída: movements.filter(m => m.type === 'Saída').reduce((acc, m) => acc + m.quantity, 0),
        };
    });

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[350px]">
        <LineChart accessibilityLayer data={movementsData}>
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
            />
             <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Line
                dataKey="Entrada"
                type="monotone"
                stroke="var(--color-Entrada)"
                strokeWidth={2}
                dot={false}
            />
            <Line
                dataKey="Saída"
                type="monotone"
                stroke="var(--color-Saída)"
                strokeWidth={2}
                dot={false}
            />
        </LineChart>
    </ChartContainer>
  );
}
