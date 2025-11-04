import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import { RecommendationForm } from "./components/recommendation-form";

export default function RecommendationsPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-4">
            <BrainCircuit className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight">Recomendações de Reposição com IA</h2>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Gerar Plano de Reposição Otimizado</CardTitle>
                <CardDescription>
                    Utilize IA para analisar dados de vendas e níveis de estoque atuais para gerar um plano de reposição eficiente. Isso ajuda a minimizar faltas de estoque e evitar excessos.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RecommendationForm />
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
