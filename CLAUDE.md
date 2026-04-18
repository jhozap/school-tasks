# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint check
```

No test runner is configured.

## Architecture

Full-stack task management app built with **Next.js App Router**, **Supabase** (Postgres + Auth + Storage), and **React 19**. There is no ORM — all DB access uses the Supabase JS client directly.

**Request flow:** React component → Server Action → Supabase server client → PostgreSQL (Row-Level Security enforces authorization at the DB layer).

**Auth & session:** Supabase Auth (email/password). Sessions are cookie-based. The active workspace is tracked via a separate `active_workspace_id` cookie. `src/proxy.ts` (Next.js middleware) redirects unauthenticated users to `/login`.

**State management:** No client-side state store. Mutations go through Server Actions and invalidate SSR cache via `revalidatePath`.

## Key Structure

```
src/
  app/
    (app)/              # Protected routes — main app UI
      actions.ts        # Task CRUD server actions
      workspace-actions.ts
      attachment-actions.ts
    login/actions.ts    # signIn, logout
    register/actions.ts # signUp + initial workspace creation
    join/[token]/       # Invitation acceptance flow
  components/
    ui/                 # shadcn/ui primitives
    tasks/              # TaskList, TaskCard, TaskModal
    layout/             # WorkspaceSwitcher
  lib/
    supabase/
      client.ts         # Browser Supabase client
      server.ts         # Server-side Supabase client (uses cookies)
    workspace.ts        # Active workspace cookie helpers
  types/                # TypeScript interfaces (Task, Attachment, Workspace, …)
  proxy.ts              # Auth middleware

supabase/
  schema.sql            # Base tables + RLS policies
  add-invitations.sql   # workspace_invitations table
  fix-rls.sql           # RLS recursion fixes (apply after schema)
```

## Database Schema

Tables: `workspaces`, `workspace_users` (junction), `tasks`, `attachments`, `workspace_invitations` (token-based, 7-day expiry).

Row-Level Security is enabled on every table — workspace members can only access data within their own workspaces. Migrations are plain SQL files applied manually to the Supabase instance in order: `schema.sql` → `add-invitations.sql` → `fix-rls.sql`.

## Environment

Requires `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
