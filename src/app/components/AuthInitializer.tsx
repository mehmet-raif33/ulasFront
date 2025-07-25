"use client";
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { restoreAuth, setLoading, logout, setInitialized } from '../redux/sliceses/authSlices';
import { tokenManager } from '../../lib/token-manager';
import { tabComm, MESSAGE_TYPES } from '../utils/broadcastChannel';
import { RootState } from '../redux/store';
import { log } from '../../lib/logger';

const AuthInitializer = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const isInitialized = useSelector((state: RootState) => state.auth.isInitialized);
  const initializationRef = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // Eğer zaten initialize edildiyse tekrar çalıştırma
      if (isInitialized || initializationRef.current) {
        return;
      }

      initializationRef.current = true;

      if (typeof window !== 'undefined') {
        dispatch(setLoading(true));
        
        try {
          console.log('🚀 Starting AuthInitializer...');
          
          // Token manager'ı initialize et
          await tokenManager.initialize();
          console.log('✅ TokenManager initialized');
          
          // Token manager'dan user bilgisini al
          const userData = tokenManager.getUserData();
          const isAuthenticated = tokenManager.isAuthenticated();
          const tokenInfo = tokenManager.getTokenInfo();
          
          console.log('🔍 Auth check:', { 
            userData: userData ? { id: userData.id, email: userData.email, role: userData.role } : null,
            isAuthenticated,
            tokenInfo 
          });
          
          if (userData && isAuthenticated) {
            log.info('User authenticated via token manager', { userId: userData.id, email: userData.email });
            console.log('✅ User is authenticated, restoring auth state');
            
            // Kullanıcı bilgilerini Redux'a kaydet (role mapping ile)
            dispatch(restoreAuth({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role === 'admin' ? 'admin' : 'user' as 'admin' | 'user',
            }));
            
            // Landing page veya auth sayfasındaysa dashboard'a yönlendir
            const currentPath = window.location.pathname;
            if (currentPath === '/landing' || currentPath === '/auth') {
              log.debug('Redirecting from auth page to dashboard', { from: currentPath });
              console.log('🔄 Redirecting to dashboard from:', currentPath);
              router.push('/');
            }
          } else {
            log.info('No valid authentication found');
            console.log('❌ No valid authentication - clearing auth state');
            
            // Token yoksa korumalı sayfalardaysa landing page'e yönlendir
            const currentPath = window.location.pathname;
            if (currentPath !== '/landing' && currentPath !== '/auth') {
              log.debug('Redirecting to landing page', { from: currentPath });
              console.log('🔄 Redirecting to landing from:', currentPath);
              router.push('/landing');
            }
          }
        } catch (error) {
          log.error('Auth initialization error', error);
          console.error('❌ Auth initialization failed:', error);
          
          // Hata durumunda logout yap - Ama sadece gerçekten kritik hatalarda
          if (error && typeof error === 'object' && 'message' in error) {
            const errorMessage = (error as Error).message;
            if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('timeout')) {
              console.log('🌐 Network error detected, not logging out user');
              // Network hataları için logout yapma, kullanıcı offline olabilir
            } else {
              console.log('💔 Critical auth error, logging out user');
              dispatch(logout());
            }
          } else {
            dispatch(logout());
          }
          
          const currentPath = window.location.pathname;
          if (currentPath !== '/landing' && currentPath !== '/auth') {
            router.push('/landing');
          }
        } finally {
          dispatch(setLoading(false));
          dispatch(setInitialized(true));
        }
      }
    };

    initializeAuth();
  }, [dispatch, router, isInitialized]);

  // Enhanced cross-tab communication
  useEffect(() => {
    // Logout mesajını dinle
    const unsubscribeLogout = tabComm.listen(MESSAGE_TYPES.LOGOUT, () => {
      log.debug('Received logout broadcast from another tab');
      dispatch(logout());
      
      // Token manager'da da temizle
      tokenManager.clearTokens().catch(error => log.error('Token clear error', error));
      
      // Auth sayfasına yönlendir
      if (window.location.pathname !== '/landing' && window.location.pathname !== '/auth') {
        router.push('/landing');
      }
    });

    // Login mesajını dinle
    const unsubscribeLogin = tabComm.listen(MESSAGE_TYPES.LOGIN, (userData: unknown) => {
      log.debug('Received login broadcast from another tab');
      
      if (userData && typeof userData === 'object' && 'id' in userData && 'email' in userData && 'name' in userData && 'role' in userData) {
        const typedUserData = userData as { id: string; email: string; name: string; role: "user" | "admin" };
        
        // Redux state'i güncelle (role mapping ile)
        const mappedUserData = {
          ...typedUserData,
          role: typedUserData.role === 'admin' ? 'admin' : 'user' as 'admin' | 'user'
        };
        dispatch(restoreAuth(mappedUserData));
        
        // Auth sayfasındaysa dashboard'a yönlendir
        if (window.location.pathname === '/auth' || window.location.pathname === '/landing') {
          router.push('/');
        }
      }
    });

    // Token expired mesajını dinle
    const unsubscribeTokenExpired = tabComm.listen(MESSAGE_TYPES.TOKEN_EXPIRED, () => {
      log.warn('Received token expired broadcast from another tab');
      
      // Redux state'i temizle
      dispatch(logout());
      
      // Token manager'da da temizle (eğer başka tab logout yapmışsa)
      tokenManager.clearTokens().catch(error => log.error('Token clear error', error));
      
      // Landing sayfasına yönlendir
      if (window.location.pathname !== '/landing' && window.location.pathname !== '/auth') {
        router.push('/landing');
      }
    });

    // Session update mesajını dinle (yeni eklenen)
    const unsubscribeSessionUpdate = tabComm.listen(MESSAGE_TYPES.SESSION_UPDATE, (sessionData: unknown) => {
      log.debug('Received session update broadcast from another tab');
      
      // Session data varsa token manager'ı güncelle
      if (sessionData && typeof sessionData === 'object') {
        // Bu, token yenileme durumlarında kullanılabilir
        log.debug('Session updated', { sessionData });
      }
    });

    // Cleanup
    return () => {
      unsubscribeLogout();
      unsubscribeLogin();
      unsubscribeTokenExpired();
      unsubscribeSessionUpdate();
    };
  }, [dispatch, router]);

  // Token durumunu periyodik olarak kontrol et
  useEffect(() => {
    const interval = setInterval(() => {
      if (tokenManager.isAuthenticated()) {
        const tokenInfo = tokenManager.getTokenInfo();
        
        if (tokenInfo && !tokenInfo.isValid) {
          log.warn('Token is invalid, logging out');
          dispatch(logout());
          tokenManager.logout().catch(error => log.error('Logout error', error));
        } else if (tokenInfo && tokenInfo.expiresIn && tokenInfo.expiresIn < 60000) {
          // Token 1 dakika içinde dolacaksa uyarı ver
          log.warn('Token will expire soon', { expiresInSeconds: Math.round(tokenInfo.expiresIn / 1000) });
        }
      }
    }, 30000); // 30 saniyede bir kontrol et

    return () => clearInterval(interval);
  }, [dispatch]);

  return null;
};

export default AuthInitializer; 