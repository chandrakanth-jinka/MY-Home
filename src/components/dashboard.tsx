"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseTracker } from "@/components/expense-tracker";
import { MilkTracker } from "@/components/milk-tracker";
import { Reports } from "@/components/reports";
import type { Expense, MilkData, Milkman } from "@/types";

const initialExpenses: Expense[] = [
  { id: '1', date: new Date(2024, 6, 20), name: 'Onions', amount: 50, category: 'Vegetables', addedBy: 'Alice' },
  { id: '2', date: new Date(2024, 6, 20), name: 'Milk', amount: 2.5, category: 'Groceries', addedBy: 'Bob' },
  { id: '3', date: new Date(2024, 6, 19), name: 'Rice Bag', amount: 1200, category: 'Groceries', addedBy: 'Alice' },
  { id: '4', date: new Date(2024, 6, 18), name: 'Electricity Bill', amount: 850, category: 'Utilities', addedBy: 'Bob' },
];

const initialMilkmen: Milkman[] = [
  { id: 'm1', name: 'Anand Dairy', rate: 58 },
  { id: 'm2', name: 'Local Farm', rate: 65 },
]

const initialMilkData: MilkData = {
  '2024-07-20': { m1: { morning: 1, evening: 0.5 } },
  '2024-07-19': { m1: { morning: 1, evening: 1 } },
  '2024-07-18': { m2: { morning: 1.5 } },
  '2024-07-05': { m1: { morning: 1 } },
};

export function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [milkData, setMilkData] = useState<MilkData>(initialMilkData);
  const [milkmen] = useState<Milkman[]>(initialMilkmen);

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
