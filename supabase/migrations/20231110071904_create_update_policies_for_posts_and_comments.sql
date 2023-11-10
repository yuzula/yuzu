create policy "Users can update their own post"
  on posts for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update their own comment"
  on comments for update
  to authenticated
  using (auth.uid() = user_id);
