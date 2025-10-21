# Bullet Journal Web Application

A modern, feature-rich bullet journal web application built with React, TypeScript, and Supabase. This digital implementation of the Bullet Journal Method® helps you organize tasks, events, and notes with powerful features like migration tracking, search, filtering, and user authentication.

![Bullet Journal](https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&h=400&fit=crop)

## 🌟 Features

### Core Bullet Journaling
- **Daily Log**: Create and manage daily tasks, events, and notes with rapid logging
- **Monthly Log**: Calendar view of all entries for the month with visual indicators
- **Future Log**: Plan ahead with yearly overview across all 12 months
- **Collections**: Create custom lists for books, goals, habits, and more
- **Index**: Quick navigation to any date or collection

### Task Management
- **Multiple Entry Types**: Tasks (•), Events (○), and Notes (-)
- **Task States**: Incomplete, Complete, Migrated, Scheduled, Cancelled
- **Event States**: Upcoming, Completed, Cancelled, Migrated, Missed
- **Migration Tracking**: Visual badges showing how many times tasks have been migrated
- **Signifiers**: Priority (*), Inspiration (!), Explore (👁️)

### Event Scheduling
- **Time-based Events**: Set start and end times for events
- **All-day Events**: Mark events that span the entire day
- **Event Categories**: Color-coded categories (Meeting, Appointment, Birthday, Deadline, Other)
- **Recurring Events**: Daily, Weekly, Monthly, or Yearly patterns
- **Event Preview**: See how your event will look before creating it

### Enhanced Productivity
- **Search**: Full-text search across all entries
- **Filter by Status**: Filter tasks by completion state
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd + T` - Quick entry creation
  - `Ctrl/Cmd + /` - Focus search
  - `Ctrl/Cmd + ←/→` - Navigate days
  - `Ctrl/Cmd + Enter` - Submit forms
- **Character Limits**: 500 characters for tasks/notes, prevent overly long entries
- **Smart Navigation**: Jump to today, navigate between days/months/years

### User Authentication
- **Email/Password Registration**: Secure account creation
- **Login System**: Persistent sessions with automatic token refresh
- **Password Reset**: Request password reset via email
- **Email Verification**: Automatic confirmation for new accounts
- **Auto-logout**: Security feature after 30 minutes of inactivity
- **Per-user Data**: Each user's journal is private and isolated

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS v4.0** for styling
- **shadcn/ui** for UI components
- **Lucide React** for icons
- **Day.js** for date manipulation (if used)

### Backend
- **Supabase** for backend services
  - Authentication (email/password, social login ready)
  - PostgreSQL database with key-value storage
  - Edge Functions (Hono web server)
  - Row Level Security (RLS)

### Development
- **Vite** for build tooling
- **ESLint** for code quality
- **TypeScript** for type safety

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Supabase account (free tier available)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Yuvraj198920/Bullet-Journal.git
   cd Bullet-Journal
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Create a `.env.local` file (see Environment Variables below)

4. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open in browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## 🗄️ Database Setup

The application uses Supabase's built-in key-value store table (`kv_store_f53d7c3b`). No additional database setup or migrations are required for basic functionality.

For authentication:
- Email confirmation is automatically handled
- User metadata is stored in Supabase Auth

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only) | For backend features |

**⚠️ Security Note**: Never commit `.env.local` or expose service role keys in frontend code.

## 📖 Usage Guide

### Getting Started
1. **Register an Account**: Click "Create Account" and enter your email and password
2. **Login**: Sign in with your credentials
3. **Create Your First Entry**: Click "Add Entry" or press `Ctrl+T`
4. **Choose Entry Type**: Select Task, Event, or Note
5. **Start Journaling**: Add content and signifiers as needed

### Creating Events
1. Click "Add Event" button in Daily Log
2. Enter event description
3. Set date and time (or mark as all-day)
4. Choose a category (Meeting, Appointment, Birthday, Deadline, Other)
5. Optionally set as recurring event
6. Preview and confirm

### Migrating Tasks
1. Click on a task to open the action menu
2. Select "Migrate" from the state options
3. Choose a new date for the task
4. The task will show a migration badge with count

### Search and Filter
1. Use the search bar to find entries by content
2. Click the filter icon to filter by task status
3. Combine search and filters for precise results
4. Clear filters with the "Clear all" button

### Keyboard Shortcuts
- Navigate faster with built-in keyboard shortcuts
- Press shortcuts while not in an input field
- See hints at the bottom of Daily Log

## 🏗️ Project Structure

```
├── App.tsx                      # Main application component
├── components/
│   ├── DailyLog.tsx            # Daily view with entries
│   ├── MonthlyLog.tsx          # Monthly calendar view
│   ├── FutureLog.tsx           # Yearly planning view
│   ├── Collections.tsx         # Custom lists/collections
│   ├── IndexNavigation.tsx     # Quick navigation index
│   ├── BulletEntry.tsx         # Individual entry component
│   ├── AddEntryDialog.tsx      # Task/note creation dialog
│   ├── AddEventDialog.tsx      # Event creation dialog
│   ├── auth/                   # Authentication components
│   └── ui/                     # shadcn/ui components
├── lib/
│   └── auth.tsx                # Authentication utilities
├── styles/
│   └── globals.css             # Global styles and Tailwind
├── supabase/
│   └── functions/server/       # Supabase Edge Functions
└── utils/
    └── supabase/               # Supabase client utilities
```

## 🤝 Contributing

We welcome contributions from the community! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Bug Reports & Feature Requests

Please use GitHub Issues to report bugs or request features:
- **Bug Report**: Use the bug report template
- **Feature Request**: Use the feature request template
- **Question**: Use GitHub Discussions

## 🗺️ Roadmap

### Completed ✅
- [x] Core bullet journaling (Daily, Monthly, Future Log)
- [x] Task states and migration tracking
- [x] User authentication system
- [x] Signifiers (priority, inspiration, explore)
- [x] Search and filtering
- [x] Event scheduling with categories
- [x] Keyboard shortcuts

### In Progress 🚧
- [ ] Monthly migration wizard
- [ ] Responsive mobile interface
- [ ] Touch gestures and mobile optimization

### Planned 📋
- [ ] Export to PDF
- [ ] Themes and customization
- [ ] Habit tracking
- [ ] Goal tracking and progress
- [ ] Data backup and sync
- [ ] Collaborative collections
- [ ] Calendar integrations
- [ ] Mobile apps (iOS/Android)

See [Projects](https://github.com/Yuvraj198920/Bullet-Journal/projects) for detailed roadmap.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Bullet Journal Method®** by Ryder Carroll - The original analog system
- **shadcn/ui** - Beautiful, accessible component library
- **Supabase** - Open source Firebase alternative
- **Lucide** - Icon library
- All our contributors and supporters!

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/Yuvraj198920/Bullet-Journal/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/Yuvraj198920/Bullet-Journal/discussions)
- **Issues**: [GitHub Issues](https://github.com/Yuvraj198920/Bullet-Journal/issues)

## 🔒 Security

Please review our [Security Policy](SECURITY.md) for reporting vulnerabilities.

---

**Note**: This is a digital implementation inspired by the Bullet Journal Method®. Bullet Journal® is a registered trademark of Ryder Carroll.

Built with ❤️ by the community
