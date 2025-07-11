"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Expense } from "@/types";
import { ExpenseForm } from "@/components/expense-form";
import { ExpensesTable } from "./expenses-table";
import { Separator } from "./ui/separator";

interface ExpenseTrackerProps {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id" | "addedBy" | "lastEditedBy" | "householdId">) => void;
}

export function ExpenseTracker({ expenses, addExpense }: ExpenseTrackerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add & View Expenses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ExpenseForm addExpense={addExpense} />
        <Separator />
        <ExpensesTable expenses={expenses} />
      </CardContent>
    </Card>
  );
}
