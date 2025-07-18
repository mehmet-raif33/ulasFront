"use client"
import './globals.css'
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { selectUser, selectLoading } from './redux/sliceses/authSlices';
import { RootState } from './redux/store';
import { motion } from 'framer-motion';
import { getActivitiesApi, getVehiclesCountApi, getPersonnelCountApi, getTransactionsStatsApi } from './api';


export default function Home() {
  const user = useSelector(selectUser);
  // const isAdmin = useSelector(selectIsAdmin);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const isLoading = useSelector(selectLoading);
  const theme = useSelector((state: RootState) => state.theme.theme);
  const router = useRouter();
  const [activities, setActivities] = useState<Array<{ id: string; action: string; user_name?: string; created_at?: string }>>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [vehiclesCount, setVehiclesCount] = useState<number | null>(null);
  const [personnelCount, setPersonnelCount] = useState<number | null>(null);
  const [transactionsStats, setTransactionsStats] = useState<{ total_transactions?: number; total_amount?: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);



  useEffect(() => {
    const fetchActivities = async () => {
      setActivitiesLoading(true);
      setActivitiesError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Oturum bulunamadı');
        const data = await getActivitiesApi(token);
        setActivities(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch (err: unknown) {
        const errorMessage = err && typeof err === 'object' && 'message' in err ? (err as { message?: string }).message || 'Etkinlikler alınamadı' : 'Etkinlikler alınamadı';
        setActivitiesError(errorMessage);
      } finally {
        setActivitiesLoading(false);
      }
    };
    fetchActivities();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Oturum bulunamadı');
        
        const [vehicles, personnel, transactions] = await Promise.all([
          getVehiclesCountApi(token),
          getPersonnelCountApi(token),
          getTransactionsStatsApi(token)
        ]);
        
        setVehiclesCount(vehicles);
        setPersonnelCount(personnel);
        setTransactionsStats(transactions);
      } catch (err: unknown) {
        const errorMessage = err && typeof err === 'object' && 'message' in err ? (err as { message?: string }).message || 'İstatistikler alınamadı' : 'İstatistikler alınamadı';
        setStatsError(errorMessage);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Loading durumunda loading göster
  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Giriş yapmamış kullanıcılar için loading göster
  if (!isLoggedIn) {
    return (
      <div className="flex-1 min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }



  return (
    <div className={`flex-1 bg-gradient-to-br min-h-screen p-6 ${theme === 'dark' ? 'from-slate-900 to-blue-950' : 'from-slate-50 to-blue-50'}`}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className={`text-4xl font-bold mb-3 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
          Hoş Geldiniz, {user?.name || 'Kullanıcı'}!
        </h1>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {new Date().toLocaleDateString('tr-TR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsLoading ? (
          <div className="col-span-4 text-center text-gray-400">Yükleniyor...</div>
        ) : statsError ? (
          <div className="col-span-4 text-center text-red-500">{statsError}</div>
        ) : (
          <>
            <div className={`rounded-lg shadow-sm border p-4 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}> 
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Toplam Araç</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehiclesCount ?? '-'}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-blue-500 text-white">🚗</div>
              </div>
            </div>
            <div className={`rounded-lg shadow-sm border p-4 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}> 
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Aktif Personel</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{personnelCount ?? '-'}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-green-500 text-white">👥</div>
              </div>
            </div>
            <div className={`rounded-lg shadow-sm border p-4 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}> 
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Toplam İşlem</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{transactionsStats?.total_transactions ?? '-'}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-purple-500 text-white">📊</div>
              </div>
            </div>
            <div className={`rounded-lg shadow-sm border p-4 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}> 
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Toplam Gelir</p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{transactionsStats?.total_amount ? `₺${Number(transactionsStats.total_amount).toLocaleString('tr-TR')}` : '-'}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-yellow-500 text-white">💰</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Recent Activities */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className={`lg:col-span-2 rounded-lg shadow-sm border p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
        >
          <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Son Aktiviteler</h2>
          {activitiesLoading && <div className="text-center text-sm text-gray-400">Yükleniyor...</div>}
          {activitiesError && <div className="text-center text-sm text-red-500">{activitiesError}</div>}
          <div className="space-y-2">
            {activities.map((activity, index) => (
              <div key={activity.id || index} className={`flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 ${theme === 'dark' ? 'hover:bg-slate-900' : 'hover:bg-gray-50'}`}> 
                <div className="text-xl">
                  {/* Icon logic */}
                  {activity.action?.toLowerCase().includes('araç') && '🚗'}
                  {activity.action?.toLowerCase().includes('kullanıcı') && '👤'}
                  {activity.action?.toLowerCase().includes('kategori') && '🏷️'}
                  {activity.action?.toLowerCase().includes('işlem') && '💸'}
                  {activity.action?.toLowerCase().includes('personel') && '👥'}
                  {activity.action?.toLowerCase().includes('şifre') && '🔐'}
                  {activity.action?.toLowerCase().includes('güncellendi') && '✏️'}
                  {activity.action?.toLowerCase().includes('silindi') && '🗑️'}
                  {activity.action?.toLowerCase().includes('eklendi') && '➕'}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{activity.action}</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{activity.user_name ? `${activity.user_name} - ` : ''}{activity.created_at ? new Date(activity.created_at).toLocaleString('tr-TR') : ''}</p>
                </div>
              </div>
            ))}
            {!activitiesLoading && !activitiesError && activities.length === 0 && (
              <div className="text-center text-sm text-gray-400">Henüz etkinlik yok.</div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className={`rounded-lg shadow-sm border p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
        >
          <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Hızlı İşlemler</h2>
          <div className="space-y-2">
            <button 
              onClick={() => router.push('/vehicles')}
              className={`w-full bg-blue-600 text-white py-2 px-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${theme === 'dark' ? 'hover:bg-blue-800' : 'hover:bg-blue-700'}`}
            >
              <span>🚗</span>
              <span>Araç Ekle</span>
            </button>
            <button 
              onClick={() => router.push('/personnel')}
              className={`w-full bg-green-600 text-white py-2 px-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${theme === 'dark' ? 'hover:bg-green-800' : 'hover:bg-green-700'}`}
            >
              <span>👤</span>
              <span>Personel Ekle</span>
            </button>
            <button 
              onClick={() => router.push('/add-transaction')}
              className={`w-full bg-purple-600 text-white py-2 px-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${theme === 'dark' ? 'hover:bg-purple-800' : 'hover:bg-purple-700'}`}
            >
              <span>📋</span>
              <span>İşlem Ekle</span>
            </button>
            <button 
              onClick={() => router.push('/transaction-categories')}
              className={`w-full bg-orange-600 text-white py-2 px-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${theme === 'dark' ? 'hover:bg-orange-800' : 'hover:bg-orange-700'}`}
            >
              <span>📊</span>
              <span>Kategoriler</span>
            </button>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className={`rounded-lg shadow-sm border p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
        >
          <h2 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Sistem Durumu</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Veritabanı</span>
              <span className={`font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>✓ Aktif</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>API Servisi</span>
              <span className={`font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>✓ Aktif</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Güvenlik</span>
              <span className={`font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>✓ Güvenli</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
        className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Welcome Message */}
        <div className={`rounded-lg shadow-sm border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
            🎉 Hoş Geldiniz!
          </h3>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Araç Filo Yönetim Sistemine hoş geldiniz. Sol menüden istediğiniz bölüme erişebilir ve 
            filo yönetiminizi kolayca gerçekleştirebilirsiniz.
          </p>
        </div>

        {/* Quick Tips */}
        <div className={`rounded-lg shadow-sm border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
            💡 Hızlı İpuçları
          </h3>
          <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>• Araç eklemek için &ldquo;Araç Ekle&rdquo; butonunu kullanın</li>
            <li>• Personel yönetimi için &ldquo;Personel Ekle&rdquo; seçeneğini kullanın</li>
            <li>• İşlem kayıtları için &ldquo;İşlem Ekle&rdquo; butonunu kullanın</li>
            <li>• Kategorileri yönetmek için &ldquo;Kategoriler&rdquo; seçeneğini kullanın</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

