"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import type { Product, StockMovement } from "@/lib/types";
import { Timestamp } from "firebase/firestore";

interface ProductHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  movements: StockMovement[];
}

function formatDate(timestamp: StockMovement['timestamp']): string {
  if (!timestamp) return 'Data indisponível';
  let date: Date;
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    date = timestamp as Date;
  }
  return date.toLocaleString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function ProductHistoryDialog({ open, onOpenChange, product, movements }: ProductHistoryDialogProps) {
  const productMovements = movements.filter(m => m.productId === product.id);
  
  const totalEntries = productMovements
    .filter(m => m.type === 'Entrada')
    .reduce((acc, m) => acc + m.quantity, 0);
  
  const totalExits = productMovements
    .filter(m => m.type === 'Saída')
    .reduce((acc, m) => acc + m.quantity, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Movimentações</DialogTitle>
          <DialogDescription>
            {product.name} - SKU: {product.sku}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="flex flex-col items-center p-4 border rounded-lg">
            <span className="text-sm text-muted-foreground">Estoque Atual</span>
            <span className="text-2xl font-bold">{product.quantity}</span>
          </div>
          <div className="flex flex-col items-center p-4 border rounded-lg bg-green-500/10">
            <span className="text-sm text-muted-foreground">Total Entradas</span>
            <span className="text-2xl font-bold text-green-600">{totalEntries}</span>
          </div>
          <div className="flex flex-col items-center p-4 border rounded-lg bg-red-500/10">
            <span className="text-sm text-muted-foreground">Total Saídas</span>
            <span className="text-2xl font-bold text-red-600">{totalExits}</span>
          </div>
        </div>

        {productMovements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma movimentação registrada para este produto.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="text-sm">{formatDate(movement.timestamp)}</TableCell>
                  <TableCell>
                    <Badge variant={movement.type === 'Entrada' ? 'secondary' : 'outline'} className={movement.type === 'Entrada' ? "text-green-600" : "text-red-600"}>
                      {movement.type === 'Entrada' ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownLeft className="mr-1 h-3 w-3" />}
                      {movement.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{movement.quantity}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{movement.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
