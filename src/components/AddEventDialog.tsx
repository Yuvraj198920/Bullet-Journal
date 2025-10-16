import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, Plus, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { EventCategory } from "./BulletEntry";

const MAX_CHARS = 500;

interface AddEventDialogProps {
  onAdd: (
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

export function AddEventDialog({ onAdd, defaultDate, trigger }: AddEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [date, setDate] = useState<Date>(defaultDate || new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isAllDay, setIsAllDay] = useState(false);
  const [category, setCategory] = useState<EventCategory>("other");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState("weekly");

  const charsRemaining = MAX_CHARS - content.length;
  const isNearLimit = charsRemaining < 50;

  const handleSubmit = () => {
    if (content.trim()) {
      onAdd(
        content,
        date,
        isAllDay ? undefined : startTime,
        isAllDay ? undefined : endTime,
        isAllDay,
        category,
        isRecurring,
        isRecurring ? recurringPattern : undefined
      );
      setContent("");
      setStartTime("09:00");
      setEndTime("10:00");
      setIsAllDay(false);
      setCategory("other");
      setIsRecurring(false);
      setRecurringPattern("weekly");
      setDate(defaultDate || new Date());
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Create a new event with scheduling details.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Event Description</Label>
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
              placeholder="Team meeting, Doctor's appointment, Birthday party..."
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleSubmit();
                }
              }}
            />
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

          <div className="flex items-center justify-between">
            <Label htmlFor="all-day">All-day Event</Label>
            <Switch
              id="all-day"
              checked={isAllDay}
              onCheckedChange={setIsAllDay}
            />
          </div>

          {!isAllDay && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as EventCategory)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    Meeting
                  </div>
                </SelectItem>
                <SelectItem value="appointment">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    Appointment
                  </div>
                </SelectItem>
                <SelectItem value="birthday">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-pink-500" />
                    Birthday
                  </div>
                </SelectItem>
                <SelectItem value="deadline">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    Deadline
                  </div>
                </SelectItem>
                <SelectItem value="other">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gray-400" />
                    Other
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="recurring">Recurring Event</Label>
            <Switch
              id="recurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
          </div>

          {isRecurring && (
            <div className="space-y-2">
              <Label htmlFor="pattern">Repeat Pattern</Label>
              <Select value={recurringPattern} onValueChange={setRecurringPattern}>
                <SelectTrigger id="pattern">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Preview */}
          <div className="pt-4 border-t">
            <Label className="text-xs text-muted-foreground">Preview:</Label>
            <div className="mt-2 p-3 bg-muted rounded-md">
              <div className="flex items-start gap-3">
                <div className={`h-1 w-1 rounded-full mt-2 ${
                  category === "meeting" ? "bg-blue-500" :
                  category === "appointment" ? "bg-green-500" :
                  category === "birthday" ? "bg-pink-500" :
                  category === "deadline" ? "bg-red-500" :
                  "bg-gray-400"
                }`} />
                <div className="flex-1">
                  <p className="text-sm">{content || "Event description..."}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {date.toLocaleDateString()}
                    </Badge>
                    {!isAllDay && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {startTime} - {endTime}
                      </Badge>
                    )}
                    {isAllDay && (
                      <Badge variant="outline" className="text-xs">
                        All Day
                      </Badge>
                    )}
                    {isRecurring && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {recurringPattern}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!content.trim()}>
            Add Event
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
