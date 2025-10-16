# Contributing to Bullet Journal

First off, thank you for considering contributing to Bullet Journal! It's people like you that make this project such a great tool for the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
  - [Pull Requests](#pull-requests)
- [Style Guides](#style-guides)
  - [Git Commit Messages](#git-commit-messages)
  - [TypeScript Style Guide](#typescript-style-guide)
  - [Component Guidelines](#component-guidelines)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

**How to Submit a Good Bug Report:**

- **Use a clear and descriptive title** for the issue
- **Describe the exact steps to reproduce the problem** in as much detail as possible
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** after following the steps
- **Explain which behavior you expected to see instead** and why
- **Include screenshots or animated GIFs** if possible
- **Include your environment details**: OS, browser, version, etc.

**Bug Report Template:**
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. macOS 13.0]
 - Browser: [e.g. Chrome 120]
 - Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description** of the suggested enhancement
- **Provide specific examples** to demonstrate the steps
- **Describe the current behavior** and **explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful** to most users
- **List some other applications where this enhancement exists** (if applicable)

**Feature Request Template:**
```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

### Your First Code Contribution

Unsure where to begin contributing? You can start by looking through these issues:

- **good-first-issue** - Issues that should only require a few lines of code
- **help-wanted** - Issues that are a bit more involved than beginner issues
- **documentation** - Improvements to documentation

### Pull Requests

Please follow these steps for your contribution:

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** in a new git branch:
   ```bash
   git checkout -b feature/my-new-feature
   ```
3. **Follow our coding standards** (see Style Guides below)
4. **Test your changes** thoroughly
5. **Commit your changes** using descriptive commit messages
6. **Push to your fork** and submit a pull request to the `main` branch

**Pull Request Guidelines:**

- Fill in the required PR template
- Include screenshots and animated GIFs in your pull request whenever possible
- Follow the TypeScript and React style guides
- Include thoughtfully-worded, well-structured tests if applicable
- Document new code based on the existing documentation style
- End all files with a newline
- Avoid platform-dependent code

**Pull Request Template:**
```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## How Has This Been Tested?
Please describe the tests that you ran to verify your changes.

- [ ] Test A
- [ ] Test B

## Checklist:
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable):
Add screenshots to help explain your changes.

## Related Issues:
Fixes #(issue number)
```

## Style Guides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- Consider starting the commit message with an applicable emoji:
  - 🎨 `:art:` - Improving structure/format of the code
  - ⚡ `:zap:` - Improving performance
  - 🔥 `:fire:` - Removing code or files
  - 🐛 `:bug:` - Fixing a bug
  - ✨ `:sparkles:` - Introducing new features
  - 📝 `:memo:` - Writing docs
  - 🚀 `:rocket:` - Deploying stuff
  - 💄 `:lipstick:` - Updating UI and style files
  - ✅ `:white_check_mark:` - Adding tests
  - 🔒 `:lock:` - Fixing security issues
  - ♿ `:wheelchair:` - Improving accessibility
  - 🔧 `:wrench:` - Changing configuration files
  - 🌐 `:globe_with_meridians:` - Internationalization and localization
  - ✏️ `:pencil2:` - Fixing typos

**Example:**
```
✨ Add recurring event support to AddEventDialog

- Implement daily, weekly, monthly, yearly patterns
- Add UI for selecting recurrence pattern
- Update event creation to handle recurring metadata
- Add tests for recurring event logic

Fixes #123
```

### TypeScript Style Guide

- Use TypeScript for all new code
- Prefer `interface` over `type` for object shapes
- Use meaningful variable names
- Use `const` for variables that won't be reassigned
- Prefer arrow functions for callbacks
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Export types/interfaces that are used across files

**Example:**
```typescript
// Good
interface BulletEntryData {
  id: string;
  date: string;
  type: EntryType;
  content: string;
  state: TaskState;
}

const handleSubmit = () => {
  if (content.trim()) {
    onAdd(content, selectedType);
  }
};

// Avoid
type BulletEntryData = {
  id: string;
  date: string;
  type: EntryType;
  content: string;
  state: TaskState;
}

function handleSubmit() {
  if (content.trim()) {
    onAdd(content, selectedType);
  }
}
```

### Component Guidelines

**React Component Structure:**

1. Imports (React, external libraries, internal components, types, styles)
2. Type/Interface definitions
3. Component definition
4. State and hooks
5. Event handlers
6. Effects
7. Helper functions
8. Render logic

**Example:**
```typescript
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { MyComponentProps } from "./types";

export function MyComponent({ prop1, prop2 }: MyComponentProps) {
  // State
  const [count, setCount] = useState(0);

  // Event handlers
  const handleClick = () => {
    setCount(count + 1);
  };

  // Effects
  useEffect(() => {
    console.log("Count changed:", count);
  }, [count]);

  // Render
  return (
    <div>
      <p>Count: {count}</p>
      <Button onClick={handleClick}>Increment</Button>
    </div>
  );
}
```

**Component Best Practices:**

- Keep components small and focused on a single responsibility
- Use composition over inheritance
- Extract reusable logic into custom hooks
- Use shadcn/ui components when possible
- Follow accessibility best practices (ARIA labels, keyboard navigation)
- Use semantic HTML elements

**Styling Guidelines:**

- Use Tailwind CSS utility classes
- Do NOT add custom font-size, font-weight, or line-height classes unless specifically needed
- Use the design tokens from `styles/globals.css`
- Keep components responsive (mobile-first approach)
- Use shadcn/ui variants for consistent styling

## Development Setup

1. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Bullet-Journal.git
   cd Bullet-Journal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Create a feature branch:**
   ```bash
   git checkout -b feature/my-feature
   ```

## Project Structure

Understanding the project structure will help you contribute effectively:

```
├── App.tsx                    # Main app component with routing and state
├── components/
│   ├── DailyLog.tsx          # Daily view component
│   ├── MonthlyLog.tsx        # Monthly calendar view
│   ├── FutureLog.tsx         # Yearly planning view
│   ├── Collections.tsx       # Collections management
│   ├── IndexNavigation.tsx   # Index/search component
│   ├── BulletEntry.tsx       # Individual entry component
│   ├── AddEntryDialog.tsx    # Dialog for adding entries
│   ├── AddEventDialog.tsx    # Dialog for adding events
│   ├── auth/                 # Authentication components
│   └── ui/                   # shadcn/ui components
├── lib/
│   └── auth.tsx              # Authentication logic
├── styles/
│   └── globals.css           # Global styles and tokens
├── supabase/
│   └── functions/server/     # Backend edge functions
└── utils/
    └── supabase/             # Supabase utilities
```

**Key Files:**

- `App.tsx` - Main application state and routing
- `components/BulletEntry.tsx` - Core entry rendering logic
- `lib/auth.tsx` - All authentication functions
- `styles/globals.css` - Design system tokens

## Testing

Currently, the project doesn't have automated tests, but we're planning to add them. When writing tests:

- Test user interactions, not implementation details
- Use React Testing Library for component tests
- Mock external dependencies (Supabase, etc.)
- Aim for meaningful test coverage

## Questions?

Feel free to ask questions in:
- **GitHub Discussions** for general questions
- **GitHub Issues** for specific problems or bugs
- **Pull Request comments** for code-specific questions

## Recognition

Contributors will be recognized in the [AUTHORS.md](AUTHORS.md) file and GitHub's contributor list.

Thank you for contributing! 🎉
