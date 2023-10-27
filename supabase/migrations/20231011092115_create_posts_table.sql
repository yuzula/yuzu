create table posts (
  id serial primary key,
  user_id uuid references profiles (id) on delete set null,
  community_domain_name text not null references communities (domain_name),
  content varchar(300),
  is_private boolean not null,
  is_deleted boolean not null default false,
  created_at timestamp with time zone not null default (current_timestamp at time zone 'UTC'),
  updated_at timestamp with time zone
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

create function count_posts_by_user(post_user_id uuid)
returns int
language sql
stable
as $$
  select coalesce(count(id), 0)
  from posts
  where user_id = post_user_id;
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

create policy "Post content must not be null"
  on posts
  as restrictive
  for insert
  to authenticated
  with check (content is not null);

create policy "Users can delete their own post"
  on posts for delete
  to authenticated
  using (auth.uid() = user_id);

-- Triggers
create function private.set_post_values_on_user_deleted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is null then
    new.is_deleted = true;
    new.content = null;
    new.updated_at = current_timestamp at time zone 'UTC';
  end if;

  return new;
end;
$$;

create trigger set_post_values_on_user_deleted
  before update on posts
  for each row execute procedure private.set_post_values_on_user_deleted();

create function private.set_post_values_on_post_deleted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_deleted = true then
    new.content = null;
    new.updated_at = current_timestamp at time zone 'UTC';
  end if;

  return new;
end;
$$;

create trigger set_post_values_on_post_deleted
  before update on posts
  for each row execute procedure private.set_post_values_on_post_deleted();

create function private.set_default_values_on_post_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.is_deleted = false;
  new.created_at = current_timestamp at time zone 'UTC';

  return new;
end;
$$;

create trigger set_default_values_on_post_created
  before insert on posts
  for each row execute procedure private.set_default_values_on_post_created();
