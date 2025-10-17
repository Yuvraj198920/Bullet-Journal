import { useState } from "react";
import { BulletEntry, BulletEntryData, EntryType } from "./BulletEntry";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Circle, Square, Minus, Plus, ArrowRightLeft } from "lucide-react";
import { AddEntryDialog } from "./AddEntryDialog";
import { Badge } from "./ui/badge";
import { MigrationWizard } from "./MigrationWizard";

interface MonthlyLogProps {
  entries: BulletEntryData[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onAddEntry: (content: string, type: EntryType, date: Date) => void;
  onDayClick: (date: Date) => void;
  onUpdateEntry?: (id: string, updates: Partial<BulletEntryData>) => void;
  onDeleteEntry?: (id: string) => void;
}

export function MonthlyLog({
  entries,
  currentDate,
  onDateChange,
  onAddEntry,
  onDayClick,
  onUpdateEntry,
  onDeleteEntry,
}: MonthlyLogProps) {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [migrationWizardOpen, setMigrationWizardOpen] = useState(false);

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const goToCurrentMonth = () => {
    onDateChange(new Date());
  };

  const isCurrentMonth = 
    currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear();

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get starting day of week (0 = Sunday, 6 = Saturday)
    const startingDayOfWeek = firstDay.getDay();
    
    // Get days from previous month to fill the grid
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays = Array.from(
      { length: startingDayOfWeek },
      (_, i) => ({
        day: prevMonthLastDay - startingDayOfWeek + i + 1,
        isCurrentMonth: false,
        isPrev: true,
        date: new Date(year, month - 1, prevMonthLastDay - startingDayOfWeek + i + 1),
      })
    );
    
    // Current month days
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      isCurrentMonth: true,
      isPrev: false,
      date: new Date(year, month, i + 1),
    }));
    
    // Next month days to complete the grid
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const remainingDays = 42 - totalDays; // 6 rows x 7 days
    const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => ({
      day: i + 1,
      isCurrentMonth: false,
      isPrev: false,
      date: new Date(year, month + 1, i + 1),
    }));
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const getEntriesForDay = (date: Date) => {
    return entries.filter((e) => new Date(e.date).toDateString() === date.toDateString());
  };

  const getMonthlyTasks = () => {
    return entries.filter((e) => e.type === "task");
  };

  const calendarDays = getCalendarDays();
  const monthlyTasks = getMonthlyTasks();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="text-center">
                <CardTitle>{formatMonth(currentDate)}</CardTitle>
                {!isCurrentMonth && (
                  <Button variant="link" size="sm" onClick={goToCurrentMonth} className="mt-1">
                    This Month
                  </Button>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={view === "calendar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("calendar")}
                >
                  Calendar
                </Button>
                <Button
                  variant={view === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("list")}
                >
                  Task List
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMigrationWizardOpen(true)}
                >
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Migration Wizard
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Square className="h-3 w-3" />
                    <span>{entries.filter(e => e.type === "task").length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Circle className="h-3 w-3" />
                    <span>{entries.filter(e => e.type === "event").length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Minus className="h-3 w-3" />
                    <span>{entries.filter(e => e.type === "note").length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {view === "calendar" ? (
            <>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center p-2 text-sm text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((dayInfo, index) => {
                  const dayEntries = getEntriesForDay(dayInfo.date);
                  const isToday = dayInfo.date.toDateString() === new Date().toDateString();
                  const hasEntries = dayEntries.length > 0;

                  return (
                    <button
                      key={index}
                      onClick={() => onDayClick(dayInfo.date)}
                      className={`
                        min-h-20 p-2 rounded-md border transition-all
                        ${dayInfo.isCurrentMonth ? "bg-card hover:bg-accent" : "bg-muted/30 text-muted-foreground"}
                        ${isToday ? "border-primary border-2" : "border-border"}
                        ${hasEntries ? "border-blue-200 dark:border-blue-800" : ""}
                      `}
                    >
                      <div className="flex flex-col h-full">
                        <div className={`text-sm mb-1 ${isToday ? "" : ""}`}>
                          {dayInfo.day}
                        </div>
                        {hasEntries && (
                          <div className="flex flex-wrap gap-0.5 mt-auto">
                            {dayEntries.slice(0, 3).map((entry) => (
                              <div
                                key={entry.id}
                                className={`h-1.5 w-1.5 rounded-full ${
                                  entry.type === "task"
                                    ? "bg-blue-500"
                                    : entry.type === "event"
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                }`}
                              />
                            ))}
                            {dayEntries.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{dayEntries.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>Task</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Event</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-gray-400" />
                  <span>Note</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Task List View */}
              <div className="space-y-4">
                {monthlyTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No tasks for this month.</p>
                    <p className="mt-2">Add tasks to track your monthly goals.</p>
                  </div>
                ) : (
                  <>
                    {/* Group by status */}
                    {["incomplete", "complete", "scheduled", "migrated", "cancelled"].map((status) => {
                      const tasksInStatus = monthlyTasks.filter((t) => t.state === status);
                      if (tasksInStatus.length === 0) return null;

                      return (
                        <div key={status} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-muted-foreground capitalize">
                              {status === "incomplete" ? "Active Tasks" : status}
                            </h3>
                            <Badge variant="secondary">{tasksInStatus.length}</Badge>
                          </div>
                          {tasksInStatus.map((task) => (
                            <div key={task.id} className="ml-2">
                              <BulletEntry
                                entry={task}
                                onUpdate={onUpdateEntry || (() => {})}
                                onDelete={onDeleteEntry || (() => {})}
                              />
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </>
          )}

          <div className="pt-4 border-t mt-6">
            <AddEntryDialog
              onAdd={onAddEntry}
              defaultDate={new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Migration Wizard */}
      {onUpdateEntry && (
        <MigrationWizard
          open={migrationWizardOpen}
          onOpenChange={setMigrationWizardOpen}
          entries={entries}
          currentMonth={currentDate}
          onMigrate={(entryIds, action, targetDate) => {
            entryIds.forEach((id) => {
              const entry = entries.find((e) => e.id === id);
              if (!entry) return;

              if (action === "migrate" && targetDate) {
                const currentMigrationCount = entry.migrationCount || 0;
                onUpdateEntry(id, {
                  state: "incomplete",
                  date: targetDate.toISOString(),
                  migrationCount: currentMigrationCount + 1,
                });
              } else if (action === "cancel") {
                onUpdateEntry(id, { state: "cancelled" });
              } else if (action === "schedule" && targetDate) {
                const currentMigrationCount = entry.migrationCount || 0;
                onUpdateEntry(id, {
                  state: "scheduled",
                  date: targetDate.toISOString(),
                  migrationCount: currentMigrationCount + 1,
                });
              }
            });
          }}
        />
      )}
    </div>
  );
}
