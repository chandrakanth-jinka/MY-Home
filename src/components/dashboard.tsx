"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseTracker } from "@/components/expense-tracker";
import { MilkTracker } from "@/components/milk-tracker";
import { Reports } from "@/components/reports";
import type { Expense, MilkData, Milkman } from "@/types";
import { addExpense, getExpenses, getMilkData, updateMilkData, getMilkmen } from "@/lib/firebase-service";

export function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [milkData, setMilkData] = useState<MilkData>({});
  const [milkmen, setMilkmen] = useState<Milkman[]>([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded user for now
  const currentUser = "User1"; 

  useEffect(() => {
    const unsubscribeExpenses = getExpenses((data) => {
        setExpenses(data);
        setLoading(false);
    });
    const unsubscribeMilkData = getMilkData((data) => {
        setMilkData(data);
    });
    const unsubscribeMilkmen = getMilkmen((data) => {
        setMilkmen(data);
    });


    return () => {
        unsubscribeExpenses();
        unsubscribeMilkData();
        unsubscribeMilkmen();
    };
  }, []);
  
  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'addedBy' | 'lastEditedBy'>) => {
    const newExpense: Omit<Expense, 'id'> = {
        ...expense,
        addedBy: currentUser,
        lastEditedBy: currentUser,
    };
    await addExpense(newExpense);
  };

  const handleUpdateMilkEntry = async (date: string, milkmanId: string, entry: { morning?: number, evening?: number }) => {
    await updateMilkData(date, milkmanId, entry, currentUser);
  };

  if (loading) {
      return <div>Loading...</div>
  }

  return (
    <Tabs defaultValue="expenses" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="milk">Milk</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="expenses">
        <ExpenseTracker expenses={expenses} addExpense={handleAddExpense} />
      </TabsContent>
      <TabsContent value="milk">
        <MilkTracker 
          milkData={milkData} 
          milkmen={milkmen}
          updateMilkEntry={handleUpdateMilkEntry}
        />
      </TabsContent>
      <TabsContent value="reports">
        <Reports expenses={expenses} milkData={milkData} milkmen={milkmen} />
      </TabsContent>
    </Tabs>
  );
}
