"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const movementSchema = z.object({
  quantity: z.coerce.number().int().positive("A quantidade deve ser maior que zero."),
  notes: z.string().optional(),
});

type MovementFormValues = z.infer<typeof movementSchema>;

interface StockMovementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product;
    type: 'Entrada' | 'Saída';
    onConfirm: (product: Product, type: 'Entrada' | 'Saída', quantity: number, notes?: string) => void;
}

export function StockMovementDialog({ open, onOpenChange, product, type, onConfirm }: StockMovementDialogProps) {
  const form = useForm<MovementFormValues>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      quantity: 1,
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ quantity: 1, notes: "" });
    }
  }, [open, form]);

  function onSubmit(data: MovementFormValues) {
    onConfirm(product, type, data.quantity, data.notes);
    onOpenChange(false);
  }

  const title = type === 'Entrada' ? 'Registrar Entrada de Estoque' : 'Registrar Saída de Estoque';
  const description = `Produto: ${product.name} (Estoque atual: ${product.quantity})`;
  const buttonText = type === 'Entrada' ? 'Confirmar Entrada' : 'Confirmar Saída';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (Opcional)</FormLabel>
                   <FormControl>
                    <Textarea placeholder="Ex: Venda para cliente, ajuste de inventário..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">
                        Cancelar
                    </Button>
                </DialogClose>
                <Button type="submit">{buttonText}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
