
"use client";

import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, Trash2 } from "lucide-react";
import type { MilkData, Milkman, DailyMilkRecord } from "@/types";
import { format, parseISO, compareDesc } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { MilkEntryDialog } from "./milk-entry-dialog";

interface MilkExpenseManagerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  milkData: MilkData;
  milkmen: Milkman[];
  updateMilkEntry: (date: string, milkmanId: string, entry: { morning?: number; evening?: number }) => void;
}

export function MilkExpenseManager({ isOpen, setIsOpen, milkData, milkmen, updateMilkEntry }: MilkExpenseManagerProps) {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const milkmenMap = useMemo(() => {
    return milkmen.reduce((acc, milkman) => {
      acc[milkman.id] = milkman;
      return acc;
    }, {} as Record<string, Milkman>);
  }, [milkmen]);

  const allEntries = useMemo(() => {
    const entries: any[] = [];
    Object.entries(milkData).forEach(([dateStr, dailyRecord]) => {
      Object.entries(dailyRecord).forEach(([milkmanId, entry]) => {
        const milkman = milkmenMap[milkmanId];
        if (milkman) {
          const morningQty = entry.morning ?? 0;
          const eveningQty = entry.evening ?? 0;
          const totalQty = morningQty + eveningQty;
          if (totalQty > 0) {
            entries.push({
              id: `${dateStr}-${milkmanId}`,
              date: parseISO(dateStr),
              milkmanId,
              milkmanName: milkman.name,
              rate: milkman.rate,
              morningQty,
              eveningQty,
              totalQty,
              totalCost: totalQty * milkman.rate,
            });
          }
        }
      });
    });
    return entries.sort((a, b) => compareDesc(a.date, b.date));
  }, [milkData, milkmenMap]);

  const handleEditClick = (date: Date) => {
    setSelectedDate(date);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (date: Date, milkmanId: string, milkmanName: string) => {
    const dateString = format(date, "yyyy-MM-dd");
    try {
      // To delete, we update with empty entries
      updateMilkEntry(dateString, milkmanId, { morning: undefined, evening: undefined });
      toast({
        title: "Entry Deleted",
        description: `Milk entry for ${milkmanName} on ${format(date, "PPP")} has been removed.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not delete the milk entry. Please try again."
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Manage Milk Expenses</DialogTitle>
            <DialogDescription>
              View, edit, or delete past milk entries.
            </DialogDescription>
          </DialogHeader>
          <div style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
            <div style={{ minWidth: '1100px' }}>
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-center">Morning (L)</TableHead>
                    <TableHead className="text-center">Evening (L)</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                    <TableHead className="text-right w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allEntries.length > 0 ? (
                    allEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{format(entry.date, "dd MMM, yyyy")}</TableCell>
                        <TableCell className="font-medium">{entry.milkmanName}</TableCell>
                        <TableCell className="text-center">{entry.morningQty > 0 ? entry.morningQty.toFixed(2) : "-"}</TableCell>
                        <TableCell className="text-center">{entry.eveningQty > 0 ? entry.eveningQty.toFixed(2) : "-"}</TableCell>
                        <TableCell className="text-right">{entry.rate.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{entry.totalCost.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditClick(entry.date)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the milk record for "{entry.milkmanName}" on {format(entry.date, "PPP")}. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteClick(entry.date, entry.milkmanId, entry.milkmanName)} className="bg-destructive hover:bg-destructive/90 text-white">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No milk records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {selectedDate && (
        <MilkEntryDialog
          isOpen={isEditDialogOpen}
          setIsOpen={setIsEditDialogOpen}
          date={selectedDate}
          milkmen={milkmen}
          dailyData={milkData[format(selectedDate, "yyyy-MM-dd")] || {}}
          updateMilkEntry={updateMilkEntry}
        />
      )}
    </>
  );
}
