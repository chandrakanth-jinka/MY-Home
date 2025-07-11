"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, Carrot, Milk, Utensils, Home, Car, Shirt, PlusCircle } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Expense } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { getExpenseCategory } from "@/lib/server-actions";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useCallback } from "react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Item name must be at least 2 characters." }),
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  date: z.date(),
  category: z.string().min(1, { message: "Please select a category." }),
});

const expenseCategories = [
  "Vegetables", "Fruits", "Meat", "Electricity", "Ghee", "Rice", "Onions",
  "Milk", "Rent", "Transport", "Groceries", "Dining Out", "Entertainment",
  "Utilities", "Health", "Education", "Clothing", "Personal Care", "Home Improvement", "Other",
];

const quickAddItems = [
    { name: 'Vegetables', icon: Carrot, category: 'Vegetables' },
    { name: 'Milk', icon: Milk, category: 'Milk' },
    { name: 'Dining Out', icon: Utensils, category: 'Dining Out' },
    { name: 'Rent', icon: Home, category: 'Rent' },
    { name: 'Transport', icon: Car, category: 'Transport' },
    { name: 'Clothing', icon: Shirt, category: 'Clothing' },
];

interface ExpenseFormProps {
  addExpense: (expense: Omit<Expense, "id" | "addedBy">) => void;
}

export function ExpenseForm({ addExpense }: ExpenseFormProps) {
  const { toast } = useToast();
  const [isCategorizing, setIsCategorizing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: undefined,
      date: new Date(),
      category: "",
    },
  });

  const handleNameChange = useCallback(
    async (name: string, amount: number | undefined) => {
      if (name.length > 2 && amount && amount > 0) {
        setIsCategorizing(true);
        try {
          const category = await getExpenseCategory({ expenseName: name, amount });
          if (expenseCategories.includes(category)) {
            form.setValue("category", category, { shouldValidate: true });
          } else {
             form.setValue("category", "Other", { shouldValidate: true });
          }
        } finally {
          setIsCategorizing(false);
        }
      }
    },
    [form]
  );

  function onSubmit(values: z.infer<typeof formSchema>) {
    addExpense(values);
    toast({
      title: "Expense Added",
      description: `${values.name} for ${values.amount} has been added.`,
    });
    form.reset();
    form.setValue("date", new Date());
  }

  return (
    <div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Item Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Onions" {...field} onChange={(e) => {
                                        field.onChange(e);
                                        handleNameChange(e.target.value, form.getValues('amount'));
                                    }}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g. 50" {...field} onChange={(e) => {
                                        field.onChange(e);
                                        handleNameChange(form.getValues('name'), Number(e.target.value));
                                    }}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={isCategorizing}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isCategorizing ? "AI thinking..." : "Select a category"} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {expenseCategories.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col pt-2">
                                <FormLabel className="mb-1.5">Date of Expense</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" className="w-full md:w-auto"><PlusCircle className="mr-2"/> Add Expense</Button>
            </form>
        </Form>
    </div>
  );
}
