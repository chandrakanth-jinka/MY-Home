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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsDialogOpen(true);
    }
  };
  
  const MilkDots = (day: Date) => {
    const dateString = format(day, "yyyy-MM-dd");
    if (milkData[dateString] && Object.keys(milkData[dateString]).length > 0) {
      return <div className="milk-dot bg-primary"></div>;
    }
    return null;
  };

  const footer = selectedDate ? (
    <p className="p-2 text-center text-sm">You selected {format(selectedDate, "PPP")}.</p>
  ) : (
    <p className="p-2 text-center text-sm">Please pick a day.</p>
  );
  
  const calendarProps: React.ComponentProps<typeof Calendar> = {
    mode: "single",
    selected: selectedDate,
    onSelect: handleDateSelect,
    className: "w-full",
    components: {
      DayContent: ({ date }) => (
        <div className="relative h-full w-full flex items-center justify-center">
          <span>{date.getDate()}</span>
          {MilkDots(date)}
        </div>
      ),
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Milk Delivery Calendar</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar {...calendarProps} />
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
