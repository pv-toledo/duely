export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      deadlines: {
        Row: {
          amount: number | null;
          created_at: string;
          document_id: string | null;
          due_date: string;
          id: string;
          recurrence: string;
          reminder_offset_days: number | null;
          status: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount?: number | null;
          created_at?: string;
          document_id?: string | null;
          due_date: string;
          id?: string;
          recurrence?: string;
          reminder_offset_days?: number | null;
          status?: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount?: number | null;
          created_at?: string;
          document_id?: string | null;
          due_date?: string;
          id?: string;
          recurrence?: string;
          reminder_offset_days?: number | null;
          status?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deadlines_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
        ];
      };
      documents: {
        Row: {
          category: string | null;
          created_at: string;
          document_type: string | null;
          id: string;
          issuer_name: string | null;
          mime_type: string;
          original_filename: string;
          search_language: string | null;
          status: string;
          storage_path: string;
          subject_name: string | null;
          title: string | null;
          user_id: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          document_type?: string | null;
          id?: string;
          issuer_name?: string | null;
          mime_type: string;
          original_filename: string;
          search_language?: string | null;
          status?: string;
          storage_path: string;
          subject_name?: string | null;
          title?: string | null;
          user_id: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          document_type?: string | null;
          id?: string;
          issuer_name?: string | null;
          mime_type?: string;
          original_filename?: string;
          search_language?: string | null;
          status?: string;
          storage_path?: string;
          subject_name?: string | null;
          title?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      extraction_status: {
        Row: {
          key: string;
          paused_until: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          paused_until?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          paused_until?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      extractions: {
        Row: {
          description: string | null;
          document_date: string | null;
          document_id: string;
          document_number: string | null;
          error_message: string | null;
          id: string;
          model: string;
          plate: string | null;
          processed_at: string | null;
          raw_response: Json;
          reference_period: string | null;
        };
        Insert: {
          description?: string | null;
          document_date?: string | null;
          document_id: string;
          document_number?: string | null;
          error_message?: string | null;
          id?: string;
          model: string;
          plate?: string | null;
          processed_at?: string | null;
          raw_response: Json;
          reference_period?: string | null;
        };
        Update: {
          description?: string | null;
          document_date?: string | null;
          document_id?: string;
          document_number?: string | null;
          error_message?: string | null;
          id?: string;
          model?: string;
          plate?: string | null;
          processed_at?: string | null;
          raw_response?: Json;
          reference_period?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "extractions_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: true;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
        ];
      };
      notification_log: {
        Row: {
          channel: string;
          deadline_id: string;
          id: string;
          offset_days: number;
          sent_at: string;
        };
        Insert: {
          channel?: string;
          deadline_id: string;
          id?: string;
          offset_days: number;
          sent_at?: string;
        };
        Update: {
          channel?: string;
          deadline_id?: string;
          id?: string;
          offset_days?: number;
          sent_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_log_deadline_id_fkey";
            columns: ["deadline_id"];
            isOneToOne: false;
            referencedRelation: "deadlines";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
          notification_prefs: Json;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
          notification_prefs?: Json;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          notification_prefs?: Json;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      confirm_document_review:
        | {
            Args: {
              p_amount?: number;
              p_category?: string;
              p_description?: string;
              p_document_date?: string;
              p_document_id: string;
              p_document_number?: string;
              p_document_type?: string;
              p_due_date?: string;
              p_issuer_name?: string;
              p_plate?: string;
              p_reference_period?: string;
              p_subject_name?: string;
              p_title?: string;
            };
            Returns: undefined;
          }
        | {
            Args: {
              p_amount?: number;
              p_category?: string;
              p_description?: string;
              p_document_date?: string;
              p_document_id: string;
              p_document_number?: string;
              p_document_type?: string;
              p_due_date?: string;
              p_issuer_name?: string;
              p_plate?: string;
              p_reference_period?: string;
              p_reminder_offset_days?: number;
              p_subject_name?: string;
              p_title?: string;
            };
            Returns: undefined;
          };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
