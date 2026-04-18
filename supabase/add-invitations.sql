create table workspace_invitations (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  created_by   uuid references auth.users not null,
  token        uuid not null default gen_random_uuid(),
  expires_at   timestamptz not null default (now() + interval '7 days'),
  used_at      timestamptz,
  created_at   timestamptz default now()
);

create unique index on workspace_invitations(token);

alter table workspace_invitations enable row level security;

create policy "owner can manage invitations"
  on workspace_invitations for all
  using (
    exists (
      select 1 from workspaces
      where workspaces.id = workspace_invitations.workspace_id
      and workspaces.created_by = auth.uid()
    )
  );

create policy "anyone can read invitation by token"
  on workspace_invitations for select
  using (true);
