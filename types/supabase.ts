export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      blocked_users: {
        Row: {
          blockee_id: string
          blocker_id: string
          created_at: string
          id: number
        }
        Insert: {
          blockee_id: string
          blocker_id: string
          created_at?: string
          id?: number
        }
        Update: {
          blockee_id?: string
          blocker_id?: string
          created_at?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: 'blocked_users_blockee_id_fkey'
            columns: ['blockee_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'blocked_users_blocker_id_fkey'
            columns: ['blocker_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      comment_votes: {
        Row: {
          comment_id: number
          created_at: string
          id: number
          is_upvote: boolean
          user_id: string
        }
        Insert: {
          comment_id: number
          created_at?: string
          id?: number
          is_upvote: boolean
          user_id: string
        }
        Update: {
          comment_id?: number
          created_at?: string
          id?: number
          is_upvote?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'comment_votes_comment_id_fkey'
            columns: ['comment_id']
            isOneToOne: false
            referencedRelation: 'comments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comment_votes_comment_id_fkey'
            columns: ['comment_id']
            isOneToOne: false
            referencedRelation: 'comments_with_vote_count'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comment_votes_comment_id_fkey'
            columns: ['comment_id']
            isOneToOne: false
            referencedRelation: 'post_screen_comments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comment_votes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      comments: {
        Row: {
          content: string | null
          created_at: string
          id: number
          is_deleted: boolean
          parent_comment_id: number | null
          post_id: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: number
          is_deleted?: boolean
          parent_comment_id?: number | null
          post_id: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: number
          is_deleted?: boolean
          parent_comment_id?: number | null
          post_id?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'comments_parent_comment_id_fkey'
            columns: ['parent_comment_id']
            isOneToOne: false
            referencedRelation: 'comments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_parent_comment_id_fkey'
            columns: ['parent_comment_id']
            isOneToOne: false
            referencedRelation: 'comments_with_vote_count'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_parent_comment_id_fkey'
            columns: ['parent_comment_id']
            isOneToOne: false
            referencedRelation: 'post_screen_comments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'home_screen_posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts_with_comment_count'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts_with_hotness'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts_with_hotness_with_flagged'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts_with_vote_and_comment_count'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts_with_vote_count'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      communities: {
        Row: {
          created_at: string
          domain_name: string
        }
        Insert: {
          created_at?: string
          domain_name: string
        }
        Update: {
          created_at?: string
          domain_name?: string
        }
        Relationships: []
      }
      post_votes: {
        Row: {
          created_at: string
          id: number
          is_upvote: boolean
          post_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_upvote: boolean
          post_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          is_upvote?: boolean
          post_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'post_votes_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'home_screen_posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'post_votes_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'post_votes_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts_with_comment_count'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'post_votes_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts_with_hotness'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'post_votes_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts_with_hotness_with_flagged'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'post_votes_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts_with_vote_and_comment_count'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'post_votes_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts_with_vote_count'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'post_votes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      posts: {
        Row: {
          community_domain_name: string
          content: string | null
          created_at: string
          id: number
          is_deleted: boolean
          is_private: boolean
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          community_domain_name: string
          content?: string | null
          created_at?: string
          id?: number
          is_deleted?: boolean
          is_private: boolean
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          community_domain_name?: string
          content?: string | null
          created_at?: string
          id?: number
          is_deleted?: boolean
          is_private?: boolean
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'posts_community_domain_name_fkey'
            columns: ['community_domain_name']
            isOneToOne: false
            referencedRelation: 'communities'
            referencedColumns: ['domain_name']
          },
          {
            foreignKeyName: 'posts_community_domain_name_fkey'
            columns: ['community_domain_name']
            isOneToOne: false
            referencedRelation: 'communities_with_member_count'
            referencedColumns: ['domain_name']
          },
          {
            foreignKeyName: 'posts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      profiles: {
        Row: {
          community_domain_name: string
          id: string
          username: string
        }
        Insert: {
          community_domain_name: string
          id: string
          username: string
        }
        Update: {
          community_domain_name?: string
          id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_community_domain_name_fkey'
            columns: ['community_domain_name']
            isOneToOne: false
            referencedRelation: 'communities'
            referencedColumns: ['domain_name']
          },
          {
            foreignKeyName: 'profiles_community_domain_name_fkey'
            columns: ['community_domain_name']
            isOneToOne: false
            referencedRelation: 'communities_with_member_count'
            referencedColumns: ['domain_name']
          },
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      reported_comments: {
        Row: {
          comment_id: number
          created_at: string
          id: number
          is_flagged: boolean
          is_pending: boolean
          updated_at: string | null
        }
        Insert: {
          comment_id: number
          created_at?: string
          id?: number
          is_flagged?: boolean
          is_pending?: boolean
          updated_at?: string | null
        }
        Update: {
          comment_id?: number
          created_at?: string
          id?: number
          is_flagged?: boolean
          is_pending?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'reported_comments_comment_id_fkey'
            columns: ['comment_id']
            isOneToOne: true
            referencedRelation: 'comments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reported_comments_comment_id_fkey'
            columns: ['comment_id']
            isOneToOne: true
            referencedRelation: 'comments_with_vote_count'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reported_comments_comment_id_fkey'
            columns: ['comment_id']
            isOneToOne: true
            referencedRelation: 'post_screen_comments'
            referencedColumns: ['id']
          }
        ]
      }
      reported_posts: {
        Row: {
          created_at: string
          id: number
          is_flagged: boolean
          is_pending: boolean
          post_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          is_flagged?: boolean
          is_pending?: boolean
          post_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          is_flagged?: boolean
          is_pending?: boolean
          post_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'reported_posts_post_id_fkey'
            columns: ['post_id']
            isOneToOne: true
            referencedRelation: 'home_screen_posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reported_posts_post_id_fkey'
            columns: ['post_id']
            isOneToOne: true
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reported_posts_post_id_fkey'
            columns: ['post_id']
            isOneToOne: true
            referencedRelation: 'posts_with_comment_count'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reported_posts_post_id_fkey'
            columns: ['post_id']
            isOneToOne: true
            referencedRelation: 'posts_with_hotness'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reported_posts_post_id_fkey'
            columns: ['post_id']
            isOneToOne: true
            referencedRelation: 'posts_with_hotness_with_flagged'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reported_posts_post_id_fkey'
            columns: ['post_id']
            isOneToOne: true
            referencedRelation: 'posts_with_vote_and_comment_count'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reported_posts_post_id_fkey'
            columns: ['post_id']
            isOneToOne: true
            referencedRelation: 'posts_with_vote_count'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      comments_with_vote_count: {
        Row: {
          content: string | null
          created_at: string | null
          id: number | null
          is_deleted: boolean | null
          parent_comment_id: number | null
          post_id: number | null
          updated_at: string | null
          user_id: string | null
          vote_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'comments_parent_comment_id_fkey'
            columns: ['parent_comment_id']
            isOneToOne: false
            referencedRelation: 'comments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_parent_comment_id_fkey'
            columns: ['parent_comment_id']
            isOneToOne: false
            referencedRelation: 'comments_with_vote_count'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_parent_comment_id_fkey'
            columns: ['parent_comment_id']
            isOneToOne: false
            referencedRelation: 'post_screen_comments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'home_screen_posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts_with_comment_count'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts_with_hotness'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts_with_hotness_with_flagged'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts_with_vote_and_comment_count'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts_with_vote_count'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      communities_with_member_count: {
        Row: {
          created_at: string | null
          domain_name: string | null
          member_count: number | null
        }
        Relationships: []
      }
      home_screen_posts: {
        Row: {
          comment_count: number | null
          community_domain_name: string | null
          content: string | null
          created_at: string | null
          current_user_vote: string | null
          hotness: number | null
          id: number | null
          is_deleted: boolean | null
          is_flagged: boolean | null
          is_private: boolean | null
          updated_at: string | null
          user_id: string | null
          username: string | null
          vote_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'posts_community_domain_name_fkey'
            columns: ['community_domain_name']
            isOneToOne: false
            referencedRelation: 'communities'
            referencedColumns: ['domain_name']
          },
          {
            foreignKeyName: 'posts_community_domain_name_fkey'
            columns: ['community_domain_name']
            isOneToOne: false
            referencedRelation: 'communities_with_member_count'
            referencedColumns: ['domain_name']
          },
          {
            foreignKeyName: 'posts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      post_screen_comments: {
        Row: {
          content: string | null
          created_at: string | null
          current_user_vote: string | null
          id: number | null
          is_author_internal: boolean | null
          is_deleted: boolean | null
          is_flagged: boolean | null
          parent_comment_id: number | null
          post_id: number | null
          updated_at: string | null
          user_id: string | null
          username: string | null
          vote_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'comments_parent_comment_id_fkey'
            columns: ['parent_comment_id']
            isOneToOne: false
            referencedRelation: 'comments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_parent_comment_id_fkey'
            columns: ['parent_comment_id']
            isOneToOne: false
            referencedRelation: 'comments_with_vote_count'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_parent_comment_id_fkey'
            columns: ['parent_comment_id']
            isOneToOne: false
            referencedRelation: 'post_screen_comments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'home_screen_posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts_with_comment_count'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts_with_hotness'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts_with_hotness_with_flagged'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts_with_vote_and_comment_count'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts_with_vote_count'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      posts_with_comment_count: {
        Row: {
          comment_count: number | null
          community_domain_name: string | null
          content: string | null
          created_at: string | null
          id: number | null
          is_deleted: boolean | null
          is_private: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'posts_community_domain_name_fkey'
            columns: ['community_domain_name']
            isOneToOne: false
            referencedRelation: 'communities'
            referencedColumns: ['domain_name']
          },
          {
            foreignKeyName: 'posts_community_domain_name_fkey'
            columns: ['community_domain_name']
            isOneToOne: false
            referencedRelation: 'communities_with_member_count'
            referencedColumns: ['domain_name']
          },
          {
            foreignKeyName: 'posts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      posts_with_hotness: {
        Row: {
          comment_count: number | null
          community_domain_name: string | null
          content: string | null
          created_at: string | null
          hotness: number | null
          id: number | null
          is_deleted: boolean | null
          is_private: boolean | null
          updated_at: string | null
          user_id: string | null
          vote_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'posts_community_domain_name_fkey'
            columns: ['community_domain_name']
            isOneToOne: false
            referencedRelation: 'communities'
            referencedColumns: ['domain_name']
          },
          {
            foreignKeyName: 'posts_community_domain_name_fkey'
            columns: ['community_domain_name']
            isOneToOne: false
            referencedRelation: 'communities_with_member_count'
            referencedColumns: ['domain_name']
          },
          {
            foreignKeyName: 'posts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      posts_with_hotness_with_flagged: {
        Row: {
          comment_count: number | null
          community_domain_name: string | null
          content: string | null
          created_at: string | null
          hotness: number | null
          id: number | null
          is_deleted: boolean | null
          is_flagged: boolean | null
          is_private: boolean | null
          updated_at: string | null
          user_id: string | null
          vote_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'posts_community_domain_name_fkey'
            columns: ['community_domain_name']
            isOneToOne: false
            referencedRelation: 'communities'
            referencedColumns: ['domain_name']
          },
          {
            foreignKeyName: 'posts_community_domain_name_fkey'
            columns: ['community_domain_name']
            isOneToOne: false
            referencedRelation: 'communities_with_member_count'
            referencedColumns: ['domain_name']
          },
          {
            foreignKeyName: 'posts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      posts_with_vote_and_comment_count: {
        Row: {
          comment_count: number | null
          community_domain_name: string | null
          content: string | null
          created_at: string | null
          id: number | null
          is_deleted: boolean | null
          is_private: boolean | null
          updated_at: string | null
          user_id: string | null
          vote_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'posts_community_domain_name_fkey'
            columns: ['community_domain_name']
            isOneToOne: false
            referencedRelation: 'communities'
            referencedColumns: ['domain_name']
          },
          {
            foreignKeyName: 'posts_community_domain_name_fkey'
            columns: ['community_domain_name']
            isOneToOne: false
            referencedRelation: 'communities_with_member_count'
            referencedColumns: ['domain_name']
          },
          {
            foreignKeyName: 'posts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      posts_with_vote_count: {
        Row: {
          community_domain_name: string | null
          content: string | null
          created_at: string | null
          id: number | null
          is_deleted: boolean | null
          is_private: boolean | null
          updated_at: string | null
          user_id: string | null
          vote_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'posts_community_domain_name_fkey'
            columns: ['community_domain_name']
            isOneToOne: false
            referencedRelation: 'communities'
            referencedColumns: ['domain_name']
          },
          {
            foreignKeyName: 'posts_community_domain_name_fkey'
            columns: ['community_domain_name']
            isOneToOne: false
            referencedRelation: 'communities_with_member_count'
            referencedColumns: ['domain_name']
          },
          {
            foreignKeyName: 'posts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Functions: {
      count_comments_by_user: {
        Args: {
          comment_user_id: string
        }
        Returns: number
      }
      count_community_members: {
        Args: {
          domain_name: string
        }
        Returns: number
      }
      count_posts_by_user: {
        Args: {
          post_user_id: string
        }
        Returns: number
      }
      search_communities: {
        Args: {
          query: string
        }
        Returns: {
          created_at: string | null
          domain_name: string | null
          member_count: number | null
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
