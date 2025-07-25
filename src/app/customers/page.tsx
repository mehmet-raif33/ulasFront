"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '../redux/store';
import { selectIsLoggedIn, selectUser } from '../redux/sliceses/authSlices';
import { motion } from 'framer-motion';
import { api } from '../../lib/api-client';

// API base URL'ini al
let API_BASE_URL = '';
if (process.env.NODE_ENV === 'production') {
  API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API1 || process.env.NEXT_PUBLIC_API_URL || 'https://ulasserver-production.up.railway.app';
} else {
  API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_API || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
}

// Fallback kontrolü
if (!API_BASE_URL || !API_BASE_URL.startsWith('http')) {
  API_BASE_URL = 'http://localhost:5000';
}

interface Customer {
  customer_email: string;
  customer_phone?: string;
  vehicle_count: number;
  transaction_count: number;
  total_revenue: number;
  first_registration_date: string;
  last_transaction_date?: string;
  vehicle_plates: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const CustomersPage: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const user = useSelector(selectUser);
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const fetchCustomers = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      // Token kontrolü
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
        return;
      }

      const response = await api.getCustomers(token, {
        page,
        limit: pagination.limit,
        search: search.trim()
      });

      if (response.data) {
        setCustomers(response.data as Customer[]);
      } else {
        setCustomers([]);
      }

      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          ...response.pagination
        }));
      }

    } catch (error: any) {
      console.error('Error fetching customers:', error);
      if (error.statusCode === 401) {
        router.push('/auth');
        return;
      }
      setError(error?.message || 'Müşteriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [router, pagination.limit]);

  // Giriş yapmamış kullanıcıları landing page'e yönlendir
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/landing');
    }
  }, [isLoggedIn, router]);

  // Admin olmayan kullanıcıları ana sayfaya yönlendir
  useEffect(() => {
    if (isLoggedIn && user?.role !== 'admin') {
      router.push('/');
    }
  }, [isLoggedIn, user, router]);

  useEffect(() => {
    if (isLoggedIn && user?.role === 'admin') {
      fetchCustomers(pagination.page, searchTerm);
    }
  }, [isLoggedIn, user, pagination.page, searchTerm, fetchCustomers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(1, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    fetchCustomers(newPage, searchTerm);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (!isLoggedIn || user?.role !== 'admin') {
    return (
      <div className="flex-1 min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className={`min-h-screen bg-gradient-to-br ${theme === 'dark' ? 'from-slate-900 via-slate-800 to-blue-950' : 'from-gray-50 via-white to-blue-50'}`}>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    👥 Müşteri Yönetimi
                  </h1>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    Tüm müşteri bilgileri ve işlem geçmişi
                  </p>
                </div>
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/')}
                  className={`group relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-500 hover:to-gray-500 text-white'
                      : 'bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-400 hover:to-slate-400 text-white'
                  } shadow-lg hover:shadow-gray-500/20`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">🏠</span>
                    <span>Ana Sayfa</span>
                    <span className="text-sm group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Search and Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`p-6 rounded-3xl shadow-xl border backdrop-blur-lg ${
                theme === 'dark' 
                  ? 'bg-slate-800/70 border-slate-700' 
                  : 'bg-white/70 border-gray-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Search */}
                <div className="flex-1 min-w-0">
                  <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="E-posta, telefon veya plaka ile ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500/50 transition-all ${
                          theme === 'dark' 
                            ? 'bg-slate-700 border-slate-600 text-gray-200 placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        theme === 'dark'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      🔍 Ara
                    </motion.button>
                  </form>
                </div>

                {/* Stats */}
                <div className="flex gap-4">
                  <div className={`px-4 py-3 rounded-xl ${
                    theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
                  }`}>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {pagination.total}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        Toplam Müşteri
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`mx-auto max-w-2xl p-8 rounded-3xl shadow-2xl border-l-8 ${
                  theme === 'dark'
                    ? 'bg-red-900/30 border-red-500 text-red-300 backdrop-blur-lg'
                    : 'bg-red-50 border-red-500 text-red-700'
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
                  }`}>
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-xl mb-2">Hata Oluştu</h4>
                    <p className="text-lg opacity-90">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 space-y-8"
              >
                <div className="relative">
                  <div className={`w-24 h-24 rounded-full border-8 border-dashed animate-spin ${
                    theme === 'dark' ? 'border-blue-400' : 'border-blue-500'
                  }`} />
                  <div className={`absolute inset-4 rounded-full border-8 border-t-transparent animate-spin ${
                    theme === 'dark' ? 'border-purple-400' : 'border-purple-500'
                  }`} style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
                </div>
                <div className="text-center space-y-3">
                  <h3 className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Müşteri verileri yükleniyor
                  </h3>
                  <p className={`text-lg ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Lütfen bekleyin, veriler hazırlanıyor...
                  </p>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Customers Table */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`rounded-3xl shadow-xl overflow-hidden border ${
                    theme === 'dark' 
                      ? 'bg-slate-800/80 border-slate-700 backdrop-blur-sm' 
                      : 'bg-white/80 border-gray-200'
                  }`}
                >
                  <div className={`p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
                    <h3 className={`text-xl font-bold flex items-center gap-3 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <span className="text-2xl">👥</span>
                      Müşteri Listesi
                      <span className={`ml-auto text-sm font-normal px-3 py-1 rounded-full ${
                        theme === 'dark' 
                          ? 'bg-slate-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {customers.length} müşteri
                      </span>
                    </h3>
                  </div>
                  
                  {customers.length === 0 ? (
                    <div className="text-center py-16">
                      <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
                      }`}>
                        <span className="text-3xl">👥</span>
                      </div>
                      <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Müşteri Bulunamadı
                      </h3>
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                        {searchTerm ? 'Arama kriterlerinize uygun müşteri bulunamadı' : 'Henüz müşteri kaydı bulunmuyor'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <div className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                         {/* Mobil görünüm için kart yapısı */}
                         <div className="lg:hidden space-y-6 p-4">
                           {customers.map((customer, index) => {
                             const firstPlate = customer.vehicle_plates.split(', ')[0];
                             return (
                               <motion.div
                                 key={customer.customer_email}
                                 initial={{ opacity: 0, x: -20 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 transition={{ duration: 0.3, delay: index * 0.05 }}
                                 onClick={() => firstPlate && router.push(`/vehicles/${firstPlate}`)}
                                 className={`p-4 rounded-xl shadow-md cursor-pointer transform transition-all duration-200 active:scale-95 ${
                                   theme === 'dark' 
                                     ? 'bg-slate-800 border border-slate-700 shadow-slate-900/50 hover:bg-slate-700' 
                                     : 'bg-white border border-gray-100 shadow-gray-200/50 hover:bg-gray-50'
                                 }`}
                               >
                                 <div className="space-y-3">
                                   {/* İletişim Bilgileri - Öne Çıkarılmış */}
                                   <div className="flex items-start justify-between">
                                     <div className="space-y-1">
                                       <div className="flex items-center gap-2">
                                         <span className="text-lg">📧</span>
                                         <div className={`font-medium text-sm break-all ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                           {customer.customer_email}
                                         </div>
                                       </div>
                                       <div className="flex items-center gap-2">
                                         <span className="text-lg">📱</span>
                                         <div className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                           {customer.customer_phone || 'Telefon bilgisi yok'}
                                         </div>
                                       </div>
                                     </div>
                                     <div className={`text-right text-sm font-semibold ${
                                       customer.total_revenue > 0
                                         ? theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                                         : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                     }`}>
                                       {formatCurrency(customer.total_revenue)}
                                     </div>
                                   </div>

                                   {/* Alt Bilgiler */}
                                   <div className="grid grid-cols-2 gap-2 text-sm">
                                     <div className="flex items-center gap-1">
                                       <span className="text-base">🚗</span>
                                       <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                         {customer.vehicle_count} araç
                                       </span>
                                     </div>
                                     <div className="flex items-center gap-1 justify-end">
                                       <span className="text-base">📊</span>
                                       <span className={`${
                                         customer.transaction_count > 0
                                           ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                                           : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                       }`}>
                                         {customer.transaction_count} işlem
                                       </span>
                                     </div>
                                   </div>
                                   
                                   {/* Plakalar */}
                                   <div className="flex flex-wrap gap-1">
                                     {customer.vehicle_plates.split(', ').map((plate) => (
                                       <span
                                         key={plate}
                                         className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                           theme === 'dark'
                                             ? 'bg-slate-700 text-gray-300 border border-slate-600'
                                             : 'bg-white text-gray-700 border border-gray-200 shadow-sm'
                                         }`}
                                       >
                                         🚘 {plate}
                                       </span>
                                     ))}
                                   </div>
                                   
                                   {/* Tarihler */}
                                   <div className="flex justify-between text-xs">
                                     <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                       İlk: {formatDate(customer.first_registration_date)}
                                     </div>
                                     <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                       Son: {customer.last_transaction_date ? formatDate(customer.last_transaction_date) : 'İşlem yok'}
                                     </div>
                                   </div>
                                 </div>
                               </motion.div>
                             );
                           })}
                         </div>

                         {/* Desktop tablo görünümü */}
                        <table className="hidden lg:table min-w-full">
                          <thead>
                            <tr className={`${theme === 'dark' ? 'bg-slate-900/50' : 'bg-gray-50/50'}`}>
                              <th className={`px-6 py-4 text-left text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                Müşteri Bilgileri
                              </th>
                              <th className={`px-6 py-4 text-left text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                Araçlar
                              </th>
                              <th className={`px-6 py-4 text-left text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                İşlem Sayısı
                              </th>
                              <th className={`px-6 py-4 text-left text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                Toplam Gelir
                              </th>
                              <th className={`px-6 py-4 text-left text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                İlk Kayıt
                              </th>
                              <th className={`px-6 py-4 text-left text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                Son İşlem
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {customers.map((customer, index) => {
                              const firstPlate = customer.vehicle_plates.split(', ')[0];
                              return (
                                <motion.tr
                                  key={customer.customer_email}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: index * 0.05 }}
                                  onClick={() => firstPlate && router.push(`/vehicles/${firstPlate}`)}
                                  className={`transition-colors cursor-pointer hover:scale-[1.01] ${
                                    theme === 'dark' 
                                      ? 'hover:bg-slate-700/50' 
                                      : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <td className={`px-6 py-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                    <div>
                                      <div className="font-medium text-sm">
                                        📧 {customer.customer_email}
                                      </div>
                                      {customer.customer_phone && (
                                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                          📱 {customer.customer_phone}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className={`px-6 py-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                    <div>
                                      <div className="font-medium text-sm">
                                        🚗 {customer.vehicle_count} araç
                                      </div>
                                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {customer.vehicle_plates}
                                      </div>
                                    </div>
                                  </td>
                                  <td className={`px-6 py-4 text-sm font-medium ${
                                    customer.transaction_count > 0 
                                      ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                                      : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    {customer.transaction_count} işlem
                                  </td>
                                  <td className={`px-6 py-4 text-sm font-bold ${
                                    customer.total_revenue > 0 
                                      ? theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                                      : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    {formatCurrency(customer.total_revenue)}
                                  </td>
                                  <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {formatDate(customer.first_registration_date)}
                                  </td>
                                  <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {customer.last_transaction_date 
                                      ? formatDate(customer.last_transaction_date)
                                      : 'Henüz işlem yok'
                                    }
                                  </td>
                                </motion.tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex justify-center items-center gap-2"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        pagination.page === 1
                          ? theme === 'dark' 
                            ? 'bg-slate-700 text-gray-500 cursor-not-allowed' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : theme === 'dark'
                            ? 'bg-slate-700 hover:bg-slate-600 text-white'
                            : 'bg-white hover:bg-gray-50 text-gray-700 border'
                      }`}
                    >
                      ← Önceki
                    </motion.button>

                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
                        return (
                          <motion.button
                            key={pageNum}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 rounded-lg font-semibold transition-all duration-200 ${
                              pagination.page === pageNum
                                ? theme === 'dark'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-500 text-white'
                                : theme === 'dark'
                                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                                  : 'bg-white hover:bg-gray-50 text-gray-700 border'
                            }`}
                          >
                            {pageNum}
                          </motion.button>
                        );
                      })}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        pagination.page === pagination.totalPages
                          ? theme === 'dark' 
                            ? 'bg-slate-700 text-gray-500 cursor-not-allowed' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : theme === 'dark'
                            ? 'bg-slate-700 hover:bg-slate-600 text-white'
                            : 'bg-white hover:bg-gray-50 text-gray-700 border'
                      }`}
                    >
                      Sonraki →
                    </motion.button>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CustomersPage; 