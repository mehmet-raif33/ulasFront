import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { login, logout } from '../redux/sliceses/authSlices'
import { authUtils } from '../lib/auth-utils'

export const useAuth = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Mevcut kullanıcıyı kontrol et
    const checkUser = async () => {
      try {
        const user = await authUtils.getCurrentUser()
        if (user) {
          dispatch(login(user))
        }
      } catch (error: unknown) {
        console.error('Auth check error:', error)
        // Hata durumunda logout yap
        dispatch(logout())
      }
    }

    checkUser()

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = authUtils.onAuthStateChange((user) => {
      if (user) {
        dispatch(login(user))
      } else {
        dispatch(logout())
      }
    })

    // Hata durumunda da logout yap
    // const handleError = (error: any) => {
    //   console.error('Auth error:', error)
    //   dispatch(setError(error.message || 'Auth hatası'))
    //   dispatch(logout())
    // }

    return () => {
      subscription.unsubscribe()
    }
  }, [dispatch])
} 