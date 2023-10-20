create table public.blocked_users (
  id serial primary key,
  blocker_id uuid not null references public.profiles (id),
  blockee_id uuid not null references public.profiles (id),
  created_at timestamp with time zone not null default (current_timestamp at time zone 'UTC'),
  unique(blocker_id, blockee_id)
);

-- Blocked users RLS
alter table public.blocked_users enable row level security;

create policy "Users can view who they blocked"
  on blocked_users for select
  using (auth.uid() = blocker_id);

create policy "Users can block others"
  on blocked_users for insert
  with check (auth.uid() = blocker_id);

create policy "Users can unblock people they blocked before"
  on blocked_users for delete
  using (auth.uid() = blocker_id);

-- Posts RLS
create policy "Posts are viewable if their creators are not blocked by the viewee"
  on posts for select
  using (not exists (
    select 1
    from public.blocked_users
    where public.blocked_users.blocker_id = auth.uid() and public.blocked_users.blockee_id = user_id
  ));

-- Comments RLS
create policy "Comments are viewable if their creators are not blocked by the viewee"
  on comments for select
  using (not exists (
    select 1
    from public.blocked_users
    where public.blocked_users.blocker_id = auth.uid() and public.blocked_users.blockee_id = user_id
  ));

-- Triggers
create function public.set_default_values_on_blocked_user_created()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.created_at = current_timestamp at time zone 'UTC';

  return new;
end;
$$;

create trigger set_default_values_on_blocked_user_created
  after insert on public.blocked_users
  for each row execute procedure public.set_default_values_on_blocked_user_created();
