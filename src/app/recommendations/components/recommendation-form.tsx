"use client";

import { useFormState, useFormStatus } from "react-dom";
import { getReorderPlan } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lightbulb, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useInventory } from "@/context/InventoryContext";

const initialState = {
  message: null,
  plan: null,
  rationale: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...
        </>
      ) : (
        "Gerar Plano de Reposição"
      )}
    </Button>
  );
}

export function RecommendationForm() {
  const [state, formAction] = useFormState(getReorderPlan, initialState);
  const { products } = useInventory();

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="productsJson" value={JSON.stringify(products)} />
        <div className="flex flex-col sm:flex-row sm:items-end sm:gap-4 space-y-4 sm:space-y-0">
          <div className="flex-1">
            <Label htmlFor="desiredServiceLevel">Nível de Serviço Desejado (%)</Label>
            <Input
              id="desiredServiceLevel"
              name="desiredServiceLevel"
              type="number"
              min="80"
              max="99"
              defaultValue="95"
              required
            />
          </div>
          <SubmitButton />
        </div>
      </form>

      {state.message && !state.plan && (
        <Alert variant="destructive">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state.plan && (
        <div className="grid gap-6 mt-6 lg:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-primary" />
                    <CardTitle>Plano de Reposição Sugerido</CardTitle>
                </CardHeader>
                <CardContent>
                    {typeof state.plan === 'object' && state.plan !== null && !Array.isArray(state.plan) && 'reorder' in state.plan && Array.isArray((state.plan as any).reorder) ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Produto</TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead className="text-right">Quantidade</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(state.plan as any).reorder.map((item: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{item.productName}</TableCell>
                                        <TableCell>{item.productId}</TableCell>
                                        <TableCell className="text-right font-bold">{item.quantityToReorder}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <pre className="p-4 mt-4 text-sm bg-muted rounded-md">{JSON.stringify(state.plan, null, 2)}</pre>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    <CardTitle>Fundamentação</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{state.rationale}</p>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
