create table public.comments (
  id serial primary key,
  user_id uuid not null references public.profiles (id),
  post_id serial not null references public.posts (id),
  content text not null,
  vote_count int not null,
  is_flagged boolean not null default false,
  is_deleted boolean not null default false,
  ancestor_id serial references public.comments (id),
  descendent_id serial references public.comments (id),
  depth int,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp
);

-- RLS
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
  using (auth.uid() = user_id);

create policy "Users can delete their own comment"
  on comments for delete
  using (auth.uid() = user_id);
