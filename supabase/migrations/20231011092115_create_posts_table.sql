create table posts (
  id serial primary key,
  user_id uuid not null references profiles (id),
  community_domain_name text not null references communities (domain_name),
  content varchar(300) not null,
  is_private boolean not null,
  is_flagged boolean not null default false,
  is_deleted boolean not null default false,
  created_at timestamp with time zone not null default (current_timestamp at time zone 'UTC'),
  updated_at timestamp
);

create index posts_user_id_idx
on posts (user_id);

create index posts_community_domain_name_idx
on posts (community_domain_name);

-- Utility functions
create function private.get_community_domain_name_from_profile()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select community_domain_name
  from profiles
  where id = auth.uid();
$$;

-- RLS
alter table posts enable row level security;

create policy "Public posts are viewable by authenticated users"
  on posts for select
  to authenticated
  using (is_private = false);

create policy "Private posts are viewable by users from the same community"
  on posts for select
  to authenticated
  using (community_domain_name = private.get_community_domain_name_from_profile());

create policy "Users can create their own post"
  on posts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own post"
  on posts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own post"
  on posts for delete
  to authenticated
  using (auth.uid() = user_id);

-- Triggers
create function private.set_default_values_on_post_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.is_flagged = false;
  new.is_deleted = false;
  new.created_at = current_timestamp at time zone 'UTC';

  return new;
end;
$$;

create trigger set_default_values_on_post_created
  after insert on posts
  for each row execute procedure private.set_default_values_on_post_created();
