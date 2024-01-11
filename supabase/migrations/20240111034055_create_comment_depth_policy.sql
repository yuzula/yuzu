create function
  get_comment_depth (comment_id int) returns int language plpgsql security invoker
set
  search_path = public stable as $$
declare
  depth int := 0;
  current_comment_id int := comment_id;
begin
  select parent_comment_id into current_comment_id from comments where id = current_comment_id;

  while current_comment_id is not null and depth < 9 loop
    select parent_comment_id into current_comment_id from comments where id = current_comment_id;

    depth := depth + 1;
  end loop;

  RETURN depth;
end;
$$;

create policy
  "Comments can be nested at most 10 times" on comments as restrictive for insert to authenticated
with
  check (get_comment_depth (id) < 10);
