create table public.posts (
  id serial primary key,
  user_id uuid not null references public.profiles (id),
  community_domain_name text not null references public.communities (domain_name),
  title text not null,
  content text not null,
  vote_count int not null default 0,
  is_private boolean not null,
  is_flagged boolean not null default false,
  is_deleted boolean not null default false,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp
);

-- RLS
alter table public.posts enable row level security;

create policy "Public posts are viewable by authenticated users"
  on posts for select
  using (auth.uid() is not null and is_private = false);

create policy "Private posts are viewable by users from the same community"
  on posts for select
  using (community_domain_name = (
    select public.profiles.community_domain_name
    from public.profiles
    where public.profiles.id = auth.uid()
  ));

create policy "Users can create their own post"
  on posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own post"
  on posts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own post"
  on posts for delete
  using (auth.uid() = user_id);

