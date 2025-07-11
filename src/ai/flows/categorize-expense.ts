'use server';

/**
 * @fileOverview An AI flow to suggest an item name, but this is not currently used.
 *
 * - categorizeExpense - A function that categorizes an expense.
 * - CategorizeExpenseInput - The input type for the categorizeExpense function.
 * - CategorizeExpenseOutput - The return type for the categorizeExpense function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeExpenseInputSchema = z.object({
  expenseName: z.string().describe('The name of the expense item.'),
  amount: z.number().describe('The amount of the expense.'),
  description: z.string().optional().describe('Optional description of the expense.'),
});
export type CategorizeExpenseInput = z.infer<typeof CategorizeExpenseInputSchema>;

const CategorizeExpenseOutputSchema = z.object({
  suggestedName: z.string().describe('A suggested, standardized name for the expense.'),
});
export type CategorizeExpenseOutput = z.infer<typeof CategorizeExpenseOutputSchema>;

export async function categorizeExpense(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  return categorizeExpenseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeExpensePrompt',
  input: {schema: CategorizeExpenseInputSchema},
  output: {schema: CategorizeExpenseOutputSchema},
  prompt: `You are an AI assistant. Given an expense name, suggest a cleaner, more standardized name for it.
  For example, if the user enters 'onins', you could suggest 'Onions'.

  Expense Name: {{{expenseName}}}
  Amount: {{{amount}}}
  Description: {{{description}}}

  Return just the suggested name.
  `,
});

const categorizeExpenseFlow = ai.defineFlow(
  {
    name: 'categorizeExpenseFlow',
    inputSchema: CategorizeExpenseInputSchema,
    outputSchema: CategorizeExpenseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
