create view home_screen_posts
    with (security_invoker) as
select posts_with_hotness.*,
       coalesce(reported_posts.is_flagged, false) as is_flagged,
       case
           when post_votes.is_upvote = true then 'upvote'
           when post_votes.is_upvote = false then 'downvote'
           end                                    as current_user_vote,
       profiles.username                          as username
from posts_with_hotness
         left join reported_posts
                   on posts_with_hotness.id = reported_posts.post_id
         left join post_votes
                   on posts_with_hotness.id = post_votes.post_id and auth.uid() = post_votes.user_id
         inner join profiles
                    on posts_with_hotness.user_id = profiles.id;
