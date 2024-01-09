alter table
  reported_posts enable row level security;

alter table
  reported_comments enable row level security;

create policy
  "Users can report comments if they are authenticated" on reported_comments for insert to authenticated
with
  check (true);
