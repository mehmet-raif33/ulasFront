"use client";
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreAuth, setLoading } from '../redux/sliceses/authSlices';
import { getProfileApi } from '../api';

const AuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        
        if (token) {
          try {
            dispatch(setLoading(true));
            const response = await getProfileApi(token);
            
            if (response.user) {
              dispatch(restoreAuth({
                id: response.user.id.toString(),
                email: response.user.email,
                name: response.user.username || response.user.name || '',
                role: response.user.role === 'admin' ? 'admin' : 'user',
              }));
            }
          } catch (error) {
            console.error('Token validation failed:', error);
            // Token geçersizse localStorage'dan sil
            localStorage.removeItem('token');
          } finally {
            dispatch(setLoading(false));
          }
        }
      }
    };

    initializeAuth();
  }, [dispatch]);

  return null; // Bu component görsel bir şey render etmez
};

export default AuthInitializer; 