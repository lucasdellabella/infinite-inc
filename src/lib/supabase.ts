import { SupabaseClient } from "@supabase/supabase-js";

const memCache: Map<string, Promise<{ data: unknown[] }>> = new Map();
//TODO clear empty array res from memCache
export function supaSelectMany(
  supabase: SupabaseClient<Database>,
  tableName: string,
  cols: [string, string][]
) {
  const hash = `${tableName}:${cols.map((x) => x.join(",")).join("|")}`;

  if (memCache.has(hash))
    return memCache.get(hash)?.then((data) => {
      return JSON.parse(JSON.stringify(data));
    });

  console.log("querying supa", hash);
  let q = supabase.from(tableName).select();

  cols.forEach(([col, val]) => (q = q.eq(col, val)));

  memCache.set(hash, q as unknown as Promise<{ data: unknown[] }>);
  return q;
}
export function supaSelectOne(
  supabase: SupabaseClient<Database>,
  tableName: string,
  cols: [string, string][]
) {
  return (supaSelectMany(supabase, tableName, cols) || Promise.resolve()).then(
    (res) => {
      const { data } = (res as { data: unknown[] }) || {};
      const [row] = data || [];
      return row;
    }
  );
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string | null;
          creator_id: string | null;
          id: string;
          issue_id: string | null;
          metadata: Json | null;
          org_id: string | null;
          title: string | null;
          updated_at: string | null;
          url: string | null;
        };
        Insert: {
          created_at?: string | null;
          creator_id?: string | null;
          id?: string;
          issue_id?: string | null;
          metadata?: Json | null;
          org_id?: string | null;
          title?: string | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Update: {
          created_at?: string | null;
          creator_id?: string | null;
          id?: string;
          issue_id?: string | null;
          metadata?: Json | null;
          org_id?: string | null;
          title?: string | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "attachments_issue_id_fkey";
            columns: ["issue_id"];
            isOneToOne: false;
            referencedRelation: "issues";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_attachments_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_attachments_organization_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          }
        ];
      };
      chats: {
        Row: {
          assistant_id: string | null;
          created_at: string;
          id: number;
          ip: string | null;
          issue_id: string | null;
          message: string | null;
          org_id: string | null;
          project_id: string | null;
          response: Json | null;
          run_id: string | null;
          subject: string | null;
          thread_id: string | null;
        };
        Insert: {
          assistant_id?: string | null;
          created_at?: string;
          id?: number;
          ip?: string | null;
          issue_id?: string | null;
          message?: string | null;
          org_id?: string | null;
          project_id?: string | null;
          response?: Json | null;
          run_id?: string | null;
          subject?: string | null;
          thread_id?: string | null;
        };
        Update: {
          assistant_id?: string | null;
          created_at?: string;
          id?: number;
          ip?: string | null;
          issue_id?: string | null;
          message?: string | null;
          org_id?: string | null;
          project_id?: string | null;
          response?: Json | null;
          run_id?: string | null;
          subject?: string | null;
          thread_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "public_chats_issue_id_fkey";
            columns: ["issue_id"];
            isOneToOne: false;
            referencedRelation: "issues";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_chats_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_chats_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      combos: {
        Row: {
          count1: number | null;
          count2: number | null;
          count3: number | null;
          count4: number | null;
          created_at: string;
          emojis: string | null;
          id: number;
          ingredients_consumed: boolean | null;
          name1: string | null;
          name2: string | null;
          name3: string | null;
          name4: string | null;
          res_count1: number | null;
          res_count2: number | null;
          res_name1: string | null;
          res_name2: string | null;
        };
        Insert: {
          count1?: number | null;
          count2?: number | null;
          count3?: number | null;
          count4?: number | null;
          created_at?: string;
          emojis?: string | null;
          id?: number;
          ingredients_consumed?: boolean | null;
          name1?: string | null;
          name2?: string | null;
          name3?: string | null;
          name4?: string | null;
          res_count1?: number | null;
          res_count2?: number | null;
          res_name1?: string | null;
          res_name2?: string | null;
        };
        Update: {
          count1?: number | null;
          count2?: number | null;
          count3?: number | null;
          count4?: number | null;
          created_at?: string;
          emojis?: string | null;
          id?: number;
          ingredients_consumed?: boolean | null;
          name1?: string | null;
          name2?: string | null;
          name3?: string | null;
          name4?: string | null;
          res_count1?: number | null;
          res_count2?: number | null;
          res_name1?: string | null;
          res_name2?: string | null;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          body: string | null;
          created_at: string | null;
          creator_id: string | null;
          id: string;
          issue_id: string | null;
          org_id: string | null;
          parent_id: string | null;
          reaction_data: Json | null;
          updated_at: string | null;
        };
        Insert: {
          body?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          id?: string;
          issue_id?: string | null;
          org_id?: string | null;
          parent_id?: string | null;
          reaction_data?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          body?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          id?: string;
          issue_id?: string | null;
          org_id?: string | null;
          parent_id?: string | null;
          reaction_data?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "comments_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_comments_issue_id_fkey";
            columns: ["issue_id"];
            isOneToOne: false;
            referencedRelation: "issues";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_comments_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          }
        ];
      };
      contacts: {
        Row: {
          assistant_id: string | null;
          created_at: string;
          email_address: string | null;
          id: string;
          name: string | null;
        };
        Insert: {
          assistant_id?: string | null;
          created_at?: string;
          email_address?: string | null;
          id?: string;
          name?: string | null;
        };
        Update: {
          assistant_id?: string | null;
          created_at?: string;
          email_address?: string | null;
          id?: string;
          name?: string | null;
        };
        Relationships: [];
      };
      emails: {
        Row: {
          attachments: Json[] | null;
          created_at: string;
          data: Json | null;
          id: string;
        };
        Insert: {
          attachments?: Json[] | null;
          created_at?: string;
          data?: Json | null;
          id?: string;
        };
        Update: {
          attachments?: Json[] | null;
          created_at?: string;
          data?: Json | null;
          id?: string;
        };
        Relationships: [];
      };
      entity_properties: {
        Row: {
          config: Json | null;
          created_at: string;
          entity_name: string | null;
          id: number;
          name: string | null;
        };
        Insert: {
          config?: Json | null;
          created_at?: string;
          entity_name?: string | null;
          id?: number;
          name?: string | null;
        };
        Update: {
          config?: Json | null;
          created_at?: string;
          entity_name?: string | null;
          id?: number;
          name?: string | null;
        };
        Relationships: [];
      };
      histories: {
        Row: {
          added_label_ids: string[] | null;
          archived: boolean | null;
          archived_at: string | null;
          attachment_ids: string[] | null;
          changes: Json | null;
          created_at: string | null;
          creator_id: string | null;
          from_assignee_id: string | null;
          from_due_date: string | null;
          from_estimate: number | null;
          from_parent_id: string | null;
          from_priority: number | null;
          from_project_id: string | null;
          from_state_id: string | null;
          from_title: string | null;
          id: string;
          issue_id: string | null;
          org_id: string | null;
          removed_label_ids: string[] | null;
          to_assignee_id: string | null;
          to_due_date: string | null;
          to_parent_id: string | null;
          to_priority: number | null;
          to_project_id: string | null;
          to_state_id: string | null;
          to_title: string | null;
          trashed: boolean | null;
          updated_at: string | null;
          updated_description: boolean | null;
        };
        Insert: {
          added_label_ids?: string[] | null;
          archived?: boolean | null;
          archived_at?: string | null;
          attachment_ids?: string[] | null;
          changes?: Json | null;
          created_at?: string | null;
          creator_id?: string | null;
          from_assignee_id?: string | null;
          from_due_date?: string | null;
          from_estimate?: number | null;
          from_parent_id?: string | null;
          from_priority?: number | null;
          from_project_id?: string | null;
          from_state_id?: string | null;
          from_title?: string | null;
          id?: string;
          issue_id?: string | null;
          org_id?: string | null;
          removed_label_ids?: string[] | null;
          to_assignee_id?: string | null;
          to_due_date?: string | null;
          to_parent_id?: string | null;
          to_priority?: number | null;
          to_project_id?: string | null;
          to_state_id?: string | null;
          to_title?: string | null;
          trashed?: boolean | null;
          updated_at?: string | null;
          updated_description?: boolean | null;
        };
        Update: {
          added_label_ids?: string[] | null;
          archived?: boolean | null;
          archived_at?: string | null;
          attachment_ids?: string[] | null;
          changes?: Json | null;
          created_at?: string | null;
          creator_id?: string | null;
          from_assignee_id?: string | null;
          from_due_date?: string | null;
          from_estimate?: number | null;
          from_parent_id?: string | null;
          from_priority?: number | null;
          from_project_id?: string | null;
          from_state_id?: string | null;
          from_title?: string | null;
          id?: string;
          issue_id?: string | null;
          org_id?: string | null;
          removed_label_ids?: string[] | null;
          to_assignee_id?: string | null;
          to_due_date?: string | null;
          to_parent_id?: string | null;
          to_priority?: number | null;
          to_project_id?: string | null;
          to_state_id?: string | null;
          to_title?: string | null;
          trashed?: boolean | null;
          updated_at?: string | null;
          updated_description?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "histories_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "histories_from_assignee_id_fkey";
            columns: ["from_assignee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "histories_from_parent_id_fkey";
            columns: ["from_parent_id"];
            isOneToOne: false;
            referencedRelation: "issues";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "histories_from_project_id_fkey";
            columns: ["from_project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "histories_from_state_id_fkey";
            columns: ["from_state_id"];
            isOneToOne: false;
            referencedRelation: "workflow_states";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "histories_issue_id_fkey";
            columns: ["issue_id"];
            isOneToOne: false;
            referencedRelation: "issues";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "histories_to_assignee_id_fkey";
            columns: ["to_assignee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "histories_to_parent_id_fkey";
            columns: ["to_parent_id"];
            isOneToOne: false;
            referencedRelation: "issues";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "histories_to_project_id_fkey";
            columns: ["to_project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "histories_to_state_id_fkey";
            columns: ["to_state_id"];
            isOneToOne: false;
            referencedRelation: "workflow_states";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_histories_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          }
        ];
      };
      inbound_addresses: {
        Row: {
          created_at: string;
          email: string | null;
          id: number;
          org_id: string | null;
          project_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: number;
          org_id?: string | null;
          project_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: number;
          org_id?: string | null;
          project_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "public_inbound_addresses_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_inbound_addresses_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_inbound_addresses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      issues: {
        Row: {
          assignee_id: string | null;
          created_at: string | null;
          creator_id: string | null;
          description: string | null;
          duedate: string | null;
          email_id: string | null;
          estimate: number | null;
          id: string;
          identifier: string | null;
          label_ids: string[] | null;
          number: number | null;
          org_id: string | null;
          previous_identifiers: string[] | null;
          priority: number | null;
          priority_label: string | null;
          project_id: string | null;
          sort_order: number | null;
          state_id: string | null;
          subscriber_ids: string[] | null;
          title: string | null;
          trashed: boolean | null;
          updated_at: string | null;
          url: string | null;
        };
        Insert: {
          assignee_id?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          description?: string | null;
          duedate?: string | null;
          email_id?: string | null;
          estimate?: number | null;
          id?: string;
          identifier?: string | null;
          label_ids?: string[] | null;
          number?: number | null;
          org_id?: string | null;
          previous_identifiers?: string[] | null;
          priority?: number | null;
          priority_label?: string | null;
          project_id?: string | null;
          sort_order?: number | null;
          state_id?: string | null;
          subscriber_ids?: string[] | null;
          title?: string | null;
          trashed?: boolean | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Update: {
          assignee_id?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          description?: string | null;
          duedate?: string | null;
          email_id?: string | null;
          estimate?: number | null;
          id?: string;
          identifier?: string | null;
          label_ids?: string[] | null;
          number?: number | null;
          org_id?: string | null;
          previous_identifiers?: string[] | null;
          priority?: number | null;
          priority_label?: string | null;
          project_id?: string | null;
          sort_order?: number | null;
          state_id?: string | null;
          subscriber_ids?: string[] | null;
          title?: string | null;
          trashed?: boolean | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "issues_assignee_id_fkey";
            columns: ["assignee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "issues_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "issues_state_id_fkey";
            columns: ["state_id"];
            isOneToOne: false;
            referencedRelation: "workflow_states";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_issues_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_issues_email_id_fkey";
            columns: ["email_id"];
            isOneToOne: false;
            referencedRelation: "emails";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_issues_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          }
        ];
      };
      labels: {
        Row: {
          assistant_id: string | null;
          color: string | null;
          created_at: string | null;
          creator_id: string | null;
          description: string | null;
          id: string;
          name: string | null;
          org_id: string | null;
          project_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          assistant_id?: string | null;
          color?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          description?: string | null;
          id?: string;
          name?: string | null;
          org_id?: string | null;
          project_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          assistant_id?: string | null;
          color?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          description?: string | null;
          id?: string;
          name?: string | null;
          org_id?: string | null;
          project_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "labels_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "labels_organization_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "labels_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      openai_files: {
        Row: {
          active: boolean | null;
          assistant_id: string | null;
          created_at: string;
          display_name: string | null;
          file_name: string | null;
          id: string;
          ip: string | null;
          pdf_to_text: string | null;
        };
        Insert: {
          active?: boolean | null;
          assistant_id?: string | null;
          created_at?: string;
          display_name?: string | null;
          file_name?: string | null;
          id: string;
          ip?: string | null;
          pdf_to_text?: string | null;
        };
        Update: {
          active?: boolean | null;
          assistant_id?: string | null;
          created_at?: string;
          display_name?: string | null;
          file_name?: string | null;
          id?: string;
          ip?: string | null;
          pdf_to_text?: string | null;
        };
        Relationships: [];
      };
      openai_labels: {
        Row: {
          created_at: string;
          id: number;
          prompt: string | null;
          response: Json | null;
          version: number | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          prompt?: string | null;
          response?: Json | null;
          version?: number | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          prompt?: string | null;
          response?: Json | null;
          version?: number | null;
        };
        Relationships: [];
      };
      org: {
        Row: {
          archived_at: string | null;
          color: string | null;
          created_at: string | null;
          id: string;
          logo_url: string | null;
          name: string | null;
          subscription_id: string | null;
          updated_at: string | null;
          url: string | null;
        };
        Insert: {
          archived_at?: string | null;
          color?: string | null;
          created_at?: string | null;
          id?: string;
          logo_url?: string | null;
          name?: string | null;
          subscription_id?: string | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Update: {
          archived_at?: string | null;
          color?: string | null;
          created_at?: string | null;
          id?: string;
          logo_url?: string | null;
          name?: string | null;
          subscription_id?: string | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "organizations_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          }
        ];
      };
      org_members: {
        Row: {
          org_id: string | null;
          user_id: string;
        };
        Insert: {
          org_id?: string | null;
          user_id: string;
        };
        Update: {
          org_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_organization_members_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_organization_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          active: boolean | null;
          admin: boolean | null;
          created_at: string | null;
          created_issue_count: number | null;
          display_name: string | null;
          email: string | null;
          guest: boolean | null;
          id: string;
          invite_hash: string | null;
          last_seen: string | null;
          name: string | null;
          org_id: string | null;
          timezone: string | null;
          updated_at: string | null;
          url: string | null;
        };
        Insert: {
          active?: boolean | null;
          admin?: boolean | null;
          created_at?: string | null;
          created_issue_count?: number | null;
          display_name?: string | null;
          email?: string | null;
          guest?: boolean | null;
          id: string;
          invite_hash?: string | null;
          last_seen?: string | null;
          name?: string | null;
          org_id?: string | null;
          timezone?: string | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Update: {
          active?: boolean | null;
          admin?: boolean | null;
          created_at?: string | null;
          created_issue_count?: number | null;
          display_name?: string | null;
          email?: string | null;
          guest?: boolean | null;
          id?: string;
          invite_hash?: string | null;
          last_seen?: string | null;
          name?: string | null;
          org_id?: string | null;
          timezone?: string | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_organization_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          }
        ];
      };
      projects: {
        Row: {
          archived_at: string | null;
          color: string | null;
          created_at: string | null;
          creator_id: string | null;
          description: string | null;
          icon: string | null;
          id: string;
          member_ids: string[] | null;
          name: string | null;
          org_id: string | null;
          slug_id: string | null;
          sort_order: number | null;
          updated_at: string | null;
          url: string | null;
        };
        Insert: {
          archived_at?: string | null;
          color?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          member_ids?: string[] | null;
          name?: string | null;
          org_id?: string | null;
          slug_id?: string | null;
          sort_order?: number | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Update: {
          archived_at?: string | null;
          color?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          member_ids?: string[] | null;
          name?: string | null;
          org_id?: string | null;
          slug_id?: string | null;
          sort_order?: number | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_organization_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          }
        ];
      };
      subscriptions: {
        Row: {
          canceled_at: string | null;
          collection_method: string | null;
          created_at: string | null;
          creator_id: string | null;
          id: string;
          next_billing_at: string | null;
          org_id: string | null;
          seats: number | null;
          seats_maximum: number | null;
          seats_minimum: number | null;
          type: string | null;
          updated_at: string | null;
        };
        Insert: {
          canceled_at?: string | null;
          collection_method?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          id?: string;
          next_billing_at?: string | null;
          org_id?: string | null;
          seats?: number | null;
          seats_maximum?: number | null;
          seats_minimum?: number | null;
          type?: string | null;
          updated_at?: string | null;
        };
        Update: {
          canceled_at?: string | null;
          collection_method?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          id?: string;
          next_billing_at?: string | null;
          org_id?: string | null;
          seats?: number | null;
          seats_maximum?: number | null;
          seats_minimum?: number | null;
          type?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriptions_organization_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          }
        ];
      };
      teams: {
        Row: {
          archived_at: string | null;
          color: string | null;
          created_at: string | null;
          creator_id: string | null;
          description: string | null;
          icon: string | null;
          id: string;
          member_ids: string[] | null;
          name: string | null;
          org_id: string | null;
          project_ids: string[] | null;
          sort_order: number | null;
          updated_at: string | null;
          url: string | null;
        };
        Insert: {
          archived_at?: string | null;
          color?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          member_ids?: string[] | null;
          name?: string | null;
          org_id?: string | null;
          project_ids?: string[] | null;
          sort_order?: number | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Update: {
          archived_at?: string | null;
          color?: string | null;
          created_at?: string | null;
          creator_id?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          member_ids?: string[] | null;
          name?: string | null;
          org_id?: string | null;
          project_ids?: string[] | null;
          sort_order?: number | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "public_teams_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "teams_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      workflow_states: {
        Row: {
          archived_at: string | null;
          color: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          name: string | null;
          org_id: string | null;
          position: number | null;
          project_id: string | null;
          type: string | null;
        };
        Insert: {
          archived_at?: string | null;
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string | null;
          org_id?: string | null;
          position?: number | null;
          project_id?: string | null;
          type?: string | null;
        };
        Update: {
          archived_at?: string | null;
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string | null;
          org_id?: string | null;
          position?: number | null;
          project_id?: string | null;
          type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "public_workflow_states_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workflow_states_organization_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "org";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workflow_states_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      zz_archived_comments: {
        Row: {
          created_at: string;
          id: number;
          message: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          message?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          message?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "z_archived_comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      zz_archived_content_item: {
        Row: {
          comments: number[] | null;
          created_at: string;
          id: string;
          likes: number | null;
          list_id: string | null;
          post_id: string | null;
          post_type: string | null;
          published_at: string | null;
        };
        Insert: {
          comments?: number[] | null;
          created_at?: string;
          id?: string;
          likes?: number | null;
          list_id?: string | null;
          post_id?: string | null;
          post_type?: string | null;
          published_at?: string | null;
        };
        Update: {
          comments?: number[] | null;
          created_at?: string;
          id?: string;
          likes?: number | null;
          list_id?: string | null;
          post_id?: string | null;
          post_type?: string | null;
          published_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "z_archived_content_item_list_id_fkey";
            columns: ["list_id"];
            isOneToOne: false;
            referencedRelation: "zz_archived_content_list";
            referencedColumns: ["id"];
          }
        ];
      };
      zz_archived_content_list: {
        Row: {
          created_at: string;
          elements: string[] | null;
          forked_from: string | null;
          hidden_mask: boolean[] | null;
          id: string;
          name: string | null;
          tags: string[] | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          elements?: string[] | null;
          forked_from?: string | null;
          hidden_mask?: boolean[] | null;
          id?: string;
          name?: string | null;
          tags?: string[] | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          elements?: string[] | null;
          forked_from?: string | null;
          hidden_mask?: boolean[] | null;
          id?: string;
          name?: string | null;
          tags?: string[] | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      zz_archived_image: {
        Row: {
          caption: string | null;
          created_at: string;
          id: string;
          tags: string[] | null;
          title: string | null;
          url: string | null;
        };
        Insert: {
          caption?: string | null;
          created_at?: string;
          id?: string;
          tags?: string[] | null;
          title?: string | null;
          url?: string | null;
        };
        Update: {
          caption?: string | null;
          created_at?: string;
          id?: string;
          tags?: string[] | null;
          title?: string | null;
          url?: string | null;
        };
        Relationships: [];
      };
      zz_archived_place_post: {
        Row: {
          business_response: string | null;
          business_response_at: string | null;
          content_id: string;
          created_at: string;
          data_id: string | null;
          description: string | null;
          images: string[] | null;
          source_type: string | null;
          stars: number | null;
          title: string | null;
          updated_at: string | null;
        };
        Insert: {
          business_response?: string | null;
          business_response_at?: string | null;
          content_id: string;
          created_at?: string;
          data_id?: string | null;
          description?: string | null;
          images?: string[] | null;
          source_type?: string | null;
          stars?: number | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          business_response?: string | null;
          business_response_at?: string | null;
          content_id?: string;
          created_at?: string;
          data_id?: string | null;
          description?: string | null;
          images?: string[] | null;
          source_type?: string | null;
          stars?: number | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "z_archived_place_post_content_id_fkey";
            columns: ["content_id"];
            isOneToOne: true;
            referencedRelation: "zz_archived_content_item";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      entity_emojis: {
        Row: {
          emojis: string | null;
          res_name1: string | null;
        };
        Relationships: [];
      };
      questions_count: {
        Row: {
          assistant_id: string | null;
          count: number | null;
          ip: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      requesting_user_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      post_type: "place" | "route" | "summary";
      source_type: "colorset";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;
