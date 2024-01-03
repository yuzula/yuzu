drop policy
  "Posts are viewable if their creators are not blocked by the viewee" on posts;

drop policy
  "Comments are viewable if their creators are not blocked by the viewee" on comments;

drop function
  private.is_user_blocked_by_current_user (user_id uuid);
