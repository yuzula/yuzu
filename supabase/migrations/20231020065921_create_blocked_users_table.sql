create table blocked_users (
  id serial primary key,
  blocker_id uuid not null references profiles (id),
  blockee_id uuid not null references profiles (id),
  created_at timestamp with time zone not null default (current_timestamp at time zone 'UTC'),
  unique(blocker_id, blockee_id)
);

-- Blocked users RLS
alter table blocked_users enable row level security;

create policy "Users can view who they blocked"
  on blocked_users for select
  to authenticated
  using (auth.uid() = blocker_id);

create policy "Users cannot block themselves"
  on blocked_users for insert
  to authenticated
  with check (auth.uid() != blockee_id);

create policy "Users can block others"
  on blocked_users for insert
  to authenticated
  with check (auth.uid() = blocker_id);

create policy "Users can unblock people they blocked before"
  on blocked_users for delete
  to authenticated
  using (auth.uid() = blocker_id);

-- Posts RLS
create policy "Posts are viewable if their creators are not blocked by the viewee"
  on posts for select
  to authenticated
  using (auth.uid() not in (
    select blocker_id
    from blocked_users
    where blockee_id = user_id
  ));

-- Comments RLS
create policy "Comments are viewable if their creators are not blocked by the viewee"
  on comments for select
  to authenticated
  using (auth.uid() not in (
    select blocker_id
    from blocked_users
    where blockee_id = user_id
  ));

-- Triggers
create function private.set_default_values_on_blocked_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.created_at = current_timestamp at time zone 'UTC';

  return new;
end;
$$;

create trigger set_default_values_on_blocked_user_created
  after insert on blocked_users
  for each row execute procedure private.set_default_values_on_blocked_user_created();
