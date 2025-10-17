import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ChevronRight, ChevronLeft, X, Calendar as CalendarIcon, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { BulletEntryData } from "./BulletEntry";
import { ScrollArea } from "./ui/scroll-area";

interface MigrationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: BulletEntryData[];
  currentMonth: Date;
  onMigrate: (entryIds: string[], action: "migrate" | "schedule" | "cancel", targetDate?: Date) => void;
}

export function MigrationWizard({
  open,
  onOpenChange,
  entries,
  currentMonth,
  onMigrate,
}: MigrationWizardProps) {
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<"review" | "preview">("review");

  // Get incomplete tasks from current month
  const incompleteTasks = useMemo(() => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    return entries.filter((entry) => {
      if (entry.type !== "task") return false;
      if (entry.state === "complete" || entry.state === "cancelled") return false;
      
      const entryDate = new Date(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });
  }, [entries, currentMonth]);

  // Group by migration count for insights
  const migrationStats = useMemo(() => {
    const stats = {
      neverMigrated: 0,
      migratedOnce: 0,
      migratedMultiple: 0,
      highPriority: 0,
    };

    incompleteTasks.forEach((task) => {
      const count = task.migrationCount || 0;
      if (count === 0) stats.neverMigrated++;
      else if (count === 1) stats.migratedOnce++;
      else stats.migratedMultiple++;

      if (task.signifiers?.includes("priority")) {
        stats.highPriority++;
      }
    });

    return stats;
  }, [incompleteTasks]);

  // Suggest which tasks to migrate based on patterns
  const suggestions = useMemo(() => {
    const suggested = new Set<string>();

    incompleteTasks.forEach((task) => {
      // Suggest tasks that have been migrated multiple times (might need attention)
      if ((task.migrationCount || 0) >= 2) {
        suggested.add(task.id);
      }
      // Suggest priority tasks
      if (task.signifiers?.includes("priority")) {
        suggested.add(task.id);
      }
    });

    return suggested;
  }, [incompleteTasks]);

  const toggleEntry = (id: string) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEntries(newSelected);
  };

  const selectAll = () => {
    setSelectedEntries(new Set(incompleteTasks.map((t) => t.id)));
  };

  const deselectAll = () => {
    setSelectedEntries(new Set());
  };

  const applySuggestions = () => {
    setSelectedEntries(new Set(suggestions));
  };

  const handleMigrate = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    
    onMigrate(Array.from(selectedEntries), "migrate", nextMonth);
    onOpenChange(false);
    setSelectedEntries(new Set());
    setStep("review");
  };

  const handleCancel = () => {
    onMigrate(Array.from(selectedEntries), "cancel");
    onOpenChange(false);
    setSelectedEntries(new Set());
    setStep("review");
  };

  const nextMonthName = useMemo(() => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    return next.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [currentMonth]);

  const currentMonthName = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Monthly Migration Wizard</DialogTitle>
          <DialogDescription>
            Review and migrate incomplete tasks from {currentMonthName}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={step} onValueChange={(v) => setStep(v as "review" | "preview")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="review">Review Tasks</TabsTrigger>
            <TabsTrigger value="preview">Preview & Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="review" className="space-y-4">
            {/* Statistics Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Migration Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-muted-foreground">Total incomplete:</span>
                    <span>{incompleteTasks.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-orange-500" />
                    <span className="text-muted-foreground">Multiple migrations:</span>
                    <span>{migrationStats.migratedMultiple}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">Never migrated:</span>
                    <span>{migrationStats.neverMigrated}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-muted-foreground">High priority:</span>
                    <span>{migrationStats.highPriority}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selection Controls */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedEntries.size} of {incompleteTasks.length} selected
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={applySuggestions}>
                  Apply Suggestions ({suggestions.size})
                </Button>
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  Deselect All
                </Button>
              </div>
            </div>

            {/* Task List */}
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {incompleteTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>No incomplete tasks found!</p>
                    <p className="text-sm mt-1">All tasks for this month are complete.</p>
                  </div>
                ) : (
                  incompleteTasks.map((task) => (
                    <Card
                      key={task.id}
                      className={`cursor-pointer transition-colors ${
                        selectedEntries.has(task.id) ? "border-primary bg-accent" : ""
                      } ${suggestions.has(task.id) ? "border-amber-500/50" : ""}`}
                      onClick={() => toggleEntry(task.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedEntries.has(task.id)}
                            onCheckedChange={() => toggleEntry(task.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm break-words">{task.content}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                {new Date(task.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </Badge>
                              {task.migrationCount && task.migrationCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  <ChevronRight className="h-3 w-3 mr-1" />
                                  Migrated {task.migrationCount}x
                                </Badge>
                              )}
                              {task.signifiers?.includes("priority") && (
                                <Badge variant="destructive" className="text-xs">
                                  High Priority
                                </Badge>
                              )}
                              {suggestions.has(task.id) && (
                                <Badge className="text-xs bg-amber-500">
                                  Suggested
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Migration Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Tasks to migrate:</span>
                  <span>{selectedEntries.size}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Destination:</span>
                  <span>{nextMonthName}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-muted-foreground">Action:</span>
                  <Badge>Migrate to Next Month</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Selected Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  {selectedEntries.size === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No tasks selected
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {incompleteTasks
                        .filter((t) => selectedEntries.has(t.id))
                        .map((task) => (
                          <li key={task.id} className="text-sm flex items-start gap-2">
                            <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                            <span className="break-words">{task.content}</span>
                          </li>
                        ))}
                    </ul>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <div className="bg-muted/50 p-3 rounded-md text-xs text-muted-foreground">
              <p>
                💡 <strong>Tip:</strong> Tasks migrated multiple times might need to be broken down into smaller tasks or
                re-evaluated for importance.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={selectedEntries.size === 0}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel Selected ({selectedEntries.size})
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleMigrate} disabled={selectedEntries.size === 0}>
              <ChevronRight className="h-4 w-4 mr-2" />
              Migrate to {nextMonthName} ({selectedEntries.size})
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
