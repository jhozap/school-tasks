-- Fix: workspace_invitations RLS vulnerability
--
-- Problem 1: "anyone can read invitation by token" used `using (true)` — any
--            authenticated user could list all invitations and harvest tokens.
-- Problem 2: Invitees (non-owners) cannot UPDATE workspace_invitations, so
--            used_at is NEVER marked — invitations were reusable forever.
--
-- Fix: drop the permissive SELECT policy and replace both read + accept flows
-- with SECURITY DEFINER functions that enforce token-only access atomically.

-- 1. Drop the vulnerable policy
drop policy if exists "anyone can read invitation by token" on workspace_invitations;

-- 2. Read an invitation by token
--    Works for unauthenticated users (join page checks before auth redirect).
--    Returns nothing unless the exact token matches — no enumeration possible.
create or replace function get_invitation_by_token(p_token uuid)
returns table (
  id             uuid,
  workspace_id   uuid,
  expires_at     timestamptz,
  used_at        timestamptz,
  workspace_name text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    wi.id,
    wi.workspace_id,
    wi.expires_at,
    wi.used_at,
    w.name as workspace_name
  from workspace_invitations wi
  join workspaces w on w.id = wi.workspace_id
  where wi.token = p_token;
end;
$$;

grant execute on function get_invitation_by_token(uuid) to anon, authenticated;

-- 3. Accept an invitation atomically
--    Runs as definer so it can mark used_at even though the caller is not the
--    workspace owner. Uses SELECT FOR UPDATE to prevent double-acceptance races.
create or replace function accept_invitation(p_token uuid, p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv workspace_invitations%rowtype;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    return jsonb_build_object('error', 'No autenticado');
  end if;

  select * into v_inv
  from workspace_invitations
  where token = p_token
  for update;

  if not found then
    return jsonb_build_object('error', 'Invitación no encontrada');
  end if;

  if v_inv.used_at is not null then
    return jsonb_build_object('error', 'Esta invitación ya fue usada');
  end if;

  if v_inv.expires_at < now() then
    return jsonb_build_object('error', 'Esta invitación expiró');
  end if;

  insert into workspace_users (workspace_id, user_id)
  values (v_inv.workspace_id, p_user_id)
  on conflict do nothing;

  update workspace_invitations
  set used_at = now()
  where id = v_inv.id;

  return jsonb_build_object('workspace_id', v_inv.workspace_id);
end;
$$;

grant execute on function accept_invitation(uuid, uuid) to authenticated;
