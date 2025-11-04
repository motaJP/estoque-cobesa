"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppLayout } from "@/components/app-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentMovements } from "@/components/dashboard/recent-movements";
import { useInventory } from "@/context/InventoryContext";
import { Package, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


export default function DashboardPage() {
  const { products, stockMovements, isProductsLoading, isMovementsLoading } = useInventory();
  
  const totalProducts = products.length;
  const lowStockItems = products.filter(
    (p) => p.quantity <= p.reorderLevel
  ).length;
  const totalStockValue = products.reduce(
    (acc, p) => acc + (p.quantity * (p.price || 0)),
    0
  );

  const recentMovements = stockMovements.slice(0, 5);
  
  // Calcular saídas dos últimos 30 dias
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const exitsLast30Days = stockMovements
    .filter(m => {
      if (!m.timestamp) return false;
      let date: Date;
      if (typeof m.timestamp === 'object' && 'toDate' in m.timestamp) {
        date = (m.timestamp as any).toDate();
      } else if (typeof m.timestamp === 'string') {
        date = new Date(m.timestamp);
      } else {
        date = m.timestamp as Date;
      }
      return m.type === 'Saída' && date >= thirtyDaysAgo;
    })
    .reduce((acc, m) => acc + m.quantity, 0);
  
  const isLoading = isProductsLoading || isMovementsLoading;

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              <Skeleton className="h-[138px]" />
              <Skeleton className="h-[138px]" />
              <Skeleton className="h-[138px]" />
              <Skeleton className="h-[138px]" />
            </>
          ) : (
            <>
              <StatCard
                title="Total de Produtos"
                value={totalProducts}
                icon={Package}
                description="Número total de itens únicos"
              />
              <StatCard
                title="Itens com Baixo Estoque"
                value={lowStockItems}
                icon={AlertTriangle}
                description="Produtos precisando de reposição"
                variant={lowStockItems > 0 ? "destructive" : "default"}
              />
              <StatCard
                title="Valor Total do Estoque"
                value={new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalStockValue)}
                icon={DollarSign}
                description="Valor estimado do inventário atual"
              />
              <StatCard
                title="Saídas (30 dias)"
                value={exitsLast30Days.toString()}
                icon={TrendingDown}
                description="Unidades vendidas/saídas no período"
              />
            </>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Visão Geral do Estoque</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {isLoading ? <Skeleton className="h-[350px]" /> : <OverviewChart products={products} />}
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Movimentações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[350px]" /> : <RecentMovements movements={recentMovements} />}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
