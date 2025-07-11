"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, Legend } from "recharts";
import type { Expense, MilkData, Milkman } from "@/types";
import { useMemo } from "react";
import { ExcelExportButton } from "./excel-export-button";

interface ReportsProps {
  expenses: Expense[];
  milkData: MilkData;
  milkmen: Milkman[];
}

const COLORS = ["#16a34a", "#22c55e", "#4ade80", "#86efac", "#bbf7d0"];

export function Reports({ expenses, milkData, milkmen }: ReportsProps) {
  const expenseByCategory = useMemo(() => {
    const categoryMap = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const monthlySpending = useMemo(() => {
    const monthMap = expenses.reduce((acc, expense) => {
      const month = expense.date.toLocaleString('default', { month: 'short', year: '2-digit' });
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // This is a simplified sort, for a real app you'd parse the dates
    return Object.entries(monthMap).map(([name, total]) => ({ name, total }));
  }, [expenses]);
  
  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const totalMilk = useMemo(() => {
    return Object.values(milkData).reduce((sum, daily) => {
        return sum + Object.values(daily).reduce((dailySum, entry) => {
            return dailySum + (entry.morning || 0) + (entry.evening || 0);
        }, 0)
    }, 0)
  }, [milkData]);


  return (
    <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{totalSpent.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">across {expenses.length} transactions</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Milk</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalMilk.toFixed(2)} L</div>
                    <p className="text-xs text-muted-foreground">this period</p>
                </CardContent>
            </Card>
             <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Export Data</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                   <div>
                     <p className="text-xs text-muted-foreground">Download all expense and milk data as an Excel file.</p>
                   </div>
                   <ExcelExportButton expenses={expenses} milkData={milkData} milkmen={milkmen} />
                </CardContent>
            </Card>
        </div>


        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
                <CardHeader>
                    <CardTitle>Monthly Spending</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlySpending}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis width={80} tickFormatter={(value) => `₹${value}`} />
                            <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))'}}/>
                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Expenses by Category</CardTitle>
                    <CardDescription>Top 5 categories shown.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={expenseByCategory.slice(0, 5)}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {expenseByCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{backgroundColor: 'hsl(var(--background))'}}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
