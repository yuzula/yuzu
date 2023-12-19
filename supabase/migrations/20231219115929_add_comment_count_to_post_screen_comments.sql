create or replace view post_screen_comments
    with (security_invoker) as
select comments_with_vote_count.*,
       coalesce(reported_comments.is_flagged, false)                as is_flagged,
       case
           when comment_votes.is_upvote = true then 'upvote'
           when comment_votes.is_upvote = false then 'downvote'
           end                                                      as current_user_vote,
       profiles.username                                            as username,
       profiles.community_domain_name = posts.community_domain_name as is_author_internal,
       comments_with_shallow_comment_count.comment_count            as comment_count
from comments_with_vote_count
         left join reported_comments
                   on comments_with_vote_count.id = reported_comments.comment_id
         left join comment_votes
                   on comments_with_vote_count.id = comment_votes.comment_id and auth.uid() = comment_votes.user_id
         inner join profiles
                    on comments_with_vote_count.user_id = profiles.id
         inner join posts
                    on comments_with_vote_count.post_id = posts.id
         inner join comments_with_shallow_comment_count
                    on comments_with_vote_count.id = comments_with_shallow_comment_count.id;
