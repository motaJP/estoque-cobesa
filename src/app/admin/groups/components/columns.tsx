"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Group } from "@/lib/auth-types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, import { MoreHorizontal, Lock, Unlock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { toggleGroupActiveStatus, deleteGroup } from "../../actions";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const columns: ColumnDef<Group>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return <div className="text-xs text-muted-foreground">{row.original.id}</div>;
    },
  },
  {
    accessorKey: "name",
    header: "Nome do Grupo",
  },
  {
    accessorKey: "description",
    header: "Descrição",
  },
  {
    accessorKey: "id",
    header: "ID",
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
      const group = row.original;
      const { toast } = useToast();
      const [isPending, setIsPending] = useState(false);

      const handleToggleActive = async () => {
        setIsPending(true);
        const newStatus = !group.isActive;
        const result = await toggleGroupActiveStatus(group.id, newStatus);
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
        if (!confirm(`Tem certeza que deseja inativar o grupo ${group.name}?`)) return;
        setIsPending(true);
        const result = await deleteGroup(group.id);
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
              onClick={() => navigator.clipboard.writeText(group.id)}
            >
              Copiar ID do Grupo
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleToggleActive} disabled={isPending}>
              {group.isActive ? (
                <><Lock className="mr-2 h-4 w-4" /> Bloquear Grupo</>
              ) : (
                <><Unlock className="mr-2 h-4 w-4" /> Desbloquear Grupo</>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} disabled={isPending} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Inativar Grupo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
