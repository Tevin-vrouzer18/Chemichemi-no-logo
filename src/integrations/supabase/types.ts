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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          business_id: string
          created_at: string | null
          customer_id: string
          id: string
          notes: string | null
          scheduled_date: string
          service_id: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          total_amount: number
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          customer_id: string
          id?: string
          notes?: string | null
          scheduled_date: string
          service_id: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          total_amount: number
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          customer_id?: string
          id?: string
          notes?: string | null
          scheduled_date?: string
          service_id?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          total_amount?: number
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          business_id: string
          created_at: string | null
          email: string | null
          id: string
          last_visit: string | null
          loyalty_points: number | null
          name: string
          phone: string | null
          total_visits: number | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          last_visit?: string | null
          loyalty_points?: number | null
          name: string
          phone?: string | null
          total_visits?: number | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          last_visit?: string | null
          loyalty_points?: number | null
          name?: string
          phone?: string | null
          total_visits?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_metrics: {
        Row: {
          average_rating: number | null
          business_id: string
          created_at: string | null
          customer_count: number | null
          expenses: number | null
          id: string
          metric_date: string
          net_profit: number | null
          revenue: number | null
          updated_at: string | null
          wash_count: number | null
        }
        Insert: {
          average_rating?: number | null
          business_id: string
          created_at?: string | null
          customer_count?: number | null
          expenses?: number | null
          id?: string
          metric_date: string
          net_profit?: number | null
          revenue?: number | null
          updated_at?: string | null
          wash_count?: number | null
        }
        Update: {
          average_rating?: number | null
          business_id?: string
          created_at?: string | null
          customer_count?: number | null
          expenses?: number | null
          id?: string
          metric_date?: string
          net_profit?: number | null
          revenue?: number | null
          updated_at?: string | null
          wash_count?: number | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          business_id: string
          created_at: string | null
          hire_date: string
          id: string
          is_active: boolean | null
          position: string
          profile_id: string
          salary: number | null
          shift_schedule: Json | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          hire_date?: string
          id?: string
          is_active?: boolean | null
          position: string
          profile_id: string
          salary?: number | null
          shift_schedule?: Json | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          hire_date?: string
          id?: string
          is_active?: boolean | null
          position?: string
          profile_id?: string
          salary?: number | null
          shift_schedule?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          business_id: string
          category: string
          created_at: string | null
          description: string
          employee_id: string | null
          expense_date: string
          id: string
          receipt_url: string | null
          status: Database["public"]["Enums"]["expense_status"] | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          business_id: string
          category: string
          created_at?: string | null
          description: string
          employee_id?: string | null
          expense_date: string
          id?: string
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["expense_status"] | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          business_id?: string
          category?: string
          created_at?: string | null
          description?: string
          employee_id?: string | null
          expense_date?: string
          id?: string
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["expense_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          appointment_id: string | null
          business_id: string
          comment: string | null
          created_at: string | null
          customer_id: string
          feedback_date: string
          id: string
          rating: number | null
          response: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          business_id: string
          comment?: string | null
          created_at?: string | null
          customer_id: string
          feedback_date?: string
          id?: string
          rating?: number | null
          response?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          business_id?: string
          comment?: string | null
          created_at?: string | null
          customer_id?: string
          feedback_date?: string
          id?: string
          rating?: number | null
          response?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          business_id: string
          category: string
          cost_per_unit: number | null
          created_at: string | null
          current_stock: number
          id: string
          last_restocked: string | null
          minimum_stock: number
          name: string
          supplier: string | null
          unit: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          category: string
          cost_per_unit?: number | null
          created_at?: string | null
          current_stock?: number
          id?: string
          last_restocked?: string | null
          minimum_stock?: number
          name: string
          supplier?: string | null
          unit: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          category?: string
          cost_per_unit?: number | null
          created_at?: string | null
          current_stock?: number
          id?: string
          last_restocked?: string | null
          minimum_stock?: number
          name?: string
          supplier?: string | null
          unit?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string
          created_at: string | null
          id: string
          payment_date: string | null
          payment_method: string
          status: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          appointment_id: string
          created_at?: string | null
          id?: string
          payment_date?: string | null
          payment_method: string
          status?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string
          created_at?: string | null
          id?: string
          payment_date?: string | null
          payment_method?: string
          status?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_id: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          email: string
          id: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      service_records: {
        Row: {
          business_id: string
          completed_at: string
          created_at: string
          employee_id: string
          id: string
          payment_method: string
          service_duration: number
          service_id: string
          service_price: number
          updated_at: string
          vehicle_plate: string
          vehicle_type: string
        }
        Insert: {
          business_id: string
          completed_at?: string
          created_at?: string
          employee_id: string
          id?: string
          payment_method: string
          service_duration: number
          service_id: string
          service_price: number
          updated_at?: string
          vehicle_plate: string
          vehicle_type: string
        }
        Update: {
          business_id?: string
          completed_at?: string
          created_at?: string
          employee_id?: string
          id?: string
          payment_method?: string
          service_duration?: number
          service_id?: string
          service_price?: number
          updated_at?: string
          vehicle_plate?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_service_records_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_service_records_service"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          business_id: string
          created_at: string | null
          description: string | null
          duration: number
          id: string
          is_active: boolean | null
          name: string
          popularity: number | null
          price: number
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          is_active?: boolean | null
          name: string
          popularity?: number | null
          price: number
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          is_active?: boolean | null
          name?: string
          popularity?: number | null
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          color: string | null
          created_at: string | null
          customer_id: string
          id: string
          make: string
          model: string
          plate_number: string | null
          year: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          make: string
          model: string
          plate_number?: string | null
          year?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          make?: string
          model?: string
          plate_number?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_employee_profile: {
        Args: {
          profile_business_id: string
          profile_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      get_current_user_business_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      appointment_status: "pending" | "in_progress" | "completed" | "cancelled"
      expense_status: "paid" | "pending"
      user_role: "owner" | "employee" | "customer"
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
      appointment_status: ["pending", "in_progress", "completed", "cancelled"],
      expense_status: ["paid", "pending"],
      user_role: ["owner", "employee", "customer"],
    },
  },
} as const
