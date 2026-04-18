-- Add created_by to tasks table
alter table tasks add column if not exists created_by uuid references auth.users;

-- Backfill existing tasks with workspace owner
update tasks t
set created_by = w.created_by
from workspaces w
where t.workspace_id = w.id
  and t.created_by is null;

-- Make it required going forward
alter table tasks alter column created_by set not null;

-- Replace permissive update/delete policies with creator-only
drop policy if exists "workspace members can update tasks" on tasks;
drop policy if exists "workspace members can delete tasks" on tasks;
drop policy if exists "Workspace members can update tasks" on tasks;
drop policy if exists "Workspace members can delete tasks" on tasks;

create policy "only creator can update tasks"
  on tasks for update
  using (
    created_by = auth.uid()
    and exists (
      select 1 from workspace_users
      where workspace_users.workspace_id = tasks.workspace_id
        and workspace_users.user_id = auth.uid()
    )
  );

create policy "only creator can delete tasks"
  on tasks for delete
  using (
    created_by = auth.uid()
    and exists (
      select 1 from workspace_users
      where workspace_users.workspace_id = tasks.workspace_id
        and workspace_users.user_id = auth.uid()
    )
  );
