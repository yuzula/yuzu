create table moderated_posts (
  id serial primary key,
  post_id int not null unique references posts (id),
  reporter_id uuid not null references profiles (id),
  is_pending boolean not null default true,
  created_at timestamp with time zone not null default (current_timestamp at time zone 'UTC'),
  updated_at timestamp with time zone
);

create index moderated_posts_post_id_idx
on moderated_posts (post_id);

create index moderated_posts_is_pending_idx
on moderated_posts (is_pending);

create index moderated_posts_reporter_id_idx
on moderated_posts (reporter_id);

-- RLS
create policy "Users can report public posts"
  on moderated_posts for insert
  to authenticated
  with check (private.is_post_private(post_id) = false);

create policy "Users can report private posts in the same community"
  on moderated_posts for insert
  to authenticated
  with check (private.get_community_domain_name_from_post(post_id) = private.get_community_domain_name_from_profile());

create policy "Users must report as themselves"
  on moderated_posts
  as restrictive
  for insert
  to authenticated
  with check (auth.uid() = reporter_id);

-- Triggers
create function private.set_default_values_on_moderated_post_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.is_pending = true;
  new.created_at = current_timestamp at time zone 'UTC';

  return new;
end;
$$;

create trigger set_default_values_on_moderated_post_created
  after insert on comment_votes
  for each row execute procedure private.set_default_values_on_moderated_post_created();
