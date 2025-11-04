import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export default function CompatibilityPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-4">
            <Wrench className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight">Consulta de Compatibilidade de Peças</h2>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Buscar Peças por Placa ou Modelo</CardTitle>
                <CardDescription>
                    Utilize o assistente de IA para encontrar peças compatíveis com um veículo específico. Clique no botão de chat no canto da tela para começar.
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[50vh] flex items-center justify-center text-muted-foreground">
                <p>O assistente de IA está pronto para ajudar!</p>
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
