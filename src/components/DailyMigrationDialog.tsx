import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import {
  ChevronRight,
  ChevronLeft,
  X,
  Calendar as CalendarIcon,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { BulletEntryData } from "./BulletEntry";
import { Calendar } from "./ui/calendar";

interface DailyMigrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incompleteTasks: BulletEntryData[];
  currentDate: Date;
  onMigrate: (taskId: string, targetDate: Date) => void;
  onSchedule: (taskId: string, targetDate: Date) => void;
  onCancel: (taskId: string) => void;
}

export function DailyMigrationDialog({
  open,
  onOpenChange,
  incompleteTasks,
  currentDate,
  onMigrate,
  onSchedule,
  onCancel,
}: DailyMigrationDialogProps) {
  const [selectedTask, setSelectedTask] = useState<BulletEntryData | null>(null);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [processedTasks, setProcessedTasks] = useState<Set<string>>(new Set());

  // Get tasks ordered by date (oldest first)
  const sortedTasks = useMemo(() => {
    return [...incompleteTasks].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [incompleteTasks]);

  // Get current task to review
  const currentTask = useMemo(() => {
    if (selectedTask) return selectedTask;
    return sortedTasks.find((task: BulletEntryData) => !processedTasks.has(task.id));
  }, [sortedTasks, selectedTask, processedTasks]);

  // Check if task is a "lurker" (migrated 3+ times)
  const isLurker = (task: BulletEntryData) => {
    return (task.migrationCount || 0) >= 3;
  };

  // Calculate days since original task date
  const daysSince = (task: BulletEntryData) => {
    const taskDate = new Date(task.date);
    const today = new Date(currentDate);
    const diffTime = Math.abs(today.getTime() - taskDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleMigrate = () => {
    if (!currentTask) return;
    onMigrate(currentTask.id, currentDate);
    markTaskProcessed(currentTask.id);
  };

  const handleSchedule = () => {
    if (!currentTask || !scheduleDate) return;
    onSchedule(currentTask.id, scheduleDate);
    markTaskProcessed(currentTask.id);
    setShowSchedulePicker(false);
    setScheduleDate(undefined);
  };

  const handleCancel = () => {
    if (!currentTask) return;
    onCancel(currentTask.id);
    markTaskProcessed(currentTask.id);
  };

  const handleSkip = () => {
    if (!currentTask) return;
    markTaskProcessed(currentTask.id);
  };

  const markTaskProcessed = (taskId: string) => {
    setProcessedTasks((prev: Set<string>) => new Set([...prev, taskId]));
    setSelectedTask(null);
  };

  const remainingCount = sortedTasks.length - processedTasks.size;
  const progress = sortedTasks.length > 0 
    ? ((processedTasks.size / sortedTasks.length) * 100).toFixed(0) 
    : 0;

  // Close dialog when all tasks are processed
  if (remainingCount === 0 && sortedTasks.length > 0) {
    setTimeout(() => {
      onOpenChange(false);
      setProcessedTasks(new Set());
    }, 500);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Daily Task Migration
          </DialogTitle>
          <DialogDescription>
            Review incomplete tasks from previous days. Decide what to do with each one.
          </DialogDescription>
        </DialogHeader>

        {sortedTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              ✨ No incomplete tasks to migrate. You're all caught up!
            </p>
          </div>
        ) : remainingCount === 0 ? (
          <div className="text-center py-8">
            <p className="text-green-600 font-medium">
              ✓ All tasks reviewed! Great work.
            </p>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Progress: {processedTasks.size} / {sortedTasks.length}
                </span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {currentTask && (
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Task Content */}
                    <div>
                      <p className="text-lg font-medium mb-2">{currentTask.content}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {new Date(currentTask.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {daysSince(currentTask)} days old
                        </Badge>
                        {currentTask.migrationCount && currentTask.migrationCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <ChevronRight className="h-3 w-3 mr-1" />
                            Migrated {currentTask.migrationCount}x
                          </Badge>
                        )}
                        {currentTask.signifiers?.includes("priority") && (
                          <Badge variant="destructive" className="text-xs">
                            High Priority
                          </Badge>
                        )}
                        {isLurker(currentTask) && (
                          <Badge className="text-xs bg-amber-500">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Lurker Alert!
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Lurker Warning */}
                    {isLurker(currentTask) && (
                      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          <strong>⚠️ This task has been migrated {currentTask.migrationCount} times.</strong>
                          <br />
                          Consider: Is this task still worth your time? Should it be broken down into smaller tasks?
                        </p>
                      </div>
                    )}

                    {/* Migration Question */}
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <p className="text-sm font-medium">Is this task still worth your time?</p>
                    </div>

                    {/* Schedule Date Picker */}
                    {showSchedulePicker && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Select a date to schedule this task:</p>
                        <Calendar
                          mode="single"
                          selected={scheduleDate}
                          onSelect={setScheduleDate}
                          disabled={(date) => date < currentDate}
                          className="rounded-md border"
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setShowSchedulePicker(false);
                              setScheduleDate(undefined);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={handleSchedule}
                            disabled={!scheduleDate}
                          >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Schedule for{" "}
                            {scheduleDate &&
                              scheduleDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {!showSchedulePicker && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="default"
                          className="w-full"
                          onClick={handleMigrate}
                        >
                          <ChevronRight className="h-4 w-4 mr-2" />
                          Migrate to Today
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowSchedulePicker(true)}
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          Schedule Later
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleSkip}
                        >
                          Keep as-is
                        </Button>
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={handleCancel}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel Task
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Remaining Tasks Preview */}
            {remainingCount > 1 && (
              <div className="text-xs text-muted-foreground text-center">
                {remainingCount - 1} more task(s) to review after this one
              </div>
            )}
          </>
        )}

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
              setProcessedTasks(new Set());
              setSelectedTask(null);
            }}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
