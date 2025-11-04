"use client";

import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthContext } from "@/context/AuthContext";
import { redirect } from "next/navigation";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Group } from "@/lib/auth-types";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { AddGroupDialog } from "./components/add-group-dialog";

export default function GroupManagementPage() {
  const { isAdmin, isLoading: isAuthLoading } = useAuthContext();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Redireciona se não for Admin
  if (!isAuthLoading && !isAdmin) {
    redirect('/');
  }
  
  // Retorna null ou um spinner enquanto o estado de autenticação está sendo verificado
  if (isAuthLoading) {
    return <AppLayout><div className="flex justify-center items-center h-96"><p>Carregando...</p></div></AppLayout>;
  }

  // Busca todos os grupos
  const groupsRef = firestore ? query(collection(firestore, 'groups'), orderBy('name')) : null;
  const { data: groups, isLoading: isGroupsLoading } = useCollection<Group>(groupsRef);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestão de Grupos (Lojas)</h1>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Grupo
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Grupos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            {isGroupsLoading ? (
              <p>Carregando grupos...</p>
            ) : (
              <DataTable 
                columns={columns} 
                data={groups || []} 
                filterColumnId="name"
                filterPlaceholder="Filtrar por nome do grupo..."
              />
            )}
          </CardContent>
        </Card>
      </div>
      <AddGroupDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </AppLayout>
  );
}
