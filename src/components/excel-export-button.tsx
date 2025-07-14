"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToExcelMultiSheet } from "@/lib/excel";
import type { Expense, MilkData, Milkman } from "@/types";

interface ExcelExportButtonProps {
    expenses: Expense[];
    milkData: MilkData;
    milkmen: Milkman[];
}

export function ExcelExportButton({ expenses, milkData, milkmen }: ExcelExportButtonProps) {
    const { toast } = useToast();

    const handleExport = () => {
        try {
            // Map expenses to correct columns
            const expensesExport = expenses.map(e => ({
                date: e.date instanceof Date ? e.date.toISOString().slice(0, 10) : e.date,
                item: e.name,
                amount: e.amount,
                addedBy: e.addedBy,
            }));

            // Convert milkData to array of rows for export
            const milkExport: any[] = [];
            Object.entries(milkData).forEach(([date, dailyRecord]) => {
                Object.entries(dailyRecord).forEach(([milkmanId, entry]) => {
                    const milkman = milkmen.find(m => m.id === milkmanId);
                    const morningQty = entry.morning || 0;
                    const eveningQty = entry.evening || 0;
                    const totalQty = morningQty + eveningQty;
                    const cost = milkman ? (totalQty * milkman.rate).toFixed(2) : '';
                    milkExport.push({
                        date,
                        milkman: milkman ? milkman.name : milkmanId,
                        morningQty,
                        eveningQty,
                        totalQty,
                        cost,
                        addedBy: entry.addedBy || '',
                        lastEditedBy: entry.lastEditedBy || '',
                    });
                });
            });

            exportToExcelMultiSheet(expensesExport, milkExport, 'MyHomeExport');
            toast({
                title: "Export Successful",
                description: "Your data has been downloaded as an Excel file.",
            });
        } catch (error) {
            console.error("Export failed", error);
            toast({
                variant: "destructive",
                title: "Export Failed",
                description: "There was a problem exporting your data.",
            });
        }
    };

    return (
        <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
        </Button>
    );
}
