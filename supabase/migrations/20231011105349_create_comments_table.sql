create table public.comments (
  id serial primary key,
  user_id uuid not null references public.profiles (id),
  post_id serial not null references public.posts (id),
  content varchar(600) not null,
  is_flagged boolean not null default false,
  is_deleted boolean not null default false,
  ancestor_id serial references public.comments (id),
  descendent_id serial references public.comments (id),
  depth int,
  created_at timestamp with time zone not null default (current_timestamp at time zone 'UTC'),
  updated_at timestamp
);

-- RLS
alter table public.comments enable row level security;

create policy "Public comments are viewable by authenticated users"
  on comments for select
  using (auth.uid() is not null and (
    select public.posts.is_private
    from public.posts
    where public.posts.id = post_id
  ) = false);

create policy "Private comments are viewable by users from the same community"
  on comments for select
  using ((
    select public.posts.community_domain_name
    from public.posts
    where public.posts.id = post_id
    ) = (
    select public.profiles.community_domain_name
    from public.profiles
    where public.profiles.id = auth.uid()
  ));

create policy "Users can create their own comment"
  on comments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own comment"
  on comments for update
  with check (auth.uid() = user_id);

create policy "Users can delete their own comment"
  on comments for delete
  using (auth.uid() = user_id);

-- Triggers
create function public.set_default_values_on_comment_created()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.is_flagged = false;
  new.is_deleted = false;
  new.created_at = current_timestamp at time zone 'UTC';

  return new;
end;
$$;

create trigger set_default_values_on_comment_created
  after insert on public.comments
  for each row execute procedure public.set_default_values_on_comment_created();
