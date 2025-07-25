"use client"
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "../redux/store";
import { selectIsLoggedIn, selectUser } from "../redux/sliceses/authSlices";
import { motion } from 'framer-motion';

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

// Interfaces
interface MonthlyProfit {
  period: {
    year: number;
    month: number;
    monthName: string;
  };
  summary: {
    totalRevenue: number;
    totalExpense: number;
    totalProfit: number;
    profitMargin: number;
    transactionCount: number;
    averageTransaction: number;
  };
  breakdown: {
    byCategory: Array<{
      category: string;
      revenue: number;
      expense: number;
      profit: number;
      profitMargin: number;
      percentage: string;
    }>;
    byVehicle: Array<{
      vehicle: string;
      revenue: number;
      expense: number;
      profit: number;
      profitMargin: number;
      percentage: string;
    }>;
    byPersonnel: Array<{
      personnel: string;
      revenue: number;
      expense: number;
      profit: number;
      profitMargin: number;
      percentage: string;
    }>;
  };
  transactions: Array<{
    id: string;
    amount: number;
    expense: number;
    profit: number;
    description: string;
    transaction_date: string;
    category_name: string;
    vehicle_plate: string;
    personnel_name: string;
    is_expense: boolean;
  }>;
}

interface YearlyProfit {
  year: number;
  summary: {
    totalRevenue: number;
    totalExpense: number;
    totalProfit: number;
    profitMargin: number;
    totalTransactions: number;
    averageMonthlyProfit: number;
    averageTransactionValue: number;
  };
  monthlyBreakdown: Array<{
    month: number;
    monthName: string;
    revenue: number;
    expense: number;
    profit: number;
    profitMargin: number;
    transactionCount: number;
  }>;
  transactions: Array<{
    id: string;
    amount: number;
    expense: number;
    profit: number;
    description: string;
    transaction_date: string;
    category_name: string;
    vehicle_plate: string;
    personnel_name: string;
    is_expense: boolean;
  }>;
}

interface WeeklyProfit {
  period: {
    startDate: string;
    endDate: string;
    periodType: 'daily' | 'weekly';
  };
  summary: {
    totalRevenue: number;
    totalExpense: number;
    totalProfit: number;
    profitMargin: number;
    transactionCount: number;
    averageTransaction: number;
  };
  dailyBreakdown: Array<{
    day: number;
    dayName: string;
    date: string;
    revenue: number;
    expense: number;
    profit: number;
    profitMargin: number;
    transactionCount: number;
    transactions?: Array<{
      id: string;
      amount: number;
      expense: number;
      profit: number;
      description: string;
      transaction_date: string;
      category_name: string;
      vehicle_plate: string;
      personnel_name: string;
      is_expense: boolean;
    }>;
  }>;
  transactions: Array<{
    id: string;
    amount: number;
    expense: number;
    profit: number;
    description: string;
    transaction_date: string;
    category_name: string;
    vehicle_plate: string;
    personnel_name: string;
    is_expense: boolean;
  }>;
}

interface CategoryData {
  category_name: string;
  totalRevenue: number;
  totalExpense: number;
  totalProfit: number;
  profitMargin: number;
  totalTransactions: number;
  monthlyBreakdown?: Array<{
    month: number;
    monthName: string;
    revenue: number;
    expense: number;
    profit: number;
    profitMargin: number;
    transactionCount: number;
  }>;
}

interface MonthlyBreakdownData {
  month: number;
  monthName: string;
  revenue: number;
  expense: number;
  profit: number;
  profitMargin: number;
  transactionCount: number;
}

const ProfitPage: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const user = useSelector(selectUser);
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly' | 'weekly' | 'daily'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State'ler
  const [monthlyData, setMonthlyData] = useState<MonthlyProfit | null>(null);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedCategoriesForMonthly, setSelectedCategoriesForMonthly] = useState<number[]>([]);
  
  const [yearlyData, setYearlyData] = useState<YearlyProfit | null>(null);
  const [selectedYearForYearly, setSelectedYearForYearly] = useState(2024);
  const [selectedCategoriesForYearly, setSelectedCategoriesForYearly] = useState<number[]>([]);

  const [weeklyData, setWeeklyData] = useState<WeeklyProfit | null>(null);
  const [dailyData, setDailyData] = useState<WeeklyProfit | null>(null);

  const [selectedStartDate, setSelectedStartDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [selectedEndDate, setSelectedEndDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [selectedYearForWeekly, setSelectedYearForWeekly] = useState(new Date().getFullYear());
  const [weeklyOptions, setWeeklyOptions] = useState<Array<{value: string, label: string}>>([]);
  const [selectedDailyDate, setSelectedDailyDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  
  // Categories for filtering
  const [categories, setCategories] = useState<Array<{id: number, name: string}>>([]);
  const [selectedCategoriesForWeekly, setSelectedCategoriesForWeekly] = useState<number[]>([]);
  const [selectedCategoriesForDaily, setSelectedCategoriesForDaily] = useState<number[]>([]);

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

  // API'den kar verisi çeken fonksiyonlar
  const loadMonthlyRevenue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token bulunamadı');
        return;
      }

      let apiUrl = `${API_BASE_URL}/activities/monthly-profit?year=${selectedYear}&month=${selectedMonth}`;
      
      if (selectedCategoriesForMonthly.length > 0) {
        const categoryIds = selectedCategoriesForMonthly.join(',');
        apiUrl = `${API_BASE_URL}/activities/category-monthly-profit?year=${selectedYear}&month=${selectedMonth}&categoryIds=${categoryIds}`;
      }
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          if (selectedCategoriesForMonthly.length > 0 && data.data.categories) {
            const totalRevenue = data.data.categories.reduce((sum: number, cat: CategoryData) => sum + cat.totalRevenue, 0);
            const totalExpense = data.data.categories.reduce((sum: number, cat: CategoryData) => sum + cat.totalExpense, 0);
            const totalProfit = totalRevenue - totalExpense;
            const profitMargin = totalRevenue > 0 ? (totalExpense / totalRevenue) * 100 : 0;
            
            const monthlyDataFormatted: MonthlyProfit = {
              period: data.data.period,
              summary: {
                totalRevenue: totalRevenue,
                totalExpense: totalExpense,
                totalProfit: totalProfit,
                profitMargin: profitMargin,
                transactionCount: data.data.transactionCount || 0,
                averageTransaction: data.data.averageTransaction || 0
              },
              breakdown: {
                byCategory: data.data.categories.map((cat: CategoryData) => ({
                  category: cat.category_name,
                  revenue: cat.totalRevenue,
                  expense: cat.totalExpense,
                  profit: cat.totalProfit,
                  profitMargin: cat.profitMargin,
                  percentage: totalRevenue > 0 ? ((cat.totalRevenue / totalRevenue) * 100).toFixed(2) : '0.00'
                })),
                byVehicle: data.data.breakdown?.byVehicle || [],
                byPersonnel: data.data.breakdown?.byPersonnel || []
              },
              transactions: data.data.transactions || []
            };
            setMonthlyData(monthlyDataFormatted);
      } else {
            setMonthlyData(data.data);
          }
        } else {
          setError(data.message || 'Aylık kar alınamadı');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Aylık kar alınamadı');
      }
    } catch (error: unknown) {
      console.error('Error loading monthly profit:', error);
      setError('Aylık kar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth, selectedCategoriesForMonthly]);

  const loadYearlyRevenue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token bulunamadı');
        return;
      }

      let apiUrl = `${API_BASE_URL}/activities/yearly-profit?year=${selectedYearForYearly}`;
      
      if (selectedCategoriesForYearly.length > 0) {
        const categoryIds = selectedCategoriesForYearly.join(',');
        apiUrl = `${API_BASE_URL}/activities/category-yearly-profit?year=${selectedYearForYearly}&categoryIds=${categoryIds}`;
      }
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          if (selectedCategoriesForYearly.length > 0 && data.data.categories) {
            const totalRevenue = data.data.categories.reduce((sum: number, cat: CategoryData) => sum + cat.totalRevenue, 0);
            const totalExpense = data.data.categories.reduce((sum: number, cat: CategoryData) => sum + cat.totalExpense, 0);
            const totalProfit = totalRevenue - totalExpense;
            const profitMargin = totalRevenue > 0 ? (totalExpense / totalRevenue) * 100 : 0;
            
            const monthlyBreakdownMap = new Map<number, MonthlyBreakdownData>();
            data.data.categories.forEach((cat: CategoryData) => {
              cat.monthlyBreakdown?.forEach((month: MonthlyBreakdownData) => {
                const key = month.month;
                if (monthlyBreakdownMap.has(key)) {
                  const existing = monthlyBreakdownMap.get(key);
                  if (existing) {
                    existing.revenue += month.revenue;
                    existing.expense += month.expense;
                    existing.profit += month.profit;
                    existing.transactionCount += month.transactionCount;
                  }
                } else {
                  monthlyBreakdownMap.set(key, {
                    month: month.month,
                    monthName: month.monthName,
                    revenue: month.revenue,
                    expense: month.expense,
                    profit: month.profit,
                    profitMargin: month.profitMargin,
                    transactionCount: month.transactionCount
                  });
                }
              });
            });
            
            const yearlyDataFormatted: YearlyProfit = {
              year: data.data.year,
              summary: {
                totalRevenue: totalRevenue,
                totalExpense: totalExpense,
                totalProfit: totalProfit,
                profitMargin: profitMargin,
                totalTransactions: data.data.totalTransactions || 0,
                averageMonthlyProfit: totalProfit / 12,
                averageTransactionValue: data.data.averageTransactionValue || 0
              },
              monthlyBreakdown: Array.from(monthlyBreakdownMap.values()).sort((a, b) => a.month - b.month),
              transactions: data.data.transactions || []
            };
            setYearlyData(yearlyDataFormatted);
          } else {
            setYearlyData(data.data);
          }
        } else {
          setError(data.message || 'Yıllık kar alınamadı');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Yıllık kar alınamadı');
      }
    } catch (error: unknown) {
      console.error('Error loading yearly profit:', error);
      setError('Yıllık kar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [selectedYearForYearly, selectedCategoriesForYearly]);

  const loadCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const categoryUrl = `${API_BASE_URL}/transaction-categories`;
      const response = await fetch(categoryUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    }
  }, []);

  const generateWeeklyOptions = useCallback((year?: number) => {
    const options: Array<{value: string, label: string}> = [];
    const targetYear = year || selectedYearForWeekly;
    
    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear, 11, 31);
    
    let currentWeekStart = new Date(startOfYear);
    
    while (currentWeekStart <= endOfYear) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      if (weekEnd > endOfYear) {
        weekEnd.setTime(endOfYear.getTime());
      }
      
      const startDateStr = currentWeekStart.toISOString().split('T')[0];
      const endDateStr = weekEnd.toISOString().split('T')[0];
      const value = `${startDateStr}_${endDateStr}`;
      
      const startDateFormatted = currentWeekStart.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'short' 
      });
      const endDateFormatted = weekEnd.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'short' 
      });
      
      const label = `${startDateFormatted} - ${endDateFormatted}`;
      
      options.push({ value, label });
      
      currentWeekStart = new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    
    setWeeklyOptions(options);
    
    const today = new Date();
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - 7);
    
    const defaultStartDate = lastWeekStart.toISOString().split('T')[0];
    const defaultEndDate = today.toISOString().split('T')[0];
    const defaultValue = `${defaultStartDate}_${defaultEndDate}`;
    
    setSelectedWeek(defaultValue);
    setSelectedStartDate(defaultStartDate);
    setSelectedEndDate(defaultEndDate);
  }, [selectedYearForWeekly]);

  const loadWeeklyRevenue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token bulunamadı');
        return;
      }

      let apiUrl = `${API_BASE_URL}/activities/custom-profit?startDate=${selectedStartDate}&endDate=${selectedEndDate}&periodType=weekly`;
      
      if (selectedCategoriesForWeekly.length > 0) {
        const categoryIds = selectedCategoriesForWeekly.join(',');
        apiUrl = `${API_BASE_URL}/activities/category-custom-profit?startDate=${selectedStartDate}&endDate=${selectedEndDate}&periodType=weekly&categoryIds=${categoryIds}`;
      }
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          if (selectedCategoriesForWeekly.length > 0 && data.data.categories) {
            const totalRevenue = data.data.categories.reduce((sum: number, cat: CategoryData) => sum + cat.totalRevenue, 0);
            const totalExpense = data.data.categories.reduce((sum: number, cat: CategoryData) => sum + cat.totalExpense, 0);
            const totalProfit = totalRevenue - totalExpense;
            const profitMargin = totalRevenue > 0 ? (totalExpense / totalRevenue) * 100 : 0;
            
            const weeklyDataFormatted: WeeklyProfit = {
              period: data.data.period,
              summary: {
                totalRevenue: totalRevenue,
                totalExpense: totalExpense,
                totalProfit: totalProfit,
                profitMargin: profitMargin,
                transactionCount: data.data.transactionCount || 0,
                averageTransaction: data.data.averageTransaction || 0
              },
              dailyBreakdown: data.data.dailyBreakdown || [],
              transactions: data.data.transactions || []
            };
            setWeeklyData(weeklyDataFormatted);
          } else {
            setWeeklyData(data.data);
          }
        } else {
          setError(data.message || 'Haftalık kar alınamadı');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Haftalık kar alınamadı');
      }
    } catch (error: unknown) {
      console.error('Error loading weekly profit:', error);
      setError('Haftalık kar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [selectedStartDate, selectedEndDate, selectedCategoriesForWeekly]);

  const loadDailyRevenue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token bulunamadı');
        return;
      }

      let apiUrl = `${API_BASE_URL}/activities/custom-profit?startDate=${selectedDailyDate}&endDate=${selectedDailyDate}&periodType=daily`;
      
      if (selectedCategoriesForDaily.length > 0) {
        const categoryIds = selectedCategoriesForDaily.join(',');
        apiUrl = `${API_BASE_URL}/activities/category-custom-profit?startDate=${selectedDailyDate}&endDate=${selectedDailyDate}&periodType=daily&categoryIds=${categoryIds}`;
      }
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          if (selectedCategoriesForDaily.length > 0 && data.data.categories) {
            const totalRevenue = data.data.categories.reduce((sum: number, cat: CategoryData) => sum + cat.totalRevenue, 0);
            const totalExpense = data.data.categories.reduce((sum: number, cat: CategoryData) => sum + cat.totalExpense, 0);
            const totalProfit = totalRevenue - totalExpense;
            const profitMargin = totalRevenue > 0 ? (totalExpense / totalRevenue) * 100 : 0;
            
            const dailyDataFormatted: WeeklyProfit = {
              period: data.data.period,
              summary: {
                totalRevenue: totalRevenue,
                totalExpense: totalExpense,
                totalProfit: totalProfit,
                profitMargin: profitMargin,
                transactionCount: data.data.transactionCount || 0,
                averageTransaction: data.data.averageTransaction || 0
              },
              dailyBreakdown: data.data.dailyBreakdown || [],
              transactions: data.data.transactions || []
            };
            setDailyData(dailyDataFormatted);
      } else {
            setDailyData(data.data);
          }
        } else {
          setError(data.message || 'Günlük kar alınamadı');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Günlük kar alınamadı');
      }
    } catch (error: unknown) {
      console.error('Error loading daily profit:', error);
      setError('Günlük kar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [selectedDailyDate, selectedCategoriesForDaily]);

  // Centralized data loading effect
  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'admin') return;

    switch (activeTab) {
      case 'monthly':
        loadMonthlyRevenue();
        break;
      case 'yearly':
        loadYearlyRevenue();
        break;
      case 'weekly':
        loadWeeklyRevenue();
        break;
      case 'daily':
        loadDailyRevenue();
        break;
    }
  }, [
    isLoggedIn,
    user?.role,
    activeTab,
    // Monthly dependencies
    selectedYear,
    selectedMonth,
    selectedCategoriesForMonthly,
    // Yearly dependencies
    selectedYearForYearly,
    selectedCategoriesForYearly,
    // Weekly dependencies
    selectedStartDate,
    selectedEndDate,
    selectedCategoriesForWeekly,
    // Daily dependencies
    selectedDailyDate,
    selectedCategoriesForDaily,
    // Memoized functions
    loadMonthlyRevenue,
    loadYearlyRevenue,
    loadWeeklyRevenue,
    loadDailyRevenue
  ]);

  // Load categories once
  useEffect(() => {
    if (isLoggedIn && user?.role === 'admin') {
      loadCategories();
    }
  }, [isLoggedIn, user?.role, loadCategories]);

  // Generate weekly options when needed
  useEffect(() => {
    if (activeTab === 'weekly') {
      generateWeeklyOptions(selectedYearForWeekly);
    }
  }, [activeTab, selectedYearForWeekly, generateWeeklyOptions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-emerald-500';
    if (profit < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Enhanced Filter Component
  const EnhancedFilters = ({ tabType }: { tabType: string }) => (
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
        <div className="flex flex-col gap-4 w-full lg:w-auto min-w-[200px]">
          {tabType === 'monthly' && (
            <>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  📅 Yıl Seçimi
                </label>
                                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-3 focus:ring-emerald-500/50 transition-all ${
                            theme === 'dark' 
                              ? 'bg-slate-700 border-slate-600 text-gray-200' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          {Array.from({ length: new Date().getFullYear() - 1999 + 3 }, (_, i) => new Date().getFullYear() + 3 - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  🗓️ Ay Seçimi
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-3 focus:ring-emerald-500/50 transition-all ${
                    theme === 'dark' 
                      ? 'bg-slate-700 border-slate-600 text-gray-200' 
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
            </>
          )}
          
          {tabType === 'yearly' && (
            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                📅 Yıl Seçimi
              </label>
              <select 
                value={selectedYearForYearly} 
                onChange={e => setSelectedYearForYearly(Number(e.target.value))} 
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-3 focus:ring-emerald-500/50 transition-all ${
                  theme === 'dark' ? 'bg-slate-700 border-slate-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {Array.from({ length: new Date().getFullYear() - 1999 + 3 }, (_, i) => new Date().getFullYear() + 3 - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          {tabType === 'weekly' && (
            <>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  📅 Yıl Seçimi
                </label>
                <select 
                  value={selectedYearForWeekly} 
                  onChange={e => setSelectedYearForWeekly(Number(e.target.value))} 
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-3 focus:ring-emerald-500/50 transition-all ${
                    theme === 'dark' ? 'bg-slate-700 border-slate-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {Array.from({ length: new Date().getFullYear() - 1999 + 3 }, (_, i) => new Date().getFullYear() + 3 - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  📊 Hafta Seçimi
                </label>
                <select 
                  value={selectedWeek} 
                  onChange={e => {
                    const [startDate, endDate] = e.target.value.split('_');
                    setSelectedStartDate(startDate);
                    setSelectedEndDate(endDate);
                  }} 
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-3 focus:ring-emerald-500/50 transition-all ${
                    theme === 'dark' ? 'bg-slate-700 border-slate-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {weeklyOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {tabType === 'daily' && (
            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                📅 Tarih Seçimi
              </label>
              <input 
                type="date" 
                value={selectedDailyDate} 
                onChange={e => setSelectedDailyDate(e.target.value)} 
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-3 focus:ring-emerald-500/50 transition-all ${
                  theme === 'dark' ? 'bg-slate-700 border-slate-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 w-full">
          <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
            🏷️ Kategori Filtreleme
          </label>
          <div className={`p-4 border rounded-xl max-h-40 overflow-y-auto ${
            theme === 'dark' 
              ? 'bg-slate-700/50 border-slate-600' 
              : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {categories.map(cat => (
                <motion.label 
                  key={cat.id} 
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                    theme === 'dark' ? 'hover:bg-slate-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={
                      tabType === 'monthly' ? selectedCategoriesForMonthly.includes(cat.id) :
                      tabType === 'yearly' ? selectedCategoriesForYearly.includes(cat.id) :
                      tabType === 'weekly' ? selectedCategoriesForWeekly.includes(cat.id) :
                      selectedCategoriesForDaily.includes(cat.id)
                    }
                    onChange={(e) => {
                      if (tabType === 'monthly') {
                        if (e.target.checked) {
                          setSelectedCategoriesForMonthly([...selectedCategoriesForMonthly, cat.id]);
                        } else {
                          setSelectedCategoriesForMonthly(selectedCategoriesForMonthly.filter(id => id !== cat.id));
                        }
                      } else if (tabType === 'yearly') {
                        if (e.target.checked) {
                          setSelectedCategoriesForYearly([...selectedCategoriesForYearly, cat.id]);
                        } else {
                          setSelectedCategoriesForYearly(selectedCategoriesForYearly.filter(id => id !== cat.id));
                        }
                      } else if (tabType === 'weekly') {
                        if (e.target.checked) {
                          setSelectedCategoriesForWeekly([...selectedCategoriesForWeekly, cat.id]);
                        } else {
                          setSelectedCategoriesForWeekly(selectedCategoriesForWeekly.filter(id => id !== cat.id));
                        }
                      } else {
                        if (e.target.checked) {
                          setSelectedCategoriesForDaily([...selectedCategoriesForDaily, cat.id]);
                        } else {
                          setSelectedCategoriesForDaily(selectedCategoriesForDaily.filter(id => id !== cat.id));
                        }
                      }
                    }}
                    className="mr-2 w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                  />
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {cat.name}
                  </span>
                </motion.label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Enhanced Summary Cards Component
  const SummaryCards = ({ data }: { data: MonthlyProfit | YearlyProfit | WeeklyProfit }) => {
    const cards = [
      {
        title: 'Toplam Gelir',
        value: formatCurrency(data.summary.totalRevenue),
        icon: '💰',
        gradient: 'from-emerald-500 to-green-600',
        bgGradient: 'from-emerald-50 to-green-50',
        darkBgGradient: 'from-emerald-900/20 to-green-900/20'
      },
      {
        title: 'Toplam Gider',
        value: formatCurrency(data.summary.totalExpense),
        icon: '💸',
        gradient: 'from-red-500 to-pink-600',
        bgGradient: 'from-red-50 to-pink-50',
        darkBgGradient: 'from-red-900/20 to-pink-900/20'
      },
      {
        title: 'Net Kar',
        value: formatCurrency(data.summary.totalProfit),
        icon: data.summary.totalProfit >= 0 ? '📈' : '📉',
        gradient: data.summary.totalProfit >= 0 ? 'from-blue-500 to-indigo-600' : 'from-orange-500 to-red-600',
        bgGradient: data.summary.totalProfit >= 0 ? 'from-blue-50 to-indigo-50' : 'from-orange-50 to-red-50',
        darkBgGradient: data.summary.totalProfit >= 0 ? 'from-blue-900/20 to-indigo-900/20' : 'from-orange-900/20 to-red-900/20',
        isProfit: true
      },
      {
        title: 'Kar Marjı',
        value: formatPercentage(data.summary.profitMargin),
        icon: '📊',
        gradient: 'from-purple-500 to-pink-600',
        bgGradient: 'from-purple-50 to-pink-50',
        darkBgGradient: 'from-purple-900/20 to-pink-900/20'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className={`relative overflow-hidden rounded-3xl p-6 shadow-xl transition-all duration-300 ${
              theme === 'dark' 
                ? `bg-gradient-to-br ${card.darkBgGradient} border border-slate-700/50 backdrop-blur-sm` 
                : `bg-gradient-to-br ${card.bgGradient} border border-gray-200/50`
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-r ${card.gradient} shadow-lg`}>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${card.gradient} opacity-20 animate-pulse`} />
            </div>
            
            <div className="space-y-2">
              <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {card.title}
              </h3>
              <p className={`text-2xl font-bold ${
                card.isProfit 
                  ? getProfitColor(data.summary.totalProfit)
                  : theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {card.value}
              </p>
            </div>
            
            {/* Decorative elements */}
            <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-r ${card.gradient} opacity-10`} />
            <div className={`absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-r ${card.gradient} opacity-15`} />
          </motion.div>
        ))}
      </div>
    );
  };

  // Enhanced Table Components
  const EnhancedTable = ({ title, data, columns, icon }: { 
    title: string; 
    data: Array<Record<string, any>>; // eslint-disable-line @typescript-eslint/no-explicit-any
    columns: Array<{key: string; label: string; isProfit?: boolean}>;
    icon: string;
  }) => {
    if (!data || data.length === 0) {
      return (
        <div className={`rounded-3xl p-8 shadow-xl border ${
          theme === 'dark' 
            ? 'bg-slate-800/80 border-slate-700 backdrop-blur-sm' 
            : 'bg-white/80 border-gray-200'
        }`}>
          <div className="text-center">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
            }`}>
              <span className="text-3xl">{icon}</span>
            </div>
            <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              Henüz veri bulunmuyor
            </p>
          </div>
        </div>
      );
    }

    return (
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
            <span className="text-2xl">{icon}</span>
            {title}
            <span className={`ml-auto text-sm font-normal px-3 py-1 rounded-full ${
              theme === 'dark' 
                ? 'bg-slate-700 text-gray-300' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {data.length} kayıt
            </span>
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`${theme === 'dark' ? 'bg-slate-900/50' : 'bg-gray-50/50'}`}>
                {columns.map(column => (
                  <th
                    key={column.key}
                    className={`px-6 py-4 text-left text-sm font-semibold ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {data.map((row, index) => (
                <motion.tr
                  key={row.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`transition-colors hover:scale-[1.01] ${
                    theme === 'dark' 
                      ? 'hover:bg-slate-700/50' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {columns.map(column => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 text-sm font-medium ${
                        column.isProfit 
                          ? getProfitColor(row[column.key])
                          : theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`}
                    >
                      {typeof row[column.key] === 'number' && column.key !== 'profitMargin' 
                        ? formatCurrency(row[column.key])
                        : column.key === 'profitMargin' 
                        ? formatPercentage(row[column.key]) 
                        : row[column.key]
                      }
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  };

  const TransactionTable = ({ transactions }: { transactions: Array<{
    id: string;
    amount: number;
    expense: number;
    profit: number;
    description: string;
    transaction_date: string;
    category_name: string;
    vehicle_plate: string;
    personnel_name: string;
    is_expense: boolean;
  }> }) => {
    const [sortKey, setSortKey] = useState<'transaction_date' | 'amount' | 'profit'>('transaction_date');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const sorted = [...transactions].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];
      if (sortKey === 'transaction_date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    const handleSort = (key: 'transaction_date' | 'amount' | 'profit') => {
      if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
      else {
        setSortKey(key);
        setSortDir('desc');
      }
    };

    if (!transactions || transactions.length === 0) {
      return (
        <div className={`rounded-3xl p-8 shadow-xl border text-center ${
          theme === 'dark' 
            ? 'bg-slate-800/80 border-slate-700 backdrop-blur-sm' 
            : 'bg-white/80 border-gray-200'
        }`}>
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
          }`}>
            <span className="text-3xl">📋</span>
          </div>
          <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            İşlem Bulunamadı
          </h3>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            Bu dönem için işlem kaydı bulunmuyor
          </p>
        </div>
      );
    }

    return (
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
            <span className="text-2xl">📋</span>
            Detaylı İşlem Listesi
            <span className={`ml-auto text-sm font-normal px-3 py-1 rounded-full ${
              theme === 'dark' 
                ? 'bg-slate-700 text-gray-300' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {transactions.length} işlem
            </span>
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={theme === 'dark' ? 'bg-slate-900/50' : 'bg-gray-50/50'}>
                <th className={`px-4 py-4 text-left text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  Açıklama
                </th>
                <th className={`px-4 py-4 text-left text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  Kategori
                </th>
                <th className={`px-4 py-4 text-left text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  Araç
                </th>
                <th className={`px-4 py-4 text-left text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  Personel
                </th>
                <th 
                  className={`px-4 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-opacity-75 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                  onClick={() => handleSort('amount')}
                >
                  Tutar {sortKey === 'amount' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className={`px-4 py-4 text-left text-sm font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  Gider
                </th>
                <th 
                  className={`px-4 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-opacity-75 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                  onClick={() => handleSort('profit')}
                >
                  Kar {sortKey === 'profit' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th 
                  className={`px-4 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-opacity-75 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                  onClick={() => handleSort('transaction_date')}
                >
                  Tarih {sortKey === 'transaction_date' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {sorted.map((tx, index) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className={`transition-colors hover:scale-[1.01] ${
                    theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className={`px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                    {tx.description}
                  </td>
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {tx.category_name}
                  </td>
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {tx.vehicle_plate}
                  </td>
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {tx.personnel_name}
                  </td>
                  <td className={`px-4 py-3 text-sm font-semibold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className={`px-4 py-3 text-sm font-semibold ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                    {formatCurrency(tx.expense)}
                  </td>
                  <td className={`px-4 py-3 text-sm font-bold ${getProfitColor(tx.profit)}`}>
                    {formatCurrency(tx.profit)}
                  </td>
                  <td className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {new Date(tx.transaction_date).toLocaleDateString('tr-TR')}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${
      theme === 'dark' 
        ? 'from-slate-900 via-slate-800 to-blue-950' 
        : 'from-gray-50 via-white to-blue-50'
    }`}>
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
                  Kar Analizi
                </h1>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  Kapsamlı kar-zarar analizi ve raporlama
                </p>
              </div>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/revenue')}
                className={`group relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white'
                } shadow-lg hover:shadow-blue-500/20`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg group-hover:scale-110 transition-transform duration-200">💰</span>
                  <span>Ciro Analizi</span>
                  <span className="text-sm group-hover:translate-x-1 transition-transform duration-200">→</span>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Enhanced Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex justify-center"
          >
            <div className={`inline-flex p-2 rounded-3xl shadow-2xl backdrop-blur-lg ${
              theme === 'dark' 
                ? 'bg-slate-800/80 border border-slate-700/50' 
                : 'bg-white/80 border border-gray-200/50'
            }`}>
              {[
                { id: 'monthly', label: 'Aylık Kar', icon: '📅', desc: 'Aylık' },
                { id: 'yearly', label: 'Yıllık Kar', icon: '📊', desc: 'Yıllık' },
                { id: 'weekly', label: 'Haftalık Kar', icon: '📈', desc: 'Haftalık' },
                { id: 'daily', label: 'Günlük Kar', icon: '📋', desc: 'Günlük' }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'monthly' | 'yearly' | 'weekly' | 'daily')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-2xl transform scale-105'
                      : theme === 'dark'
                        ? 'text-gray-300 hover:text-white hover:bg-slate-700/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                  }`}
                >
                  <span className="text-2xl">{tab.icon}</span>
                  <span className="text-sm font-semibold">{tab.desc}</span>
                </motion.button>
              ))}
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
                  theme === 'dark' ? 'border-emerald-400' : 'border-emerald-500'
                }`} />
                <div className={`absolute inset-4 rounded-full border-8 border-t-transparent animate-spin ${
                  theme === 'dark' ? 'border-blue-400' : 'border-blue-500'
                }`} style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
              </div>
              <div className="text-center space-y-3">
                <h3 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Kar verileri yükleniyor
                </h3>
                <p className={`text-lg ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Lütfen bekleyin, veriler hazırlanıyor...
                </p>
              </div>
              <div className="flex space-x-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      theme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-500'
                    }`}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              {/* Content for each tab */}
              {activeTab === 'monthly' && monthlyData && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-8"
                >
                  <EnhancedFilters tabType="monthly" />
                  <SummaryCards data={monthlyData} />
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <EnhancedTable 
                      title="Kategori Bazında Analiz" 
                      data={monthlyData.breakdown.byCategory} 
                      columns={[
                        { key: 'category', label: 'Kategori' },
                        { key: 'revenue', label: 'Gelir' },
                        { key: 'expense', label: 'Gider' },
                        { key: 'profit', label: 'Kar', isProfit: true }
                      ]}
                      icon="📊"
                    />
                    <EnhancedTable 
                      title="Araç Bazında Analiz" 
                      data={monthlyData.breakdown.byVehicle} 
                      columns={[
                        { key: 'vehicle', label: 'Araç' },
                        { key: 'revenue', label: 'Gelir' },
                        { key: 'expense', label: 'Gider' },
                        { key: 'profit', label: 'Kar', isProfit: true }
                      ]}
                      icon="🚗"
                    />
                  </div>
                  
                  <TransactionTable transactions={monthlyData.transactions} />
                </motion.div>
              )}

              {activeTab === 'yearly' && yearlyData && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-8"
                >
                  <EnhancedFilters tabType="yearly" />
                  <SummaryCards data={yearlyData} />
                  
                  <EnhancedTable 
                    title="Aylık Dağılım" 
                    data={yearlyData.monthlyBreakdown} 
                    columns={[
                      { key: 'monthName', label: 'Ay' },
                      { key: 'revenue', label: 'Gelir' },
                      { key: 'expense', label: 'Gider' },
                      { key: 'profit', label: 'Kar', isProfit: true }
                    ]}
                    icon="📈"
                  />
                  
                  <TransactionTable transactions={yearlyData.transactions} />
                </motion.div>
              )}

              {activeTab === 'weekly' && weeklyData && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-8"
                >
                  <EnhancedFilters tabType="weekly" />
                  <SummaryCards data={weeklyData} />
                  
                  <EnhancedTable 
                    title="Günlük Dağılım" 
                    data={weeklyData.dailyBreakdown} 
                    columns={[
                      { key: 'dayName', label: 'Gün' },
                      { key: 'date', label: 'Tarih' },
                      { key: 'revenue', label: 'Gelir' },
                      { key: 'expense', label: 'Gider' },
                      { key: 'profit', label: 'Kar', isProfit: true }
                    ]}
                    icon="📅"
                  />
                  
                  <TransactionTable transactions={weeklyData.transactions} />
                </motion.div>
              )}

              {activeTab === 'daily' && dailyData && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-8"
                >
                  <EnhancedFilters tabType="daily" />
                  <SummaryCards data={dailyData} />
                  
                  <EnhancedTable 
                    title="Günlük Detay" 
                    data={dailyData.dailyBreakdown} 
                    columns={[
                      { key: 'dayName', label: 'Gün' },
                      { key: 'date', label: 'Tarih' },
                      { key: 'revenue', label: 'Gelir' },
                      { key: 'expense', label: 'Gider' },
                      { key: 'profit', label: 'Kar', isProfit: true }
                    ]}
                    icon="📋"
                  />
                  
                  <TransactionTable transactions={dailyData.transactions} />
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfitPage; 