create index communities_domain_name_trgm_idx on communities using gist (domain_name gist_trgm_ops);

create function search_communities(query text)
    returns setof communities_with_member_count
    language sql
    stable
as
$$
select *
from communities_with_member_count
order by similarity(domain_name, query) desc;
$$;
