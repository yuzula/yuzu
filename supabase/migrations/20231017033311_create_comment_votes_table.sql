create table public.comment_votes (
  id serial primary key,
  user_id uuid not null references public.profiles (id),
  comment_id serial not null references public.comments (id),
  is_upvote boolean not null,
  created_at timestamp not null default current_timestamp
);

-- RLS
alter table public.comment_votes enable row level security;

create policy "Comment votes are viewable by authenticated users"
  on comment_votes for select
  using (auth.uid() is not null);

create policy "Comment votes can be casted by authenticated users"
  on comment_votes for insert
  with check (auth.uid() is not null);

create policy "Users can update their own comment vote"
  on comment_votes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own comment vote"
  on comment_votes for delete
  using (auth.uid() = user_id);

-- Utility functions
create function count_comment_votes(comment_id int)
returns int
language sql
as $$
  select sum(case when is_upvote = true then 1 else -1 end)
  from public.comment_votes
  where public.comment_votes.comment_id = comment_id;
$$;

-- Triggers
create function public.set_default_values_on_comment_vote_created()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.created_at = current_timestamp;

  return new;
end;
$$;

create trigger set_default_values_on_comment_vote_created
  after insert on public.comment_votes
  for each row execute procedure public.set_default_values_on_comment_vote_created();
