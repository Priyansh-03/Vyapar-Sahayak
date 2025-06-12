
// src/ai/flows/suggest-products.ts
'use server';

/**
 * @fileOverview An AI agent that suggests products to add to a bill based on previous sales data.
 *
 * - suggestProducts - A function that suggests products based on sales history.
 * - SuggestProductsInput - The input type for the suggestProducts function.
 * - SuggestProductsOutput - The return type for the suggestProducts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {Prompt, Flow} from 'genkit';

const SuggestProductsInputSchema = z.object({
  salesHistory: z
    .string()
    .describe('A string containing the sales history data.'),
  currentCart: z.string().optional().describe('A string containing the current items in the cart.'),
});
export type SuggestProductsInput = z.infer<typeof SuggestProductsInputSchema>;

const SuggestProductsOutputSchema = z.object({
  suggestedProducts: z
    .string()
    .describe('A comma separated list of suggested products to add to the cart.'),
});
export type SuggestProductsOutput = z.infer<typeof SuggestProductsOutputSchema>;

const defaultOutput: SuggestProductsOutput = { suggestedProducts: "" };

let suggestProductsPrompt: Prompt<typeof SuggestProductsInputSchema, typeof SuggestProductsOutputSchema> | undefined;
let suggestProductsFlow: Flow<typeof SuggestProductsInputSchema, typeof SuggestProductsOutputSchema> | undefined;

if (process.env.GOOGLE_API_KEY) {
  suggestProductsPrompt = ai.definePrompt({
    name: 'suggestProductsPrompt',
    input: {schema: SuggestProductsInputSchema},
    output: {schema: SuggestProductsOutputSchema},
    prompt: `You are an expert sales assistant for a small shopkeeper. Based on the sales history and the current cart, you will suggest products to add to the cart to increase sales and offer relevant items to the customer.

  Sales History: {{{salesHistory}}}
  Current Cart: {{{currentCart}}}

  Suggested Products:`,
  });

  suggestProductsFlow = ai.defineFlow(
    {
      name: 'suggestProductsFlow',
      inputSchema: SuggestProductsInputSchema,
      outputSchema: SuggestProductsOutputSchema,
    },
    async input => {
      if (!suggestProductsPrompt) { // Should not happen if API key is present, but good check
        console.warn("Suggest products flow: suggestProductsPrompt not defined.");
        return defaultOutput;
      }
      try {
        const {output} = await suggestProductsPrompt(input);
        return output || defaultOutput;
      } catch (flowError) {
        console.error("Error calling suggestProductsPrompt within flow, returning default output:", flowError);
        if (flowError instanceof Error && (flowError.message.includes("model_not_found") || flowError.message.includes("No model found"))) {
          console.warn("Suggest products flow: Model not found, likely due to missing API key or plugin issue.");
        }
        return defaultOutput;
      }
    }
  );
}


export async function suggestProducts(input: SuggestProductsInput): Promise<SuggestProductsOutput> {
  if (!process.env.GOOGLE_API_KEY || !suggestProductsFlow) {
    console.warn("Suggest products: GOOGLE_API_KEY not available or flow not defined. Returning empty suggestions.");
    return defaultOutput;
  }
  try {
    return await suggestProductsFlow(input);
  } catch (error) {
    console.error("Error in suggestProducts flow, returning default output:", error);
    return defaultOutput;
  }
}
