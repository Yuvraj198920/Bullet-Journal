import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Plus, Trash2, Flame, TrendingUp, Calendar, Check } from "lucide-react";
import { AddHabitDialog } from "./AddHabitDialog";

export type HabitFrequency = "daily" | "weekly" | "custom";
export type HabitCategory = "health" | "productivity" | "learning" | "social" | "other";

export interface HabitCompletion {
  date: string; // ISO date string
  completed: boolean;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  frequency: HabitFrequency;
  category: HabitCategory;
  color: string;
  createdAt: string;
  completions: HabitCompletion[];
  targetDays?: number; // For custom frequency
  icon?: string;
}

interface HabitsTrackerProps {
  habits: Habit[];
  onAddHabit: (habit: Omit<Habit, "id" | "createdAt" | "completions">) => void;
  onDeleteHabit: (id: string) => void;
  onToggleCompletion: (habitId: string, date: string) => void;
  currentDate: Date;
}

export function HabitsTracker({
  habits,
  onAddHabit,
  onDeleteHabit,
  onToggleCompletion,
  currentDate,
}: HabitsTrackerProps) {
  const [view, setView] = useState<"grid" | "list">("grid");

  // Get last 7 days for the tracker
  const getLast7Days = () => {
    const days: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const days = getLast7Days();

  const isCompletedOnDate = (habit: Habit, date: Date): boolean => {
    const dateStr = date.toISOString().split("T")[0];
    return habit.completions.some(
      (c) => c.date === dateStr && c.completed
    );
  };

  const getCurrentStreak = (habit: Habit): number => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create a set of completed dates for fast lookups
    const completedDates = new Set(
      habit.completions.filter(c => c.completed).map(c => c.date)
    );

    // The streak can only start from today or yesterday.
    let startDate = new Date(today);
    const todayStr = startDate.toISOString().split("T")[0];

    if (!completedDates.has(todayStr)) {
      // If today is not completed, check yesterday.
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      
      if(completedDates.has(yesterdayStr)) {
        // Streak ended yesterday. Count backwards from there.
        startDate = yesterday;
      } else {
        // Not completed today or yesterday, so streak is 0.
        return 0;
      }
    }

    // Now, count backwards from startDate
    while (true) {
      const dateStr = startDate.toISOString().split("T")[0];
      if (completedDates.has(dateStr)) {
        streak++;
        startDate.setDate(startDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const getCompletionRate = (habit: Habit, days: Date[]): number => {
    if (days.length === 0) return 0;

    const completedCount = days.filter(day => isCompletedOnDate(habit, day)).length;
    return Math.round((completedCount / days.length) * 100);
  };

  const getCategoryColor = (category: HabitCategory): string => {
    const colors = {
      health: "bg-green-500",
      productivity: "bg-blue-500",
      learning: "bg-purple-500",
      social: "bg-pink-500",
      other: "bg-gray-500",
    };
    return colors[category];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Habits Tracker</CardTitle>
              <CardDescription>Build better habits, one day at a time</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={view === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("grid")}
              >
                Grid
              </Button>
              <Button
                variant={view === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("list")}
              >
                List
              </Button>
              <AddHabitDialog onAdd={onAddHabit} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* No Habits State */}
      {habits.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Flame className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg mb-2">No habits yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start building better habits by creating your first one
              </p>
              <AddHabitDialog onAdd={onAddHabit} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid View */}
      {view === "grid" && habits.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => {
            const streak = getCurrentStreak(habit);
            const completionRate = getCompletionRate(habit, days);

            return (
              <Card key={habit.id} className="overflow-hidden">
                <div className={`h-2 ${habit.color}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{habit.name}</CardTitle>
                      {habit.description && (
                        <CardDescription className="text-xs mt-1">
                          {habit.description}
                        </CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 -mr-2 -mt-1"
                      onClick={() => onDeleteHabit(habit.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {habit.frequency}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getCategoryColor(habit.category)} text-white border-0`}
                    >
                      {habit.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* 7-day tracker */}
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day, idx) => {
                      const isCompleted = isCompletedOnDate(habit, day);
                      const isToday =
                        day.toDateString() === currentDate.toDateString();

                      return (
                        <button
                          key={idx}
                          onClick={() =>
                            onToggleCompletion(
                              habit.id,
                              day.toISOString().split("T")[0]
                            )
                          }
                          className={`aspect-square rounded-md border-2 transition-all flex flex-col items-center justify-center text-xs ${
                            isCompleted
                              ? `${habit.color} border-transparent text-white`
                              : "border-border hover:border-primary"
                          } ${isToday ? "ring-2 ring-primary ring-offset-2" : ""}`}
                        >
                          <span className="text-[10px] opacity-70">
                            {day.toLocaleDateString("en-US", { weekday: "short" })[0]}
                          </span>
                          {isCompleted && <Check className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span>{streak} day streak</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>{completionRate}%</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <Progress value={completionRate} className="h-2" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === "list" && habits.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {habits.map((habit) => {
                const streak = getCurrentStreak(habit);
                const completionRate = getCompletionRate(habit, days);

                return (
                  <div key={habit.id} className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Color indicator */}
                      <div className={`w-1 h-16 rounded-full ${habit.color}`} />

                      {/* Habit info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{habit.name}</h4>
                            {habit.description && (
                              <p className="text-sm text-muted-foreground">
                                {habit.description}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onDeleteHabit(habit.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>

                        {/* 7-day tracker */}
                        <div className="grid grid-cols-7 gap-2 mb-3">
                          {days.map((day, idx) => {
                            const isCompleted = isCompletedOnDate(habit, day);
                            const isToday =
                              day.toDateString() === currentDate.toDateString();

                            return (
                              <button
                                key={idx}
                                onClick={() =>
                                  onToggleCompletion(
                                    habit.id,
                                    day.toISOString().split("T")[0]
                                  )
                                }
                                className={`h-10 rounded-md border-2 transition-all flex flex-col items-center justify-center ${
                                  isCompleted
                                    ? `${habit.color} border-transparent text-white`
                                    : "border-border hover:border-primary"
                                } ${isToday ? "ring-2 ring-primary ring-offset-1" : ""}`}
                              >
                                <span className="text-xs">
                                  {day.toLocaleDateString("en-US", { weekday: "short" })[0]}
                                </span>
                                {isCompleted && <Check className="h-3 w-3" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Stats and badges */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Flame className="h-4 w-4 text-orange-500" />
                              <span>{streak} day</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <span>{completionRate}%</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs capitalize">
                              {habit.frequency}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getCategoryColor(
                                habit.category
                              )} text-white border-0`}
                            >
                              {habit.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
