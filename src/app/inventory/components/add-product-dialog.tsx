"use client";

import { useEffect } from "react";
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
import type { Product } from "@/lib/types";

const productSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  sku: z.string().min(3, "O SKU deve ter pelo menos 3 caracteres."),
  category: z.string().min(1, "A categoria é obrigatória."),
  quantity: z.coerce.number().int().min(0, "A quantidade não pode ser negativa."),
  reorderLevel: z.coerce.number().int().min(0, "O nível de reposição não pode ser negativo."),
  location: z.string().optional(),
  price: z.coerce.number().min(0, "O preço não pode ser negativo."),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface AddProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    addProduct: (newProduct: Omit<Product, 'id'>) => void;
    productToEdit?: Product;
}

export function AddProductDialog({ open, onOpenChange, addProduct, productToEdit }: AddProductDialogProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (productToEdit) {
      form.reset(productToEdit);
    } else {
      form.reset({
        name: "",
        sku: "",
        category: "",
        quantity: 0,
        reorderLevel: 10,
        location: "",
        price: 0,
      });
    }
  }, [productToEdit, open, form]);


  function onSubmit(data: ProductFormValues) {
    const productData = {
        ...data,
        location: data.location || '' 
    }
    addProduct(productData);
    onOpenChange(false);
  }

  const isEditing = !!productToEdit;
  const title = isEditing ? "Editar Produto" : "Adicionar Novo Produto";
  const description = isEditing 
    ? "Atualize os detalhes do produto selecionado."
    : "Preencha os detalhes do novo produto a ser adicionado ao inventário.";
  const buttonText = isEditing ? "Salvar Alterações" : "Salvar Produto";

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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Filtro de Ar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU (Modelo do Caminhão)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Scania R450" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                   <FormControl>
                    <Input placeholder="Ex: Filtros" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Estoque</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="reorderLevel"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nível de Reposição</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
             </div>
             <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço Unitário (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="Ex: 85.50" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localização (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: A1-L2" {...field} />
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
