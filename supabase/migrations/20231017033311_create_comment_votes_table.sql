create table comment_votes (
  id serial primary key,
  user_id uuid not null references profiles (id) on delete cascade,
  comment_id int not null references comments (id),
  is_upvote boolean not null,
  created_at timestamp with time zone not null default (current_timestamp at time zone 'UTC'),
  unique(user_id, comment_id)
);

create index comment_votes_user_id_idx
on comment_votes (user_id);

create index comment_votes_comment_id_idx
on comment_votes (comment_id);

-- RLS
alter table comment_votes enable row level security;

create policy "Comment votes are viewable by authenticated users"
  on comment_votes for select
  to authenticated
  using (true);

create policy "Users can cast their own votes"
  on comment_votes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own comment vote"
  on comment_votes for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own comment vote"
  on comment_votes for delete
  to authenticated
  using (auth.uid() = user_id);

-- Utility views
create view comments_with_vote_count
with (security_invoker) as
select
  comments.*,
  sum(case
    when comment_votes.is_upvote = true then 1
    when comment_votes.is_upvote = false then -1
    else 0 end) as vote_count
from comments
left join comment_votes
on comments.id = comment_votes.comment_id
group by comments.id;

-- Triggers
create function private.self_upvote_on_comment_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into comment_votes (user_id, comment_id, is_upvote)
  values (new.user_id, new.id, true);

  return new;
end;
$$;

create trigger self_upvote_on_comment_created
  after insert on comments
  for each row execute procedure private.self_upvote_on_comment_created();

create function private.set_default_values_on_comment_vote_created()
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

create trigger set_default_values_on_comment_vote_created
  after insert on comment_votes
  for each row execute procedure private.set_default_values_on_comment_vote_created();
