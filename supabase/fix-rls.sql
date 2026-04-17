-- Fix infinite recursion in RLS policies

-- Drop recursive policies
drop policy if exists "members can view workspace" on workspaces;
drop policy if exists "members can view workspace_users" on workspace_users;
drop policy if exists "workspace owner can manage members" on workspace_users;

-- workspace_users: simple, no recursion
create policy "users can view own memberships"
  on workspace_users for select
  using (user_id = auth.uid());

create policy "users can insert own memberships"
  on workspace_users for insert
  with check (user_id = auth.uid());

create policy "users can delete own memberships"
  on workspace_users for delete
  using (user_id = auth.uid());

-- workspaces: now safe because workspace_users policy no longer recurses
create policy "members can view workspace"
  on workspaces for select
  using (
    created_by = auth.uid()
    or exists (
      select 1 from workspace_users
      where workspace_users.workspace_id = workspaces.id
      and workspace_users.user_id = auth.uid()
    )
  );
