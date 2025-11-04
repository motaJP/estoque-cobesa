'use server';
/**
 * @fileOverview A flow to find compatible vehicle parts based on a license plate or model.
 *
 * - findCompatibleParts - The main function that orchestrates the part finding process.
 * - FindCompatiblePartsInput - The input type for the flow.
 * - FindCompatiblePartsOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/client-provider';


// Define input and output schemas
const FindCompatiblePartsInputSchema = z.object({
  query: z.string().describe('The license plate or vehicle model to search for.'),
});
export type FindCompatiblePartsInput = z.infer<typeof FindCompatiblePartsInputSchema>;

const PartSchema = z.object({
    partName: z.string().describe("The descriptive name of the compatible part."),
    partNumber: z.string().describe("The unique part number, code, or SKU."),
    manufacturer: z.string().describe("The manufacturer of the part."),
});

const FindCompatiblePartsOutputSchema = z.object({
  compatibleParts: z.array(PartSchema).describe('A list of compatible parts found.'),
  rationale: z.string().describe('An explanation of how the result was obtained, including any assumptions made.'),
  source: z.enum(["cache", "api", "web_search"]).describe("The source of the information (Firestore Cache, Parts API, or Web Search).")
});
export type FindCompatiblePartsOutput = z.infer<typeof FindCompatiblePartsOutputSchema>;


// Mock Tool: Get Vehicle Details from License Plate
const getVehicleDetailsTool = ai.defineTool(
  {
    name: 'getVehicleDetails',
    description: 'Gets detailed vehicle information (like exact model, year, and engine) from a license plate. Use this if the user provides a license plate.',
    inputSchema: z.object({ licensePlate: z.string().describe("The vehicle's license plate.") }),
    outputSchema: z.object({
        found: z.boolean(),
        model: z.string().optional().describe("The exact model of the vehicle, e.g., 'Scania R450'"),
        year: z.number().optional().describe("The manufacturing year of the vehicle."),
        engine: z.string().optional().describe("The engine specification, e.g., 'DC13 148'"),
    }),
  },
  async ({ licensePlate }) => {
    console.log(`[Tool] Mock searching for vehicle with plate: ${licensePlate}`);
    // In a real implementation, this would call an external API like 'Olho no Carro'.
    // Returning mock data for demonstration.
    if (licensePlate.toUpperCase().includes("ABC")) {
        return { found: true, model: 'Scania R450', year: 2021, engine: 'DC13 148' };
    }
    return { found: false };
  }
);


// Mock Tool: Find parts in a catalog API
const getPartsFromCatalogTool = ai.defineTool(
    {
        name: 'getPartsFromCatalog',
        description: 'Searches a parts catalog API for compatible parts based on a detailed vehicle model.',
        inputSchema: z.object({ vehicleModel: z.string().describe("The detailed model of the vehicle, e.g., 'Scania R450 2021'.") }),
        outputSchema: z.object({
            found: z.boolean(),
            parts: z.array(PartSchema).optional(),
        }),
    },
    async ({ vehicleModel }) => {
        console.log(`[Tool] Mock searching catalog for model: ${vehicleModel}`);
        // In a real implementation, this would call an API like TecDoc or MaktubAPI.
        // Returning mock data for demonstration.
        if (vehicleModel.toLowerCase().includes("scania r450")) {
            return {
                found: true,
                parts: [
                    { partName: "Filtro de Óleo", partNumber: "HU 945/2x", manufacturer: "MANN" },
                    { partName: "Filtro de Ar", partNumber: "C 30 1500", manufacturer: "MANN" },
                    { partName: "Filtro de Combustível", partNumber: "PU 1059x", manufacturer: "MANN" },
                ]
            };
        }
        return { found: false };
    }
);


// Main Flow Definition
export const findCompatiblePartsFlow = ai.defineFlow(
  {
    name: 'findCompatiblePartsFlow',
    inputSchema: FindCompatiblePartsInputSchema,
    outputSchema: FindCompatiblePartsOutputSchema,
  },
  async ({ query }) => {
    // Initialize Firestore
    const { firestore } = initializeFirebase();
    const cacheRef = doc(firestore, 'compatibilityCache', query.toLowerCase());
    
    // 1. Check Firestore Cache
    const cachedSnap = await getDoc(cacheRef);
    if (cachedSnap.exists()) {
      console.log("Returning result from Firestore cache.");
      return {
        ...cachedSnap.data() as FindCompatiblePartsOutput,
        source: "cache",
      };
    }

    // 2. Use LLM with Tools
    const llmResponse = await ai.generate({
      prompt: `An user is asking for compatible parts for a vehicle: "${query}".
      First, determine if the query is a license plate or a vehicle model.
      - If it is a license plate, use the 'getVehicleDetails' tool to find the exact model. Then, use the 'getPartsFromCatalog' tool with the model you found.
      - If it is a vehicle model, use the 'getPartsFromCatalog' tool directly.
      - If the tools return compatible parts, output them in the specified JSON format.
      - If the tools do NOT find any parts, state that the tools found nothing and that you will now search the web. Then, perform a web search to find compatible parts for "${query}".
      Your final answer MUST be a list of parts. If you find nothing after all steps, return an empty list.`,
      model: 'googleai/gemini-2.5-flash',
      tools: [getVehicleDetailsTool, getPartsFromCatalogTool],
      output: {
        schema: FindCompatiblePartsOutputSchema,
      },
      config: {
          // It's better to allow the model to search the web if needed.
          // For this, we don't need a specific tool, just let the model do it.
      }
    });

    const output = llmResponse.output()!;

    // Determine the source based on tool usage. If tools were used, it's 'api'. Otherwise, it's 'web_search'.
    const source = llmResponse.usage.toolCalls.length > 0 ? "api" : "web_search";
    
    const finalOutput = {
        ...output,
        source,
    }

    // 3. Save to Cache
    if (output.compatibleParts.length > 0) {
      await setDoc(cacheRef, finalOutput);
      console.log("Result saved to Firestore cache.");
    }
    
    return finalOutput;
  }
);


// Exported wrapper function
export async function findCompatibleParts(input: FindCompatiblePartsInput): Promise<FindCompatiblePartsOutput> {
  return findCompatiblePartsFlow(input);
}
