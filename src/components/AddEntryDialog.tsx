import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { EntryType } from "./BulletEntry";

interface AddEntryDialogProps {
  onAdd: (content: string, type: EntryType, date: Date) => void;
  defaultDate?: Date;
  trigger?: React.ReactNode;
}

const MAX_CHARS = 500;

export function AddEntryDialog({ onAdd, defaultDate, trigger }: AddEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [type, setType] = useState<EntryType>("task");
  const [date, setDate] = useState<Date>(defaultDate || new Date());

  const charsRemaining = MAX_CHARS - content.length;
  const isNearLimit = charsRemaining < 50;

  const handleSubmit = () => {
    if (content.trim()) {
      onAdd(content, type, date);
      setContent("");
      setType("task");
      setDate(defaultDate || new Date());
      setOpen(false);
    }
  };

  return (
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
            Create a new task or note for your bullet journal.
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
              placeholder="Enter your task or note..."
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
  );
}
