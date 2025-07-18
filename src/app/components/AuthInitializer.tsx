"use client";
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { restoreAuth, setLoading, logout } from '../redux/sliceses/authSlices';
import { getProfileApi } from '../api';
import { useState } from 'react';
import { tabComm, MESSAGE_TYPES } from '../utils/broadcastChannel';

const AuthInitializer = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const currentPath = window.location.pathname;
        
        // Token varsa doğrula
        if (token) {
          try {
            dispatch(setLoading(true));
            const response = await getProfileApi(token);
            
            if (response.user) {
              // Kullanıcı bilgilerini Redux'a kaydet
              dispatch(restoreAuth({
                id: response.user.id.toString(),
                email: response.user.email,
                name: response.user.username || response.user.name || '',
                role: response.user.role === 'admin' ? 'admin' : 'user',
              }));
              
              // Landing page veya auth sayfasındaysa dashboard'a yönlendir
              if (currentPath === '/landing' || currentPath === '/auth') {
                router.push('/');
              }
            }
          } catch (error: unknown) {
            console.error('Token validation failed:', error);
            // Token geçersizse localStorage'dan sil
            localStorage.removeItem('token');
            const errorMessage = error && typeof error === 'object' && 'message' in error ? (error as { message?: string }).message || 'Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.' : 'Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.';
            setErrorMessage(errorMessage);
            
            // Sadece korumalı sayfalardaysa landing page'e yönlendir
            const protectedRoutes = ['/vehicles', '/personnel', '/add-transaction', '/transaction-categories'];
            if (protectedRoutes.includes(currentPath)) {
              router.push('/landing');
            }
          } finally {
            dispatch(setLoading(false));
          }
        } else {
          // Token yoksa sadece korumalı sayfalardaysa landing page'e yönlendir
          const protectedRoutes = ['/vehicles', '/personnel', '/add-transaction', '/transaction-categories'];
          if (protectedRoutes.includes(currentPath)) {
            router.push('/landing');
          }
          dispatch(setLoading(false));
        }
      }
    };

    initializeAuth();
  }, [dispatch, router]);

  // Sekme arası iletişim için listener'ları kur
  useEffect(() => {
    // Logout mesajını dinle
    const unsubscribeLogout = tabComm.listen(MESSAGE_TYPES.LOGOUT, () => {
      console.log('Logout mesajı alındı, oturum kapatılıyor...');
      localStorage.removeItem('token');
      dispatch(logout());
      router.push('/auth');
    });

    // Login mesajını dinle
    const unsubscribeLogin = tabComm.listen(MESSAGE_TYPES.LOGIN, (userData: unknown) => {
      console.log('Login mesajı alındı, oturum açılıyor...');
      if (userData && typeof userData === 'object' && 'id' in userData && 'email' in userData && 'name' in userData && 'role' in userData) {
        const typedUserData = userData as { id: string; email: string; name: string; role: "user" | "admin" };
        dispatch(restoreAuth(typedUserData));
        if (window.location.pathname === '/auth') {
          router.push('/');
        }
      }
    });

    // Token expired mesajını dinle
    const unsubscribeTokenExpired = tabComm.listen(MESSAGE_TYPES.TOKEN_EXPIRED, () => {
      console.log('Token expired mesajı alındı, oturum kapatılıyor...');
      localStorage.removeItem('token');
      dispatch(logout());
      router.push('/auth');
    });

    // Cleanup
    return () => {
      unsubscribeLogout();
      unsubscribeLogin();
      unsubscribeTokenExpired();
    };
  }, [dispatch, router]);

  useEffect(() => {
    if (errorMessage) {
      alert(errorMessage);
      setErrorMessage(null);
    }
  }, [errorMessage]);

  return null;
};

export default AuthInitializer; 