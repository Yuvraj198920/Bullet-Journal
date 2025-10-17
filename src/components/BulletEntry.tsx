import { useState } from "react";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ChevronRight, ChevronLeft, X, Circle, Minus, Square, Star, Lightbulb, Eye, CircleDot, Slash, Clock, Calendar as CalendarIcon, Repeat } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { RescheduleDialog } from "./RescheduleDialog";
import { SwipeableEntry } from "./SwipeableEntry";
import { useIsMobile } from "./ui/use-mobile";

export type EntryType = "task" | "event" | "note";
export type TaskState = "incomplete" | "complete" | "migrated" | "scheduled" | "cancelled";
export type EventState = "upcoming" | "attended" | "missed" | "cancelled" | "migrated";
export type Signifier = "priority" | "inspiration" | "explore";
export type EventCategory = "meeting" | "appointment" | "birthday" | "deadline" | "other";

export interface BulletEntryData {
  id: string;
  date: string;
  type: EntryType;
  content: string;
  state: TaskState;
  migrationCount?: number; // Track how many times this task has been migrated
  signifiers?: Signifier[]; // Priority (*), Inspiration (!), Explore (👁)
  
  // Event-specific properties
  eventState?: EventState; // State for events (separate from task state)
  eventTime?: string; // ISO time string for events with specific times
  eventEndTime?: string; // End time for events
  isAllDay?: boolean; // All-day event flag
  eventCategory?: EventCategory; // Category for color coding
  isRecurring?: boolean; // Recurring event flag
  recurringPattern?: string; // e.g., "weekly", "monthly", "yearly"
}

interface BulletEntryProps {
  entry: BulletEntryData;
  onUpdate: (id: string, updates: Partial<BulletEntryData>) => void;
  onDelete: (id: string) => void;
  currentDate?: Date;
}

export function BulletEntry({ entry, onUpdate, onDelete, currentDate }: BulletEntryProps) {
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [rescheduleEventDialogOpen, setRescheduleEventDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const isPastEvent = () => {
    if (entry.type !== "event") return false;
    const now = new Date();
    const eventDate = new Date(entry.date);
    if (entry.eventTime) {
      const [hours, minutes] = entry.eventTime.split(":");
      eventDate.setHours(parseInt(hours), parseInt(minutes));
    }
    return eventDate < now;
  };

  const getBulletSymbol = () => {
    if (entry.type === "task") {
      switch (entry.state) {
        case "complete":
          return <X className="h-4 w-4" />;
        case "migrated":
          return <ChevronRight className="h-4 w-4" />;
        case "scheduled":
          return <ChevronLeft className="h-4 w-4" />;
        case "cancelled":
          return <Square className="h-4 w-4" />;
        default:
          return <Square className="h-4 w-4" />;
      }
    } else if (entry.type === "event") {
      // Event states
      switch (entry.eventState) {
        case "attended":
          return <CircleDot className="h-4 w-4 fill-current" />; // Filled circle
        case "missed":
          return (
            <div className="relative">
              <Circle className="h-4 w-4" />
              <Slash className="h-4 w-4 absolute top-0 left-0" />
            </div>
          );
        case "cancelled":
          return <Circle className="h-4 w-4 opacity-50" />;
        case "migrated":
          return <ChevronRight className="h-4 w-4" />;
        default:
          // Upcoming event - show filled or unfilled based on whether it's past
          return isPastEvent() ? (
            <Circle className="h-4 w-4 opacity-60" />
          ) : (
            <Circle className="h-4 w-4" />
          );
      }
    } else {
      return <Minus className="h-4 w-4" />;
    }
  };

  const handleTaskClick = () => {
    if (entry.type === "task" && entry.state === "incomplete") {
      onUpdate(entry.id, { state: "complete" });
    } else if (entry.type === "task" && entry.state === "complete") {
      onUpdate(entry.id, { state: "incomplete" });
    }
  };

  const handleEventClick = () => {
    if (entry.type !== "event") return;
    
    // Toggle between attended and upcoming for past events
    if (isPastEvent()) {
      if (entry.eventState === "attended") {
        onUpdate(entry.id, { eventState: "upcoming" });
      } else if (entry.eventState === "missed") {
        onUpdate(entry.id, { eventState: "attended" });
      } else {
        onUpdate(entry.id, { eventState: "attended" });
      }
    }
  };

  const getEventCategoryColor = () => {
    if (entry.type !== "event") return "";
    
    switch (entry.eventCategory) {
      case "meeting":
        return "border-l-4 border-l-blue-500";
      case "appointment":
        return "border-l-4 border-l-green-500";
      case "birthday":
        return "border-l-4 border-l-pink-500";
      case "deadline":
        return "border-l-4 border-l-red-500";
      default:
        return "border-l-4 border-l-gray-400";
    }
  };

  const formatEventTime = () => {
    if (!entry.eventTime) return null;
    
    const [hours, minutes] = entry.eventTime.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    
    let timeStr = `${displayHour}:${minutes} ${ampm}`;
    
    if (entry.eventEndTime) {
      const [endHours, endMinutes] = entry.eventEndTime.split(":");
      const endHour = parseInt(endHours);
      const endAmpm = endHour >= 12 ? "PM" : "AM";
      const endDisplayHour = endHour % 12 || 12;
      timeStr += ` - ${endDisplayHour}:${endMinutes} ${endAmpm}`;
    }
    
    return timeStr;
  };

  const handleMigrate = () => {
    // Use the entry's own date to calculate next day
    const entryDate = new Date(entry.date);
    const nextDay = new Date(entryDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const currentMigrationCount = entry.migrationCount || 0;
    
    onUpdate(entry.id, { 
      state: "incomplete", // Reset to incomplete for the new day
      date: nextDay.toISOString(),
      migrationCount: currentMigrationCount + 1
    });
  };

  const toggleSignifier = (signifier: Signifier) => {
    const currentSignifiers = entry.signifiers || [];
    const hasSignifier = currentSignifiers.includes(signifier);
    
    const newSignifiers = hasSignifier
      ? currentSignifiers.filter(s => s !== signifier)
      : [...currentSignifiers, signifier];
    
    onUpdate(entry.id, { signifiers: newSignifiers });
  };

  const handleReschedule = (newDate: Date) => {
    const currentMigrationCount = entry.migrationCount || 0;
    onUpdate(entry.id, { 
      state: "scheduled",
      date: newDate.toISOString(),
      migrationCount: currentMigrationCount + 1
    });
  };

  const handleEventReschedule = (newDate: Date) => {
    onUpdate(entry.id, { 
      date: newDate.toISOString(),
      eventState: "migrated" 
    });
  };

  const getSignifierIcon = (signifier: Signifier) => {
    switch (signifier) {
      case "priority":
        return <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />;
      case "inspiration":
        return <Lightbulb className="h-3.5 w-3.5 fill-blue-500 text-blue-500" />;
      case "explore":
        return <Eye className="h-3.5 w-3.5 text-purple-500" />;
    }
  };

  const handleSwipeComplete = () => {
    if (entry.type === "task") {
      handleTaskClick();
    } else if (entry.type === "event") {
      handleEventClick();
    }
  };

  const handleSwipeDelete = () => {
    if (entry.type === "task" || entry.type === "event") {
      onUpdate(entry.id, { 
        state: "cancelled",
        eventState: entry.type === "event" ? "cancelled" : undefined 
      });
    } else {
      onDelete(entry.id);
    }
  };

  const entryContent = (
    <div className={`flex items-start gap-3 group hover:bg-accent/50 p-3 md:p-2 rounded-md transition-colors ${getEventCategoryColor()}`}>
      <button
        onClick={entry.type === "task" ? handleTaskClick : handleEventClick}
        className="mt-0.5 flex-shrink-0 text-foreground/70 hover:text-foreground transition-colors"
        disabled={entry.type === "note"}
      >
        {getBulletSymbol()}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {entry.signifiers && entry.signifiers.length > 0 && (
                <div className="flex items-center gap-1">
                  {entry.signifiers.map((signifier) => (
                    <span key={signifier} className="inline-flex">
                      {getSignifierIcon(signifier)}
                    </span>
                  ))}
                </div>
              )}
              <p
                className={`break-words ${
                  entry.type === "task" && entry.state === "complete" ? "line-through text-muted-foreground" : ""
                } ${entry.type === "task" && entry.state === "cancelled" ? "line-through text-muted-foreground" : ""}
                ${entry.type === "event" && entry.eventState === "cancelled" ? "line-through text-muted-foreground" : ""}`}
              >
                {entry.content}
              </p>
            </div>
            
            {/* Event time and badges */}
            {entry.type === "event" && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {formatEventTime() && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatEventTime()}
                  </Badge>
                )}
                {entry.isAllDay && (
                  <Badge variant="outline" className="text-xs">
                    All Day
                  </Badge>
                )}
                {entry.isRecurring && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Repeat className="h-3 w-3" />
                    {entry.recurringPattern}
                  </Badge>
                )}
                {entry.eventCategory && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {entry.eventCategory}
                  </Badge>
                )}
                {entry.eventState === "missed" && (
                  <Badge variant="destructive" className="text-xs">
                    Missed
                  </Badge>
                )}
              </div>
            )}
          </div>
          {entry.migrationCount && entry.migrationCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 text-xs text-orange-800 dark:text-orange-400 flex-shrink-0">
              <ChevronRight className="h-3 w-3 mr-0.5" />
              {entry.migrationCount}
            </span>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity h-8 w-8 p-0`}
          >
            •••
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {entry.type === "task" && (
            <>
              <DropdownMenuItem onClick={handleMigrate}>
                <ChevronRight className="h-4 w-4 mr-2" />
                Migrate to Next Day
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRescheduleDialogOpen(true)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Schedule for Different Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdate(entry.id, { state: "cancelled" })}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleSignifier("priority")}>
                <Star className="h-4 w-4 mr-2" />
                {entry.signifiers?.includes("priority") ? "Remove" : "Add"} Priority (*)
              </DropdownMenuItem>
            </>
          )}
          
          {entry.type === "event" && (
            <>
              <DropdownMenuItem onClick={() => onUpdate(entry.id, { eventState: "attended" })}>
                <CircleDot className="h-4 w-4 mr-2" />
                Mark as Attended
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdate(entry.id, { eventState: "missed" })}>
                <Slash className="h-4 w-4 mr-2" />
                Mark as Missed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdate(entry.id, { eventState: "cancelled" })}>
                <X className="h-4 w-4 mr-2" />
                Cancel Event
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRescheduleEventDialogOpen(true)}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Reschedule Event
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuItem onClick={() => toggleSignifier("inspiration")}>
            <Lightbulb className="h-4 w-4 mr-2" />
            {entry.signifiers?.includes("inspiration") ? "Remove" : "Add"} Inspiration (!)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toggleSignifier("explore")}>
            <Eye className="h-4 w-4 mr-2" />
            {entry.signifiers?.includes("explore") ? "Remove" : "Add"} Explore
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(entry.id)}
            className="text-destructive focus:text-destructive"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Reschedule Dialog for Tasks */}
      <RescheduleDialog
        open={rescheduleDialogOpen}
        onOpenChange={setRescheduleDialogOpen}
        onReschedule={handleReschedule}
        currentDate={entry.date}
        entryContent={entry.content}
      />

      {/* Reschedule Dialog for Events */}
      <RescheduleDialog
        open={rescheduleEventDialogOpen}
        onOpenChange={setRescheduleEventDialogOpen}
        onReschedule={handleEventReschedule}
        currentDate={entry.date}
        entryContent={entry.content}
      />
    </div>
  );

  // Wrap with swipeable on mobile
  if (isMobile && entry.type !== "note") {
    return (
      <SwipeableEntry
        onSwipeRight={handleSwipeComplete}
        onSwipeLeft={handleSwipeDelete}
        rightAction={entry.type === "task" ? "complete" : "check"}
        leftAction="cancel"
      >
        {entryContent}
      </SwipeableEntry>
    );
  }

  return entryContent;
}
