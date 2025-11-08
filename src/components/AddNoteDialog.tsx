import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, FileText } from "lucide-react";

interface AddNoteDialogProps {
  onAdd: (content: string, type: "note", date: Date) => void;
  defaultDate?: Date;
  trigger?: React.ReactNode;
}

const MAX_CHARS = 500;

export function AddNoteDialog({ onAdd, defaultDate, trigger }: AddNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [date, setDate] = useState<Date>(defaultDate || new Date());

  const charsRemaining = MAX_CHARS - content.length;
  const isNearLimit = charsRemaining < 50;

  const handleSubmit = () => {
    if (content.trim()) {
      onAdd(content, "note", date);
      setContent("");
      setDate(defaultDate || new Date());
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          )}
        </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Note</DialogTitle>
          <DialogDescription>
            Create a note to capture ideas, observations, or information.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="note-content">Note Content</Label>
            <Textarea
              id="note-content"
              placeholder="What would you like to note?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  handleSubmit();
                }
              }}
              className="min-h-[150px] resize-none"
              maxLength={MAX_CHARS}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Press Ctrl+Enter to submit</span>
              <span className={isNearLimit ? "text-amber-500 font-medium" : ""}>
                {charsRemaining} characters remaining
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!content.trim()}>
              Add Note
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
