create table public.comment_votes (
  id serial primary key,
  user_id uuid not null references public.profiles (id),
  comment_id serial not null references public.comments (id),
  is_upvote boolean not null,
  created_at timestamp with time zone not null default (current_timestamp at time zone 'UTC')
);

-- RLS
alter table public.comment_votes enable row level security;

create policy "Comment votes are viewable by authenticated users"
  on comment_votes for select
  using (auth.uid() is not null);

create policy "Users can cast their own votes"
  on comment_votes for insert
  with check (auth.uid() = user_id);

create policy "Users can only vote once per comment"
  on comment_votes for insert
  with check (exists (
    select 1
    from public.comment_votes
    where public.comment_votes.user_id = auth.uid()
    and public.comment_votes.comment_id = comment_id
  ));

create policy "Users can update their own comment vote"
  on comment_votes for update
  with check (auth.uid() = user_id);

create policy "Users can delete their own comment vote"
  on comment_votes for delete
  using (auth.uid() = user_id);

-- Utility views
create view public.comments_with_vote_count
with (security_invoker) as
select
  public.comments.*,
  sum(case when public.comment_votes.is_upvote = true then 1 else -1 end) as vote_count
from public.comments
left join public.comment_votes
on public.comments.id = public.comment_votes.comment_id
group by public.comments.id;

-- Triggers
create function public.set_default_values_on_comment_vote_created()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.created_at = current_timestamp at time zone 'UTC';

  return new;
end;
$$;

create trigger set_default_values_on_comment_vote_created
  after insert on public.comment_votes
  for each row execute procedure public.set_default_values_on_comment_vote_created();
