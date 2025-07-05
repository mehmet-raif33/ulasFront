import { supabase } from './supabase'
import { userUtils } from './supabase-utils'
import type { User } from './supabase-utils'

export const authUtils = {
  // Email/Password ile giriş
  async signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Kullanıcı profilini al
        const profile = await userUtils.getUserProfile(data.user.id)
        return {
          id: data.user.id,
          email: data.user.email!,
          name: profile.name,
          role: profile.role,
        }
      }

      throw new Error('Giriş başarısız')
    } catch (error: unknown) {
      throw error
    }
  },

  // Email/Password ile kayıt
  async signUpWithEmail(email: string, password: string, name: string, role: 'admin' | 'user' = 'user') {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          }
        }
      })

      if (error) throw error

      if (data.user) {
        // Trigger otomatik olarak users tablosuna ekleyecek
        // Manuel profil oluşturmaya gerek yok
        return {
          id: data.user.id,
          email: data.user.email!,
          name,
          role,
        }
      }

      throw new Error('Kayıt başarısız')
    } catch (error: unknown) {
      throw error
    }
  },

  // Google ile giriş
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
      return data
    } catch (error: unknown) {
      throw error
    }
  },

  // Çıkış yap
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Local storage'ı temizle
      if (typeof window !== 'undefined') {
        localStorage.removeItem('theme-fab-pos')
      }
      
      return true
    } catch (error: unknown) {
      throw error
    }
  },

  // Mevcut kullanıcıyı al
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) throw error
      
      if (user) {
        try {
          const profile = await userUtils.getUserProfile(user.id)
          return {
            id: user.id,
            email: user.email!,
            name: profile.name,
            role: profile.role,
          }
        } catch {
          // Profil bulunamazsa auth user bilgilerini kullan
          return {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name || 'Kullanıcı',
            role: user.user_metadata?.role || 'user',
          }
        }
      }

      return null
    } catch (error: unknown) {
      throw error
    }
  },

  // Auth state değişikliklerini dinle
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const profile = await userUtils.getUserProfile(session.user.id)
          callback({
            id: session.user.id,
            email: session.user.email!,
            name: profile.name,
            role: profile.role,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
          })
        } catch {
          // Profil bulunamazsa auth user bilgilerini kullan
          callback({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || 'Kullanıcı',
            role: session.user.user_metadata?.role || 'user',
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at,
          })
        }
      } else if (event === 'SIGNED_OUT') {
        callback(null)
      }
    })
  },

  // Şifre sıfırlama
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error
      return true
    } catch (error: unknown) {
      throw error
    }
  },

  // Şifre güncelleme
  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      return true
    } catch (error: unknown) {
      throw error
    }
  },

  // Kullanıcı profilini güncelle
  async updateUserProfile(updates: { name?: string; role?: 'admin' | 'user' }) {
    try {
      const { data: { user }, error } = await supabase.auth.updateUser({
        data: updates
      })

      if (error) throw error

      // SQL tablosunu da güncelle
      if (user) {
        try {
          await userUtils.updateUserProfile(user.id, updates)
        } catch (sqlError) {
          console.warn('SQL güncelleme hatası:', sqlError)
          // Auth güncellemesi başarılı olduğu için devam et
        }
      }

      return user
    } catch (error: unknown) {
      throw error
    }
  }
} 