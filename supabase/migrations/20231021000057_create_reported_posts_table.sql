create table reported_posts (
  id serial primary key,
  post_id int not null unique references posts (id),
  is_pending boolean not null default true,
  is_flagged boolean not null default false,
  created_at timestamp with time zone not null default (current_timestamp at time zone 'UTC'),
  updated_at timestamp with time zone
);

create index reported_posts_post_id_idx
on reported_posts (post_id);

create index reported_posts_is_pending_idx
on reported_posts (is_pending);

-- RLS
create policy "Users can report public posts"
  on reported_posts for insert
  to authenticated
  with check (private.is_post_private(post_id) = false);

create policy "Users can report private posts in the same community"
  on reported_posts for insert
  to authenticated
  with check (private.get_community_domain_name_from_post(post_id) = private.get_community_domain_name_from_profile());

-- Utility functions
create function private.get_post_is_flagged(reported_post_id int)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select is_flagged
  from reported_posts
  where reported_posts.post_id = reported_post_id;
$$;

create function private.get_reported_post_exists(reported_post_id int)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from reported_posts
    where reported_posts.post_id = reported_post_id
  );
$$;

-- Posts RLS
create policy "Posts are viewable if they are not flagged"
  on posts
  as restrictive
  for select
  to authenticated
  using (not private.get_reported_post_exists(id) or private.get_post_is_flagged(id) = false);

-- Triggers
create function private.set_default_values_on_reported_post_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.is_pending = true;
  new.is_flagged = false;
  new.created_at = current_timestamp at time zone 'UTC';

  return new;
end;
$$;

create trigger set_default_values_on_reported_post_created
  after insert on reported_posts
  for each row execute procedure private.set_default_values_on_reported_post_created();
