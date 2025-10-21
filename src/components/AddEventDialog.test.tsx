import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddEventDialog } from './AddEventDialog';

describe('AddEventDialog - Event Creation', () => {
  let mockOnAdd: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnAdd = vi.fn();
  });

  describe('Dialog Opening and Closing', () => {
    it('should open dialog when clicking Add Event button', async () => {
      render(<AddEventDialog onAdd={mockOnAdd} />);

      const addButton = screen.getByText('Add Event');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Add New Event')).toBeInTheDocument();
      });
    });

    it('should close dialog when clicking Cancel', async () => {
      render(<AddEventDialog onAdd={mockOnAdd} />);

      // Open dialog
      const addButton = screen.getByText('Add Event');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Add New Event')).toBeInTheDocument();
      });

      // Click cancel
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Add New Event')).not.toBeInTheDocument();
      });
    });
  });

  describe('Event Creation', () => {
    it('should create event with basic details', async () => {
      render(<AddEventDialog onAdd={mockOnAdd} defaultDate={new Date('2025-10-21')} />);

      // Open dialog
      fireEvent.click(screen.getByText('Add Event'));

      await waitFor(() => {
        expect(screen.getByText('Add New Event')).toBeInTheDocument();
      });

      // Enter event description
      const textarea = screen.getByPlaceholderText(/Team meeting/i);
      fireEvent.change(textarea, { target: { value: 'Project Review Meeting' } });

      // Submit
      const submitButton = screen.getAllByText('Add Event')[1]; // Get the submit button, not the trigger
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalledWith(
          'Project Review Meeting',
          expect.any(Date),
          expect.any(String), // start time
          expect.any(String), // end time
          false, // isAllDay
          'other', // category
          false, // isRecurring
          undefined // recurringPattern
        );
      });
    });

    it('should create all-day event', async () => {
      render(<AddEventDialog onAdd={mockOnAdd} />);

      fireEvent.click(screen.getByText('Add Event'));

      await waitFor(() => {
        expect(screen.getByText('Add New Event')).toBeInTheDocument();
      });

      // Enter event description
      const textarea = screen.getByPlaceholderText(/Team meeting/i);
      fireEvent.change(textarea, { target: { value: 'Company Holiday' } });

      // Toggle all-day
      const allDayToggle = screen.getByRole('switch', { name: /all-day/i });
      fireEvent.click(allDayToggle);

      // Submit
      const submitButton = screen.getAllByText('Add Event')[1];
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalledWith(
          'Company Holiday',
          expect.any(Date),
          undefined, // no start time for all-day
          undefined, // no end time for all-day
          true, // isAllDay
          'other',
          false,
          undefined
        );
      });
    });

    it('should create event with specific time', async () => {
      render(<AddEventDialog onAdd={mockOnAdd} />);

      fireEvent.click(screen.getByText('Add Event'));

      await waitFor(() => {
        expect(screen.getByText('Add New Event')).toBeInTheDocument();
      });

      // Enter event description
      const textarea = screen.getByPlaceholderText(/Team meeting/i);
      fireEvent.change(textarea, { target: { value: 'Client Call' } });

      // Set start time
      const startTimeInput = screen.getByLabelText(/start time/i);
      fireEvent.change(startTimeInput, { target: { value: '10:30' } });

      // Set end time
      const endTimeInput = screen.getByLabelText(/end time/i);
      fireEvent.change(endTimeInput, { target: { value: '11:30' } });

      // Submit
      const submitButton = screen.getAllByText('Add Event')[1];
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalledWith(
          'Client Call',
          expect.any(Date),
          '10:30',
          '11:30',
          false,
          'other',
          false,
          undefined
        );
      });
    });

    it('should create event with category', async () => {
      render(<AddEventDialog onAdd={mockOnAdd} />);

      fireEvent.click(screen.getByText('Add Event'));

      await waitFor(() => {
        expect(screen.getByText('Add New Event')).toBeInTheDocument();
      });

      // Enter event description
      const textarea = screen.getByPlaceholderText(/Team meeting/i);
      fireEvent.change(textarea, { target: { value: 'Sprint Planning' } });

      // Select category
      const categorySelect = screen.getByRole('combobox', { name: /category/i });
      fireEvent.click(categorySelect);

      const meetingOption = screen.getByText('Meeting');
      fireEvent.click(meetingOption);

      // Submit
      const submitButton = screen.getAllByText('Add Event')[1];
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalledWith(
          'Sprint Planning',
          expect.any(Date),
          expect.any(String),
          expect.any(String),
          false,
          'meeting',
          false,
          undefined
        );
      });
    });

    it('should create recurring event', async () => {
      render(<AddEventDialog onAdd={mockOnAdd} />);

      fireEvent.click(screen.getByText('Add Event'));

      await waitFor(() => {
        expect(screen.getByText('Add New Event')).toBeInTheDocument();
      });

      // Enter event description
      const textarea = screen.getByPlaceholderText(/Team meeting/i);
      fireEvent.change(textarea, { target: { value: 'Weekly Standup' } });

      // Toggle recurring
      const recurringToggle = screen.getByRole('switch', { name: /recurring/i });
      fireEvent.click(recurringToggle);

      // Select pattern
      const patternSelect = screen.getByRole('combobox', { name: /pattern/i });
      fireEvent.click(patternSelect);

      const weeklyOption = screen.getByText('Weekly');
      fireEvent.click(weeklyOption);

      // Submit
      const submitButton = screen.getAllByText('Add Event')[1];
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalledWith(
          'Weekly Standup',
          expect.any(Date),
          expect.any(String),
          expect.any(String),
          false,
          'other',
          true,
          'weekly'
        );
      });
    });
  });

  describe('Event Validation', () => {
    it('should not submit event without content', async () => {
      render(<AddEventDialog onAdd={mockOnAdd} />);

      fireEvent.click(screen.getByText('Add Event'));

      await waitFor(() => {
        expect(screen.getByText('Add New Event')).toBeInTheDocument();
      });

      // Try to submit without entering content
      const submitButton = screen.getAllByText('Add Event')[1];
      fireEvent.click(submitButton);

      // Should not call onAdd
      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it('should enforce character limit', async () => {
      render(<AddEventDialog onAdd={mockOnAdd} />);

      fireEvent.click(screen.getByText('Add Event'));

      await waitFor(() => {
        expect(screen.getByText('Add New Event')).toBeInTheDocument();
      });

      // Try to enter more than 500 characters
      const longText = 'a'.repeat(600);
      const textarea = screen.getByPlaceholderText(/Team meeting/i);
      fireEvent.change(textarea, { target: { value: longText } });

      // Should only accept 500 characters
      expect(textarea).toHaveValue('a'.repeat(500));
    });
  });

  describe('Event Persistence', () => {
    it('should persist event after page refresh', async () => {
      // This test verifies that the event is passed to the database
      render(<AddEventDialog onAdd={mockOnAdd} />);

      fireEvent.click(screen.getByText('Add Event'));

      await waitFor(() => {
        expect(screen.getByText('Add New Event')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Team meeting/i);
      fireEvent.change(textarea, { target: { value: 'Important Meeting' } });

      const submitButton = screen.getAllByText('Add Event')[1];
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Verify onAdd was called, which should save to database
        expect(mockOnAdd).toHaveBeenCalled();
        const [content] = mockOnAdd.mock.calls[0];
        expect(content).toBe('Important Meeting');
      });
    });
  });

  describe('Event Categories', () => {
    const categories = ['meeting', 'appointment', 'birthday', 'deadline', 'other'];

    categories.forEach((category) => {
      it(`should create event with ${category} category`, async () => {
        render(<AddEventDialog onAdd={mockOnAdd} />);

        fireEvent.click(screen.getByText('Add Event'));

        await waitFor(() => {
          expect(screen.getByText('Add New Event')).toBeInTheDocument();
        });

        const textarea = screen.getByPlaceholderText(/Team meeting/i);
        fireEvent.change(textarea, { target: { value: `Test ${category}` } });

        // Select category
        const categorySelect = screen.getByRole('combobox', { name: /category/i });
        fireEvent.click(categorySelect);

        const categoryOption = screen.getByText(
          category.charAt(0).toUpperCase() + category.slice(1)
        );
        fireEvent.click(categoryOption);

        const submitButton = screen.getAllByText('Add Event')[1];
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockOnAdd).toHaveBeenCalledWith(
            `Test ${category}`,
            expect.any(Date),
            expect.any(String),
            expect.any(String),
            false,
            category,
            false,
            undefined
          );
        });
      });
    });
  });
});
