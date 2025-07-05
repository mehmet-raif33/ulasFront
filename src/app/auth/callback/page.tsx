'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { login, setError } from '../../redux/sliceses/authSlices'
import { authUtils } from '../../lib/auth-utils'

export default function AuthCallback() {
  const router = useRouter()
  const dispatch = useDispatch()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const userData = await authUtils.getCurrentUser()
        if (userData) {
          dispatch(login(userData))
          router.push('/')
        } else {
          dispatch(setError('Giriş başarısız'))
          router.push('/auth')
        }
      } catch (error: unknown) {
        let message = 'Bir hata oluştu';
        if (error && typeof error === 'object' && 'message' in error) {
          message = (error as { message?: string }).message || message;
        }
        dispatch(setError(message));
        router.push('/auth');
      }
    }

    handleCallback()
  }, [dispatch, router])

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Giriş yapılıyor...</p>
      </div>
    </div>
  )
} 