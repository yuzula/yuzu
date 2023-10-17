create table public.post_votes (
  id serial primary key,
  user_id uuid not null references public.profiles (id),
  post_id serial not null references public.posts (id),
  is_upvote boolean not null,
  created_at timestamp not null default current_timestamp
);

-- RLS
alter table public.post_votes enable row level security;

create policy "Post votes are viewable by authenticated users"
  on post_votes for select
  using (auth.uid() is not null);

create policy "Post votes can be casted by authenticated users"
  on post_votes for insert
  with check (auth.uid() is not null);

create policy "Users can update their own post vote"
  on post_votes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own post vote"
  on post_votes for delete
  using (auth.uid() = user_id);

-- Utility functions
create function count_post_votes(post_id int)
returns int
language sql
as $$
  select sum(case when is_upvote = true then 1 else -1 end)
  from public.post_votes
  where public.post_votes.post_id = post_id;
$$;

-- Triggers
create function public.set_default_values_on_post_vote_created()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.created_at = current_timestamp;

  return new;
end;
$$;

create trigger set_default_values_on_post_vote_created
  after insert on public.post_votes
  for each row execute procedure public.set_default_values_on_post_vote_created();
