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
import { CalendarIcon, PlusCircle } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Expense } from "@/types";
import { useToast } from "@/hooks/use-toast";
import React from "react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Item name must be at least 2 characters." }),
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  date: z.date(),
});

const quickAddItems = ["Vegetables", "Fruits", "Meat", "Electricity", "Ghee", "Rent", "Auto"];

interface ExpenseFormProps {
  addExpense: (expense: Omit<Expense, "id" | "addedBy" | "lastEditedBy" | "householdId">) => void;
}

export function ExpenseForm({ addExpense }: ExpenseFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: undefined,
      date: new Date(),
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addExpense(values);
    toast({
      title: "Expense Added",
      description: `${values.name} for ${values.amount} has been added.`,
    });
    form.reset();
    form.setValue("date", new Date());
  }
  
  const handleQuickAdd = (name: string) => {
    form.setValue("name", name, { shouldValidate: true });
  }

  return (
    <div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Item Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Onions" {...field} />
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
                                    <Input type="number" placeholder="e.g. 50" {...field} />
                                </FormControl>
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
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-sm font-medium mr-2 self-center">Quick Add:</span>
                    {quickAddItems.map(item => (
                        <Button key={item} type="button" variant="outline" size="sm" onClick={() => handleQuickAdd(item)}>{item}</Button>
                    ))}
                </div>
                <Button type="submit" className="w-full md:w-auto"><PlusCircle className="mr-2"/> Add Expense</Button>
            </form>
        </Form>
    </div>
  );
}
