
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Expense, MilkData, Milkman } from "@/types";
import { useMemo, useState } from "react";
import { ExcelExportButton } from "./excel-export-button";
import { DateRangePicker } from "./ui/date-range-picker";
import type { DateRange } from "react-day-picker";
import { addDays, format, startOfMonth } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ScrollArea } from "./ui/scroll-area";

interface ReportsProps {
  expenses: Expense[];
  milkData: MilkData;
  milkmen: Milkman[];
}

export function Reports({ expenses, milkData, milkmen }: ReportsProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  const filteredData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return { filteredExpenses: [], filteredMilkData: {}, filteredMilkmen: milkmen };
    }
    const from = dateRange.from;
    const to = dateRange.to;

    const filteredExpenses = expenses.filter(e => e.date >= from && e.date <= to);

    const filteredMilkData: MilkData = {};
    for (const date in milkData) {
      const d = new Date(date);
      // Add a day to include the 'to' date in the range, as date objects are at midnight
      if (d >= from && d < addDays(to, 1)) {
        filteredMilkData[date] = milkData[date];
      }
    }
    
    return { filteredExpenses, filteredMilkData, filteredMilkmen: milkmen };
  }, [expenses, milkData, milkmen, dateRange]);


  const monthlySpending = useMemo(() => {
    const monthMap = filteredData.filteredExpenses.reduce((acc, expense) => {
      const month = format(expense.date, 'dd MMM');
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(monthMap).map(([name, total]) => ({ name, total }));
  }, [filteredData.filteredExpenses]);
  
  const totalSpent = useMemo(() => filteredData.filteredExpenses.reduce((sum, e) => sum + e.amount, 0), [filteredData.filteredExpenses]);
  
  const milkReport = useMemo(() => {
    const report: { [milkmanId: string]: { name: string; rate: number; totalQty: number; totalCost: number } } = {};
  
    milkmen.forEach(m => {
      report[m.id] = { name: m.name, rate: m.rate, totalQty: 0, totalCost: 0 };
    });
  
    Object.values(filteredData.filteredMilkData).forEach(daily => {
      Object.entries(daily).forEach(([milkmanId, entry]) => {
        if (report[milkmanId]) {
          const qty = (entry.morning || 0) + (entry.evening || 0);
          report[milkmanId].totalQty += qty;
          report[milkmanId].totalCost += qty * report[milkmanId].rate;
        }
      });
    });
  
    const totalQty = Object.values(report).reduce((sum, m) => sum + m.totalQty, 0);
    const totalCost = Object.values(report).reduce((sum, m) => sum + m.totalCost, 0);
  
    return {
      byMilkman: Object.values(report).filter(m => m.totalQty > 0),
      totalQty,
      totalCost,
    };
  }, [filteredData.filteredMilkData, milkmen]);


  return (
    <div className="space-y-4">
        <Card>
            <CardHeader>
                <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4 items-center">
                <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                <div className="flex-grow"></div>
                <ExcelExportButton 
                    expenses={filteredData.filteredExpenses} 
                    milkData={filteredData.filteredMilkData} 
                    milkmen={filteredData.filteredMilkmen} 
                />
            </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{totalSpent.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">across {filteredData.filteredExpenses.length} transactions</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Milk Cost</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{milkReport.totalCost.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">{milkReport.totalQty.toFixed(2)} L total</p>
                </CardContent>
            </Card>
        </div>


        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Spending Chart</CardTitle>
                    <CardDescription>Daily spending in selected range.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlySpending}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                            <YAxis width={60} tickFormatter={(value) => `₹${value}`} />
                            <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))'}}/>
                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Milk Cost Breakdown</CardTitle>
                    <CardDescription>Total cost per supplier in selected range.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Supplier</TableHead>
                                <TableHead className="text-right">Quantity (L)</TableHead>
                                <TableHead className="text-right">Cost</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {milkReport.byMilkman.length > 0 ? (
                                milkReport.byMilkman.map((m) => (
                                    <TableRow key={m.name}>
                                        <TableCell className="font-medium">{m.name}</TableCell>
                                        <TableCell className="text-right">{m.totalQty.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">₹{m.totalCost.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        No milk data for this period.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
