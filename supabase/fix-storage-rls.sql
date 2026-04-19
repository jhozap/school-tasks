-- Fix: Storage bucket lacks workspace isolation
--
-- Current policies only check auth.role() = 'authenticated', meaning any
-- authenticated user can read/write/delete files from any workspace.
--
-- Fix: extract workspaceId from the storage path prefix and verify the
-- caller is a member of that workspace. Path format: {workspaceId}/{taskId}/{file}

create or replace function storage_object_workspace_member(p_name text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
begin
  begin
    v_workspace_id := (split_part(p_name, '/', 1))::uuid;
  exception when others then
    return false;
  end;

  return exists (
    select 1 from workspace_users
    where workspace_id = v_workspace_id
      and user_id = auth.uid()
  );
end;
$$;

grant execute on function storage_object_workspace_member(text) to authenticated;

-- Replace permissive storage policies
drop policy if exists "members can upload attachments" on storage.objects;
drop policy if exists "members can view attachments"   on storage.objects;
drop policy if exists "members can delete attachments" on storage.objects;

create policy "members can upload attachments"
  on storage.objects for insert
  with check (
    bucket_id = 'attachments'
    and auth.role() = 'authenticated'
    and storage_object_workspace_member(name)
  );

create policy "members can view attachments"
  on storage.objects for select
  using (
    bucket_id = 'attachments'
    and auth.role() = 'authenticated'
    and storage_object_workspace_member(name)
  );

create policy "members can delete attachments"
  on storage.objects for delete
  using (
    bucket_id = 'attachments'
    and auth.role() = 'authenticated'
    and storage_object_workspace_member(name)
  );
