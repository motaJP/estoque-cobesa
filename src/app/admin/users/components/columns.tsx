"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserProfile } from "@/lib/auth-types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, import { MoreHorizontal, UserCheck, UserX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { toggleUserActiveStatus, deleteUserAndProfile } from "../../actions";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const columns: ColumnDef<UserProfile>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return <div className="text-xs text-muted-foreground">{row.original.id}</div>;
    },
  },
  {
    accessorKey: "username",
    header: "Nome de Usuário",
  },
  {
    accessorKey: "role",
    header: "Função",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "groupId",
    header: "ID do Grupo (Loja)",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <div className="flex items-center space-x-2">
          {isActive ? (
            <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-400">
              <CheckCircle className="mr-1 h-3 w-3" /> Ativo
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="mr-1 h-3 w-3" /> Bloqueado
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      const { toast } = useToast();
      const [isPending, setIsPending] = useState(false);

      const handleToggleActive = async () => {
        setIsPending(true);
        const newStatus = !user.isActive;
        const result = await toggleUserActiveStatus(user.id, newStatus);
        if (result.success) {
          toast({
            title: "Sucesso",
            description: result.message,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erro",
            description: result.message,
          });
        }
        setIsPending(false);
      };
      
      const handleDelete = async () => {
        if (!confirm(`Tem certeza que deseja inativar o usuário ${user.username}?`)) return;
        setIsPending(true);
        const result = await deleteUserAndProfile(user.id);
        if (result.success) {
          toast({
            title: "Sucesso",
            description: result.message,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erro",
            description: result.message,
          });
        }
        setIsPending(false);
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copiar ID do Usuário
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleToggleActive} disabled={isPending}>
              {user.isActive ? (
                <><UserX className="mr-2 h-4 w-4" /> Bloquear Usuário</>
              ) : (
                <><UserCheck className="mr-2 h-4 w-4" /> Desbloquear Usuário</>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} disabled={isPending} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Inativar Usuário
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
