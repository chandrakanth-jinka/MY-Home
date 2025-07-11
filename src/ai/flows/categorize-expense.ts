'use server';

/**
 * @fileOverview Automatically categorizes expenses using AI based on user input.
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
  category: z.string().describe('The predicted category of the expense.'),
});
export type CategorizeExpenseOutput = z.infer<typeof CategorizeExpenseOutputSchema>;

export async function categorizeExpense(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  return categorizeExpenseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeExpensePrompt',
  input: {schema: CategorizeExpenseInputSchema},
  output: {schema: CategorizeExpenseOutputSchema},
  prompt: `You are an AI assistant specialized in categorizing expenses.
  Given the expense name, amount, and description (if available), predict the most appropriate category for the expense.

  Expense Name: {{{expenseName}}}
  Amount: {{{amount}}}
  Description: {{{description}}}

  Possible categories are: Vegetables, Fruits, Meat, Electricity, Ghee, Rice, Onions, Milk, Rent, Transport, Groceries, Dining Out, Entertainment, Utilities, Health, Education, Clothing, Personal Care, Home Improvement, Other.
  Return just the category name, do not include any other text. Do not explain your reasoning.
  The category must be from the specified list.
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
