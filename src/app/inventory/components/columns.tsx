"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableRowActions } from "./data-table-row-actions";
import { useIsMobile } from "@/hooks/use-mobile";


type ColumnsProps = {
  handleStockMovement: (product: Product, type: 'Entrada' | 'Saída', quantity: number, notes?: string) => void;
  deleteProduct: (productId: string) => void;
  editProduct: (editedProduct: Product) => void;
}

export const columns = ({ handleStockMovement, deleteProduct, editProduct }: ColumnsProps): ColumnDef<Product>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar tudo"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Produto",
    cell: ({ row }) => {
      const product = row.original;
      const isMobile = useIsMobile();
      return (
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-medium truncate max-w-[200px]">{product.name}</span>
            <span className="text-xs text-muted-foreground">{product.sku}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => <Badge variant="outline">{row.getValue("category")}</Badge>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "quantity",
    header: "Estoque",
    cell: ({ row }) => {
        const product = row.original;
        const status = product.quantity === 0 ? "bg-destructive/20 text-destructive-foreground" : product.quantity <= product.reorderLevel ? "bg-yellow-500/20 text-yellow-600" : "bg-green-500/20 text-green-600";
        return <div className="text-center"><Badge className={`pointer-events-none ${status}`}>{product.quantity}</Badge></div>
    }
  },
  {
    accessorKey: "reorderLevel",
    header: "Nível de Reposição",
  },
  {
    accessorKey: "location",
    header: "Localização",
  },
  {
    accessorKey: "price",
    header: "Preço",
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(price || 0);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} handleStockMovement={handleStockMovement} deleteProduct={deleteProduct} editProduct={editProduct} />,
  },
];
