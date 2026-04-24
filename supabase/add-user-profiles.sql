create table user_profiles (
  user_id    uuid primary key references auth.users on delete cascade,
  is_paid    boolean not null default false,
  updated_at timestamptz default now()
);

alter table user_profiles enable row level security;

create policy "users can view own profile"
  on user_profiles for select
  using (user_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (user_id, is_paid)
  values (new.id, false);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_profiles_updated_at
  before update on user_profiles
  for each row execute procedure public.set_updated_at();
