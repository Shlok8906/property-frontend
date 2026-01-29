export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      csv_uploads: {
        Row: {
          completed_at: string | null
          created_at: string
          errors: Json | null
          file_size: number | null
          filename: string
          id: string
          mode: string
          projects_created: number | null
          projects_updated: number | null
          rows_skipped: number | null
          status: string
          total_rows: number | null
          units_added: number | null
          uploaded_by: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          errors?: Json | null
          file_size?: number | null
          filename: string
          id?: string
          mode: string
          projects_created?: number | null
          projects_updated?: number | null
          rows_skipped?: number | null
          status?: string
          total_rows?: number | null
          units_added?: number | null
          uploaded_by: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          errors?: Json | null
          file_size?: number | null
          filename?: string
          id?: string
          mode?: string
          projects_created?: number | null
          projects_updated?: number | null
          rows_skipped?: number | null
          status?: string
          total_rows?: number | null
          units_added?: number | null
          uploaded_by?: string
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string
          project_uuid: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone: string
          project_uuid: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string
          project_uuid?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_project_uuid_fkey"
            columns: ["project_uuid"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          budget: string | null
          created_at: string
          customer_name: string
          email: string | null
          id: string
          interested_localities: string | null
          notes: Json | null
          phone: string
          property_id: string | null
          rejection_reason: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          budget?: string | null
          created_at?: string
          customer_name: string
          email?: string | null
          id?: string
          interested_localities?: string | null
          notes?: Json | null
          phone: string
          property_id?: string | null
          rejection_reason?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          budget?: string | null
          created_at?: string
          customer_name?: string
          email?: string | null
          id?: string
          interested_localities?: string | null
          notes?: Json | null
          phone?: string
          property_id?: string | null
          rejection_reason?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          amenities: string | null
          builder: string
          construction: string | null
          created_at: string
          id: string
          image_url: string | null
          land_parcel: string | null
          launch_date: string | null
          location: string
          possession: string | null
          project_id: string
          project_name: string
          sales_person: string | null
          status: string
          tower: string | null
          updated_at: string
        }
        Insert: {
          amenities?: string | null
          builder: string
          construction?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          land_parcel?: string | null
          launch_date?: string | null
          location: string
          possession?: string | null
          project_id: string
          project_name: string
          sales_person?: string | null
          status?: string
          tower?: string | null
          updated_at?: string
        }
        Update: {
          amenities?: string | null
          builder?: string
          construction?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          land_parcel?: string | null
          launch_date?: string | null
          location?: string
          possession?: string | null
          project_id?: string
          project_name?: string
          sales_person?: string | null
          status?: string
          tower?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          amenities: string[] | null
          area_unit: string | null
          available_from: string | null
          balconies: number | null
          bathrooms: number | null
          bhk_type: string | null
          brokerage: string | null
          brokerage_amount: number | null
          built_up_area: number | null
          carpet_area: number | null
          category: string
          city: string
          covered_parking: number | null
          created_at: string
          created_by: string
          description: string | null
          featured_image: string | null
          floor_number: number | null
          furnishing_items: string[] | null
          furnishing_type: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          landmark: string | null
          latitude: number | null
          locality: string
          lock_in_months: number | null
          lock_in_period: string | null
          longitude: number | null
          maintenance_amount: number | null
          maintenance_type: string | null
          monthly_rent: number | null
          open_parking: number | null
          pet_friendly: boolean | null
          price_negotiable: boolean | null
          property_age: number | null
          property_type: string
          purpose: string
          sale_price: number | null
          security_deposit: string | null
          security_deposit_amount: number | null
          status: string
          super_built_up_area: number | null
          tenant_preference: string[] | null
          title: string
          total_floors: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          area_unit?: string | null
          available_from?: string | null
          balconies?: number | null
          bathrooms?: number | null
          bhk_type?: string | null
          brokerage?: string | null
          brokerage_amount?: number | null
          built_up_area?: number | null
          carpet_area?: number | null
          category?: string
          city: string
          covered_parking?: number | null
          created_at?: string
          created_by: string
          description?: string | null
          featured_image?: string | null
          floor_number?: number | null
          furnishing_items?: string[] | null
          furnishing_type?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          landmark?: string | null
          latitude?: number | null
          locality: string
          lock_in_months?: number | null
          lock_in_period?: string | null
          longitude?: number | null
          maintenance_amount?: number | null
          maintenance_type?: string | null
          monthly_rent?: number | null
          open_parking?: number | null
          pet_friendly?: boolean | null
          price_negotiable?: boolean | null
          property_age?: number | null
          property_type: string
          purpose?: string
          sale_price?: number | null
          security_deposit?: string | null
          security_deposit_amount?: number | null
          status?: string
          super_built_up_area?: number | null
          tenant_preference?: string[] | null
          title: string
          total_floors?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          area_unit?: string | null
          available_from?: string | null
          balconies?: number | null
          bathrooms?: number | null
          bhk_type?: string | null
          brokerage?: string | null
          brokerage_amount?: number | null
          built_up_area?: number | null
          carpet_area?: number | null
          category?: string
          city?: string
          covered_parking?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          featured_image?: string | null
          floor_number?: number | null
          furnishing_items?: string[] | null
          furnishing_type?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          landmark?: string | null
          latitude?: number | null
          locality?: string
          lock_in_months?: number | null
          lock_in_period?: string | null
          longitude?: number | null
          maintenance_amount?: number | null
          maintenance_type?: string | null
          monthly_rent?: number | null
          open_parking?: number | null
          pet_friendly?: boolean | null
          price_negotiable?: boolean | null
          property_age?: number | null
          property_type?: string
          purpose?: string
          sale_price?: number | null
          security_deposit?: string | null
          security_deposit_amount?: number | null
          status?: string
          super_built_up_area?: number | null
          tenant_preference?: string[] | null
          title?: string
          total_floors?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          bhk_type: string
          carpet: string | null
          carpet_max: number | null
          carpet_min: number | null
          created_at: string
          details: string | null
          flat_per_floor: number | null
          floor: string | null
          id: string
          parking: string | null
          price: string | null
          price_max: number | null
          price_min: number | null
          project_uuid: string
          total_units: number | null
          updated_at: string
        }
        Insert: {
          bhk_type: string
          carpet?: string | null
          carpet_max?: number | null
          carpet_min?: number | null
          created_at?: string
          details?: string | null
          flat_per_floor?: number | null
          floor?: string | null
          id?: string
          parking?: string | null
          price?: string | null
          price_max?: number | null
          price_min?: number | null
          project_uuid: string
          total_units?: number | null
          updated_at?: string
        }
        Update: {
          bhk_type?: string
          carpet?: string | null
          carpet_max?: number | null
          carpet_min?: number | null
          created_at?: string
          details?: string | null
          flat_per_floor?: number | null
          floor?: string | null
          id?: string
          parking?: string | null
          price?: string | null
          price_max?: number | null
          price_min?: number | null
          project_uuid?: string
          total_units?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_project_uuid_fkey"
            columns: ["project_uuid"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer"],
    },
  },
} as const
