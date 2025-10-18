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

export interface EntryDB {
  id: string;
  user_id: string;
  entry_date: string;
  entry_type: string;
  content: string;
  state: string;
  migration_count: number | null;
  signifiers: string[] | null;
  event_state: string | null;
  event_time: string | null;
  event_end_time: string | null;
  is_all_day: boolean | null;
  event_category: string | null;
  is_recurring: boolean | null;
  recurring_pattern: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollectionDB {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface CollectionItemDB {
  id: string;
  collection_id: string;
  user_id: string;
  text: string;
  checked: boolean;
  created_at: string;
  updated_at: string;
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

// ============================================
// ENTRIES CRUD
// ============================================

export async function createEntry(entry: {
  date: string;
  type: string;
  content: string;
  state: string;
  migrationCount?: number;
  signifiers?: string[];
  eventState?: string;
  eventTime?: string;
  eventEndTime?: string;
  isAllDay?: boolean;
  eventCategory?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("entries")
    .insert([
      {
        user_id: user.id,
        entry_date: entry.date,
        entry_type: entry.type,
        content: entry.content,
        state: entry.state,
        migration_count: entry.migrationCount || null,
        signifiers: entry.signifiers || null,
        event_state: entry.eventState || null,
        event_time: entry.eventTime || null,
        event_end_time: entry.eventEndTime || null,
        is_all_day: entry.isAllDay || null,
        event_category: entry.eventCategory || null,
        is_recurring: entry.isRecurring || null,
        recurring_pattern: entry.recurringPattern || null,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserEntries() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateEntry(entryId: string, updates: Partial<EntryDB>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("entries")
    .update(updates)
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function deleteEntry(entryId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) throw error;
}

// ============================================
// COLLECTIONS CRUD
// ============================================

export async function createCollection(title: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("collections")
    .insert([
      {
        user_id: user.id,
        title: title,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserCollections() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function deleteCollection(collectionId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", collectionId)
    .eq("user_id", user.id);

  if (error) throw error;
}

// ============================================
// COLLECTION ITEMS CRUD
// ============================================

export async function createCollectionItem(collectionId: string, text: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("collection_entries")
    .insert([
      {
        collection_id: collectionId,
        user_id: user.id,
        text: text,
        checked: false,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCollectionItems(collectionId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("collection_entries")
    .select("*")
    .eq("collection_id", collectionId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getAllUserCollectionItems() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("collection_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function toggleCollectionItem(itemId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get current state
  const { data: item } = await supabase
    .from("collection_entries")
    .select("checked")
    .eq("id", itemId)
    .eq("user_id", user.id)
    .single();

  if (!item) throw new Error("Item not found");

  const { error } = await supabase
    .from("collection_entries")
    .update({ checked: !item.checked })
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) throw error;
  return !item.checked;
}

export async function deleteCollectionItem(itemId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("collection_entries")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) throw error;
}

// ============================================
// MIGRATION HISTORY CRUD
// ============================================

export interface MigrationHistoryDB {
  id: string;
  task_id: string;
  user_id: string;
  original_date: string;
  migrated_to_date: string | null;
  migration_type: 'migrate' | 'schedule' | 'cancel';
  created_at: string;
}

/**
 * Get all incomplete tasks from previous days (for daily migration prompt)
 */
export async function getPendingMigrations(beforeDate?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const today = beforeDate || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("entry_type", "task")
    .lt("entry_date", today)
    .in("state", ["incomplete", "migrated", "scheduled"])
    .order("entry_date", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Migrate a task to a new date and record the migration
 */
export async function migrateTask(
  taskId: string,
  originalDate: string,
  newDate: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get the current task
  const { data: task, error: fetchError } = await supabase
    .from("entries")
    .select("*")
    .eq("id", taskId)
    .eq("user_id", user.id)
    .single();

  if (fetchError) throw fetchError;
  if (!task) throw new Error("Task not found");

  // Update the original task to show it was migrated
  const { error: updateError } = await supabase
    .from("entries")
    .update({
      state: "migrated",
      migration_count: (task.migration_count || 0) + 1,
    })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (updateError) throw updateError;

  // Create a new task for the new date
  const { data: newTask, error: createError } = await supabase
    .from("entries")
    .insert([
      {
        user_id: user.id,
        entry_date: newDate,
        entry_type: task.entry_type,
        content: task.content,
        state: "incomplete",
        migration_count: (task.migration_count || 0) + 1,
        signifiers: task.signifiers,
        event_state: task.event_state,
        event_time: task.event_time,
        event_end_time: task.event_end_time,
        is_all_day: task.is_all_day,
        event_category: task.event_category,
        is_recurring: task.is_recurring,
        recurring_pattern: task.recurring_pattern,
      },
    ])
    .select()
    .single();

  if (createError) throw createError;

  // Record the migration in history
  const { error: historyError } = await supabase
    .from("migration_history")
    .insert([
      {
        task_id: taskId,
        user_id: user.id,
        original_date: originalDate,
        migrated_to_date: newDate,
        migration_type: "migrate",
      },
    ]);

  if (historyError) throw historyError;

  return newTask;
}

/**
 * Schedule a task to a specific future date and record the migration
 */
export async function scheduleTask(
  taskId: string,
  originalDate: string,
  scheduledDate: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get the current task
  const { data: task, error: fetchError } = await supabase
    .from("entries")
    .select("*")
    .eq("id", taskId)
    .eq("user_id", user.id)
    .single();

  if (fetchError) throw fetchError;
  if (!task) throw new Error("Task not found");

  // Update the original task to show it was scheduled
  const { error: updateError } = await supabase
    .from("entries")
    .update({
      state: "scheduled",
      migration_count: (task.migration_count || 0) + 1,
    })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (updateError) throw updateError;

  // Create a new task for the scheduled date
  const { data: newTask, error: createError } = await supabase
    .from("entries")
    .insert([
      {
        user_id: user.id,
        entry_date: scheduledDate,
        entry_type: task.entry_type,
        content: task.content,
        state: "incomplete",
        migration_count: (task.migration_count || 0) + 1,
        signifiers: task.signifiers,
        event_state: task.event_state,
        event_time: task.event_time,
        event_end_time: task.event_end_time,
        is_all_day: task.is_all_day,
        event_category: task.event_category,
        is_recurring: task.is_recurring,
        recurring_pattern: task.recurring_pattern,
      },
    ])
    .select()
    .single();

  if (createError) throw createError;

  // Record the migration in history
  const { error: historyError } = await supabase
    .from("migration_history")
    .insert([
      {
        task_id: taskId,
        user_id: user.id,
        original_date: originalDate,
        migrated_to_date: scheduledDate,
        migration_type: "schedule",
      },
    ]);

  if (historyError) throw historyError;

  return newTask;
}

/**
 * Cancel a task and record the cancellation
 */
export async function cancelTask(taskId: string, originalDate: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Update the task to cancelled
  const { error: updateError } = await supabase
    .from("entries")
    .update({ state: "cancelled" })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (updateError) throw updateError;

  // Record the cancellation in history
  const { error: historyError } = await supabase
    .from("migration_history")
    .insert([
      {
        task_id: taskId,
        user_id: user.id,
        original_date: originalDate,
        migrated_to_date: null,
        migration_type: "cancel",
      },
    ]);

  if (historyError) throw historyError;
}

/**
 * Get migration history for a specific task
 */
export async function getTaskMigrationHistory(taskId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("migration_history")
    .select("*")
    .eq("task_id", taskId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get migration statistics for a user
 */
export async function getUserMigrationStats() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("migration_history")
    .select("migration_type")
    .eq("user_id", user.id);

  if (error) throw error;

  const stats = {
    totalMigrations: data?.length || 0,
    migrated: data?.filter((m) => m.migration_type === "migrate").length || 0,
    scheduled: data?.filter((m) => m.migration_type === "schedule").length || 0,
    cancelled: data?.filter((m) => m.migration_type === "cancel").length || 0,
  };

  return stats;
}

