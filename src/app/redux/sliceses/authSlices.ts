import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// Define a type for the slice state
interface AuthState {
  isLoggedIn: boolean
  user: {
    email: string
    isAdmin: boolean
  } | null
  loading: boolean
}

// Define the initial state using that type
const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  loading: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ email: string; isAdmin: boolean }>) => {
      state.isLoggedIn = true
      state.user = action.payload
      state.loading = false
    },
    logout: (state) => {
      state.isLoggedIn = false
      state.user = null
      state.loading = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { login, logout, setLoading } = authSlice.actions

// Selectors
export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn
export const selectUser = (state: RootState) => state.auth.user
export const selectLoading = (state: RootState) => state.auth.loading

export default authSlice.reducer