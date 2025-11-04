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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, where, doc, setDoc, getDoc } from "firebase/firestore";
import { Group, UserProfile, UserRole } from "@/lib/auth-types";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

interface AddUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Função auxiliar para converter username em um email de login (mesma do AuthContext)
const usernameToEmail = (username: string) => `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@truckstock.com`;

const addUserSchema = z.object({
  username: z.string().min(3, "Nome de usuário deve ter pelo menos 3 caracteres."),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
  role: z.enum(["admin", "user"], { required_error: "Selecione uma função." }),
  groupId: z.string().min(1, "Selecione um grupo/loja."),
});

type AddUserFormData = z.infer<typeof addUserSchema>;

export function AddUserDialog({ isOpen, onClose }: AddUserDialogProps) {
  const firestore = useFirestore();
  const auth = getAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "user",
      groupId: "",
    },
  });
  
  // Busca a lista de grupos/lojas
  const groupsRef = firestore ? query(collection(firestore, 'groups'), orderBy('name')) : null;
  const { data: groups, isLoading: isGroupsLoading } = useCollection<Group>(groupsRef);

  const onSubmit = async (data: AddUserFormData) => {
    if (!firestore) return;
    setIsSubmitting(true);

    try {
      const email = usernameToEmail(data.username);
      
      // 1. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, data.password);
      const uid = userCredential.user.uid;

      // 2. Criar o perfil do usuário no Firestore
      const userProfileRef = doc(firestore, 'userProfiles', uid);
      const newProfile: UserProfile = {
        id: uid,
        username: data.username,
        role: data.role,
        groupId: data.groupId,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(userProfileRef, newProfile);

      toast({
        title: "Usuário Criado!",
        description: `O usuário ${data.username} foi criado com sucesso.`,
      });
      
      reset();
      onClose();

    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      let errorMessage = "Erro desconhecido ao criar usuário.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Nome de usuário já existe. Por favor, escolha outro.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "A senha é muito fraca. Escolha uma senha mais forte.";
      }
      
      toast({
        variant: "destructive",
        title: "Falha na Criação",
        description: errorMessage,
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
          <DialogTitle>Adicionar Novo Usuário</DialogTitle>
          <DialogDescription>
            Crie um novo usuário para acessar o sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Usuário
              </Label>
              <Input
                id="username"
                placeholder="nome.sobrenome"
                className="col-span-3"
                {...register("username")}
              />
              {errors.username && <p className="col-span-4 text-right text-sm text-red-500">{errors.username.message}</p>}
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="col-span-3"
                {...register("password")}
              />
              {errors.password && <p className="col-span-4 text-right text-sm text-red-500">{errors.password.message}</p>}
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Função
              </Label>
              <Select onValueChange={(value) => setValue("role", value as UserRole)} defaultValue={watch("role")}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="col-span-4 text-right text-sm text-red-500">{errors.role.message}</p>}
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="groupId" className="text-right">
                Loja/Grupo
              </Label>
              <Select onValueChange={(value) => setValue("groupId", value)} defaultValue={watch("groupId")}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a loja/grupo" />
                </SelectTrigger>
                <SelectContent>
                  {isGroupsLoading ? (
                    <SelectItem value="" disabled>Carregando...</SelectItem>
                  ) : (
                    groups?.map(group => (
                      <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.groupId && <p className="col-span-4 text-right text-sm text-red-500">{errors.groupId.message}</p>}
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
                "Criar Usuário"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
