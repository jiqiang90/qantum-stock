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
      inventory_snapshots: {
        Row: {
          available_quantity: number;
          captured_at: string;
          id: string;
          product_id: string;
        };
        Insert: {
          available_quantity: number;
          captured_at: string;
          id: string;
          product_id: string;
        };
        Update: {
          available_quantity?: number;
          captured_at?: string;
          id?: string;
          product_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_snapshots_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_requirements: {
        Row: {
          description: string;
          id: string;
          position: number;
          required_quantity: number | null;
          solution_option_id: string;
          solution_product_id: string | null;
        };
        Insert: {
          description: string;
          id: string;
          position: number;
          required_quantity?: number | null;
          solution_option_id: string;
          solution_product_id?: string | null;
        };
        Update: {
          description?: string;
          id?: string;
          position?: number;
          required_quantity?: number | null;
          solution_option_id?: string;
          solution_product_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "product_requirements_solution_option_id_fkey";
            columns: ["solution_option_id"];
            isOneToOne: false;
            referencedRelation: "solution_options";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_requirements_solution_product_id_fkey";
            columns: ["solution_product_id"];
            isOneToOne: false;
            referencedRelation: "solution_products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          canonical_unit: string;
          category: string;
          description: string;
          id: string;
          manufacturer: string;
          name: string;
          product_code: string;
          supplier_product_code: string;
          variant: string;
        };
        Insert: {
          canonical_unit: string;
          category: string;
          description: string;
          id: string;
          manufacturer: string;
          name: string;
          product_code: string;
          supplier_product_code: string;
          variant: string;
        };
        Update: {
          canonical_unit?: string;
          category?: string;
          description?: string;
          id?: string;
          manufacturer?: string;
          name?: string;
          product_code?: string;
          supplier_product_code?: string;
          variant?: string;
        };
        Relationships: [];
      };
      solution_options: {
        Row: {
          id: string;
          solution_id: string;
          work_package_id: string;
        };
        Insert: {
          id: string;
          solution_id: string;
          work_package_id: string;
        };
        Update: {
          id?: string;
          solution_id?: string;
          work_package_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "solution_options_solution_id_fkey";
            columns: ["solution_id"];
            isOneToOne: false;
            referencedRelation: "solutions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "solution_options_work_package_id_fkey";
            columns: ["work_package_id"];
            isOneToOne: false;
            referencedRelation: "work_packages";
            referencedColumns: ["id"];
          },
        ];
      };
      solution_products: {
        Row: {
          id: string;
          product_id: string;
          solution_id: string;
        };
        Insert: {
          id: string;
          product_id: string;
          solution_id: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          solution_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "solution_products_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "solution_products_solution_id_fkey";
            columns: ["solution_id"];
            isOneToOne: false;
            referencedRelation: "solutions";
            referencedColumns: ["id"];
          },
        ];
      };
      solutions: {
        Row: {
          id: string;
          insulation: string;
          integrity: string;
          internal_code: string;
          orientation: string;
          service_classification: string;
          service_size: string;
          service_type: string;
          service_type_option: string;
          substrate: string;
          substrate_option: string;
          supplier: string;
          supplier_ref_code: string;
        };
        Insert: {
          id: string;
          insulation: string;
          integrity: string;
          internal_code: string;
          orientation: string;
          service_classification: string;
          service_size: string;
          service_type: string;
          service_type_option: string;
          substrate: string;
          substrate_option: string;
          supplier: string;
          supplier_ref_code: string;
        };
        Update: {
          id?: string;
          insulation?: string;
          integrity?: string;
          internal_code?: string;
          orientation?: string;
          service_classification?: string;
          service_size?: string;
          service_type?: string;
          service_type_option?: string;
          substrate?: string;
          substrate_option?: string;
          supplier?: string;
          supplier_ref_code?: string;
        };
        Relationships: [];
      };
      work_packages: {
        Row: {
          id: string;
          name: string;
          planned_date: string;
          selected_solution_option_id: string;
        };
        Insert: {
          id: string;
          name: string;
          planned_date: string;
          selected_solution_option_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          planned_date?: string;
          selected_solution_option_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "work_packages_selected_option_owner_fkey";
            columns: ["id", "selected_solution_option_id"];
            isOneToOne: false;
            referencedRelation: "solution_options";
            referencedColumns: ["work_package_id", "id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      select_work_package_solution: {
        Args: {
          p_expected_current_option_id: string;
          p_solution_option_id: string;
          p_work_package_id: string;
        };
        Returns: string;
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

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
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
  public: {
    Enums: {},
  },
} as const;
