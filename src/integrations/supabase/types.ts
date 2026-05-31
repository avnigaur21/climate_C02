export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          location: string | null
          country: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          location?: string | null
          country?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          location?: string | null
          country?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      imports: {
        Row: {
          id: string
          user_id: string
          filename: string
          source: string
          status: 'processing' | 'completed' | 'failed'
          row_count: number
          total_co2_kg: number
          errors: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          source?: string
          status?: 'processing' | 'completed' | 'failed'
          row_count?: number
          total_co2_kg?: number
          errors?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          source?: string
          status?: 'processing' | 'completed' | 'failed'
          row_count?: number
          total_co2_kg?: number
          errors?: Json
          created_at?: string
        }
        Relationships: []
      }
      footprints: {
        Row: {
          id: string
          user_id: string
          import_id: string | null
          category: 'transport' | 'energy' | 'food' | 'shopping' | 'purchase' | 'travel' | 'other'
          description: string | null
          activity_date: string
          amount: number
          unit: string
          co2_kg: number
          emission_factor: number | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          import_id?: string | null
          category: 'transport' | 'energy' | 'food' | 'shopping' | 'purchase' | 'travel' | 'other'
          description?: string | null
          activity_date?: string
          amount?: number
          unit?: string
          co2_kg: number
          emission_factor?: number | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          import_id?: string | null
          category?: 'transport' | 'energy' | 'food' | 'shopping' | 'purchase' | 'travel' | 'other'
          description?: string | null
          activity_date?: string
          amount?: number
          unit?: string
          co2_kg?: number
          emission_factor?: number | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'footprints_import_id_fkey'
            columns: ['import_id']
            isOneToOne: false
            referencedRelation: 'imports'
            referencedColumns: ['id']
          },
        ]
      }
      regions: {
        Row: {
          id: string
          region_code: string
          name: string
          lat: number
          lng: number
          population: number
          vulnerability_index: number
          exposure_fraction: number
          primary_risk: string
          climate_impacts: string[]
          hazard_weights: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          region_code: string
          name: string
          lat: number
          lng: number
          population: number
          vulnerability_index: number
          exposure_fraction: number
          primary_risk: string
          climate_impacts?: string[]
          hazard_weights?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          region_code?: string
          name?: string
          lat?: number
          lng?: number
          population?: number
          vulnerability_index?: number
          exposure_fraction?: number
          primary_risk?: string
          climate_impacts?: string[]
          hazard_weights?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      risk_evaluations: {
        Row: {
          id: string
          user_id: string
          footprint_id: string | null
          region_id: string
          risk_type: 'flood' | 'drought' | 'heat' | 'displacement' | 'food_insecurity' | 'storm' | 'general'
          risk_score: number
          people_at_risk: number
          scenario: Json
          explanation: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          footprint_id?: string | null
          region_id: string
          risk_type: 'flood' | 'drought' | 'heat' | 'displacement' | 'food_insecurity' | 'storm' | 'general'
          risk_score: number
          people_at_risk?: number
          scenario?: Json
          explanation?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          footprint_id?: string | null
          region_id?: string
          risk_type?: 'flood' | 'drought' | 'heat' | 'displacement' | 'food_insecurity' | 'storm' | 'general'
          risk_score?: number
          people_at_risk?: number
          scenario?: Json
          explanation?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'risk_evaluations_region_id_fkey'
            columns: ['region_id']
            isOneToOne: false
            referencedRelation: 'regions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'risk_evaluations_footprint_id_fkey'
            columns: ['footprint_id']
            isOneToOne: false
            referencedRelation: 'footprints'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database['public']

export type Tables<TableName extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][TableName]['Row']

export type TablesInsert<TableName extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][TableName]['Insert']

export type TablesUpdate<TableName extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][TableName]['Update']
