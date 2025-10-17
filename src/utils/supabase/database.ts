import { supabase } from "../../lib/auth";

export interface HabitDB {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  frequency: string;
  category: string;
  color: string;
  target_days: number | null;
  icon: string | null;
  created_at: string;
}

export interface HabitCompletionDB {
  id: string;
  habit_id: string;
  user_id: string;
  completion_date: string;
  completed: boolean;
  created_at: string;
}

// Habits CRUD
export async function createHabit(habit: {
  name: string;
  description?: string;
  frequency: string;
  category: string;
  color: string;
  targetDays?: number;
  icon?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("habits")
    .insert([
      {
        user_id: user.id,
        name: habit.name,
        description: habit.description || null,
        frequency: habit.frequency,
        category: habit.category,
        color: habit.color,
        target_days: habit.targetDays || null,
        icon: habit.icon || null,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserHabits() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function deleteHabit(habitId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("habits")
    .delete()
    .eq("id", habitId)
    .eq("user_id", user.id); // Ensure user can only delete their own habits

  if (error) throw error;
}

// Habit Completions CRUD
export async function toggleHabitCompletion(habitId: string, date: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check if completion exists
  const { data: existing } = await supabase
    .from("habit_completions")
    .select("*")
    .eq("habit_id", habitId)
    .eq("user_id", user.id)
    .eq("completion_date", date)
    .maybeSingle();

  if (existing) {
    // Toggle completion
    const { error } = await supabase
      .from("habit_completions")
      .update({ completed: !existing.completed })
      .eq("id", existing.id);

    if (error) throw error;
    return !existing.completed;
  } else {
    // Create new completion
    const { error } = await supabase
      .from("habit_completions")
      .insert([
        {
          habit_id: habitId,
          user_id: user.id,
          completion_date: date,
          completed: true,
        },
      ]);

    if (error) throw error;
    return true;
  }
}

export async function getHabitCompletions(habitId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("habit_completions")
    .select("*")
    .eq("habit_id", habitId)
    .eq("user_id", user.id)
    .order("completion_date", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAllUserHabitCompletions() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("habit_completions")
    .select("*")
    .eq("user_id", user.id)
    .order("completion_date", { ascending: false });

  if (error) throw error;
  return data;
}
