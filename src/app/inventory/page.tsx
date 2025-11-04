"use client";

import * as React from "react";
import { AppLayout } from "@/components/app-layout";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { useInventory } from "@/context/InventoryContext";
import { Skeleton } from "@/components/ui/skeleton";


export default function InventoryPage() {
  const { products, addProduct, editProduct, deleteProduct, handleStockMovement, isProductsLoading } = useInventory();
  
  if (isProductsLoading) {
    return (
      <AppLayout>
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Inventário</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-1 items-center space-x-2">
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-10 w-[180px]" />
              </div>
              <div className="flex items-center space-x-2">
                 <Skeleton className="h-10 w-[100px]" />
                 <Skeleton className="h-10 w-[130px]" />
              </div>
            </div>
             <Skeleton className="h-[600px] w-full" />
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Inventário</h2>
        </div>
        <DataTable 
          data={products} 
          columns={columns({ handleStockMovement, deleteProduct, editProduct })} 
          addProduct={addProduct}
        />
      </div>
    </AppLayout>
  );
}
