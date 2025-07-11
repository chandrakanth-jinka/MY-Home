
"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format, subDays } from "date-fns"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
    date: DateRange | undefined;
    onDateChange: (date: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  date,
  onDateChange
}: DateRangePickerProps) {

  const handlePresetChange = (value: string) => {
    const now = new Date();
    switch (value) {
        case "today":
            onDateChange({ from: now, to: now });
            break;
        case "yesterday":
            onDateChange({ from: subDays(now, 1), to: subDays(now, 1) });
            break;
        case "this_month":
            onDateChange({ from: new Date(now.getFullYear(), now.getMonth(), 1), to: now });
            break;
        case "last_7_days":
            onDateChange({ from: subDays(now, 6), to: now });
            break;
        case "last_30_days":
            onDateChange({ from: subDays(now, 29), to: now });
            break;
        default:
            onDateChange(undefined);
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <div className="flex flex-wrap items-center gap-2">
            <PopoverTrigger asChild>
            <Button
                id="date"
                variant={"outline"}
                className={cn(
                "w-[260px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                date.to ? (
                    <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                    </>
                ) : (
                    format(date.from, "LLL dd, y")
                )
                ) : (
                <span>Pick a date</span>
                )}
            </Button>
            </PopoverTrigger>
             <Select onValueChange={handlePresetChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Date Presets" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
