create table comments (
  id serial primary key,
  user_id uuid not null references profiles (id) on delete cascade,
  post_id int not null references posts (id),
  content varchar(600) not null,
  is_deleted boolean not null default false,
  parent_comment_id int references comments (id),
  created_at timestamp with time zone not null default (current_timestamp at time zone 'UTC'),
  updated_at timestamp with time zone
);

create index comments_user_id_idx
on comments (user_id);

create index comments_post_id_idx
on comments (post_id);

create index comments_parent_comment_id_idx
on comments (parent_comment_id);

-- Utility functions
create function private.is_post_private(post_id int)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select is_private
  from posts
  where id = post_id;
$$;

create function private.get_community_domain_name_from_post(post_id int)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select community_domain_name
  from posts
  where id = post_id;
$$;

create function private.get_comment_depth(comment_id int)
returns int
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  depth int := 0;
  current_comment_id int := comment_id;
begin
  while current_comment_id is not null and depth < 2 loop
    select parent_comment_id into current_comment_id from comments where id = current_comment_id;

    depth := depth + 1;
  end loop;

  RETURN depth;
end;
$$;

create function count_comments_by_user(comment_user_id uuid)
returns int
language sql
stable
as $$
  select coalesce(count(id), 0)
  from comments
  where user_id = comment_user_id;
$$;

-- RLS
alter table comments enable row level security;

create policy "Public comments are viewable by authenticated users"
  on comments for select
  to authenticated
  using (private.is_post_private(post_id) = false);

create policy "Private comments are viewable by users from the same community"
  on comments for select
  to authenticated
  using (private.get_community_domain_name_from_post(post_id) = private.get_community_domain_name_from_profile());

create policy "Users can create their own comment"
  on comments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Comments can be at most 2 levels deep"
  on comments
  as restrictive
  for all
  using (private.get_comment_depth(id) <= 2);

create policy "Users can delete their own comment"
  on comments for delete
  to authenticated
  using (auth.uid() = user_id);

-- Triggers
create function private.set_default_values_on_comment_created()
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

create trigger set_default_values_on_comment_created
  after insert on comments
  for each row execute procedure private.set_default_values_on_comment_created();
