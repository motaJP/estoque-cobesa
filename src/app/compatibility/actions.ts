"use server";

import { findCompatibleParts } from "@/ai/flows/find-compatible-parts-flow";
import { z } from "zod";

const CompatibilitySchema = z.object({
  query: z.string().min(3, "A consulta deve ter pelo menos 3 caracteres."),
});

export async function getCompatibleParts(prevState: any, formData: FormData) {
  const validatedFields = CompatibilitySchema.safeParse({
    query: formData.get("query"),
  });

  if (!validatedFields.success) {
    return {
      message: "Dados inválidos. Por favor, tente novamente.",
      parts: null,
      rationale: null,
      source: null,
    };
  }

  try {
    const result = await findCompatibleParts({ query: validatedFields.data.query });
    
    return { 
        message: "Busca concluída com sucesso.", 
        parts: result.compatibleParts, 
        rationale: result.rationale,
        source: result.source,
    };

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Um erro desconhecido ocorreu.";
    return {
      message: `Ocorreu um erro ao buscar as peças: ${errorMessage}`,
      parts: null,
      rationale: null,
      source: null,
    };
  }
}
