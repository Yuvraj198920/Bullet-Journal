import { useState, useEffect } from "react";
import { BulletEntry, BulletEntryData, EntryType, TaskState, EventState, EventCategory } from "./BulletEntry";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ChevronLeft, ChevronRight, Search, Filter, X, Clock } from "lucide-react";
import { AddTaskDialog } from "./AddTaskDialog";
import { AddEventDialog } from "./AddEventDialog";
import { AddNoteDialog } from "./AddNoteDialog";
import { DailyMigrationDialog } from "./DailyMigrationDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";

interface DailyLogProps {
  entries: BulletEntryData[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onAddEntry: (content: string, type: EntryType, date: Date) => void;
  onAddEvent?: (
    content: string,
    date: Date,
    eventTime?: string,
    eventEndTime?: string,
    isAllDay?: boolean,
    eventCategory?: EventCategory,
    isRecurring?: boolean,
    recurringPattern?: string
  ) => void;
  onUpdateEntry: (id: string, updates: Partial<BulletEntryData>) => void;
  onDeleteEntry: (id: string) => void;
  allEntries: BulletEntryData[];
  onMigrateTask: (taskId: string, targetDate: Date) => void;
  onScheduleTask: (taskId: string, targetDate: Date) => void;
  onCancelTask: (taskId: string) => void;
}

export function DailyLog({
  entries,
  currentDate,
  onDateChange,
  onAddEntry,
  onAddEvent,
  onUpdateEntry,
  onDeleteEntry,
  allEntries,
  onMigrateTask,
  onScheduleTask,
  onCancelTask,
}: DailyLogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStates, setFilterStates] = useState<TaskState[]>([]);
  const [filterEventStates, setFilterEventStates] = useState<EventState[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [migrationDialogOpen, setMigrationDialogOpen] = useState(false);
  const [incompleteTasks, setIncompleteTasks] = useState<BulletEntryData[]>([]);

  // Check for incomplete tasks from previous days when date changes
  useEffect(() => {
    const checkIncompleteTasks = () => {
      const today = new Date(currentDate);
      today.setHours(0, 0, 0, 0);

      const incomplete = allEntries.filter((entry) => {
        if (entry.type !== "task") return false;
        
        // Exclude tasks that are already complete, cancelled, migrated, or scheduled
        if (entry.state !== "incomplete") return false;

        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);

        // Only show tasks from previous days
        return entryDate < today;
      });

      if (incomplete.length > 0) {
        setIncompleteTasks(incomplete);
        setMigrationDialogOpen(true);
      }
    };

    checkIncompleteTasks();
  }, [currentDate, allEntries]);

  // Keyboard shortcuts for rapid logging
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + T for new task
      if ((e.ctrlKey || e.metaKey) && e.key === "t") {
        e.preventDefault();
        document.getElementById("add-entry-button")?.click();
      }

      // Ctrl/Cmd + / for search
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      }

      // Arrow keys for navigation
      if ((e.ctrlKey || e.metaKey) && e.key === "ArrowLeft") {
        e.preventDefault();
        goToPreviousDay();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "ArrowRight") {
        e.preventDefault();
        goToNextDay();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const isToday =
    currentDate.toDateString() === new Date().toDateString();

  // Filter and search logic
  const filteredEntries = entries.filter((entry) => {
    // Search filter
    if (searchQuery && !entry.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Task status filter
    if (filterStates.length > 0 && entry.type === "task") {
      if (!filterStates.includes(entry.state)) {
        return false;
      }
    }

    // Event status filter - only apply if filters are set
    if (filterEventStates.length > 0 && entry.type === "event") {
      // Events might not have eventState set, treat as "upcoming" by default
      const eventState = entry.eventState || "upcoming";
      if (!filterEventStates.includes(eventState)) {
        return false;
      }
    }

    return true;
  });

  const tasks = filteredEntries.filter((e) => e.type === "task");
  const events = filteredEntries.filter((e) => e.type === "event");
  const notes = filteredEntries.filter((e) => e.type === "note");

  const toggleFilterState = (state: TaskState) => {
    setFilterStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  };

  const toggleFilterEventState = (state: EventState) => {
    setFilterEventStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  };

  const clearFilters = () => {
    setFilterStates([]);
    setFilterEventStates([]);
    setSearchQuery("");
  };

  const hasActiveFilters = searchQuery || filterStates.length > 0 || filterEventStates.length > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={goToPreviousDay} title="Previous Day (Ctrl+←)">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-center flex-1">
              <CardTitle>{formatDate(currentDate)}</CardTitle>
              {!isToday && (
                <Button variant="link" size="sm" onClick={goToToday} className="mt-1">
                  Jump to Today
                </Button>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={goToNextDay} title="Next Day (Ctrl+→)">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-input"
                  type="text"
                  placeholder="Search entries... (Ctrl+/)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Filter className="h-4 w-4" />
                    {(filterStates.length > 0 || filterEventStates.length > 0) && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {filterStates.length + filterEventStates.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Task Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={filterStates.includes("incomplete")}
                    onCheckedChange={() => toggleFilterState("incomplete")}
                  >
                    Incomplete Tasks
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterStates.includes("complete")}
                    onCheckedChange={() => toggleFilterState("complete")}
                  >
                    Completed Tasks
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterStates.includes("migrated")}
                    onCheckedChange={() => toggleFilterState("migrated")}
                  >
                    Migrated Tasks
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterStates.includes("scheduled")}
                    onCheckedChange={() => toggleFilterState("scheduled")}
                  >
                    Scheduled Tasks
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterStates.includes("cancelled")}
                    onCheckedChange={() => toggleFilterState("cancelled")}
                  >
                    Cancelled Tasks
                  </DropdownMenuCheckboxItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Event Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuCheckboxItem
                    checked={filterEventStates.includes("upcoming")}
                    onCheckedChange={() => toggleFilterEventState("upcoming")}
                  >
                    Upcoming Events
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterEventStates.includes("attended")}
                    onCheckedChange={() => toggleFilterEventState("attended")}
                  >
                    Attended Events
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterEventStates.includes("missed")}
                    onCheckedChange={() => toggleFilterEventState("missed")}
                  >
                    Missed Events
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterEventStates.includes("cancelled")}
                    onCheckedChange={() => toggleFilterEventState("cancelled")}
                  >
                    Cancelled Events
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterEventStates.includes("migrated")}
                    onCheckedChange={() => toggleFilterEventState("migrated")}
                  >
                    Migrated Events
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery("")} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filterStates.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    {filterStates.length} task filter{filterStates.length > 1 ? "s" : ""}
                    <button onClick={() => setFilterStates([])} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filterEventStates.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    {filterEventStates.length} event filter{filterEventStates.length > 1 ? "s" : ""}
                    <button onClick={() => setFilterEventStates([])} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {entries.length === 0 ? (
                <>
                  <p>No entries for this day.</p>
                  <p className="mt-2">Start by adding a task, event, or note.</p>
                  <p className="mt-4 text-xs">Tip: Press <kbd className="px-2 py-1 bg-muted rounded">Ctrl+T</kbd> to quickly add an entry</p>
                </>
              ) : (
                <>
                  <p>No entries match your filters.</p>
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Clear filters
                  </Button>
                </>
              )}
            </div>
          ) : (
            <>
              {tasks.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-muted-foreground">Tasks</h3>
                  {tasks.map((entry) => (
                    <BulletEntry
                      key={entry.id}
                      entry={entry}
                      onUpdate={onUpdateEntry}
                      onDelete={onDeleteEntry}
                      onSchedule={onScheduleTask}
                      currentDate={currentDate}
                    />
                  ))}
                </div>
              )}

              {events.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-muted-foreground">Events</h3>
                  {events.map((entry) => (
                    <BulletEntry
                      key={entry.id}
                      entry={entry}
                      onUpdate={onUpdateEntry}
                      onDelete={onDeleteEntry}
                      currentDate={currentDate}
                    />
                  ))}
                </div>
              )}

              {notes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-muted-foreground">Notes</h3>
                  {notes.map((entry) => (
                    <BulletEntry
                      key={entry.id}
                      entry={entry}
                      onUpdate={onUpdateEntry}
                      onDelete={onDeleteEntry}
                      currentDate={currentDate}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          <div className="pt-4">
            <div className="flex gap-2 flex-wrap" id="add-entry-button">
              <AddTaskDialog onAdd={onAddEntry} defaultDate={currentDate} />
              {onAddEvent && (
                <AddEventDialog onAdd={onAddEvent} defaultDate={currentDate} />
              )}
              <AddNoteDialog onAdd={onAddEntry} defaultDate={currentDate} />
            </div>
          </div>
          
          {/* Keyboard shortcuts help */}
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <p>Keyboard shortcuts: <kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl+T</kbd> New entry • <kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl+/</kbd> Search • <kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl+←→</kbd> Navigate days</p>
          </div>
        </CardContent>
      </Card>

      {/* Daily Migration Dialog */}
      <DailyMigrationDialog
        open={migrationDialogOpen}
        onOpenChange={setMigrationDialogOpen}
        incompleteTasks={incompleteTasks}
        currentDate={currentDate}
        onMigrate={onMigrateTask}
        onSchedule={onScheduleTask}
        onCancel={onCancelTask}
      />
    </div>
  );
}
