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
      comments: {
        Row: {
          ancestor_id: number
          content: string
          created_at: string
          depth: number | null
          descendent_id: number
          id: number
          is_deleted: boolean
          is_flagged: boolean
          post_id: number
          updated_at: string | null
          user_id: string
          vote_count: number
        }
        Insert: {
          ancestor_id?: number
          content: string
          created_at?: string
          depth?: number | null
          descendent_id?: number
          id?: number
          is_deleted?: boolean
          is_flagged?: boolean
          post_id?: number
          updated_at?: string | null
          user_id: string
          vote_count: number
        }
        Update: {
          ancestor_id?: number
          content?: string
          created_at?: string
          depth?: number | null
          descendent_id?: number
          id?: number
          is_deleted?: boolean
          is_flagged?: boolean
          post_id?: number
          updated_at?: string | null
          user_id?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: 'comments_ancestor_id_fkey'
            columns: ['ancestor_id']
            referencedRelation: 'comments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_descendent_id_fkey'
            columns: ['descendent_id']
            referencedRelation: 'comments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_post_id_fkey'
            columns: ['post_id']
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_user_id_fkey'
            columns: ['user_id']
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
      domain_suffixes: {
        Row: {
          id: number
          suffix: string
        }
        Insert: {
          id?: number
          suffix: string
        }
        Update: {
          id?: number
          suffix?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          comment_count: number
          community_domain_name: string
          content: string
          created_at: string
          id: number
          is_deleted: boolean
          is_flagged: boolean
          is_private: boolean
          title: string
          updated_at: string | null
          user_id: string
          vote_count: number
        }
        Insert: {
          comment_count: number
          community_domain_name: string
          content: string
          created_at?: string
          id?: number
          is_deleted?: boolean
          is_flagged?: boolean
          is_private: boolean
          title: string
          updated_at?: string | null
          user_id: string
          vote_count: number
        }
        Update: {
          comment_count?: number
          community_domain_name?: string
          content?: string
          created_at?: string
          id?: number
          is_deleted?: boolean
          is_flagged?: boolean
          is_private?: boolean
          title?: string
          updated_at?: string | null
          user_id?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: 'posts_community_domain_name_fkey'
            columns: ['community_domain_name']
            referencedRelation: 'communities'
            referencedColumns: ['domain_name']
          },
          {
            foreignKeyName: 'posts_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      profiles: {
        Row: {
          community_domain_name: string
          id: string
          username: string | null
          vote_count: number
        }
        Insert: {
          community_domain_name: string
          id: string
          username?: string | null
          vote_count?: number
        }
        Update: {
          community_domain_name?: string
          id?: string
          username?: string | null
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_community_domain_name_fkey'
            columns: ['community_domain_name']
            referencedRelation: 'communities'
            referencedColumns: ['domain_name']
          },
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_members: {
        Args: {
          domain_name: string
        }
        Returns: number
      }
      get_domain_name_from_email: {
        Args: {
          email: string
        }
        Returns: string
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
