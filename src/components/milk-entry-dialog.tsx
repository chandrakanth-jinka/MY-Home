
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
import { MilkmenManager } from "./milkmen-manager";
import { ScrollArea } from "./ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronsUpDown, PlusCircle } from "lucide-react";


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
  const [isMilkmenOpen, setIsMilkmenOpen] = React.useState(false)

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
        [session]: isNaN(quantity) || quantity < 0 ? undefined : quantity,
      }
    }));
  };

  const handleSave = () => {
    const dateString = format(date, "yyyy-MM-dd");
    
    const allMilkmanIds = new Set([...Object.keys(dailyData), ...Object.keys(entries)]);

    allMilkmanIds.forEach(milkmanId => {
      const originalEntry = dailyData[milkmanId] || {};
      const newEntry = entries[milkmanId] || {};
      
      const originalMorning = originalEntry.morning;
      const newMorning = newEntry.morning;
      const originalEvening = originalEntry.evening;
      const newEvening = newEntry.evening;

      if (originalMorning !== newMorning || originalEvening !== newEvening) {
        updateMilkEntry(dateString, milkmanId, { morning: newMorning, evening: newEvening });
      }
    });

    setIsOpen(false);
  };
  
  const quickSetQuantity = (milkmanId: string, session: "morning" | "evening", value: number) => {
    handleQuantityChange(milkmanId, session, value.toString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Milk Entry</DialogTitle>
          <DialogDescription>
            Log or edit milk delivery for {format(date, "PPP")}.
          </DialogDescription>
        </DialogHeader>

        <Collapsible
          open={isMilkmenOpen}
          onOpenChange={setIsMilkmenOpen}
          className="w-full space-y-2"
        >
          <CollapsibleTrigger asChild>
             <Button variant="ghost" className="w-full justify-between px-3">
              <span className="font-semibold">Manage Milk Suppliers</span>
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
             <MilkmenManager milkmen={milkmen} />
          </CollapsibleContent>
        </Collapsible>
        
        <Separator />
        
        <ScrollArea className="max-h-[220px] pr-4">
          <div className="py-4 space-y-6">
            {milkmen.length > 0 ? milkmen.map((milkman, index) => (
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
            )) : (
              <p className="text-center text-muted-foreground">Add a milkman to begin logging entries.</p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
