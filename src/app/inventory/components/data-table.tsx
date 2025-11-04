"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTablePagination } from "./data-table-pagination";
import type { Product } from "@/lib/types";
import { AddProductDialog } from "./add-product-dialog";
import { ProductDetailsDialog } from "./product-details-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface DataTableProps<TData extends { category: string }, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  addProduct: (newProduct: Omit<Product, 'id'>) => void;
}

export function DataTable<TData extends { category: string }, TValue>({
  columns,
  data,
  addProduct,
}: DataTableProps<TData, TValue>) {
  const isMobile = useIsMobile();
  const [rowSelection, setRowSelection] = React.useState({});
  
  const initialVisibility: VisibilityState = isMobile ? {
    reorderLevel: false,
    location: false,
    select: false,
    actions: false,
  } : {
    select: true,
    actions: true,
  };

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialVisibility);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [isAddProductOpen, setIsAddProductOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<TData | null>(null);

  const holdTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (product: TData) => {
    if (isMobile) {
      holdTimeoutRef.current = setTimeout(() => {
        setSelectedProduct(product);
      }, 500); // 500ms for a long press
    }
  };

  const handleTouchEnd = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
    // We close the dialog on touch end, regardless of hold duration
    setSelectedProduct(null);
  };
  
  const handleRowClick = (row: TData) => {
    if (!isMobile) {
      // you could implement a desktop-specific click action here if needed
    }
  };

  React.useEffect(() => {
    setColumnVisibility(
      isMobile 
        ? { reorderLevel: false, location: false, select: false, actions: false } 
        : { select: true, actions: true, reorderLevel: true, location: true }
    );
  }, [isMobile]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
       <DataTableToolbar 
        table={table} 
        openAddProductDialog={() => setIsAddProductOpen(true)} 
        products={data} 
      />
      <AddProductDialog 
        open={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
        addProduct={addProduct}
      />
      {selectedProduct && (
        <ProductDetailsDialog
            open={!!selectedProduct}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setSelectedProduct(null);
                }
            }}
            product={selectedProduct as unknown as Product}
        />
      )}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => handleRowClick(row.original)}
                  onTouchStart={() => handleTouchStart(row.original)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchEnd} // Cancel on drag/move
                  onContextMenu={(e) => isMobile && e.preventDefault()} // prevent context menu on long press
                  className={isMobile ? "cursor-pointer" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
