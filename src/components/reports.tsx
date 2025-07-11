
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import type { Expense, MilkData, Milkman } from "@/types";
import { useMemo, useState } from "react";
import { ExcelExportButton } from "./excel-export-button";
import { DateRangePicker } from "./ui/date-range-picker";
import type { DateRange } from "react-day-picker";
import { addDays, format, startOfMonth, eachDayOfInterval, compareAsc } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ScrollArea } from "./ui/scroll-area";
import { Milk, IndianRupee } from "lucide-react";

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
      if (d >= from && d <= to) {
        filteredMilkData[date] = milkData[date];
      }
    }
    
    return { filteredExpenses, filteredMilkData, filteredMilkmen: milkmen };
  }, [expenses, milkData, milkmen, dateRange]);


  const milkmenMap = useMemo(() => {
    const map = new Map<string, Milkman>();
    milkmen.forEach(m => map.set(m.id, m));
    return map;
  }, [milkmen]);

  const dailyTotals = useMemo(() => {
    const totals: { [date: string]: { expenses: number; milk: number; total: number } } = {};

    if (!dateRange?.from || !dateRange?.to) return [];

    const interval = eachDayOfInterval({
        start: dateRange.from,
        end: dateRange.to,
      });

    interval.forEach(day => {
        const dateStr = format(day, "yyyy-MM-dd");
        totals[dateStr] = { expenses: 0, milk: 0, total: 0 };
    });

    filteredData.filteredExpenses.forEach(expense => {
      const dateStr = format(expense.date, "yyyy-MM-dd");
      if (totals[dateStr]) {
        totals[dateStr].expenses += expense.amount;
      }
    });

    Object.entries(filteredData.filteredMilkData).forEach(([dateStr, dailyRecord]) => {
      if (totals[dateStr]) {
        let dailyMilkCost = 0;
        Object.entries(dailyRecord).forEach(([milkmanId, entry]) => {
          const milkman = milkmenMap.get(milkmanId);
          if (milkman) {
            const qty = (entry.morning || 0) + (entry.evening || 0);
            dailyMilkCost += qty * milkman.rate;
          }
        });
        totals[dateStr].milk = dailyMilkCost;
      }
    });
    
    return Object.entries(totals).map(([date, data]) => ({
      name: format(new Date(date), 'dd MMM'),
      Expenses: data.expenses,
      Milk: data.milk,
      Total: data.expenses + data.milk,
    })).sort((a, b) => compareAsc(new Date(a.name), new Date(b.name)));

  }, [filteredData.filteredExpenses, filteredData.filteredMilkData, milkmenMap, dateRange]);


  const cumulativeSpending = useMemo(() => {
    let cumulativeTotal = 0;
    return dailyTotals.map(day => {
        cumulativeTotal += day.Total;
        return {
            name: day.name,
            Spending: cumulativeTotal
        }
    });
  }, [dailyTotals]);

  const totalSpent = useMemo(() => dailyTotals.reduce((sum, day) => sum + day.Expenses, 0), [dailyTotals]);
  const totalMilkCost = useMemo(() => dailyTotals.reduce((sum, day) => sum + day.Milk, 0), [dailyTotals]);

  
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
  
    return {
      byMilkman: Object.values(report).filter(m => m.totalQty > 0),
      totalQty,
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

        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
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
                    <div className="text-2xl font-bold">₹{totalMilkCost.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">{milkReport.totalQty.toFixed(2)} L total</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Grand Total</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{(totalSpent + totalMilkCost).toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Total spending in selected period</p>
                </CardContent>
            </Card>
        </div>
        
        {milkReport.byMilkman.length > 0 && (
          <Card>
              <CardHeader>
                  <CardTitle>Milk Supplier Bills</CardTitle>
                  <CardDescription>
                      Summary of amount owed to each supplier for the selected period.
                  </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {milkReport.byMilkman.map((supplier) => (
                      <Card key={supplier.name} className="flex flex-col">
                          <CardHeader className="pb-4">
                              <CardTitle className="text-lg">{supplier.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="flex-grow space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground flex items-center"><Milk className="mr-2 h-4 w-4" /> Total Quantity</span>
                                  <span className="font-medium">{supplier.totalQty.toFixed(2)} L</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center"><IndianRupee className="mr-2 h-4 w-4" /> Rate</span>
                                <span className="font-medium">₹{supplier.rate.toFixed(2)} / L</span>
                              </div>
                          </CardContent>
                          <div className="p-4 pt-0 mt-2">
                              <div className="bg-muted rounded-lg p-3 text-center">
                                  <p className="text-sm text-muted-foreground">Total Owed</p>
                                  <p className="text-2xl font-bold text-primary">₹{supplier.totalCost.toFixed(2)}</p>
                              </div>
                          </div>
                      </Card>
                  ))}
              </CardContent>
          </Card>
        )}


        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
            <Card className="lg:col-span-4">
                <CardHeader>
                    <CardTitle>Daily Spending Breakdown</CardTitle>
                    <CardDescription>Expenses vs. Milk cost for the selected range.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dailyTotals}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} interval={Math.floor(dailyTotals.length / 15)} />
                            <YAxis width={60} tickFormatter={(value) => `₹${value}`} />
                            <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))'}}/>
                            <Legend />
                            <Bar dataKey="Expenses" stackId="a" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Milk" stackId="a" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
             <Card className="lg:col-span-3">
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
        <Card>
            <CardHeader>
                <CardTitle>Cumulative Spending Over Time</CardTitle>
                <CardDescription>Shows how total spending changes over the selected period.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={cumulativeSpending}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} interval={Math.floor(cumulativeSpending.length / 15)} />
                        <YAxis width={60} tickFormatter={(value) => `₹${value}`} />
                        <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))'}}/>
                        <Area type="monotone" dataKey="Spending" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    </div>
  );
}

    