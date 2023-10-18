create table public.posts (
  id serial primary key,
  user_id uuid not null references public.profiles (id),
  community_domain_name text not null references public.communities (domain_name),
  content varchar(300) not null,
  is_private boolean not null,
  is_flagged boolean not null default false,
  is_deleted boolean not null default false,
  created_at timestamp with time zone not null default (current_timestamp at time zone 'UTC'),
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
  with check (auth.uid() = user_id);

create policy "Users can delete their own post"
  on posts for delete
  using (auth.uid() = user_id);

-- Triggers
create function public.set_default_values_on_post_created()
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

create trigger set_default_values_on_post_created
  after insert on public.posts
  for each row execute procedure public.set_default_values_on_post_created();
