"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel } from "@/lib/excel";
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
      exportToExcel(expenses, milkData, milkmen);
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
