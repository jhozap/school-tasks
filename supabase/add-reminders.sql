create table reminders (
  id          uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  created_by  uuid references auth.users not null,
  title       text not null,
  notes       text,
  remind_at   timestamptz not null,
  created_at  timestamptz default now()
);

alter table reminders enable row level security;

create policy "workspace members can view reminders"
  on reminders for select
  using (exists (
    select 1 from workspace_users
    where workspace_users.workspace_id = reminders.workspace_id
      and workspace_users.user_id = auth.uid()
  ));

create policy "only creator can insert reminders"
  on reminders for insert
  with check (created_by = auth.uid());

create policy "only creator can delete reminders"
  on reminders for delete
  using (created_by = auth.uid());
