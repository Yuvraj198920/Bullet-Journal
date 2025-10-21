import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BulletEntry, BulletEntryData, EventState } from './BulletEntry';

// Mock the UI components
vi.mock('./ui/use-mobile', () => ({
  useIsMobile: () => false,
}));

vi.mock('./SwipeableEntry', () => ({
  SwipeableEntry: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../RescheduleDialog', () => ({
  RescheduleDialog: ({ 
    open, 
    onReschedule, 
    entryContent 
  }: { 
    open: boolean; 
    onReschedule: (date: Date) => void;
    entryContent: string;
  }) => 
    open ? (
      <div data-testid="reschedule-dialog">
        <p>{entryContent}</p>
        <button onClick={() => onReschedule(new Date('2025-10-25'))}>
          Reschedule
        </button>
      </div>
    ) : null,
}));

describe('BulletEntry - Event Functionality', () => {
  let mockOnUpdate: ReturnType<typeof vi.fn>;
  let mockOnDelete: ReturnType<typeof vi.fn>;
  let baseEventEntry: BulletEntryData;

  beforeEach(() => {
    mockOnUpdate = vi.fn();
    mockOnDelete = vi.fn();
    
    baseEventEntry = {
      id: 'event-1',
      date: '2025-10-21T00:00:00.000Z',
      type: 'event',
      content: 'Team Meeting',
      state: 'incomplete',
      eventState: 'upcoming',
      eventTime: '14:00',
      eventEndTime: '15:00',
      isAllDay: false,
      eventCategory: 'meeting',
    };
  });

  describe('Event Display', () => {
    it('should render event with correct content', () => {
      render(
        <BulletEntry
          entry={baseEventEntry}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    });

    it('should display event time badge', () => {
      render(
        <BulletEntry
          entry={baseEventEntry}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Should show formatted time (2:00 PM - 3:00 PM)
      expect(screen.getByText(/2:00 PM/)).toBeInTheDocument();
      expect(screen.getByText(/3:00 PM/)).toBeInTheDocument();
    });

    it('should display "All Day" badge for all-day events', () => {
      const allDayEvent = { ...baseEventEntry, isAllDay: true, eventTime: undefined };
      
      render(
        <BulletEntry
          entry={allDayEvent}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('All Day')).toBeInTheDocument();
    });

    it('should display event category badge', () => {
      render(
        <BulletEntry
          entry={baseEventEntry}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('meeting')).toBeInTheDocument();
    });

    it('should display attended badge for attended events', () => {
      const attendedEvent = { ...baseEventEntry, eventState: 'attended' as EventState };
      
      render(
        <BulletEntry
          entry={attendedEvent}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Attended')).toBeInTheDocument();
    });

    it('should display missed badge for missed events', () => {
      const missedEvent = { ...baseEventEntry, eventState: 'missed' as EventState };
      
      render(
        <BulletEntry
          entry={missedEvent}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Missed')).toBeInTheDocument();
    });

    it('should display recurring badge for recurring events', () => {
      const recurringEvent = { 
        ...baseEventEntry, 
        isRecurring: true, 
        recurringPattern: 'weekly' 
      };
      
      render(
        <BulletEntry
          entry={recurringEvent}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('weekly')).toBeInTheDocument();
    });
  });

  describe('Event State Changes', () => {
    it('should allow marking event as attended', async () => {
      render(
        <BulletEntry
          entry={baseEventEntry}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Open dropdown menu
      const menuButton = screen.getByText('•••');
      fireEvent.click(menuButton);

      // Click "Mark as Attended"
      const attendedButton = screen.getByText('Mark as Attended');
      fireEvent.click(attendedButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('event-1', {
          eventState: 'attended',
        });
      });
    });

    it('should allow marking event as missed', async () => {
      render(
        <BulletEntry
          entry={baseEventEntry}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Open dropdown menu
      const menuButton = screen.getByText('•••');
      fireEvent.click(menuButton);

      // Click "Mark as Missed"
      const missedButton = screen.getByText('Mark as Missed');
      fireEvent.click(missedButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('event-1', {
          eventState: 'missed',
        });
      });
    });

    it('should allow cancelling event', async () => {
      render(
        <BulletEntry
          entry={baseEventEntry}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Open dropdown menu
      const menuButton = screen.getByText('•••');
      fireEvent.click(menuButton);

      // Click "Cancel Event"
      const cancelButton = screen.getByText('Cancel Event');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('event-1', {
          eventState: 'cancelled',
        });
      });
    });
  });

  describe('Event Rescheduling', () => {
    it('should open reschedule dialog when clicking reschedule option', async () => {
      render(
        <BulletEntry
          entry={baseEventEntry}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Open dropdown menu
      const menuButton = screen.getByText('•••');
      fireEvent.click(menuButton);

      // Click "Reschedule Event"
      const rescheduleButton = screen.getByText('Reschedule Event');
      fireEvent.click(rescheduleButton);

      await waitFor(() => {
        expect(screen.getByTestId('reschedule-dialog')).toBeInTheDocument();
      });
    });

    it('should reschedule event to new date', async () => {
      render(
        <BulletEntry
          entry={baseEventEntry}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Open dropdown menu
      const menuButton = screen.getByText('•••');
      fireEvent.click(menuButton);

      // Click "Reschedule Event"
      const rescheduleButton = screen.getByText('Reschedule Event');
      fireEvent.click(rescheduleButton);

      // Wait for dialog and click reschedule
      await waitFor(() => {
        expect(screen.getByTestId('reschedule-dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Reschedule');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('event-1', {
          date: expect.any(String),
          eventState: 'migrated',
        });
      });
    });

    it('should set eventState to migrated when rescheduling', async () => {
      render(
        <BulletEntry
          entry={baseEventEntry}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Open dropdown menu
      const menuButton = screen.getByText('•••');
      fireEvent.click(menuButton);

      // Click "Reschedule Event"
      const rescheduleButton = screen.getByText('Reschedule Event');
      fireEvent.click(rescheduleButton);

      await waitFor(() => {
        expect(screen.getByTestId('reschedule-dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Reschedule');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        const callArgs = mockOnUpdate.mock.calls[0][1];
        expect(callArgs.eventState).toBe('migrated');
      });
    });
  });

  describe('Event Persistence', () => {
    it('should maintain event properties after state change', () => {
      const { rerender } = render(
        <BulletEntry
          entry={baseEventEntry}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Mark as attended
      const menuButton = screen.getByText('•••');
      fireEvent.click(menuButton);
      const attendedButton = screen.getByText('Mark as Attended');
      fireEvent.click(attendedButton);

      // Simulate re-render with updated state
      const updatedEntry = { ...baseEventEntry, eventState: 'attended' as EventState };
      rerender(
        <BulletEntry
          entry={updatedEntry}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Event should still be visible with all properties
      expect(screen.getByText('Team Meeting')).toBeInTheDocument();
      expect(screen.getByText('Attended')).toBeInTheDocument();
      expect(screen.getByText('meeting')).toBeInTheDocument();
    });
  });

  describe('Event Categories', () => {
    const categories: Array<{ category: string; className: string }> = [
      { category: 'meeting', className: 'border-l-blue-500' },
      { category: 'appointment', className: 'border-l-green-500' },
      { category: 'birthday', className: 'border-l-pink-500' },
      { category: 'deadline', className: 'border-l-red-500' },
      { category: 'other', className: 'border-l-gray-400' },
    ];

    categories.forEach(({ category, className }) => {
      it(`should apply correct styling for ${category} category`, () => {
        const categoryEvent = { 
          ...baseEventEntry, 
          eventCategory: category as any 
        };
        
        const { container } = render(
          <BulletEntry
            entry={categoryEvent}
            onUpdate={mockOnUpdate}
            onDelete={mockOnDelete}
          />
        );

        const eventElement = container.querySelector(`.${className.replace('-', '\\-')}`);
        expect(eventElement).toBeInTheDocument();
      });
    });
  });

  describe('Event Deletion', () => {
    it('should allow deleting event', async () => {
      render(
        <BulletEntry
          entry={baseEventEntry}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      // Open dropdown menu
      const menuButton = screen.getByText('•••');
      fireEvent.click(menuButton);

      // Click "Delete"
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalledWith('event-1');
      });
    });
  });
});
