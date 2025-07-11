"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import type { Milkman, DailyMilkRecord } from "@/types";
import React, { useState, useEffect } from "react";

interface MilkEntryDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  date: Date;
  milkmen: Milkman[];
  dailyData: DailyMilkRecord;
  updateMilkEntry: (date: string, milkmanId: string, entry: { morning?: number; evening?: number }) => void;
}

export function MilkEntryDialog({
  isOpen,
  setIsOpen,
  date,
  milkmen,
  dailyData,
  updateMilkEntry,
}: MilkEntryDialogProps) {
  const [entries, setEntries] = useState<DailyMilkRecord>({});

  useEffect(() => {
    if (isOpen) {
      setEntries(dailyData);
    }
  }, [isOpen, dailyData]);

  const handleQuantityChange = (milkmanId: string, session: "morning" | "evening", value: string) => {
    const quantity = parseFloat(value);
    setEntries(prev => ({
      ...prev,
      [milkmanId]: {
        ...prev[milkmanId],
        [session]: isNaN(quantity) ? undefined : quantity,
      }
    }));
  };

  const handleSave = () => {
    const dateString = format(date, "yyyy-MM-dd");
    Object.keys(entries).forEach(milkmanId => {
      const entry = entries[milkmanId];
      // Only update if data is different from original
      if (entry.morning !== dailyData[milkmanId]?.morning || entry.evening !== dailyData[milkmanId]?.evening) {
        updateMilkEntry(dateString, milkmanId, { morning: entry.morning, evening: entry.evening });
      }
    });
     // Handle cases where an entry was removed
     Object.keys(dailyData).forEach(milkmanId => {
        if (!entries[milkmanId]) {
            updateMilkEntry(dateString, milkmanId, { morning: undefined, evening: undefined });
        }
    });

    setIsOpen(false);
  };
  
  const quickSetQuantity = (milkmanId: string, session: "morning" | "evening", value: number) => {
    handleQuantityChange(milkmanId, session, value.toString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Milk Entry</DialogTitle>
          <DialogDescription>
            Log milk delivery for {format(date, "PPP")}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          {milkmen.map((milkman, index) => (
            <div key={milkman.id}>
              <h4 className="font-semibold text-lg mb-2">{milkman.name}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`morning-${milkman.id}`}>Morning (Liters)</Label>
                  <Input
                    id={`morning-${milkman.id}`}
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="e.g. 1.5"
                    value={entries[milkman.id]?.morning ?? ""}
                    onChange={(e) => handleQuantityChange(milkman.id, "morning", e.target.value)}
                  />
                   <div className="flex gap-1">
                      {[0.5, 1, 1.5].map(q => <Button key={q} size="sm" variant="outline" onClick={() => quickSetQuantity(milkman.id, 'morning', q)}>{q}</Button>)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`evening-${milkman.id}`}>Evening (Liters)</Label>
                  <Input
                    id={`evening-${milkman.id}`}
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="e.g. 0.5"
                    value={entries[milkman.id]?.evening ?? ""}
                    onChange={(e) => handleQuantityChange(milkman.id, "evening", e.target.value)}
                  />
                  <div className="flex gap-1">
                      {[0.5, 1, 1.5].map(q => <Button key={q} size="sm" variant="outline" onClick={() => quickSetQuantity(milkman.id, 'evening', q)}>{q}</Button>)}
                  </div>
                </div>
              </div>
              {index < milkmen.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
