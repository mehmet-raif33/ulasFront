import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (gelecekte otomatik generate edilecek)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          plate: string
          brand: string
          model: string
          year: number
          fuel_type: string
          status: 'active' | 'inactive' | 'maintenance'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          plate: string
          brand: string
          model: string
          year: number
          fuel_type: string
          status?: 'active' | 'inactive' | 'maintenance'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plate?: string
          brand?: string
          model?: string
          year?: number
          fuel_type?: string
          status?: 'active' | 'inactive' | 'maintenance'
          created_at?: string
          updated_at?: string
        }
      }
      personnel: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          department: string
          position: string
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          department: string
          position: string
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          department?: string
          position?: string
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          vehicle_id: string
          personnel_id: string
          transaction_type: 'fuel' | 'maintenance' | 'repair' | 'toll' | 'parking' | 'other'
          amount: number
          description: string
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          personnel_id: string
          transaction_type: 'fuel' | 'maintenance' | 'repair' | 'toll' | 'parking' | 'other'
          amount: number
          description: string
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          personnel_id?: string
          transaction_type?: 'fuel' | 'maintenance' | 'repair' | 'toll' | 'parking' | 'other'
          amount?: number
          description?: string
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 