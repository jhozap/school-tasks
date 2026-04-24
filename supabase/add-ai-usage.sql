create table ai_usage (
  user_id     uuid references auth.users on delete cascade,
  date        date not null default current_date,
  image_count int  not null default 0,
  audio_count int  not null default 0,
  primary key (user_id, date)
);

alter table ai_usage enable row level security;

create policy "users can view own usage"
  on ai_usage for select using (user_id = auth.uid());

-- Atomically checks the daily limit and increments the counter if allowed.
-- Returns: { allowed: bool, image_count: int, audio_count: int }
create or replace function check_and_increment_ai_usage(p_user_id uuid, p_mode text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_row   ai_usage%rowtype;
  v_limit constant int := 10;
begin
  insert into ai_usage (user_id, date, image_count, audio_count)
  values (p_user_id, current_date, 0, 0)
  on conflict (user_id, date) do nothing;

  select * into v_row from ai_usage
  where user_id = p_user_id and date = current_date
  for update;

  if p_mode = 'image' then
    if v_row.image_count >= v_limit then
      return jsonb_build_object('allowed', false, 'image_count', v_row.image_count, 'audio_count', v_row.audio_count);
    end if;
    update ai_usage set image_count = image_count + 1
    where user_id = p_user_id and date = current_date;
    return jsonb_build_object('allowed', true, 'image_count', v_row.image_count + 1, 'audio_count', v_row.audio_count);
  else
    if v_row.audio_count >= v_limit then
      return jsonb_build_object('allowed', false, 'image_count', v_row.image_count, 'audio_count', v_row.audio_count);
    end if;
    update ai_usage set audio_count = audio_count + 1
    where user_id = p_user_id and date = current_date;
    return jsonb_build_object('allowed', true, 'image_count', v_row.image_count, 'audio_count', v_row.audio_count + 1);
  end if;
end;
$$;