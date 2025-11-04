"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface ProductDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

export function ProductDetailsDialog({ open, onOpenChange, product }: ProductDetailsDialogProps) {
  if (!product) return null;
  const status = product.quantity === 0 ? "bg-destructive/20 text-destructive-foreground" : product.quantity <= product.reorderLevel ? "bg-yellow-500/20 text-yellow-600" : "bg-green-500/20 text-green-600";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>SKU: {product.sku}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="font-semibold">Categoria</div>
            <div><Badge variant="outline">{product.category}</Badge></div>

            <div className="font-semibold">Estoque Atual</div>
            <div><Badge className={`pointer-events-none ${status}`}>{product.quantity}</Badge></div>

            <div className="font-semibold">Nível de Reposição</div>
            <div>{product.reorderLevel}</div>

            <div className="font-semibold">Localização</div>
            <div>{product.location || "N/A"}</div>
          </div>
        </div>
        <div className="flex justify-end">
            <DialogClose asChild>
                <Button type="button" variant="outline">
                    Fechar
                </Button>
            </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
