"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFirestore } from "@/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { Group } from "@/lib/auth-types";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const addGroupSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
  description: z.string().optional(),
});

type AddGroupFormData = z.infer<typeof addGroupSchema>;

export function AddGroupDialog({ isOpen, onClose }: AddGroupDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AddGroupFormData>({
    resolver: zodResolver(addGroupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: AddGroupFormData) => {
    if (!firestore) return;
    setIsSubmitting(true);

    try {
      const groupRef = doc(collection(firestore, 'groups'));
      const newGroup: Group = {
        id: groupRef.id,
        name: data.name,
        description: data.description || '',
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(groupRef, newGroup);

      toast({
        title: "Grupo Criado!",
        description: `O grupo/loja ${data.name} foi criado com sucesso.`,
      });
      
      reset();
      onClose();

    } catch (error: any) {
      console.error("Erro ao criar grupo:", error);
      toast({
        variant: "destructive",
        title: "Falha na Criação",
        description: "Não foi possível criar o grupo/loja.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Grupo (Loja)</DialogTitle>
          <DialogDescription>
            Crie um novo grupo/loja para segmentar o estoque.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                placeholder="Loja Matriz"
                className="col-span-3"
                {...register("name")}
              />
              {errors.name && <p className="col-span-4 text-right text-sm text-red-500">{errors.name.message}</p>}
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Descrição
              </Label>
              <Textarea
                id="description"
                placeholder="Descrição breve do grupo/loja"
                className="col-span-3"
                {...register("description")}
              />
              {errors.description && <p className="col-span-4 text-right text-sm text-red-500">{errors.description.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose} type="button" disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Grupo"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
