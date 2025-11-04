"use client";

import * as React from "react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StockByCategoryChart } from "./components/stock-by-category-chart";
import { MovementsChart } from "./components/movements-chart";
import { ExportReportButton } from "./components/export-report-button";
import { useInventory } from "@/context/InventoryContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
  const { products, stockMovements, isProductsLoading, isMovementsLoading } = useInventory();
  
  const isLoading = isProductsLoading || isMovementsLoading;
  
  return (
    <AppLayout>
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
          {!isLoading && <ExportReportButton products={products} stockMovements={stockMovements} />}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Estoque por Categoria</CardTitle>
              <CardDescription>
                Distribuição da quantidade total de itens por categoria.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[350px]" /> : <StockByCategoryChart products={products} />}
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Movimentação de Estoque</CardTitle>
              <CardDescription>
                Entradas e saídas de produtos nos últimos 7 dias.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-[350px]" /> : <MovementsChart stockMovements={stockMovements} />}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
