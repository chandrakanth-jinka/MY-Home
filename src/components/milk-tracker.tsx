
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { MilkEntryDialog } from "@/components/milk-entry-dialog";
import { MilkExpenseManager } from "@/components/milk-expense-manager";
import type { MilkData, Milkman } from "@/types";
import { format } from "date-fns";
import { SlidersHorizontal } from "lucide-react";

interface MilkTrackerProps {
  milkData: MilkData;
  milkmen: Milkman[];
  updateMilkEntry: (date: string, milkmanId: string, entry: { morning?: number; evening?: number }) => void;
}

export function MilkTracker({ milkData, milkmen, updateMilkEntry }: MilkTrackerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    // Always set selectedDate and open dialog, even if the same day is clicked
    setSelectedDate(new Date(date));
    setIsEntryDialogOpen(false); // Close first to force re-mount
    setTimeout(() => setIsEntryDialogOpen(true), 0); // Reopen immediately
  };

  const MilkDots = ({ date }: { date: Date }) => {
    const dateString = format(date, "yyyy-MM-dd");
    if (milkData[dateString] && Object.values(milkData[dateString]).some(entry => (entry.morning ?? 0) > 0 || (entry.evening ?? 0) > 0)) {
      return <div className="milk-dot bg-orange-500"></div>;
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Milk Delivery Calendar</CardTitle>
        <Button variant="outline" className="hidden md:flex" onClick={() => setIsManagerOpen(true)}>
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Manage Milk Expenses
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onDayClick={handleDateSelect}
          className="w-full"
          components={{
            DayContent: ({ date }) => (
              <div className="relative h-full w-full flex items-center justify-center">
                <span>{date.getDate()}</span>
                <MilkDots date={date} />
              </div>
            ),
          }}
        />
        <Button variant="outline" className="md:hidden w-full mt-4" onClick={() => setIsManagerOpen(true)}>
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Manage Milk Expenses
        </Button>
        {selectedDate && (
          <MilkEntryDialog
            isOpen={isEntryDialogOpen}
            setIsOpen={setIsEntryDialogOpen}
            date={selectedDate}
            milkmen={milkmen}
            dailyData={milkData[format(selectedDate, "yyyy-MM-dd")] || {}}
            updateMilkEntry={updateMilkEntry}
          />
        )}
        <MilkExpenseManager
          isOpen={isManagerOpen}
          setIsOpen={setIsManagerOpen}
          milkData={milkData}
          milkmen={milkmen}
          updateMilkEntry={updateMilkEntry}
        />
        {/* Footer */}
        <div className="mt-16 w-full flex justify-center">
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>Created by Chandrakanth</span>
        </div>
      </CardContent>
    </Card>
  );
}
