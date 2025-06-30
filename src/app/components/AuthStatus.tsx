'use client';

import { useSelector } from 'react-redux';
import { selectIsLoggedIn, selectUser } from '../redux/sliceses/authSlices';

export default function AuthStatus() {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const user = useSelector(selectUser);

  if (!isLoggedIn) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <strong>Durum:</strong> Giriş yapılmadı
      </div>
    );
  }

  return (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      <strong>Durum:</strong> Giriş yapıldı - {user?.email} ({user?.isAdmin ? 'Admin' : 'Kullanıcı'})
    </div>
  );
} 