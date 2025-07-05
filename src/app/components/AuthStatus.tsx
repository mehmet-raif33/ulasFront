'use client';

import { useSelector } from 'react-redux';
import { selectIsLoggedIn, selectUser, selectIsAdmin } from '../redux/sliceses/authSlices';
import { RootState } from '../redux/store';

export default function AuthStatus() {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const user = useSelector(selectUser);
  const isAdmin = useSelector(selectIsAdmin);
  const theme = useSelector((state: RootState) => state.theme.theme);

  if (!isLoggedIn) {
    return (
      <div className={`px-4 py-3 rounded mb-4 border font-medium ${theme === 'dark' ? 'bg-yellow-900 border-yellow-700 text-yellow-200' : 'bg-yellow-100 border-yellow-400 text-yellow-700'}`}>
        <strong>Durum:</strong> Giriş yapılmadı
      </div>
    );
  }

  return (
    <div className={`px-4 py-3 rounded mb-4 border font-medium ${theme === 'dark' ? 'bg-green-900 border-green-700 text-green-200' : 'bg-green-100 border-green-400 text-green-700'}`}>
      <strong>Durum:</strong> Giriş yapıldı - {user?.email} ({isAdmin ? 'Admin' : 'Kullanıcı'})
    </div>
  );
} 