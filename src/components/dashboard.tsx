"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseTracker } from "@/components/expense-tracker";
import { MilkTracker } from "@/components/milk-tracker";
import { Reports } from "@/components/reports";
import type { Expense, MilkData, Milkman } from "@/types";

export function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [milkData, setMilkData] = useState<MilkData>({});
  const [milkmen, setMilkmen] = useState<Milkman[]>([]);

  const addExpense = (expense: Omit<Expense, 'id' | 'addedBy'>) => {
    setExpenses(prev => [
      { ...expense, id: Date.now().toString(), addedBy: 'You' },
      ...prev
    ].sort((a,b) => b.date.getTime() - a.date.getTime()));
  };

  const updateMilkEntry = (date: string, milkmanId: string, entry: { morning?: number, evening?: number }) => {
    setMilkData(prev => {
      const newMilkData = { ...prev };
      if (!newMilkData[date]) {
        newMilkData[date] = {};
      }
      if (!newMilkData[date][milkmanId]) {
        newMilkData[date][milkmanId] = {};
      }
      
      const currentEntry = newMilkData[date][milkmanId];
      const newEntry = {
        morning: entry.morning ?? currentEntry.morning,
        evening: entry.evening ?? currentEntry.evening,
      }

      // If both are 0 or undefined, remove the entry for that milkman
      if(!newEntry.morning && !newEntry.evening) {
        delete newMilkData[date][milkmanId];
        // if no milkmen left for the date, remove date entry
        if(Object.keys(newMilkData[date]).length === 0) {
          delete newMilkData[date];
        }
      } else {
        newMilkData[date][milkmanId] = newEntry;
      }
      
      return newMilkData;
    });
  };

  return (
    <Tabs defaultValue="expenses" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="milk">Milk</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="expenses">
        <ExpenseTracker expenses={expenses} addExpense={addExpense} />
      </TabsContent>
      <TabsContent value="milk">
        <MilkTracker 
          milkData={milkData} 
          milkmen={milkmen}
          updateMilkEntry={updateMilkEntry}
        />
      </TabsContent>
      <TabsContent value="reports">
        <Reports expenses={expenses} milkData={milkData} milkmen={milkmen} />
      </TabsContent>
    </Tabs>
  );
}
