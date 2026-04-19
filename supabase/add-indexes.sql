-- Performance: add missing indexes on FK columns used in RLS subqueries,
-- joins, and ORDER BY clauses. All use IF NOT EXISTS for idempotency.

-- tasks
create index if not exists tasks_workspace_id_idx          on tasks(workspace_id);
create index if not exists tasks_workspace_id_due_date_idx on tasks(workspace_id, due_date);

-- attachments
create index if not exists attachments_task_id_idx on attachments(task_id);

-- reminders
create index if not exists reminders_workspace_id_idx          on reminders(workspace_id);
create index if not exists reminders_workspace_id_remind_at_idx on reminders(workspace_id, remind_at);
create index if not exists reminders_created_by_idx            on reminders(created_by);

-- workspace_invitations
create index if not exists workspace_invitations_workspace_id_idx on workspace_invitations(workspace_id);

-- workspaces
create index if not exists workspaces_created_by_idx on workspaces(created_by);

-- workspace_users (both FK sides — heavily queried in RLS policies)
create index if not exists workspace_users_workspace_id_idx on workspace_users(workspace_id);
create index if not exists workspace_users_user_id_idx      on workspace_users(user_id);
