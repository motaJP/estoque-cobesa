"use client";

import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthContext } from "@/context/AuthContext";
import { redirect } from "next/navigation";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, where } from "firebase/firestore";
import { UserProfile } from "@/lib/auth-types";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./components/columns";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { AddUserDialog } from "./components/add-user-dialog";

export default function UserManagementPage() {
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

  // Busca todos os perfis de usuário
  const usersRef = firestore ? query(collection(firestore, 'userProfiles'), orderBy('username')) : null;
  const { data: users, isLoading: isUsersLoading } = useCollection<UserProfile>(usersRef);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Usuário
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuários do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            {isUsersLoading ? (
              <p>Carregando usuários...</p>
            ) : (
              <DataTable 
                columns={columns} 
                data={users || []} 
                filterColumnId="username"
                filterPlaceholder="Filtrar por nome de usuário..."
              />
            )}
          </CardContent>
        </Card>
      </div>
      <AddUserDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </AppLayout>
  );
}
