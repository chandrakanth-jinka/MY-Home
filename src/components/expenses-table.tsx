"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { Expense } from "@/types";
import { format } from "date-fns";

interface ExpensesTableProps {
    expenses: Expense[];
}

export function ExpensesTable({ expenses }: ExpensesTableProps) {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Recent Expenses</h3>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Added By</TableHead>
                            <TableHead>Last Edited By</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.length > 0 ? (
                            expenses.map((expense) => (
                                <TableRow key={expense.id}>
                                    <TableCell>{format(expense.date, "dd MMM, yyyy")}</TableCell>
                                    <TableCell className="font-medium">{expense.name}</TableCell>
                                    <TableCell>{expense.addedBy}</TableCell>
                                    <TableCell>{expense.lastEditedBy}</TableCell>
                                    <TableCell className="text-right">
                                        ₹{expense.amount.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No expenses recorded yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
