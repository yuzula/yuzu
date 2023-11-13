create view communities_with_member_count
  with (security_invoker) as
select communities.*, count(profiles.id) as member_count
from communities
       left join profiles on communities.domain_name = profiles.community_domain_name
group by communities.domain_name
order by member_count;
