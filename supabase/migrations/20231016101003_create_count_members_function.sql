create function count_members(domain_name text)
returns int
language sql
as $$
  select count(id)
  from public.profiles
  where community_domain_name = domain_name;
$$;
