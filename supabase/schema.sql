-- Workspaces
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users not null,
  created_at timestamptz default now()
);

-- Workspace members
create table workspace_users (
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references auth.users on delete cascade,
  primary key (workspace_id, user_id)
);

-- Tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  title text not null,
  description text,
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  created_at timestamptz default now()
);

-- Attachments
create table attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade not null,
  file_url text not null,
  file_type text not null,
  file_name text not null,
  created_at timestamptz default now()
);

-- RLS
alter table workspaces enable row level security;
alter table workspace_users enable row level security;
alter table tasks enable row level security;
alter table attachments enable row level security;

-- Policies: workspaces
create policy "members can view workspace"
  on workspaces for select
  using (
    exists (
      select 1 from workspace_users
      where workspace_users.workspace_id = workspaces.id
      and workspace_users.user_id = auth.uid()
    )
  );

create policy "creator can manage workspace"
  on workspaces for all
  using (created_by = auth.uid());

-- Policies: workspace_users
create policy "members can view workspace_users"
  on workspace_users for select
  using (
    exists (
      select 1 from workspace_users wu
      where wu.workspace_id = workspace_users.workspace_id
      and wu.user_id = auth.uid()
    )
  );

create policy "workspace owner can manage members"
  on workspace_users for all
  using (
    exists (
      select 1 from workspaces
      where workspaces.id = workspace_users.workspace_id
      and workspaces.created_by = auth.uid()
    )
  );

-- Policies: tasks
create policy "members can view tasks"
  on tasks for select
  using (
    exists (
      select 1 from workspace_users
      where workspace_users.workspace_id = tasks.workspace_id
      and workspace_users.user_id = auth.uid()
    )
  );

create policy "members can manage tasks"
  on tasks for all
  using (
    exists (
      select 1 from workspace_users
      where workspace_users.workspace_id = tasks.workspace_id
      and workspace_users.user_id = auth.uid()
    )
  );

-- Policies: attachments
create policy "members can view attachments"
  on attachments for select
  using (
    exists (
      select 1 from tasks
      join workspace_users on workspace_users.workspace_id = tasks.workspace_id
      where tasks.id = attachments.task_id
      and workspace_users.user_id = auth.uid()
    )
  );

create policy "members can manage attachments"
  on attachments for all
  using (
    exists (
      select 1 from tasks
      join workspace_users on workspace_users.workspace_id = tasks.workspace_id
      where tasks.id = attachments.task_id
      and workspace_users.user_id = auth.uid()
    )
  );

-- Storage bucket for attachments
insert into storage.buckets (id, name, public) values ('attachments', 'attachments', false);

create policy "members can upload attachments"
  on storage.objects for insert
  with check (bucket_id = 'attachments' and auth.role() = 'authenticated');

create policy "members can view attachments"
  on storage.objects for select
  using (bucket_id = 'attachments' and auth.role() = 'authenticated');

create policy "members can delete attachments"
  on storage.objects for delete
  using (bucket_id = 'attachments' and auth.role() = 'authenticated');
