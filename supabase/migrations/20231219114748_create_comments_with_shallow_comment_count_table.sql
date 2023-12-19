create view comments_with_shallow_comment_count
    with (security_invoker) as
select comments.*,
       count(child_comments.id) as comment_count
from comments
         left join comments as child_comments
                   on comments.id = child_comments.parent_comment_id
group by comments.id;
