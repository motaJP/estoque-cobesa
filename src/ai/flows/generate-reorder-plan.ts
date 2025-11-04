'use server';

/**
 * @fileOverview Generates an optimized reorder plan based on sales data and inventory levels.
 *
 * - generateReorderPlan - A function that generates the reorder plan.
 * - GenerateReorderPlanInput - The input type for the generateReorderPlan function.
 * - GenerateReorderPlanOutput - The return type for the generateReorderPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReorderPlanInputSchema = z.object({
  salesData: z.string().describe('Sales data in JSON format, including product IDs and quantities sold over a period.'),
  inventoryLevels: z.string().describe('Current inventory levels in JSON format, including product IDs and quantities in stock.'),
  desiredServiceLevel: z.number().describe('The desired service level (percentage of demand met from stock).'),
});
export type GenerateReorderPlanInput = z.infer<typeof GenerateReorderPlanInputSchema>;

const GenerateReorderPlanOutputSchema = z.object({
  reorderPlan: z.string().describe('Reorder plan in JSON format, including product IDs and quantities to reorder.'),
  rationale: z.string().describe('Explanation of the reorder plan, including factors considered and assumptions made.'),
});
export type GenerateReorderPlanOutput = z.infer<typeof GenerateReorderPlanOutputSchema>;

export async function generateReorderPlan(input: GenerateReorderPlanInput): Promise<GenerateReorderPlanOutput> {
  return generateReorderPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReorderPlanPrompt',
  input: {schema: GenerateReorderPlanInputSchema},
  output: {schema: GenerateReorderPlanOutputSchema},
  prompt: `You are an expert inventory management analyst. Analyze the provided sales data and inventory levels to generate an optimized reorder plan.

Sales Data: {{{salesData}}}
Inventory Levels: {{{inventoryLevels}}}
Desired Service Level: {{{desiredServiceLevel}}}

Consider the following factors when generating the reorder plan:
* Sales trends and seasonality
* Lead times for each product
* Storage capacity
* Cost of holding inventory

Provide the reorder plan in JSON format, including the product ID and quantity to reorder for each product. Also, include a rationale explaining the reorder plan, including the factors considered and assumptions made.

Ensure that the reorder plan minimizes stockouts while also avoiding excess inventory.
`,
});

const generateReorderPlanFlow = ai.defineFlow(
  {
    name: 'generateReorderPlanFlow',
    inputSchema: GenerateReorderPlanInputSchema,
    outputSchema: GenerateReorderPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
