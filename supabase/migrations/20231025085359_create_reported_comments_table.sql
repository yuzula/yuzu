create table reported_comments (
  id serial primary key,
  comment_id int not null unique references comments (id),
  is_pending boolean not null default true,
  is_flagged boolean not null default false,
  created_at timestamp with time zone not null default (current_timestamp at time zone 'UTC'),
  updated_at timestamp with time zone
);

create index reported_comments_comment_id_idx
on reported_comments (comment_id);

create index reported_comments_is_pending_idx
on reported_comments (is_pending);

-- Utility functions
create function private.get_comment_is_flagged(reported_comment_id int)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select is_flagged
  from reported_comments
  where reported_comments.comment_id = reported_comment_id;
$$;

create function private.get_reported_comment_exists(reported_comment_id int)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from reported_comments
    where reported_comments.comment_id = reported_comment_id
  );
$$;

-- Triggers
create function private.set_default_values_on_reported_comment_created()
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

create trigger set_default_values_on_reported_comment_created
  before insert on reported_comments
  for each row execute procedure private.set_default_values_on_reported_comment_created();
