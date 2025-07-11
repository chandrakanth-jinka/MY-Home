"use client";

import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Expense } from "@/types";
import { format } from "date-fns";
import { Edit, Trash2, Check, X, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useUserProfile } from "@/hooks/useUserProfile";
import { updateExpense, deleteExpense } from "@/lib/firebase-service";


interface ExpensesTableProps {
    expenses: Expense[];
}

export function ExpensesTable({ expenses }: ExpensesTableProps) {
    const [user] = useAuthState(auth);
    const { userProfile } = useUserProfile(user?.uid);
    const { toast } = useToast();

    const [isManaging, setIsManaging] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [currentExpense, setCurrentExpense] = useState<Partial<Expense>>({});

    const householdId = userProfile?.householdId;

    const handleEditClick = (expense: Expense) => {
        setEditingId(expense.id);
        setCurrentExpense({ ...expense });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setCurrentExpense({});
    };

    const handleSaveEdit = async () => {
        if (!householdId || !editingId || !currentExpense.name || !currentExpense.amount || !currentExpense.date || !user?.email) return;

        const updatedFields: Partial<Expense> = {
            name: currentExpense.name,
            amount: Number(currentExpense.amount),
            date: currentExpense.date,
            lastEditedBy: user.email,
        };

        try {
            await updateExpense(householdId, editingId, updatedFields);
            toast({ title: "Expense Updated", description: "Your expense has been successfully updated." });
            handleCancelEdit();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update expense." });
        }
    };

    const handleDelete = async (expenseId: string) => {
        if (!householdId) return;
        try {
            await deleteExpense(householdId, expenseId);
            toast({ title: "Expense Deleted", description: "The expense has been removed." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete expense." });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentExpense(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setCurrentExpense(prev => ({ ...prev, date }));
        }
    }

    // Helper to extract name from email if needed
    const displayName = (val: string) => {
        if (!val) return "Unknown";
        if (val.includes("@")) return val.split("@")[0];
        return val;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Recent Expenses</h3>
                <Button variant="outline" size="sm" onClick={() => setIsManaging(!isManaging)}>
                    {isManaging ? "Done" : "Manage Expenses"}
                </Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Added By</TableHead>
                            <TableHead>Last Edited By</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            {isManaging && <TableHead className="text-right w-[100px]">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.length > 0 ? (
                            expenses.map((expense) => (
                                editingId === expense.id ? (
                                    // Editing Row
                                    <TableRow key={expense.id} className="bg-muted/50">
                                        <TableCell>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        size="sm"
                                                        className={cn("w-full justify-start text-left font-normal", !currentExpense.date && "text-muted-foreground")}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {currentExpense.date ? format(currentExpense.date, "dd MMM, yy") : <span>Pick date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar mode="single" selected={currentExpense.date} onSelect={handleDateChange} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                        </TableCell>
                                        <TableCell>
                                            <Input name="name" value={currentExpense.name || ''} onChange={handleInputChange} className="h-9" />
                                        </TableCell>
                                        <TableCell>{displayName(expense.addedBy)}</TableCell>
                                        <TableCell>{displayName(expense.lastEditedBy)}</TableCell>
                                        <TableCell className="text-right">
                                            <Input name="amount" type="number" value={currentExpense.amount || ''} onChange={handleInputChange} className="h-9 w-24 ml-auto text-right" />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveEdit}><Check className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelEdit}><X className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    // Display Row
                                    <TableRow key={expense.id}>
                                        <TableCell>{format(expense.date, "dd MMM, yyyy")}</TableCell>
                                        <TableCell className="font-medium">{expense.name}</TableCell>
                                        <TableCell>{displayName(expense.addedBy)}</TableCell>
                                        <TableCell>{displayName(expense.lastEditedBy)}</TableCell>
                                        <TableCell className="text-right">
                                            {expense.amount.toFixed(2)} rupees
                                        </TableCell>
                                        {isManaging && (
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditClick(expense)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will permanently delete the expense for "{expense.name}". This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(expense.id)} className="bg-destructive hover:bg-destructive/90 text-white">
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                )
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={isManaging ? 6 : 5} className="h-24 text-center">
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