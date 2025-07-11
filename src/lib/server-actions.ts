"use server";

import {
  categorizeExpense as categorizeExpenseFlow,
  type CategorizeExpenseInput,
} from "@/ai/flows/categorize-expense";

export async function getExpenseCategory(
  input: CategorizeExpenseInput
): Promise<string> {
  try {
    const result = await categorizeExpenseFlow(input);
    return result.category;
  } catch (error) {
    console.error("AI categorization failed:", error);
    // In case of an error, return a default category.
    // This prevents the UI from breaking if the AI service is unavailable.
    return "Other";
  }
}
