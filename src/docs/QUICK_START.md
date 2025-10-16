# Quick Start Guide

Get your Bullet Journal app up and running in 5 minutes!

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **npm, yarn, or pnpm** package manager
- A **Supabase account** ([Sign up free](https://supabase.com))
- A **code editor** (VS Code recommended)
- **Git** installed

## Step 1: Clone the Repository

```bash
git clone https://github.com/Yuvraj198920/Bullet-Journal.git
cd Bullet-Journal
```

## Step 2: Install Dependencies

Choose your preferred package manager:

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

This will install all required dependencies including React, TypeScript, Tailwind CSS, and shadcn/ui components.

## Step 3: Set Up Supabase

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in or create an account
4. Click "New Project"
5. Fill in project details:
   - **Name**: Bullet Journal (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine for development

### Get Your API Keys

1. Once your project is created, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` in your editor and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. Save the file

**⚠️ Important**: Never commit `.env.local` to Git! It's already in `.gitignore`.

## Step 5: Run the Development Server

Start the application:

```bash
npm run dev
```

You should see output like:

```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 6: Open in Browser

1. Open your browser
2. Navigate to `http://localhost:5173`
3. You should see the Bullet Journal login page!

## Step 7: Create Your First Account

1. Click **"Create Account"**
2. Enter your email and password
3. Add your name (optional)
4. Click **"Sign Up"**
5. You'll be automatically logged in!

## Step 8: Start Journaling! 🎉

### Create Your First Entry

1. You'll start on the **Daily Log** page
2. Click **"Add Entry"** button
3. Choose entry type:
   - **Task** (•) - For to-dos
   - **Event** (○) - For scheduled items
   - **Note** (-) - For general notes
4. Type your content
5. Click **"Add"**

### Create Your First Event

1. Click **"Add Event"** button
2. Enter event description
3. Set date and time
4. Choose a category (Meeting, Appointment, etc.)
5. Optionally set as recurring
6. Click **"Add Event"**

### Try Other Features

- **Navigate Days**: Use arrow buttons or `Ctrl/Cmd + ←/→`
- **Search**: Press `Ctrl/Cmd + /` to focus search
- **Filter**: Click filter icon to filter by status
- **Migrate Tasks**: Click on a task and choose "Migrate"
- **Add Signifiers**: Mark tasks as priority (*), inspiration (!), or explore (👁️)

## Next Steps

### Explore the Application

- **Monthly Log**: See your month at a glance with calendar view
- **Future Log**: Plan ahead with yearly overview
- **Collections**: Create custom lists (books to read, goals, etc.)
- **Index**: Quick navigation to any date or collection

### Keyboard Shortcuts

Learn these shortcuts for faster journaling:

- `Ctrl/Cmd + T` - Quick entry creation
- `Ctrl/Cmd + /` - Focus search
- `Ctrl/Cmd + ←` - Previous day
- `Ctrl/Cmd + →` - Next day
- `Ctrl/Cmd + Enter` - Submit forms

### Customize Your Experience

- Add tasks with priority signifiers (*)
- Create recurring events for regular meetings
- Use collections for ongoing projects
- Tag important entries with inspiration (!)
- Migrate incomplete tasks to future dates

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, you can specify a different port:

```bash
npm run dev -- --port 3000
```

### Build Errors

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   ```

### Supabase Connection Issues

1. **Check your credentials**: Make sure URL and keys are correct in `.env.local`
2. **Check Supabase dashboard**: Ensure your project is running (not paused)
3. **Check console**: Open browser DevTools (F12) and check for errors
4. **Restart dev server**: Stop (Ctrl+C) and run `npm run dev` again

### Authentication Not Working

1. **Email confirmation**: By default, email confirmation is disabled in development
2. **Check Supabase Auth settings**: Go to Authentication → Settings
3. **Clear browser data**: Clear cookies and localStorage
4. **Check console**: Look for authentication errors in DevTools

### "Cannot GET /" Error

This happens if you try to navigate to a route directly. The app uses client-side routing. Try:
1. Go back to `http://localhost:5173`
2. Navigate using the app's UI

## Development Tips

### Code Organization

```
components/          # React components
├── DailyLog.tsx    # Daily view
├── MonthlyLog.tsx  # Monthly view
├── BulletEntry.tsx # Entry component
├── auth/           # Auth components
└── ui/             # shadcn/ui components

lib/                # Utilities and helpers
├── auth.tsx        # Auth functions

styles/             # Global styles
└── globals.css     # Tailwind config

App.tsx             # Main app component
```

### Making Changes

1. **Edit a component**: Changes hot-reload instantly
2. **Add a new component**: Create in `/components`
3. **Modify styles**: Edit Tailwind classes in components
4. **Change global styles**: Edit `/styles/globals.css`

### Testing Your Changes

1. Test in multiple browsers (Chrome, Firefox, Safari)
2. Test on mobile (use DevTools device emulation)
3. Test authentication flows
4. Test data persistence (refresh page)

## Building for Production

When you're ready to deploy:

```bash
# Build the application
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` folder.

## Need Help?

- **📚 Read the docs**: Check [README.md](../README.md) for detailed information
- **💬 Ask questions**: Use [GitHub Discussions](https://github.com/Yuvraj198920/Bullet-Journal/discussions)
- **🐛 Report bugs**: Open an [issue](https://github.com/Yuvraj198920/Bullet-Journal/issues)
- **📖 Contributing**: See [CONTRIBUTING.md](../CONTRIBUTING.md)

## What's Next?

### For Users

- Explore all features
- Customize your workflow
- Provide feedback
- Share with friends!

### For Developers

- Check the [CONTRIBUTING.md](../CONTRIBUTING.md) guide
- Look for [good first issues](https://github.com/Yuvraj198920/Bullet-Journal/labels/good-first-issue)
- Join discussions about new features
- Submit your first pull request!

### For Designers

- Help with UI/UX improvements
- Create mockups for new features
- Suggest theme ideas
- Contribute to design documentation

---

**Congratulations! You're now ready to use and develop the Bullet Journal app! 🎉**

If you run into any issues not covered here, please [open an issue](https://github.com/Yuvraj198920/Bullet-Journal/issues) or start a [discussion](https://github.com/Yuvraj198920/Bullet-Journal/discussions).

Happy journaling! 📓✨
