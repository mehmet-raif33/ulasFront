import { configureStore } from '@reduxjs/toolkit'
import authReducer from './sliceses/authSlices'
import themeReducer from './sliceses/themeSlice'

// LocalStorage'dan auth state'i geri yükle
const loadAuthState = () => {
  try {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const user = JSON.parse(userData);
      return {
        isLoggedIn: true,
        user: user,
        loading: false,
        error: null,
        isInitialized: true
      };
    }
  } catch (error) {
    console.error('Error loading auth state from localStorage:', error);
  }
  
  return {
    isLoggedIn: false,
    user: null,
    loading: false,
    error: null,
    isInitialized: true
  };
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
  },
  preloadedState: {
    auth: loadAuthState()
  }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch 