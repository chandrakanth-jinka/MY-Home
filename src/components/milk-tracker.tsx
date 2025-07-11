
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { MilkEntryDialog } from "@/components/milk-entry-dialog";
import type { MilkData, Milkman } from "@/types";
import { format } from "date-fns";

interface MilkTrackerProps {
  milkData: MilkData;
  milkmen: Milkman[];
  updateMilkEntry: (date: string, milkmanId: string, entry: { morning?: number; evening?: number }) => void;
}

export function MilkTracker({ milkData, milkmen, updateMilkEntry }: MilkTrackerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(true); // Open dialog by default for today's date

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
  
    setSelectedDate((prevSelectedDate) => {
      const sameDate = prevSelectedDate?.toDateString() === date.toDateString();
  
      setIsDialogOpen((prevIsDialogOpen) => {
        if (sameDate) {
          return !prevIsDialogOpen; // toggle
        } else {
          return true; // open on new date
        }
      });
  
      return date;
    });
  };
  
  const MilkDots = ({ date }: { date: Date }) => {
    const dateString = format(date, "yyyy-MM-dd");
    if (milkData[dateString] && Object.values(milkData[dateString]).some(entry => (entry.morning ?? 0) > 0 || (entry.evening ?? 0) > 0)) {
      return <div className="milk-dot bg-primary"></div>;
    }
    return null;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Milk Delivery Calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar 
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
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
        {selectedDate && (
          <MilkEntryDialog
            isOpen={isDialogOpen}
            setIsOpen={setIsDialogOpen}
            date={selectedDate}
            milkmen={milkmen}
            dailyData={milkData[format(selectedDate, "yyyy-MM-dd")] || {}}
            updateMilkEntry={updateMilkEntry}
          />
        )}
      </CardContent>
    </Card>
  );
}
