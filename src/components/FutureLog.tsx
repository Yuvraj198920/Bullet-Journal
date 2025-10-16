import { useState } from "react";
import { BulletEntry, BulletEntryData, EntryType } from "./BulletEntry";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { AddEntryDialog } from "./AddEntryDialog";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface FutureLogProps {
  entries: BulletEntryData[];
  currentYear: number;
  onYearChange: (year: number) => void;
  onAddEntry: (content: string, type: EntryType, date: Date) => void;
  onUpdateEntry: (id: string, updates: Partial<BulletEntryData>) => void;
  onDeleteEntry: (id: string) => void;
}

export function FutureLog({
  entries,
  currentYear,
  onYearChange,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
}: FutureLogProps) {
  const [view, setView] = useState<"6-month" | "full-year">("6-month");
  const [startMonth, setStartMonth] = useState(new Date().getMonth());

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const goToPreviousYear = () => {
    onYearChange(currentYear - 1);
  };

  const goToNextYear = () => {
    onYearChange(currentYear + 1);
  };

  const goToPrevious6Months = () => {
    const newMonth = startMonth - 6;
    if (newMonth < 0) {
      setStartMonth(12 + newMonth);
      onYearChange(currentYear - 1);
    } else {
      setStartMonth(newMonth);
    }
  };

  const goToNext6Months = () => {
    const newMonth = startMonth + 6;
    if (newMonth >= 12) {
      setStartMonth(newMonth - 12);
      onYearChange(currentYear + 1);
    } else {
      setStartMonth(newMonth);
    }
  };

  const getEntriesForMonth = (monthIndex: number, year: number) => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getFullYear() === year &&
        entryDate.getMonth() === monthIndex
      );
    });
  };

  const getMonthsToShow = () => {
    if (view === "full-year") {
      return months.map((month, index) => ({ month, index, year: currentYear }));
    } else {
      const monthsToShow = [];
      for (let i = 0; i < 6; i++) {
        const monthIndex = (startMonth + i) % 12;
        const year = startMonth + i >= 12 ? currentYear + 1 : currentYear;
        monthsToShow.push({ month: months[monthIndex], index: monthIndex, year });
      }
      return monthsToShow;
    }
  };

  const monthsToDisplay = getMonthsToShow();

  const getMonthStats = (monthIndex: number, year: number) => {
    const monthEntries = getEntriesForMonth(monthIndex, year);
    return {
      total: monthEntries.length,
      tasks: monthEntries.filter((e) => e.type === "task").length,
      events: monthEntries.filter((e) => e.type === "event").length,
      notes: monthEntries.filter((e) => e.type === "note").length,
    };
  };

  const isCurrentMonth = (monthIndex: number, year: number) => {
    const now = new Date();
    return now.getMonth() === monthIndex && now.getFullYear() === year;
  };

  const isPastMonth = (monthIndex: number, year: number) => {
    const now = new Date();
    const monthDate = new Date(year, monthIndex);
    return monthDate < new Date(now.getFullYear(), now.getMonth());
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={view === "full-year" ? goToPreviousYear : goToPrevious6Months}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="text-center">
                <CardTitle>
                  {view === "full-year"
                    ? `Future Log ${currentYear}`
                    : `${monthsToDisplay[0].month} - ${monthsToDisplay[5].month} ${currentYear}`}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={view === "full-year" ? goToNextYear : goToNext6Months}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={view === "6-month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("6-month")}
                >
                  6 Months
                </Button>
                <Button
                  variant={view === "full-year" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("full-year")}
                >
                  Full Year
                </Button>
              </div>

              <Select
                value={currentYear.toString()}
                onValueChange={(value) => onYearChange(parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map(
                    (year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className={`grid gap-4 ${
            view === "full-year" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}>
            {monthsToDisplay.map(({ month, index, year }) => {
              const monthEntries = getEntriesForMonth(index, year);
              const stats = getMonthStats(index, year);
              const isCurrent = isCurrentMonth(index, year);
              const isPast = isPastMonth(index, year);

              return (
                <Card
                  key={`${month}-${year}`}
                  className={`${
                    isCurrent ? "border-primary border-2" : ""
                  } ${isPast ? "opacity-60" : ""}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {month}
                        {year !== currentYear && (
                          <span className="text-sm text-muted-foreground ml-2">{year}</span>
                        )}
                      </CardTitle>
                      {isCurrent && <Badge variant="default">Current</Badge>}
                      {isPast && <Badge variant="secondary">Past</Badge>}
                    </div>
                    {stats.total > 0 && (
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                        {stats.tasks > 0 && <span>{stats.tasks} tasks</span>}
                        {stats.events > 0 && <span>{stats.events} events</span>}
                        {stats.notes > 0 && <span>{stats.notes} notes</span>}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="max-h-64 overflow-y-auto">
                    {monthEntries.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No entries yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {monthEntries.map((entry) => (
                          <BulletEntry
                            key={entry.id}
                            entry={entry}
                            onUpdate={onUpdateEntry}
                            onDelete={onDeleteEntry}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="pt-6 border-t mt-6">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">
                Add entries to plan your future months and long-term goals
              </p>
            </div>
            <AddEntryDialog
              onAdd={onAddEntry}
              defaultDate={new Date(currentYear, new Date().getMonth(), 1)}
            />
          </div>

          {/* Quick Tips */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm mb-2">Future Log Tips:</h4>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Use the Future Log to plan events and goals 3-12 months ahead</li>
              <li>Add tasks with signifiers to mark priorities and important items</li>
              <li>Migrate items to your monthly or daily logs when they become relevant</li>
              <li>Review regularly to stay aligned with your long-term objectives</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
