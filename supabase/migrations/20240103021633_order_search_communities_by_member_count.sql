create
or replace function search_communities (query text) returns setof communities_with_member_count language sql stable as $$
select
  *
from
  communities_with_member_count
order by
  similarity (domain_name, query) desc,
  member_count desc;
$$;
