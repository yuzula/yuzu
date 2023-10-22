create table post_votes (
  id serial primary key,
  user_id uuid not null references profiles (id) on delete cascade,
  post_id int not null references posts (id),
  is_upvote boolean not null,
  created_at timestamp with time zone not null default (current_timestamp at time zone 'UTC'),
  unique(user_id, post_id)
);

create index post_votes_user_id_idx
on post_votes (user_id);

create index post_votes_post_id_idx
on post_votes (post_id);

-- RLS
alter table post_votes enable row level security;

create policy "Public post votes are viewable by authenticated users"
  on post_votes for select
  to authenticated
  using (private.is_post_private(post_id) = false);

create policy "Private post votes are viewable by users from the same community"
  on post_votes for select
  to authenticated
  using (private.get_community_domain_name_from_post(post_id) = private.get_community_domain_name_from_profile());

create policy "Users must cast their own votes"
  on post_votes
  as restrictive
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can vote on public posts"
  on post_votes for insert
  to authenticated
  with check (private.is_post_private(post_id) = false);

create policy "Users can vote on private posts of the same community"
  on post_votes for insert
  to authenticated
  with check (private.get_community_domain_name_from_post(post_id) = private.get_community_domain_name_from_profile());

create policy "Users can update their own post vote"
  on post_votes for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own post vote"
  on post_votes for delete
  to authenticated
  using (auth.uid() = user_id);

-- Utility views
create view posts_with_vote_and_comment_count
with (security_invoker) as
select
  posts.*,
  sum(case
    when post_votes.is_upvote = true then 1
    when post_votes.is_upvote = false then -1
    else 0 end) as vote_count,
  count(comments.id) as comment_count
from posts
left join post_votes
on posts.id = post_votes.post_id
left join comments
on posts.id = comments.post_id
group by posts.id;

create view posts_with_hotness
with (security_invoker) as
select
  *,
  (vote_count - 1) / ((((extract(epoch from current_timestamp) - extract(epoch from created_at)) / 3600) + 2) ^ 1.5) as hotness
from posts_with_vote_and_comment_count;

-- Triggers
create function private.self_upvote_on_post_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into post_votes (user_id, post_id, is_upvote)
  values (new.user_id, new.id, true);

  return new;
end;
$$;

create trigger self_upvote_on_post_created
  after insert on posts
  for each row execute procedure private.self_upvote_on_post_created();

create function private.set_default_values_on_post_vote_created()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.created_at = current_timestamp at time zone 'UTC';

  return new;
end;
$$;

create trigger set_default_values_on_post_vote_created
  after insert on post_votes
  for each row execute procedure private.set_default_values_on_post_vote_created();
