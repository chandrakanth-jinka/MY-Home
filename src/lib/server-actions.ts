"use server";

// This file is currently not used but is kept for future AI feature implementation.
import {
  categorizeExpense as categorizeExpenseFlow,
  type CategorizeExpenseInput,
} from "@/ai/flows/categorize-expense";

export async function getExpenseSuggestion(
  input: CategorizeExpenseInput
): Promise<string> {
  try {
    const result = await categorizeExpenseFlow(input);
    return result.suggestedName;
  } catch (error) {
    console.error("AI suggestion failed:", error);
    // In case of an error, return the original name.
    return input.expenseName;
  }
}
