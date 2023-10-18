create table public.post_votes (
  id serial primary key,
  user_id uuid not null references public.profiles (id),
  post_id serial not null references public.posts (id),
  is_upvote boolean not null,
  created_at timestamp with time zone not null default (current_timestamp at time zone 'UTC')
);

-- RLS
alter table public.post_votes enable row level security;

create policy "Post votes are viewable by authenticated users"
  on post_votes for select
  using (auth.uid() is not null);

create policy "Users can cast their own votes"
  on post_votes for insert
  with check (auth.uid() = user_id);

create policy "Users can only vote once per post"
  on post_votes for insert
  with check (exists (
    select 1
    from public.post_votes
    where public.post_votes.user_id = auth.uid()
    and public.post_votes.post_id = post_id
  ));

create policy "Users can update their own post vote"
  on post_votes for update
  with check (auth.uid() = user_id);

create policy "Users can delete their own post vote"
  on post_votes for delete
  using (auth.uid() = user_id);

-- Utility views
create view public.posts_with_vote_and_comment_count
with (security_invoker) as
select
  public.posts.*,
  sum(case
    when public.post_votes.is_upvote = true then 1
    when public.post_votes.is_upvote = false then -1
    else 0 end) as vote_count,
  count(public.comments.id) as comment_count
from public.posts
left join public.post_votes
on public.posts.id = public.post_votes.post_id
left join public.comments
on public.posts.id = public.comments.post_id
group by public.posts.id;

create view public.posts_with_hotness
with (security_invoker) as
select
  *,
  (vote_count - 1) / ((((extract(epoch from current_timestamp) - extract(epoch from created_at)) / 3600) + 2) ^ 1.5) as hotness
from public.posts_with_vote_and_comment_count;

-- Triggers
create function public.self_upvote_on_post_created()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.post_votes (user_id, post_id, is_upvote)
  values (new.user_id, new.id, true);

  return new;
end;
$$;

create trigger self_upvote_on_post_created
  after insert on public.posts
  for each row execute procedure public.self_upvote_on_post_created();

create function public.set_default_values_on_post_vote_created()
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
  after insert on public.post_votes
  for each row execute procedure public.set_default_values_on_post_vote_created();
