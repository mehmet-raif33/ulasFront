"use client"
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "../redux/store";
import { selectIsLoggedIn, selectUser } from "../redux/sliceses/authSlices";
import { motion } from 'framer-motion';
import { getMonthlyRevenueApi, getYearlyRevenueApi, getCategoryRevenueApi } from '../api';

interface MonthlyRevenue {
  period: {
    year: number;
    month: number;
    monthName: string;
  };
  summary: {
    totalRevenue: number;
    transactionCount: number;
    averageTransaction: number;
  };
  breakdown: {
    byCategory: Array<{
      category: string;
      revenue: number;
      percentage: string;
    }>;
    byVehicle: Array<{
      vehicle: string;
      revenue: number;
      percentage: string;
    }>;
    byPersonnel: Array<{
      personnel: string;
      revenue: number;
      percentage: string;
    }>;
  };
  transactions: Array<{
    id: string;
    amount: number;
    description: string;
    transaction_date: string;
    category_name: string;
    vehicle_plate: string;
    personnel_name: string;
  }>;
}

interface YearlyRevenue {
  year: number;
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    averageMonthlyRevenue: number;
    averageTransactionValue: number;
  };
  monthlyBreakdown: Array<{
    month: number;
    monthName: string;
    revenue: number;
    transactionCount: number;
  }>;
}

const RevenuePage: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const user = useSelector(selectUser);
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly' | 'category'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Monthly revenue state
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  // Yearly revenue state
  const [yearlyData, setYearlyData] = useState<YearlyRevenue | null>(null);
  const [selectedYearForYearly, setSelectedYearForYearly] = useState(new Date().getFullYear());

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

  const loadMonthlyRevenue = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token bulunamadı');
        return;
      }

      const response = await getMonthlyRevenueApi(token, selectedYear, selectedMonth);
      if (response.success) {
        setMonthlyData(response.data);
      } else {
        setError(response.message || 'Aylık ciro alınamadı');
      }
    } catch (error: unknown) {
      console.error('Error loading monthly revenue:', error);
      setError('Aylık ciro yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadYearlyRevenue = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token bulunamadı');
        return;
      }

      const response = await getYearlyRevenueApi(token, selectedYearForYearly);
      if (response.success) {
        setYearlyData(response.data);
      } else {
        setError(response.message || 'Yıllık ciro alınamadı');
      }
    } catch (error: unknown) {
      console.error('Error loading yearly revenue:', error);
      setError('Yıllık ciro yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user?.role === 'admin') {
      if (activeTab === 'monthly') {
        loadMonthlyRevenue();
      } else if (activeTab === 'yearly') {
        loadYearlyRevenue();
      }
    }
  }, [isLoggedIn, user, activeTab, selectedYear, selectedMonth, selectedYearForYearly]);

  // Giriş yapmamış kullanıcılar için loading göster
  if (!isLoggedIn) {
    return (
      <div className="flex-1 min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Admin olmayan kullanıcılar için loading göster (yönlendirme sırasında)
  if (isLoggedIn && user?.role !== 'admin') {
    return (
      <div className="flex-1 min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  return (
    <div className={`flex-1 bg-gradient-to-br min-h-screen p-6 ${theme === 'dark' ? 'from-slate-900 to-blue-950' : 'from-slate-50 to-blue-50'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Ciro Hesaplama
          </h1>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            İşlem bazlı ciro analizi ve raporlama
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg mb-6 bg-red-100 border border-red-400 text-red-700`}
          >
            {error}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className={`flex space-x-1 p-1 rounded-lg ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
          }`}>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'monthly'
                  ? theme === 'dark' 
                    ? 'bg-slate-600 text-blue-300 shadow-sm' 
                    : 'bg-white text-blue-600 shadow-sm'
                  : theme === 'dark' 
                    ? 'text-gray-300 hover:text-white hover:bg-slate-600' 
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Aylık Ciro
            </button>
            <button
              onClick={() => setActiveTab('yearly')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'yearly'
                  ? theme === 'dark' 
                    ? 'bg-slate-600 text-blue-300 shadow-sm' 
                    : 'bg-white text-blue-600 shadow-sm'
                  : theme === 'dark' 
                    ? 'text-gray-300 hover:text-white hover:bg-slate-600' 
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yıllık Ciro
            </button>
            <button
              onClick={() => setActiveTab('category')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'category'
                  ? theme === 'dark' 
                    ? 'bg-slate-600 text-blue-300 shadow-sm' 
                    : 'bg-white text-blue-600 shadow-sm'
                  : theme === 'dark' 
                    ? 'text-gray-300 hover:text-white hover:bg-slate-600' 
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Kategori Bazlı
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>
            <div className={`animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4 ${theme === 'dark' ? 'border-blue-400' : 'border-blue-600'}`}></div>
            <p className="font-medium">Ciro verileri yükleniyor...</p>
          </div>
        ) : (
          <>
            {/* Monthly Revenue */}
            {activeTab === 'monthly' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Filters */}
                <div className={`p-4 rounded-lg mb-6 border ${
                  theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
                } shadow-sm`}>
                  <div className="flex flex-wrap gap-4 items-center">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                        Yıl
                      </label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          theme === 'dark' 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                        Ay
                      </label>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          theme === 'dark' 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <option key={month} value={month}>
                            {new Date(2024, month - 1).toLocaleDateString('tr-TR', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                {monthlyData && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Toplam Ciro
                          </p>
                          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(monthlyData.summary.totalRevenue)}
                          </p>
                        </div>
                        <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-green-900/50' : 'bg-green-100'}`}>
                          <span className="text-2xl">💰</span>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            İşlem Sayısı
                          </p>
                          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatNumber(monthlyData.summary.transactionCount)}
                          </p>
                        </div>
                        <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                          <span className="text-2xl">📊</span>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Ortalama İşlem
                          </p>
                          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(monthlyData.summary.averageTransaction)}
                          </p>
                        </div>
                        <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                          <span className="text-2xl">📈</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Breakdown Sections */}
                {monthlyData && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Category Breakdown */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                      className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                    >
                      <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Kategori Bazında Ciro
                      </h3>
                      <div className="space-y-3">
                        {monthlyData.breakdown.byCategory.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                              {item.category}
                            </span>
                            <div className="text-right">
                              <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {formatCurrency(item.revenue)}
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                %{item.percentage}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Vehicle Breakdown */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                      className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                    >
                      <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Araç Bazında Ciro
                      </h3>
                      <div className="space-y-3">
                        {monthlyData.breakdown.byVehicle.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                              {item.vehicle}
                            </span>
                            <div className="text-right">
                              <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {formatCurrency(item.revenue)}
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                %{item.percentage}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Yearly Revenue */}
            {activeTab === 'yearly' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Filters */}
                <div className={`p-4 rounded-lg mb-6 border ${
                  theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
                } shadow-sm`}>
                  <div className="flex flex-wrap gap-4 items-center">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                        Yıl
                      </label>
                      <select
                        value={selectedYearForYearly}
                        onChange={(e) => setSelectedYearForYearly(parseInt(e.target.value))}
                        className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          theme === 'dark' 
                            ? 'bg-slate-700 border-slate-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                {yearlyData && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                    >
                      <div className="text-center">
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Yıllık Toplam
                        </p>
                        <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(yearlyData.summary.totalRevenue)}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                    >
                      <div className="text-center">
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Toplam İşlem
                        </p>
                        <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatNumber(yearlyData.summary.totalTransactions)}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                    >
                      <div className="text-center">
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Aylık Ortalama
                        </p>
                        <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(yearlyData.summary.averageMonthlyRevenue)}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                      className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                    >
                      <div className="text-center">
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Ortalama İşlem
                        </p>
                        <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(yearlyData.summary.averageTransactionValue)}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Monthly Chart */}
                {yearlyData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                  >
                    <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Aylık Ciro Dağılımı
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {yearlyData.monthlyBreakdown.map((month, index) => (
                        <div key={index} className="text-center">
                          <div className={`p-4 rounded-lg border ${
                            theme === 'dark' ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              {month.monthName}
                            </p>
                            <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(month.revenue)}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {month.transactionCount} işlem
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Category Revenue */}
            {activeTab === 'category' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`p-6 rounded-xl shadow-lg border ${
                  theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Kategori Bazlı Ciro Analizi
                  </h3>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    Bu özellik yakında eklenecek. Kategori bazında detaylı ciro analizi yapabileceksiniz.
                  </p>
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default RevenuePage; 