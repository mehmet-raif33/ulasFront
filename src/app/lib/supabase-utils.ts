import { supabase } from './supabase'
import type { Database } from './supabase'

// Type definitions
type User = Database['public']['Tables']['users']['Row']
type Vehicle = Database['public']['Tables']['vehicles']['Row']
type Personnel = Database['public']['Tables']['personnel']['Row']
type Transaction = Database['public']['Tables']['transactions']['Row']

// User functions
export const userUtils = {
  // Get user profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      // Eğer profil bulunamazsa, auth user'dan bilgileri al
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.id === userId) {
        return {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || 'Kullanıcı',
          role: user.user_metadata?.role || 'user',
          created_at: user.created_at,
          updated_at: user.updated_at || user.created_at,
        }
      }
      throw error
    }
    return data
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Create user profile (for new users)
  async createUserProfile(userId: string, userData: { email: string; name: string; role: 'admin' | 'user' }) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Vehicle functions
export const vehicleUtils = {
  // Get all vehicles
  async getAllVehicles() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get vehicle by ID
  async getVehicleById(id: string) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Get vehicle by plate
  async getVehicleByPlate(plate: string) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('plate', plate)
      .single()
    
    if (error) throw error
    return data
  },

  // Create new vehicle
  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) {
    console.log('Supabase createVehicle called with:', vehicle);
    
    const { data, error } = await supabase
      .from('vehicles')
      .insert(vehicle)
      .select()
      .single()
    
    console.log('Supabase response:', { data, error });
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    return data
  },

  // Update vehicle
  async updateVehicle(id: string, updates: Partial<Vehicle>) {
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete vehicle
  async deleteVehicle(id: string) {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}

// Personnel functions
export const personnelUtils = {
  // Get all personnel
  async getAllPersonnel() {
    const { data, error } = await supabase
      .from('personnel')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get personnel by ID
  async getPersonnelById(id: string) {
    const { data, error } = await supabase
      .from('personnel')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create new personnel
  async createPersonnel(personnel: Omit<Personnel, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('personnel')
      .insert(personnel)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update personnel
  async updatePersonnel(id: string, updates: Partial<Personnel>) {
    const { data, error } = await supabase
      .from('personnel')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete personnel
  async deletePersonnel(id: string) {
    const { error } = await supabase
      .from('personnel')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}

// Transaction functions
export const transactionUtils = {
  // Get all transactions
  async getAllTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        vehicles (plate, brand, model),
        personnel (name, email)
      `)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get transactions by vehicle
  async getTransactionsByVehicle(vehicleId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        vehicles (plate, brand, model),
        personnel (name, email)
      `)
      .eq('vehicle_id', vehicleId)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get transactions by personnel
  async getTransactionsByPersonnel(personnelId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        vehicles (plate, brand, model),
        personnel (name, email)
      `)
      .eq('personnel_id', personnelId)
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create new transaction
  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select(`
        *,
        vehicles (plate, brand, model),
        personnel (name, email)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Update transaction
  async updateTransaction(id: string, updates: Partial<Transaction>) {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        vehicles (plate, brand, model),
        personnel (name, email)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Delete transaction
  async deleteTransaction(id: string) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
} 