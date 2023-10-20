create table comments (
  id serial primary key,
  user_id uuid not null references profiles (id),
  post_id int not null references posts (id),
  content varchar(600) not null,
  is_flagged boolean not null default false,
  is_deleted boolean not null default false,
  ancestor_id int references comments (id),
  descendent_id int references comments (id),
  depth int check (depth < 10),
  created_at timestamp with time zone not null default (current_timestamp at time zone 'UTC'),
  updated_at timestamp
);

-- RLS
alter table comments enable row level security;

create policy "Public comments are viewable by authenticated users"
  on comments for select
  to authenticated
  using ((
    select posts.is_private
    from posts
    where posts.id = post_id
  ) = false);

create policy "Private comments are viewable by users from the same community"
  on comments for select
  to authenticated
  using ((
    select posts.community_domain_name
    from posts
    where posts.id = post_id
    ) = (
    select profiles.community_domain_name
    from profiles
    where profiles.id = auth.uid()
  ));

create policy "Users can create their own comment"
  on comments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own comment"
  on comments for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own comment"
  on comments for delete
  to authenticated
  using (auth.uid() = user_id);

-- Triggers
create function private.set_default_values_on_comment_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.is_flagged = false;
  new.is_deleted = false;
  new.created_at = current_timestamp at time zone 'UTC';

  return new;
end;
$$;

create trigger set_default_values_on_comment_created
  after insert on comments
  for each row execute procedure private.set_default_values_on_comment_created();
