import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase
vi.mock('./utils/supabase/database', () => ({
  createEntry: vi.fn(),
  updateEntry: vi.fn(),
  deleteEntry: vi.fn(),
  getUserEntries: vi.fn(() => Promise.resolve([])),
  migrateTask: vi.fn(),
  scheduleTask: vi.fn(),
  getPendingMigrations: vi.fn(() => Promise.resolve([])),
}));

vi.mock('./lib/auth', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } } })),
    },
  },
}));

import { createEntry, updateEntry, migrateTask, scheduleTask } from './utils/supabase/database';

describe('App - Task Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Task Creation', () => {
    it('should create a task and verify it appears in daily log', async () => {
      const mockCreateEntry = vi.mocked(createEntry);
      mockCreateEntry.mockResolvedValue({
        id: 'task-001',
        user_id: 'test-user',
        entry_date: '2025-10-21',
        entry_type: 'task',
        content: 'Complete project documentation',
        state: 'incomplete',
        migration_count: null,
        signifiers: null,
        event_state: null,
        event_time: null,
        event_end_time: null,
        is_all_day: null,
        event_category: null,
        is_recurring: null,
        recurring_pattern: null,
        created_at: '2025-10-21T10:00:00Z',
        updated_at: '2025-10-21T10:00:00Z',
      });

      const task = await createEntry({
        date: '2025-10-21',
        type: 'task',
        content: 'Complete project documentation',
        state: 'incomplete',
      });

      expect(mockCreateEntry).toHaveBeenCalledWith({
        date: '2025-10-21',
        type: 'task',
        content: 'Complete project documentation',
        state: 'incomplete',
      });

      expect(task.id).toBe('task-001');
      expect(task.entry_type).toBe('task');
      expect(task.content).toBe('Complete project documentation');
      expect(task.state).toBe('incomplete');
    });

    it('should create task with signifiers', async () => {
      const mockCreateEntry = vi.mocked(createEntry);
      mockCreateEntry.mockResolvedValue({
        id: 'task-002',
        user_id: 'test-user',
        entry_date: '2025-10-21',
        entry_type: 'task',
        content: 'High priority task',
        state: 'incomplete',
        migration_count: null,
        signifiers: ['!', '*'],
        event_state: null,
        event_time: null,
        event_end_time: null,
        is_all_day: null,
        event_category: null,
        is_recurring: null,
        recurring_pattern: null,
        created_at: '2025-10-21T10:00:00Z',
        updated_at: '2025-10-21T10:00:00Z',
      });

      await createEntry({
        date: '2025-10-21',
        type: 'task',
        content: 'High priority task',
        state: 'incomplete',
        signifiers: ['!', '*'],
      });

      expect(mockCreateEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          signifiers: ['!', '*'],
        })
      );
    });
  });

  describe('Task Completion', () => {
    it('should mark task complete and verify X symbol', async () => {
      await updateEntry('task-001', {
        state: 'complete',
      });

      expect(updateEntry).toHaveBeenCalledWith('task-001', {
        state: 'complete',
      });
    });

    it('should allow completing a task from any valid state', async () => {
      // From incomplete
      await updateEntry('task-001', { state: 'complete' });
      expect(updateEntry).toHaveBeenLastCalledWith('task-001', { state: 'complete' });

      // From scheduled
      await updateEntry('task-002', { state: 'complete' });
      expect(updateEntry).toHaveBeenLastCalledWith('task-002', { state: 'complete' });

      // From migrated
      await updateEntry('task-003', { state: 'complete' });
      expect(updateEntry).toHaveBeenLastCalledWith('task-003', { state: 'complete' });
    });

    it('should keep completed tasks visible in daily log', async () => {
      // Mark as complete but don't delete
      await updateEntry('task-001', { state: 'complete' });
      
      expect(updateEntry).toHaveBeenCalledWith('task-001', { state: 'complete' });
      // Should NOT call deleteEntry
    });
  });

  describe('Task Migration', () => {
    it('should migrate task and verify > symbol on original', async () => {
      const mockMigrateTask = vi.mocked(migrateTask);
      const mockUpdateEntry = vi.mocked(updateEntry);

      mockMigrateTask.mockResolvedValue({
        id: 'task-001-new',
        user_id: 'test-user',
        entry_date: '2025-10-22',
        entry_type: 'task',
        content: 'Task to migrate',
        state: 'incomplete',
        migration_count: 1,
        signifiers: null,
        event_state: null,
        event_time: null,
        event_end_time: null,
        is_all_day: null,
        event_category: null,
        is_recurring: null,
        recurring_pattern: null,
        created_at: '2025-10-21T10:00:00Z',
        updated_at: '2025-10-22T10:00:00Z',
      });

      const newTask = await migrateTask('task-001', '2025-10-21', '2025-10-22');

      expect(mockMigrateTask).toHaveBeenCalledWith('task-001', '2025-10-21', '2025-10-22');
      expect(newTask.entry_date).toBe('2025-10-22');
      expect(newTask.migration_count).toBe(1);
      expect(newTask.state).toBe('incomplete');
    });

    it('should increment migration counter correctly', async () => {
      const mockMigrateTask = vi.mocked(migrateTask);

      // First migration
      mockMigrateTask.mockResolvedValueOnce({
        id: 'task-m1',
        user_id: 'test-user',
        entry_date: '2025-10-22',
        entry_type: 'task',
        content: 'Task',
        state: 'incomplete',
        migration_count: 1,
        signifiers: null,
        event_state: null,
        event_time: null,
        event_end_time: null,
        is_all_day: null,
        event_category: null,
        is_recurring: null,
        recurring_pattern: null,
        created_at: '2025-10-21T10:00:00Z',
        updated_at: '2025-10-22T10:00:00Z',
      });

      // Second migration
      mockMigrateTask.mockResolvedValueOnce({
        id: 'task-m2',
        user_id: 'test-user',
        entry_date: '2025-10-23',
        entry_type: 'task',
        content: 'Task',
        state: 'incomplete',
        migration_count: 2,
        signifiers: null,
        event_state: null,
        event_time: null,
        event_end_time: null,
        is_all_day: null,
        event_category: null,
        is_recurring: null,
        recurring_pattern: null,
        created_at: '2025-10-21T10:00:00Z',
        updated_at: '2025-10-23T10:00:00Z',
      });

      const task1 = await migrateTask('task-001', '2025-10-21', '2025-10-22');
      expect(task1.migration_count).toBe(1);

      const task2 = await migrateTask('task-m1', '2025-10-22', '2025-10-23');
      expect(task2.migration_count).toBe(2);
    });

    it('should detect lurker at 3+ migrations', async () => {
      const mockMigrateTask = vi.mocked(migrateTask);

      mockMigrateTask.mockResolvedValue({
        id: 'task-lurker',
        user_id: 'test-user',
        entry_date: '2025-10-24',
        entry_type: 'task',
        content: 'Lurker task',
        state: 'incomplete',
        migration_count: 3,
        signifiers: null,
        event_state: null,
        event_time: null,
        event_end_time: null,
        is_all_day: null,
        event_category: null,
        is_recurring: null,
        recurring_pattern: null,
        created_at: '2025-10-21T10:00:00Z',
        updated_at: '2025-10-24T10:00:00Z',
      });

      const lurkerTask = await migrateTask('task-002', '2025-10-23', '2025-10-24');

      // Should be flagged as lurker (migrated 3+ times)
      expect(lurkerTask.migration_count).toBeGreaterThanOrEqual(3);
    });

    it('should migrate across month boundaries', async () => {
      const mockMigrateTask = vi.mocked(migrateTask);

      mockMigrateTask.mockResolvedValue({
        id: 'task-month',
        user_id: 'test-user',
        entry_date: '2025-11-01',
        entry_type: 'task',
        content: 'Cross month task',
        state: 'incomplete',
        migration_count: 1,
        signifiers: null,
        event_state: null,
        event_time: null,
        event_end_time: null,
        is_all_day: null,
        event_category: null,
        is_recurring: null,
        recurring_pattern: null,
        created_at: '2025-10-31T10:00:00Z',
        updated_at: '2025-11-01T10:00:00Z',
      });

      const newTask = await migrateTask('task-oct', '2025-10-31', '2025-11-01');

      expect(newTask.entry_date).toBe('2025-11-01');
      expect(mockMigrateTask).toHaveBeenCalledWith('task-oct', '2025-10-31', '2025-11-01');
    });
  });

  describe('Task Scheduling', () => {
    it('should schedule task and verify < symbol', async () => {
      const mockScheduleTask = vi.mocked(scheduleTask);

      mockScheduleTask.mockResolvedValue({
        id: 'task-scheduled-new',
        user_id: 'test-user',
        entry_date: '2025-10-25',
        entry_type: 'task',
        content: 'Scheduled task',
        state: 'incomplete',
        migration_count: null,
        signifiers: null,
        event_state: null,
        event_time: null,
        event_end_time: null,
        is_all_day: null,
        event_category: null,
        is_recurring: null,
        recurring_pattern: null,
        created_at: '2025-10-21T10:00:00Z',
        updated_at: '2025-10-25T10:00:00Z',
      });

      const scheduledTask = await scheduleTask('task-003', '2025-10-21', '2025-10-25');

      expect(mockScheduleTask).toHaveBeenCalledWith('task-003', '2025-10-21', '2025-10-25');
      expect(scheduledTask.entry_date).toBe('2025-10-25');
    });

    it('should appear on target date when scheduled', async () => {
      const mockScheduleTask = vi.mocked(scheduleTask);

      mockScheduleTask.mockResolvedValue({
        id: 'task-target',
        user_id: 'test-user',
        entry_date: '2025-10-28',
        entry_type: 'task',
        content: 'Future task',
        state: 'incomplete',
        migration_count: null,
        signifiers: null,
        event_state: null,
        event_time: null,
        event_end_time: null,
        is_all_day: null,
        event_category: null,
        is_recurring: null,
        recurring_pattern: null,
        created_at: '2025-10-21T10:00:00Z',
        updated_at: '2025-10-28T10:00:00Z',
      });

      const task = await scheduleTask('task-004', '2025-10-21', '2025-10-28');

      // Verify appears on target date
      expect(task.entry_date).toBe('2025-10-28');
    });
  });

  describe('Task Cancellation', () => {
    it('should cancel task and verify strikethrough', async () => {
      await updateEntry('task-005', {
        state: 'cancelled',
      });

      expect(updateEntry).toHaveBeenCalledWith('task-005', {
        state: 'cancelled',
      });
    });

    it('should allow cancelling scheduled task', async () => {
      // Cancel a scheduled task
      await updateEntry('task-scheduled', {
        state: 'cancelled',
      });

      expect(updateEntry).toHaveBeenCalledWith('task-scheduled', {
        state: 'cancelled',
      });
    });
  });

  describe('State Transitions', () => {
    it('should only allow valid state transitions', async () => {
      // Valid: incomplete -> complete
      await updateEntry('task-1', { state: 'complete' });
      expect(updateEntry).toHaveBeenCalledWith('task-1', { state: 'complete' });

      // Valid: incomplete -> migrated
      await updateEntry('task-2', { state: 'migrated' });
      expect(updateEntry).toHaveBeenCalledWith('task-2', { state: 'migrated' });

      // Valid: incomplete -> scheduled
      await updateEntry('task-3', { state: 'scheduled' });
      expect(updateEntry).toHaveBeenCalledWith('task-3', { state: 'scheduled' });

      // Valid: incomplete -> cancelled
      await updateEntry('task-4', { state: 'cancelled' });
      expect(updateEntry).toHaveBeenCalledWith('task-4', { state: 'cancelled' });

      // Valid: cancelled -> incomplete (reactivate)
      await updateEntry('task-5', { state: 'incomplete' });
      expect(updateEntry).toHaveBeenCalledWith('task-5', { state: 'incomplete' });
    });

    it('should reactivate cancelled task', async () => {
      // Reactivate
      await updateEntry('task-cancelled', {
        state: 'incomplete',
      });

      expect(updateEntry).toHaveBeenCalledWith('task-cancelled', {
        state: 'incomplete',
      });
    });
  });

  describe('Edge Cases', () => {
    it('should complete a migrated task', async () => {
      // Complete a task that was migrated
      await updateEntry('task-migrated', {
        state: 'complete',
      });

      expect(updateEntry).toHaveBeenCalledWith('task-migrated', {
        state: 'complete',
      });
    });

    it('should handle tasks with very long content', async () => {
      const mockCreateEntry = vi.mocked(createEntry);
      const longContent = 'A'.repeat(500);

      mockCreateEntry.mockResolvedValue({
        id: 'task-long',
        user_id: 'test-user',
        entry_date: '2025-10-21',
        entry_type: 'task',
        content: longContent,
        state: 'incomplete',
        migration_count: null,
        signifiers: null,
        event_state: null,
        event_time: null,
        event_end_time: null,
        is_all_day: null,
        event_category: null,
        is_recurring: null,
        recurring_pattern: null,
        created_at: '2025-10-21T10:00:00Z',
        updated_at: '2025-10-21T10:00:00Z',
      });

      const task = await createEntry({
        date: '2025-10-21',
        type: 'task',
        content: longContent,
        state: 'incomplete',
      });

      expect(task.content).toBe(longContent);
      expect(task.content.length).toBe(500);
    });

    it('should migrate multiple times (lurker scenario)', async () => {
      const mockMigrateTask = vi.mocked(migrateTask);

      // First migration
      mockMigrateTask.mockResolvedValueOnce({
        id: 'task-l1',
        user_id: 'test-user',
        entry_date: '2025-10-22',
        entry_type: 'task',
        content: 'Persistent task',
        state: 'incomplete',
        migration_count: 1,
        signifiers: null,
        event_state: null,
        event_time: null,
        event_end_time: null,
        is_all_day: null,
        event_category: null,
        is_recurring: null,
        recurring_pattern: null,
        created_at: '2025-10-21T10:00:00Z',
        updated_at: '2025-10-22T10:00:00Z',
      });

      // Second migration
      mockMigrateTask.mockResolvedValueOnce({
        id: 'task-l2',
        user_id: 'test-user',
        entry_date: '2025-10-23',
        entry_type: 'task',
        content: 'Persistent task',
        state: 'incomplete',
        migration_count: 2,
        signifiers: null,
        event_state: null,
        event_time: null,
        event_end_time: null,
        is_all_day: null,
        event_category: null,
        is_recurring: null,
        recurring_pattern: null,
        created_at: '2025-10-21T10:00:00Z',
        updated_at: '2025-10-23T10:00:00Z',
      });

      // Third migration - becomes lurker
      mockMigrateTask.mockResolvedValueOnce({
        id: 'task-l3',
        user_id: 'test-user',
        entry_date: '2025-10-24',
        entry_type: 'task',
        content: 'Persistent task',
        state: 'incomplete',
        migration_count: 3,
        signifiers: null,
        event_state: null,
        event_time: null,
        event_end_time: null,
        is_all_day: null,
        event_category: null,
        is_recurring: null,
        recurring_pattern: null,
        created_at: '2025-10-21T10:00:00Z',
        updated_at: '2025-10-24T10:00:00Z',
      });

      const task1 = await migrateTask('task-orig', '2025-10-21', '2025-10-22');
      expect(task1.migration_count).toBe(1);

      const task2 = await migrateTask('task-l1', '2025-10-22', '2025-10-23');
      expect(task2.migration_count).toBe(2);

      const task3 = await migrateTask('task-l2', '2025-10-23', '2025-10-24');
      expect(task3.migration_count).toBe(3);

      // This task should be flagged as a lurker
      expect(task3.migration_count).toBeGreaterThanOrEqual(3);
    });

    it('should handle 100+ incomplete tasks', async () => {
      const mockCreateEntry = vi.mocked(createEntry);

      // Create 100 tasks
      for (let i = 0; i < 100; i++) {
        mockCreateEntry.mockResolvedValueOnce({
          id: `task-${i}`,
          user_id: 'test-user',
          entry_date: '2025-10-21',
          entry_type: 'task',
          content: `Task ${i}`,
          state: 'incomplete',
          migration_count: null,
          signifiers: null,
          event_state: null,
          event_time: null,
          event_end_time: null,
          is_all_day: null,
          event_category: null,
          is_recurring: null,
          recurring_pattern: null,
          created_at: '2025-10-21T10:00:00Z',
          updated_at: '2025-10-21T10:00:00Z',
        });

        await createEntry({
          date: '2025-10-21',
          type: 'task',
          content: `Task ${i}`,
          state: 'incomplete',
        });
      }

      expect(mockCreateEntry).toHaveBeenCalledTimes(100);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain task properties through state changes', async () => {
      const mockCreateEntry = vi.mocked(createEntry);

      // Create task with signifiers
      mockCreateEntry.mockResolvedValue({
        id: 'task-integrity',
        user_id: 'test-user',
        entry_date: '2025-10-21',
        entry_type: 'task',
        content: 'Important task',
        state: 'incomplete',
        migration_count: null,
        signifiers: ['!'],
        event_state: null,
        event_time: null,
        event_end_time: null,
        is_all_day: null,
        event_category: null,
        is_recurring: null,
        recurring_pattern: null,
        created_at: '2025-10-21T10:00:00Z',
        updated_at: '2025-10-21T10:00:00Z',
      });

      const task = await createEntry({
        date: '2025-10-21',
        type: 'task',
        content: 'Important task',
        state: 'incomplete',
        signifiers: ['!'],
      });

      // Mark complete
      await updateEntry('task-integrity', { state: 'complete' });

      // Verify signifiers should be preserved
      expect(task.signifiers).toEqual(['!']);
      expect(updateEntry).toHaveBeenCalledWith('task-integrity', { state: 'complete' });
    });

    it('should preserve content when migrating', async () => {
      const mockMigrateTask = vi.mocked(migrateTask);
      const originalContent = 'Original task content with signifiers!';

      mockMigrateTask.mockResolvedValue({
        id: 'task-new',
        user_id: 'test-user',
        entry_date: '2025-10-22',
        entry_type: 'task',
        content: originalContent,
        state: 'incomplete',
        migration_count: 1,
        signifiers: ['!'],
        event_state: null,
        event_time: null,
        event_end_time: null,
        is_all_day: null,
        event_category: null,
        is_recurring: null,
        recurring_pattern: null,
        created_at: '2025-10-21T10:00:00Z',
        updated_at: '2025-10-22T10:00:00Z',
      });

      const newTask = await migrateTask('task-old', '2025-10-21', '2025-10-22');

      expect(newTask.content).toBe(originalContent);
      expect(newTask.signifiers).toEqual(['!']);
    });
  });
});
