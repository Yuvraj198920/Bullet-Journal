import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { EntryType, EventCategory } from "./BulletEntry";
import { AddEventDialog } from "./AddEventDialog";

interface AddEntryDialogProps {
  onAdd: (content: string, type: EntryType, date: Date) => void;
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
  defaultDate?: Date;
  trigger?: React.ReactNode;
}

const MAX_CHARS = 500;

export function AddEntryDialog({ onAdd, onAddEvent, defaultDate, trigger }: AddEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [content, setContent] = useState("");
  const [type, setType] = useState<EntryType>("task");
  const [date, setDate] = useState<Date>(defaultDate || new Date());

  const charsRemaining = MAX_CHARS - content.length;
  const isNearLimit = charsRemaining < 50;

  const handleSubmit = () => {
    if (content.trim()) {
      if (type === "event" && onAddEvent) {
        // Close this dialog and show event dialog
        setOpen(false);
        setShowEventDialog(true);
      } else {
        onAdd(content, type, date);
        setContent("");
        setType("task");
        setDate(defaultDate || new Date());
        setOpen(false);
      }
    }
  };

  const handleEventAdd = (
    eventContent: string,
    eventDate: Date,
    eventTime?: string,
    eventEndTime?: string,
    isAllDay?: boolean,
    eventCategory?: EventCategory,
    isRecurring?: boolean,
    recurringPattern?: string
  ) => {
    if (onAddEvent) {
      onAddEvent(eventContent, eventDate, eventTime, eventEndTime, isAllDay, eventCategory, isRecurring, recurringPattern);
    }
    setContent("");
    setType("task");
    setDate(defaultDate || new Date());
    setShowEventDialog(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          )}
        </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Entry</DialogTitle>
          <DialogDescription>
            Create a new task, event, or note for your bullet journal.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Entry Type</Label>
            <RadioGroup value={type} onValueChange={(v) => setType(v as EntryType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="task" id="task" />
                <Label htmlFor="task">Task - Action item to complete</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="event" id="event" />
                <Label htmlFor="event">
                  Event - Time-specific occurrence
                  {onAddEvent && <span className="text-xs text-muted-foreground ml-2">(Advanced options available)</span>}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="note" id="note" />
                <Label htmlFor="note">Note - Information or thought</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date.toLocaleDateString()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Content</Label>
              <span className={`text-xs ${isNearLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                {charsRemaining} / {MAX_CHARS}
              </span>
            </div>
            <Textarea
              value={content}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) {
                  setContent(e.target.value);
                }
              }}
              placeholder="Enter your task, event, or note..."
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleSubmit();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Tip: Press <kbd className="px-1.5 py-0.5 bg-muted rounded">Ctrl+Enter</kbd> to save quickly
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!content.trim()}>
            Add Entry
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Event Dialog with advanced options */}
    {onAddEvent && (
      <AddEventDialog
        onAdd={handleEventAdd}
        defaultDate={date}
        trigger={null}
      />
    )}
    </>
  );
}
