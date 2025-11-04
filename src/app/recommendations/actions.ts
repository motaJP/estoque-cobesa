"use server";

import { generateReorderPlan } from "@/ai/flows/generate-reorder-plan";
import { z } from "zod";
import type { Product } from "@/lib/types";

const ReorderPlanSchema = z.object({
  desiredServiceLevel: z.coerce.number().min(80).max(99),
  productsJson: z.string(),
});

export async function getReorderPlan(prevState: any, formData: FormData) {
  const validatedFields = ReorderPlanSchema.safeParse({
    desiredServiceLevel: formData.get("desiredServiceLevel"),
    productsJson: formData.get("productsJson"),
  });

  if (!validatedFields.success) {
    return {
      message: "Dados inválidos. Por favor, tente novamente.",
      plan: null,
      rationale: null,
    };
  }

  try {
    const products: Product[] = JSON.parse(validatedFields.data.productsJson);
    const inventoryLevels = products.map((p) => ({
      productId: p.id,
      productName: p.name,
      quantityInStock: p.quantity,
    }));
    
    // Mock sales data for now, as it's not in Firestore
    const salesData = products.map(p => ({ productId: p.id, productName: p.name, unitsSold: Math.floor(Math.random() * 100) + 50 }));

    const result = await generateReorderPlan({
      salesData: JSON.stringify(salesData),
      inventoryLevels: JSON.stringify(inventoryLevels),
      desiredServiceLevel: validatedFields.data.desiredServiceLevel,
    });
    
    try {
        const parsedPlan = JSON.parse(result.reorderPlan);
        return { message: "Plano gerado com sucesso.", plan: parsedPlan, rationale: result.rationale };
    } catch (e) {
        return { message: "Plano gerado com sucesso, mas não pôde ser formatado.", plan: result.reorderPlan, rationale: result.rationale };
    }

  } catch (error) {
    console.error(error);
    return {
      message: "Ocorreu um erro ao gerar o plano. Tente novamente.",
      plan: null,
      rationale: null,
    };
  }
}
