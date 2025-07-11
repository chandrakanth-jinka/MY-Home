"use client";

import * as XLSX from "xlsx";
import type { Expense, MilkData, Milkman } from "@/types";
import { format } from "date-fns";

export function exportToExcel(
  expenses: Expense[],
  milkData: MilkData,
  milkmen: Milkman[]
) {
  // Format expenses data
  const expensesSheetData = expenses.map((expense) => ({
    Date: format(expense.date, "yyyy-MM-dd"),
    Item: expense.name,
    Amount: expense.amount,
    Category: expense.category,
    "Added By": expense.addedBy,
  }));

  // Format milk data
  const milkSheetData: any[] = [];
  Object.entries(milkData).forEach(([date, dailyRecord]) => {
    Object.entries(dailyRecord).forEach(([milkmanId, entry]) => {
      const milkman = milkmen.find((m) => m.id === milkmanId);
      if (milkman) {
        const morningQty = entry.morning || 0;
        const eveningQty = entry.evening || 0;
        const totalQty = morningQty + eveningQty;
        const cost = totalQty * milkman.rate;
        milkSheetData.push({
          Date: date,
          Milkman: milkman.name,
          "Morning Qty (L)": morningQty,
          "Evening Qty (L)": eveningQty,
          "Total Qty (L)": totalQty,
          "Cost": cost.toFixed(2),
        });
      }
    });
  });

  // Sort milk data by date
  milkSheetData.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());


  const expensesWorksheet = XLSX.utils.json_to_sheet(expensesSheetData);
  const milkWorksheet = XLSX.utils.json_to_sheet(milkSheetData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, expensesWorksheet, "Expenses");
  XLSX.utils.book_append_sheet(workbook, milkWorksheet, "Milk");
  
  // Auto-fit columns
  const fitCols = (worksheet: XLSX.WorkSheet) => {
    const objectMaxLength: any[] = [];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    data.forEach((row: any) => {
      Object.keys(row).forEach((key) => {
        const value = row[key] === null ? "" : row[key].toString();
        if(objectMaxLength[key] === undefined || objectMaxLength[key] < value.length) {
          objectMaxLength[key] = value.length;
        }
      });
    });
    worksheet["!cols"] = objectMaxLength.map(w => ({ width: w + 2 }));
  }

  fitCols(expensesWorksheet);
  fitCols(milkWorksheet);

  XLSX.writeFile(workbook, `KinKeeper_Export_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
}
