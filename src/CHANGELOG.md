# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Monthly migration wizard for reviewing and moving incomplete tasks
- Responsive mobile interface with touch optimization
- Export journal to PDF
- Theme customization
- Habit tracking
- Calendar integrations

## [1.0.0] - 2025-10-16

### Added - Initial Release

#### Core Bullet Journaling Features
- **Daily Log** - Create and manage daily entries with rapid logging
- **Monthly Log** - Calendar view with visual indicators for entries
- **Future Log** - Yearly overview across all 12 months
- **Collections** - Custom lists for books, goals, habits, and more
- **Index Navigation** - Quick navigation to any date or collection

#### Entry Management
- Three entry types: Tasks (•), Events (○), and Notes (-)
- Task states: Incomplete, Complete, Migrated, Scheduled, Cancelled
- Event states: Upcoming, Completed, Cancelled, Migrated, Missed
- Migration tracking with visual badges showing migration count
- Signifiers: Priority (*), Inspiration (!), Explore (👁️)

#### Event Scheduling
- Time-based events with start and end times
- All-day event support
- Event categories with color coding:
  - Meeting (blue)
  - Appointment (green)
  - Birthday (pink)
  - Deadline (red)
  - Other (gray)
- Recurring events (daily, weekly, monthly, yearly)
- Event preview before creation
- AddEventDialog component for enhanced event creation

#### Search and Filtering
- Full-text search across all entries
- Filter tasks by completion state
- Multiple simultaneous filters
- Clear filters functionality
- Search results highlighting

#### Keyboard Shortcuts
- `Ctrl/Cmd + T` - Quick entry creation
- `Ctrl/Cmd + /` - Focus search
- `Ctrl/Cmd + ←/→` - Navigate days
- `Ctrl/Cmd + Enter` - Submit forms
- Keyboard shortcut hints in UI

#### User Authentication
- Email/password registration
- Secure login system with JWT tokens
- Password reset functionality
- Email verification (automatic confirmation)
- Session management with auto-refresh
- Auto-logout after 30 minutes of inactivity
- Per-user data isolation
- Remember me functionality

#### User Interface
- Clean, modern design using shadcn/ui components
- Responsive layout (desktop-first)
- Dark mode support (via system preferences)
- Loading states and skeletons
- Toast notifications for user feedback
- Character limits (500 chars) with counters
- Confirmation dialogs for destructive actions

#### Data Management
- LocalStorage persistence per user
- Automatic data saving
- Data isolation by user ID
- Import/export ready architecture

#### Technical Infrastructure
- React 18 with TypeScript
- Tailwind CSS v4.0 for styling
- Supabase backend integration
  - Authentication service
  - PostgreSQL database with KV store
  - Edge Functions with Hono web server
- Lucide React icons
- shadcn/ui component library
- Vite build tooling

#### Developer Experience
- Comprehensive TypeScript types
- Well-structured component architecture
- Reusable custom hooks
- Clear separation of concerns
- Code documentation and comments

### Security
- Environment variables for sensitive configuration
- Secure JWT token handling
- Password hashing via Supabase Auth
- HTTPS enforcement
- XSS protection via React
- CSRF protection via token validation
- Auto-logout on inactivity

## [0.1.0] - 2025-10-10

### Added - Beta Release
- Basic bullet journal functionality
- Task creation and management
- Simple authentication
- LocalStorage persistence

---

## Version History Summary

- **v1.0.0** - Full-featured release with events, scheduling, search, and authentication
- **v0.1.0** - Initial beta release with basic features

## Upgrade Notes

### Upgrading to v1.0.0

#### New Features Available
- Event scheduling with categories and recurrence
- Enhanced search and filtering
- Keyboard shortcuts for productivity
- Migration tracking badges

#### Breaking Changes
None - v1.0.0 is backward compatible with v0.1.0 data

#### Migration Steps
1. Pull the latest code
2. Run `npm install` to update dependencies
3. No database migrations required (using KV store)
4. Existing user data will be preserved

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this changelog.

## Links

- [Repository](https://github.com/Yuvraj198920/Bullet-Journal)
- [Issues](https://github.com/Yuvraj198920/Bullet-Journal/issues)
- [Releases](https://github.com/Yuvraj198920/Bullet-Journal/releases)
- [Documentation](https://github.com/Yuvraj198920/Bullet-Journal/wiki)

---

*This changelog is maintained by the project maintainers and community contributors.*
