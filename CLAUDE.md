This is a beginner-friendly React + Vite project.

Tech stack:
- React (JavaScript, not TypeScript)
- React Router
- dnd-kit for drag and drop
- localStorage for persistence

Rules:
- Keep components small and readable
- Do not overcomplicate logic
- Use functional components
- Avoid advanced patterns unless necessary
- Prefer simple data structures over abstract configurations
- Keep props explicit and easy to understand
- Do not introduce global state yet
- Keep state updates simple and explicit
- Avoid complex state patterns
- Do not introduce reducers or context yet
- Keep UI state simple (modals, selections)
- Avoid deeply nested state structures
- Prefer updating state in a clear and readable way
- When implementing drag and drop, keep logic simple and readable
- Do not over-abstract drag and drop logic
- Keep state updates explicit and easy to follow
- Use localStorage for persistence
- Keep persistence logic simple
- Save and load data in a clear and explicit way
- Use simple array methods for calculations (map, filter, reduce)
- Keep calculations readable and not overly optimized
- Focus on good user experience, not just functionality
- Keep UI clean and consistent
- Prefer simple and intuitive interactions
- Use simple confirmation dialogs for destructive actions
- Avoid accidental data loss
- Use Tailwind CSS for UI styling
- Keep the design clean, modern, and minimal
- Use consistent spacing, rounded corners, and subtle shadows
- Do not overdesign or add flashy effects
- Keep Tailwind class usage readable
- New family members should use the same shared data structure as existing members
- Keep creation flows simple and consistent with the rest of the app
- Destructive actions should require confirmation
- Reuse existing modal patterns when possible
- Keep deletion flows safe and predictable
- When editing existing entities, preserve ids and nested data
- Only update the fields that are explicitly editable
- Reuse existing UI patterns for forms and modals
- Family members should have a simple visual identity using avatar initials and a color accent
- Keep member cards clean, readable, and consistent
- Action buttons like Edit and Delete should be clear but not visually aggressive
- Prefer predefined avatar color options over free-form color input
- Keep visual customization simple and consistent
- Reuse saved member colors across the app

## Task Period System

Each task belongs to a specific time period:

- Daily → periodKey: YYYY-MM-DD
- Weekly → periodKey: YYYY-W##
- Monthly → periodKey: YYYY-MM

This determines where the task appears in the UI.

## Task Templates

Each family member has:
- dailyTemplates
- weeklyTemplates
- monthlyTemplates

Templates define recurring tasks.

Templates are NOT tasks.

When a period is viewed:
- tasks are automatically generated from templates
- generated tasks are created in "todo" status

Generated task structure:
- sourceTemplateId
- isGenerated: true

## Template Auto-Generation Rules

When a user views a period:

- Daily → generate tasks from dailyTemplates
- Weekly → generate tasks from weeklyTemplates
- Monthly → generate tasks from monthlyTemplates

Rules:
- Do NOT create duplicates
- Check using:
  - sourceTemplateId
  - periodType
  - periodKey

Generated tasks are persisted in localStorage.

## MemberPage Behavior

MemberPage uses a tab-based layout:

- Daily
- Weekly
- Monthly

Only ONE board is visible at a time.

Each tab has:
- its own period selector
- its own task list

Daily includes a mini calendar.
Weekly uses a week navigator.
Monthly uses a month navigator.

## HistoryPage Behavior

HistoryPage allows reviewing tasks by period:

Modes:
- Day → shows only daily tasks
- Week → shows only weekly tasks
- Month → shows only monthly tasks

Day view uses a calendar.

Results are displayed as a timeline/activity feed.

## Task Types

There are two types of tasks:

1. Generated tasks
   - created from templates
   - have isGenerated: true

2. Manual tasks
   - created by user
   - tied to a specific period

Both types coexist in the same board.

## Development Rules

- Keep logic simple and beginner-friendly
- Do not introduce complex abstractions unless necessary
- Avoid external libraries when possible
- Prefer clarity over cleverness

## Missed Task Logic

Every task has an implicit deadline based on its period:

- Daily task → deadline is the end of that day
- Weekly task → deadline is the end of that week
- Monthly task → deadline is the end of that month

A task is considered missed if:
- it is not in "done" status
- and its period has already passed

This rule applies to:
- generated tasks
- manual tasks

## Missed Tasks in Statistics

Missed tasks are a derived state, not a task status.

A task is missed if:
- it is not done
- and its period has already passed

Missed tasks should be visible in statistics.

However:
- completion percentage logic must remain unchanged
- streak logic must remain unchanged
- existing status values stay the same