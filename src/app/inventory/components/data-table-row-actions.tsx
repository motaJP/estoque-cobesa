"use client";

import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpCircle, ArrowDownCircle, Edit, Trash2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StockMovementDialog } from "./stock-movement-dialog";
import { DeleteProductDialog } from "./delete-product-dialog";
import { AddProductDialog } from "./add-product-dialog";
import { ProductHistoryDialog } from "./product-history-dialog";
import type { Product, StockMovement } from "@/lib/types";
import { useInventory } from "@/context/InventoryContext";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  handleStockMovement: (product: Product, type: 'Entrada' | 'Saída', quantity: number, notes?: string) => void;
  deleteProduct: (productId: string) => void;
  editProduct: (editedProduct: Product) => void;
}

export function DataTableRowActions<TData>({ row, handleStockMovement, deleteProduct, editProduct }: DataTableRowActionsProps<TData>) {
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'Entrada' | 'Saída'>('Entrada');
  const { stockMovements } = useInventory();
  
  const product = row.original as Product;

  const handleOpenStockDialog = (type: 'Entrada' | 'Saída') => {
    setDialogType(type);
    setStockDialogOpen(true);
  }

  const handleConfirmDelete = () => {
    deleteProduct(product.id);
    setDeleteDialogOpen(false);
  }

  const handleConfirmEdit = (editedData: Omit<Product, 'id'>) => {
    editProduct({ ...product, ...editedData });
    setEditDialogOpen(false);
  }

  return (
    <>
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem onSelect={() => handleOpenStockDialog('Entrada')}>
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                Registrar Entrada
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleOpenStockDialog('Saída')}>
                <ArrowDownCircle className="mr-2 h-4 w-4" />
                Registrar Saída
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setHistoryDialogOpen(true)}>
                <History className="mr-2 h-4 w-4" />
                Ver Histórico
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setDeleteDialogOpen(true)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
        <StockMovementDialog 
            open={stockDialogOpen}
            onOpenChange={setStockDialogOpen}
            product={product}
            type={dialogType}
            onConfirm={handleStockMovement}
        />
        <DeleteProductDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            product={product}
            onConfirm={handleConfirmDelete}
        />
        <AddProductDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            addProduct={handleConfirmEdit}
            productToEdit={product}
        />
        <ProductHistoryDialog
            open={historyDialogOpen}
            onOpenChange={setHistoryDialogOpen}
            product={product}
            movements={stockMovements}
        />
    </>
  );
}
