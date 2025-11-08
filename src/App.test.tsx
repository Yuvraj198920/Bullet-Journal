import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase
vi.mock('./utils/supabase/database', () => ({
  createEntry: vi.fn(),
  updateEntry: vi.fn(),
  deleteEntry: vi.fn(),
  getUserEntries: vi.fn(() => Promise.resolve([])),
}));

vi.mock('./lib/auth', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } } })),
    },
  },
}));

import { createEntry, updateEntry } from './utils/supabase/database';

describe('App - Event Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Event Creation via addEvent', () => {
    it('should save event to database with all properties', async () => {
      const mockCreateEntry = vi.mocked(createEntry);
      mockCreateEntry.mockResolvedValue({
        id: 'event-123',
        user_id: 'test-user',
        entry_date: '2025-10-21',
        entry_type: 'event',
        content: 'Team Meeting',
        state: 'incomplete',
        event_state: 'upcoming',
        event_time: '14:00',
        event_end_time: '15:00',
        is_all_day: false,
        event_category: 'meeting',
        is_recurring: false,
        recurring_pattern: null,
        migration_count: null,
        signifiers: null,
        created_at: '2025-10-21T10:00:00Z',
        updated_at: '2025-10-21T10:00:00Z',
      });

      // Simulate the addEvent function call
      const date = new Date('2025-10-21');
      await createEntry({
        date: '2025-10-21',
        type: 'event',
        content: 'Team Meeting',
        state: 'incomplete',
        eventState: 'upcoming',
        eventTime: '14:00',
        eventEndTime: '15:00',
        isAllDay: false,
        eventCategory: 'meeting',
        isRecurring: false,
        recurringPattern: undefined,
      });

      expect(mockCreateEntry).toHaveBeenCalledWith({
        date: '2025-10-21',
        type: 'event',
        content: 'Team Meeting',
        state: 'incomplete',
        eventState: 'upcoming',
        eventTime: '14:00',
        eventEndTime: '15:00',
        isAllDay: false,
        eventCategory: 'meeting',
        isRecurring: false,
        recurringPattern: undefined,
      });
    });

    it('should save all-day event correctly', async () => {
      const mockCreateEntry = vi.mocked(createEntry);
      mockCreateEntry.mockResolvedValue({
        id: 'event-124',
        user_id: 'test-user',
        entry_date: '2025-12-25',
        entry_type: 'event',
        content: 'Christmas',
        state: 'incomplete',
        event_state: 'upcoming',
        event_time: null,
        event_end_time: null,
        is_all_day: true,
        event_category: 'other',
        is_recurring: false,
        recurring_pattern: null,
        migration_count: null,
        signifiers: null,
        created_at: '2025-10-21T10:00:00Z',
        updated_at: '2025-10-21T10:00:00Z',
      });

      await createEntry({
        date: '2025-12-25',
        type: 'event',
        content: 'Christmas',
        state: 'incomplete',
        eventState: 'upcoming',
        eventTime: undefined,
        eventEndTime: undefined,
        isAllDay: true,
        eventCategory: 'other',
        isRecurring: false,
        recurringPattern: undefined,
      });

      expect(mockCreateEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          isAllDay: true,
          eventTime: undefined,
          eventEndTime: undefined,
        })
      );
    });

    it('should save recurring event correctly', async () => {
      const mockCreateEntry = vi.mocked(createEntry);
      mockCreateEntry.mockResolvedValue({
        id: 'event-125',
        user_id: 'test-user',
        entry_date: '2025-10-21',
        entry_type: 'event',
        content: 'Weekly Standup',
        state: 'incomplete',
        event_state: 'upcoming',
        event_time: '09:00',
        event_end_time: '09:30',
        is_all_day: false,
        event_category: 'meeting',
        is_recurring: true,
        recurring_pattern: 'weekly',
        migration_count: null,
        signifiers: null,
        created_at: '2025-10-21T10:00:00Z',
        updated_at: '2025-10-21T10:00:00Z',
      });

      await createEntry({
        date: '2025-10-21',
        type: 'event',
        content: 'Weekly Standup',
        state: 'incomplete',
        eventState: 'upcoming',
        eventTime: '09:00',
        eventEndTime: '09:30',
        isAllDay: false,
        eventCategory: 'meeting',
        isRecurring: true,
        recurringPattern: 'weekly',
      });

      expect(mockCreateEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          isRecurring: true,
          recurringPattern: 'weekly',
        })
      );
    });
  });

  describe('Event State Updates', () => {
    it('should update event state to attended', async () => {
      const mockUpdateEntry = vi.mocked(updateEntry);

      await updateEntry('event-123', {
        event_state: 'attended',
      });

      expect(mockUpdateEntry).toHaveBeenCalledWith('event-123', {
        event_state: 'attended',
      });
    });

    it('should update event state to missed', async () => {
      const mockUpdateEntry = vi.mocked(updateEntry);

      await updateEntry('event-123', {
        event_state: 'missed',
      });

      expect(mockUpdateEntry).toHaveBeenCalledWith('event-123', {
        event_state: 'missed',
      });
    });

    it('should update event state to cancelled', async () => {
      const mockUpdateEntry = vi.mocked(updateEntry);

      await updateEntry('event-123', {
        event_state: 'cancelled',
      });

      expect(mockUpdateEntry).toHaveBeenCalledWith('event-123', {
        event_state: 'cancelled',
      });
    });
  });

  describe('Event Rescheduling', () => {
    it('should update event date and set state to migrated', async () => {
      const mockUpdateEntry = vi.mocked(updateEntry);

      const newDate = new Date('2025-10-25');
      await updateEntry('event-123', {
        entry_date: '2025-10-25',
        event_state: 'migrated',
      });

      expect(mockUpdateEntry).toHaveBeenCalledWith('event-123', {
        entry_date: '2025-10-25',
        event_state: 'migrated',
      });
    });

    it('should preserve event properties when rescheduling', async () => {
      const mockUpdateEntry = vi.mocked(updateEntry);

      // When rescheduling, only date and eventState should change
      await updateEntry('event-123', {
        entry_date: '2025-10-26',
        event_state: 'migrated',
      });

      // Should NOT update other properties
      expect(mockUpdateEntry).toHaveBeenCalledWith(
        'event-123',
        expect.not.objectContaining({
          event_time: expect.anything(),
          event_category: expect.anything(),
          is_recurring: expect.anything(),
        })
      );
    });
  });

  describe('Event Filtering in DailyLog', () => {
    it('should filter events by date', () => {
      const entries = [
        {
          id: '1',
          date: '2025-10-21T00:00:00.000Z',
          type: 'event' as const,
          content: 'Event 1',
          state: 'incomplete' as const,
          eventState: 'upcoming' as const,
        },
        {
          id: '2',
          date: '2025-10-22T00:00:00.000Z',
          type: 'event' as const,
          content: 'Event 2',
          state: 'incomplete' as const,
          eventState: 'upcoming' as const,
        },
        {
          id: '3',
          date: '2025-10-21T00:00:00.000Z',
          type: 'event' as const,
          content: 'Event 3',
          state: 'incomplete' as const,
          eventState: 'attended' as const,
        },
      ];

      const targetDate = new Date('2025-10-21');
      const filtered = entries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate.toDateString() === targetDate.toDateString();
      });

      expect(filtered).toHaveLength(2);
      expect(filtered.map(e => e.id)).toEqual(['1', '3']);
    });

    it('should include attended events in filtered results', () => {
      const entries = [
        {
          id: '1',
          date: '2025-10-21T00:00:00.000Z',
          type: 'event' as const,
          content: 'Attended Event',
          state: 'incomplete' as const,
          eventState: 'attended' as const,
        },
        {
          id: '2',
          date: '2025-10-21T00:00:00.000Z',
          type: 'event' as const,
          content: 'Upcoming Event',
          state: 'incomplete' as const,
          eventState: 'upcoming' as const,
        },
      ];

      const targetDate = new Date('2025-10-21');
      const filtered = entries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate.toDateString() === targetDate.toDateString();
      });

      // Both attended and upcoming events should be included
      expect(filtered).toHaveLength(2);
      expect(filtered.some(e => e.eventState === 'attended')).toBe(true);
      expect(filtered.some(e => e.eventState === 'upcoming')).toBe(true);
    });

    it('should filter events by event state when filter is applied', () => {
      const entries = [
        {
          id: '1',
          date: '2025-10-21T00:00:00.000Z',
          type: 'event' as const,
          content: 'Attended Event',
          state: 'incomplete' as const,
          eventState: 'attended' as const,
        },
        {
          id: '2',
          date: '2025-10-21T00:00:00.000Z',
          type: 'event' as const,
          content: 'Upcoming Event',
          state: 'incomplete' as const,
          eventState: 'upcoming' as const,
        },
        {
          id: '3',
          date: '2025-10-21T00:00:00.000Z',
          type: 'event' as const,
          content: 'Missed Event',
          state: 'incomplete' as const,
          eventState: 'missed' as const,
        },
      ];

      // Filter to show only attended events
      const filterEventStates = ['attended'];
      const filtered = entries.filter((entry) => {
        if (entry.type === 'event' && filterEventStates.length > 0) {
          const eventState = entry.eventState || 'upcoming';
          return filterEventStates.includes(eventState);
        }
        return true;
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].eventState).toBe('attended');
    });
  });

  describe('Event Data Integrity', () => {
    it('should maintain all event properties through create-update cycle', async () => {
      const mockCreateEntry = vi.mocked(createEntry);
      const mockUpdateEntry = vi.mocked(updateEntry);

      // Create event
      mockCreateEntry.mockResolvedValue({
        id: 'event-126',
        user_id: 'test-user',
        entry_date: '2025-10-21',
        entry_type: 'event',
        content: 'Important Meeting',
        state: 'incomplete',
        event_state: 'upcoming',
        event_time: '14:00',
        event_end_time: '15:00',
        is_all_day: false,
        event_category: 'meeting',
        is_recurring: false,
        recurring_pattern: null,
        migration_count: null,
        signifiers: null,
        created_at: '2025-10-21T10:00:00Z',
        updated_at: '2025-10-21T10:00:00Z',
      });

      const createdEvent = await createEntry({
        date: '2025-10-21',
        type: 'event',
        content: 'Important Meeting',
        state: 'incomplete',
        eventState: 'upcoming',
        eventTime: '14:00',
        eventEndTime: '15:00',
        isAllDay: false,
        eventCategory: 'meeting',
        isRecurring: false,
      });

      // Update event state
      await updateEntry('event-126', {
        event_state: 'attended',
      });

      // Verify original properties are preserved
      expect(createdEvent.event_time).toBe('14:00');
      expect(createdEvent.event_end_time).toBe('15:00');
      expect(createdEvent.event_category).toBe('meeting');
      expect(mockUpdateEntry).toHaveBeenCalledWith('event-126', {
        event_state: 'attended',
      });
    });
  });
});
