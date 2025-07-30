"use client"
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "../redux/store";
import { selectIsLoggedIn, selectUser } from "../redux/sliceses/authSlices";
import { motion } from 'framer-motion';
import { api } from '@/lib/api-endpoints';

// Ay isimleri
const months = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// Güncel Revenue API Response Interfaces (New Revenue API)
interface DailyRevenueResponse {
  success: boolean;
  data: {
    period: {
      type: 'daily';
      date: string;
      dayName: string;
    };
    summary: {
      totalRevenue: number;
      revenueTransactionCount: number;
      totalTransactionCount: number;
      averageRevenue: number;
      revenuePercentage: string;
    };
    breakdowns: {
      categories: Array<{
        category: string;
        revenue: number;
        transactionCount: number;
        percentage: string;
      }>;
    };
    transactions: Array<{
      id: number;
      amount: number;
      description: string;
      transaction_date: string;
      category_name: string;
      vehicle_plate: string;
      personnel_name: string;
    }>;
  };
}

interface WeeklyRevenueResponse {
  success: boolean;
  data: {
    period: {
      type: 'weekly';
      year: number;
      week: number;
      startDate: string;
      endDate: string;
    };
    summary: {
      totalRevenue: number;
      revenueTransactionCount: number;
      totalTransactionCount: number;
      averageRevenue: number;
      averageDailyRevenue: number;
    };
    breakdowns: {
      daily: Array<{
        day: number;
        dayName: string;
        date: string;
        revenue: number;
        revenueTransactionCount: number;
        totalTransactionCount: number;
      }>;
      categories: Array<{
        category: string;
        revenue: number;
        transactionCount: number;
        percentage: string;
      }>;
    };
  };
}

interface MonthlyRevenueResponse {
  success: boolean;
  data: {
    period: {
      type: 'monthly';
      year: number;
      month: number;
      monthName: string;
      startDate: string;
      endDate: string;
      dayCount: number;
    };
    summary: {
      totalRevenue: number;
      revenueTransactionCount: number;
      totalTransactionCount: number;
      averageRevenue: number;
      averageDailyRevenue: number;
      revenuePercentage: string;
    };
    breakdowns: {
      daily: Array<{
        tarih: string;
        gun_adi: string;
        gunluk_ciro: number;
        gunluk_gelir_islem_sayisi: number;
        gunluk_toplam_islem_sayisi: number;
      }>;
      categories: Array<{
        category: string;
        revenue: number;
        transactionCount: number;
        percentage: string;
      }>;
    };
  };
}

interface YearlyRevenueResponse {
  success: boolean;
  data: {
    period: {
      type: 'yearly';
      year: number;
      startDate: string;
      endDate: string;
    };
    summary: {
      totalRevenue: number;
      revenueTransactionCount: number;
      totalTransactionCount: number;
      averageRevenue: number;
      averageMonthlyRevenue: number;
      revenuePercentage: string;
    };
    breakdowns: {
      monthly: Array<{
        ay: number;
        yil: number;
        ay_adi: string;
        aylik_ciro: number;
        aylik_gelir_islem_sayisi: number;
        aylik_toplam_islem_sayisi: number;
      }>;
      categories: Array<{
        category: string;
        revenue: number;
        transactionCount: number;
        percentage: string;
      }>;
      topTransactions: Array<{
        id: number;
        amount: number;
        description: string;
        transaction_date: string;
        category_name: string;
        vehicle_plate: string;
        personnel_name: string;
      }>;
    };
  };
}

// Legacy interfaces for backward compatibility
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

interface WeeklyRevenue {
  period: {
    startDate: string;
    endDate: string;
    periodType: 'daily' | 'weekly';
  };
  summary: {
    totalRevenue: number;
    transactionCount: number;
    averageTransaction: number;
  };
  dailyBreakdown: Array<{
    day: number;
    dayName: string;
    date: string;
    revenue: number;
    transactionCount: number;
  }>;
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

interface CategoryData {
  category_name: string;
  totalRevenue: number;
  totalTransactions: number;
  monthlyBreakdown?: Array<{
    month: number;
    monthName: string;
    revenue: number;
    transactionCount: number;
  }>;
}

interface MonthlyBreakdownData {
  month: number;
  monthName: string;
  revenue: number;
  transactionCount: number;
}

const RevenuePage: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const user = useSelector(selectUser);
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly' | 'weekly' | 'daily'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Monthly revenue state
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue | null>(null);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedCategoriesForMonthly, setSelectedCategoriesForMonthly] = useState<number[]>([]);
  
  // Yearly revenue state
  const [yearlyData, setYearlyData] = useState<YearlyRevenue | null>(null);
  const [selectedYearForYearly, setSelectedYearForYearly] = useState(2024);
  const [selectedCategoriesForYearly, setSelectedCategoriesForYearly] = useState<number[]>([]);

  // Weekly revenue state
  const [weeklyData, setWeeklyData] = useState<WeeklyRevenue | null>(null);
  const [dailyData, setDailyData] = useState<WeeklyRevenue | null>(null);

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

  // Memoized API functions
  const loadMonthlyRevenue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 [FRONTEND-DEBUG] Monthly revenue API call başlatılıyor:', {
        year: selectedYear,
        month: selectedMonth,
        categoriesSelected: selectedCategoriesForMonthly.length,
        selectedCategories: selectedCategoriesForMonthly
      });
      
      // Check if API client is initialized
      console.log('🔧 [FRONTEND-DEBUG] API client config:', api?.revenue ? 'Available' : 'Not Available');
      
      // Use the enhanced API client instead of manual fetch
      console.log('📡 [FRONTEND-DEBUG] Calling api.revenue.getMonthlyRevenue...');
      const response = await api.revenue.getMonthlyRevenue(selectedYear, selectedMonth);
      
      console.log('📥 [FRONTEND-DEBUG] API Response received:', {
        hasResponse: !!response,
        success: response?.success,
        hasData: !!response?.data,
        responseKeys: response ? Object.keys(response) : 'N/A',
        dataKeys: response?.data ? Object.keys(response.data) : 'N/A'
      });

      if (response.success && response.data) {
        // Backend response format: { success, data: { revenue, period, transactions, ... } }
        let backendData = response.data as any;
        
        console.log('🔍 [FRONTEND-DEBUG] Backend response structure:', {
          hasData: !!backendData,
          success: backendData?.success,
          hasRevenue: !!backendData?.revenue,
          hasPeriod: !!backendData?.period,
          hasTransactions: !!backendData?.transactions,
          revenue: backendData?.revenue,
          transactionCount: backendData?.transactions?.length,
          fullBackendData: backendData
        });
        
        // 🚨 DOUBLE WRAPPING CHECK: Enhanced API client might double-wrap response
        if (backendData.success && backendData.data && !backendData.summary) {
          console.log('🔧 [API-FIX] Double wrapping detected! Unwrapping response.data.data...');
          backendData = backendData.data;
          console.log('🔧 [API-FIX] After unwrapping:', {
            keys: Object.keys(backendData),
            hasSummary: !!backendData.summary,
            hasBreakdown: !!backendData.breakdown,
            hasTransactions: !!backendData.transactions
          });
        }
        
        console.log('🔍 [RAW-BACKEND-DATA] Complete raw response from backend:', JSON.stringify(backendData, null, 2));
        
        console.log('🔄 [DATA-TRANSFORM-START] Starting data transformation...');
        
        // Step 1: Extract period data
        const periodData = {
          year: selectedYear,
          month: selectedMonth,
          monthName: months[selectedMonth - 1]
        };
        console.log('📅 [TRANSFORM-STEP-1] Period data extracted:', periodData);
        
        // Step 2: Extract summary data
        console.log('📊 [TRANSFORM-STEP-2] Backend summary data check:', {
          hasSummary: !!backendData?.summary,
          summaryKeys: backendData?.summary ? Object.keys(backendData.summary) : 'N/A',
          summaryData: backendData?.summary
        });
        
        const summaryData = {
          totalRevenue: backendData?.summary?.totalRevenue || 0,
          transactionCount: backendData?.summary?.transactionCount || 0,
          averageTransaction: backendData?.summary?.averageTransaction || 0
        };
        console.log('📊 [TRANSFORM-STEP-2] Summary data extracted:', summaryData);
        
        // Step 3: Extract breakdown data
        console.log('📋 [TRANSFORM-STEP-3] Backend breakdown data check:', {
          hasBreakdown: !!backendData?.breakdown,
          breakdownKeys: backendData?.breakdown ? Object.keys(backendData.breakdown) : 'N/A',
          breakdownData: backendData?.breakdown
        });
        
        const breakdownData = {
          byCategory: backendData?.breakdown?.byCategory || [],
          byPersonnel: backendData?.breakdown?.byPersonnel || [],
          byVehicle: backendData?.breakdown?.byVehicle || []
        };
        console.log('📋 [TRANSFORM-STEP-3] Breakdown data extracted:', breakdownData);
        
        // Step 4: Extract transactions
        const transactionsData = backendData?.transactions || [];
        console.log('💼 [TRANSFORM-STEP-4] Transactions data extracted:', {
          transactionCount: transactionsData.length,
          firstTransaction: transactionsData[0] || 'No transactions',
          transactionsArray: transactionsData
        });
        
        // Step 5: Create final transformed object
        const monthlyRevenue: MonthlyRevenue = {
          period: periodData,
          summary: summaryData,
          breakdown: breakdownData,
          transactions: transactionsData
        };
        
        // 🎯 CATEGORY FILTERING: Apply client-side filtering if categories selected
        if (selectedCategoriesForMonthly.length > 0) {
          console.log('🔍 [CATEGORY-FILTER] Applying category filter:', {
            selectedCategories: selectedCategoriesForMonthly,
            originalTransactionCount: monthlyRevenue.transactions.length,
            originalRevenue: monthlyRevenue.summary.totalRevenue
          });
          
          // Get selected category names
          const selectedCategoryNames = selectedCategoriesForMonthly.map(catId => 
            categories.find(c => c.id === catId)?.name
          ).filter(Boolean) as string[];
          
          console.log('🔍 [CATEGORY-FILTER] Selected category names:', selectedCategoryNames);
          
          // Filter transactions by selected categories
          const filteredTransactions = monthlyRevenue.transactions.filter((tx: any) => 
            selectedCategoryNames.includes(tx.category_name)
          );
          
          // Recalculate totals based on filtered transactions
          const filteredRevenue = filteredTransactions.reduce((sum: number, tx: any) => 
            sum + (parseFloat(tx.amount) || 0), 0
          );
          
          // Update the monthlyRevenue object with filtered data
          monthlyRevenue.transactions = filteredTransactions;
          monthlyRevenue.summary.totalRevenue = filteredRevenue;
          monthlyRevenue.summary.transactionCount = filteredTransactions.length;
          monthlyRevenue.summary.averageTransaction = filteredTransactions.length > 0 
            ? filteredRevenue / filteredTransactions.length 
            : 0;
          
          // Filter breakdown by category as well
          monthlyRevenue.breakdown.byCategory = monthlyRevenue.breakdown.byCategory.filter((cat: any) =>
            selectedCategoryNames.includes(cat.category)
          );
          
          console.log('🔍 [CATEGORY-FILTER] After filtering:', {
            filteredTransactionCount: monthlyRevenue.transactions.length,
            filteredRevenue: monthlyRevenue.summary.totalRevenue,
            filteredCategories: monthlyRevenue.breakdown.byCategory.length
          });
        }
        
        console.log('✨ [TRANSFORM-COMPLETE] Final transformed monthly revenue object:', {
          periodKeys: Object.keys(monthlyRevenue.period),
          summaryKeys: Object.keys(monthlyRevenue.summary),
          breakdownKeys: Object.keys(monthlyRevenue.breakdown),
          hasTransactions: monthlyRevenue.transactions.length > 0,
          completeObject: monthlyRevenue
        });

        console.log('✅ [FRONTEND-DEBUG] Transformed monthly revenue:', {
          totalRevenue: monthlyRevenue.summary.totalRevenue,
          transactionCount: monthlyRevenue.summary.transactionCount,
          categoriesCount: monthlyRevenue.breakdown.byCategory.length
        });

        console.log('🏪 [STATE-UPDATE-BEFORE] Current monthlyRevenue state before update:', monthlyRevenue);
        setMonthlyData(monthlyRevenue);
        console.log('🎯 [STATE-UPDATE-AFTER] setMonthlyData called - state should be updated');
        
        // State update verification - state gerçekten değişti mi?
        setTimeout(() => {
          console.log('⏰ [STATE-VERIFY] Checking if state was actually updated after 100ms...');
          console.log('⏰ [STATE-VERIFY] monthlyData after setTimeout:', {
            hasData: !!monthlyData,
            isCurrentMonth: monthlyData?.period?.year === selectedYear && monthlyData?.period?.month === selectedMonth,
            dataContent: monthlyData
          });
        }, 100);
      } else {
        console.error('❌ [FRONTEND-DEBUG] API response unsuccessful:', {
          success: response?.success,
          hasData: !!response?.data,
          message: response?.message || 'No message',
          fullResponse: response
        });
        setError('Aylık ciro verileri alınamadı');
      }
    } catch (error) {
      console.error('💥 [FRONTEND-DEBUG] Monthly revenue API error:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack'
      });
      setError(`Aylık ciro verileri yüklenirken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
      console.log('🏁 [FRONTEND-DEBUG] Monthly revenue API call completed');
    }
  }, [selectedYear, selectedMonth, selectedCategoriesForMonthly]);

  const loadYearlyRevenue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 [FRONTEND-DEBUG] Yearly revenue API call başlatılıyor:', {
        year: selectedYearForYearly,
        categoriesSelected: selectedCategoriesForYearly.length,
        selectedCategories: selectedCategoriesForYearly
      });

      console.log('🔧 [FRONTEND-DEBUG] API client config:', api?.revenue ? 'Available' : 'Not Available');
      console.log('📡 [FRONTEND-DEBUG] Calling api.revenue.getYearlyRevenue...');

      // Use the enhanced API client instead of manual fetch
      const response = await api.revenue.getYearlyRevenue(selectedYearForYearly);

      console.log('📥 [FRONTEND-DEBUG] Yearly API Response received:', {
        hasResponse: !!response,
        success: response?.success,
        hasData: !!response?.data,
        responseKeys: response ? Object.keys(response) : 'N/A',
        dataKeys: response?.data ? Object.keys(response.data) : 'N/A'
      });

      if (response.success && response.data) {
        // Backend response format: { success, data: { totalRevenue, monthlyRevenue, transactions, ... } }
        let backendData = response.data as any;
        
        console.log('🔍 [FRONTEND-DEBUG] Yearly backend response structure:', {
          hasData: !!backendData,
          keys: backendData ? Object.keys(backendData) : 'N/A',
          hasTotalRevenue: !!backendData?.totalRevenue,
          hasMonthlyRevenue: !!backendData?.monthlyRevenue,
          hasTransactions: !!backendData?.transactions,
          totalRevenue: backendData?.totalRevenue,
          monthlyDataLength: backendData?.monthlyRevenue?.length,
          fullBackendData: backendData
        });
        
        // 🚨 DOUBLE WRAPPING CHECK: Enhanced API client might double-wrap response
        if (backendData.success && backendData.data && !backendData.summary) {
          console.log('🔧 [API-FIX-YEARLY] Double wrapping detected! Unwrapping response.data.data...');
          backendData = backendData.data;
          console.log('🔧 [API-FIX-YEARLY] After unwrapping:', {
            keys: Object.keys(backendData),
            hasSummary: !!backendData.summary,
            hasMonthlyBreakdown: !!backendData.monthlyBreakdown,
            hasTransactions: !!backendData.transactions
          });
        }
        
        console.log('🔍 [RAW-BACKEND-DATA] Complete raw response from backend:', JSON.stringify(backendData, null, 2));
        
        console.log('🔄 [DATA-TRANSFORM-START] Starting data transformation...');
        
        // Step 1: Extract period data
        const periodData = {
          year: selectedYearForYearly,
          startDate: backendData?.period?.startDate || '',
          endDate: backendData?.period?.endDate || ''
        };
        console.log('📅 [TRANSFORM-STEP-1] Period data extracted:', periodData);
        
        // Step 2: Extract summary data
        console.log('📊 [TRANSFORM-STEP-2] Backend summary data check:', {
          hasSummary: !!backendData?.summary,
          summaryKeys: backendData?.summary ? Object.keys(backendData.summary) : 'N/A',
          summaryData: backendData?.summary
        });
        
        const summaryData = {
          totalRevenue: backendData?.summary?.totalRevenue || 0,
          totalTransactions: backendData?.summary?.totalTransactions || 0,
          averageMonthlyRevenue: backendData?.summary?.averageMonthlyRevenue || 0,
          averageTransactionValue: backendData?.summary?.averageTransactionValue || 0
        };
        console.log('📊 [TRANSFORM-STEP-2] Summary data extracted:', summaryData);
        
        // Step 3: Extract monthly breakdown
        const monthlyBreakdownData = backendData?.monthlyBreakdown || [];
        console.log('📋 [TRANSFORM-STEP-3] Monthly breakdown data extracted:', {
          monthlyBreakdownLength: monthlyBreakdownData.length,
          firstMonth: monthlyBreakdownData[0] || 'No monthly data'
        });
        
        // Step 4: Extract transactions
        const transactionsData = backendData?.transactions || [];
        console.log('💼 [TRANSFORM-STEP-4] Transactions data extracted:', {
          transactionCount: transactionsData.length,
          firstTransaction: transactionsData[0] || 'No transactions',
          transactionsArray: transactionsData
        });
        
        // Step 5: Create final transformed object
        const yearlyRevenue: YearlyRevenue = {
          year: selectedYearForYearly,
          summary: summaryData,
          monthlyBreakdown: monthlyBreakdownData,
          transactions: transactionsData
        };
        
        // 🎯 CATEGORY FILTERING: Apply client-side filtering if categories selected
        if (selectedCategoriesForYearly.length > 0) {
          console.log('🔍 [CATEGORY-FILTER-YEARLY] Applying category filter:', {
            selectedCategories: selectedCategoriesForYearly,
            originalTransactionCount: yearlyRevenue.transactions.length,
            originalRevenue: yearlyRevenue.summary.totalRevenue
          });
          
          // Get selected category names
          const selectedCategoryNames = selectedCategoriesForYearly.map(catId => 
            categories.find(c => c.id === catId)?.name
          ).filter(Boolean) as string[];
          
          console.log('🔍 [CATEGORY-FILTER-YEARLY] Selected category names:', selectedCategoryNames);
          
          // Filter transactions by selected categories
          const filteredTransactions = yearlyRevenue.transactions.filter((tx: any) => 
            selectedCategoryNames.includes(tx.category_name)
          );
          
          // Recalculate totals based on filtered transactions
          const filteredRevenue = filteredTransactions.reduce((sum: number, tx: any) => 
            sum + (parseFloat(tx.amount) || 0), 0
          );
          
          // Update the yearlyRevenue object with filtered data
          yearlyRevenue.transactions = filteredTransactions;
          yearlyRevenue.summary.totalRevenue = filteredRevenue;
          yearlyRevenue.summary.totalTransactions = filteredTransactions.length;
          yearlyRevenue.summary.averageTransactionValue = filteredTransactions.length > 0 
            ? filteredRevenue / filteredTransactions.length 
            : 0;
          yearlyRevenue.summary.averageMonthlyRevenue = filteredRevenue / 12;
          
          console.log('🔍 [CATEGORY-FILTER-YEARLY] After filtering:', {
            filteredTransactionCount: yearlyRevenue.transactions.length,
            filteredRevenue: yearlyRevenue.summary.totalRevenue
          });
        }
        
        console.log('✨ [TRANSFORM-COMPLETE] Final transformed yearly revenue object:', {
          year: yearlyRevenue.year,
          summaryKeys: Object.keys(yearlyRevenue.summary),
          monthlyBreakdownLength: yearlyRevenue.monthlyBreakdown.length,
          hasTransactions: yearlyRevenue.transactions.length > 0,
          completeObject: yearlyRevenue
        });

        console.log('✅ [FRONTEND-DEBUG] Transformed yearly revenue:', {
          totalRevenue: yearlyRevenue.summary.totalRevenue,
          totalTransactions: yearlyRevenue.summary.totalTransactions,
          monthlyDataLength: yearlyRevenue.monthlyBreakdown.length
        });

        setYearlyData(yearlyRevenue);
        console.log('🎯 [FRONTEND-DEBUG] Yearly revenue state updated successfully');
      } else {
        console.error('❌ [FRONTEND-DEBUG] Yearly API response unsuccessful:', {
          success: response?.success,
          hasData: !!response?.data,
          message: response?.message || 'No message',
          fullResponse: response
        });
        setError('Yıllık ciro verileri alınamadı');
      }
    } catch (error) {
      console.error('💥 [FRONTEND-DEBUG] Yearly revenue API error:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack'
      });
      setError(`Yıllık ciro verileri yüklenirken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
      console.log('🏁 [FRONTEND-DEBUG] Yearly revenue API call completed');
    }
  }, [selectedYearForYearly, selectedCategoriesForYearly]);

  const loadCategories = useCallback(async () => {
    try {
      console.log('🔍 [FRONTEND] loadCategories fonksiyonu başlatıldı');
      
      // Use the enhanced API client instead of manual fetch
      const response = await api.category.getTransactionCategories();
      console.log('🔍 [FRONTEND] Kategoriler API response:', response);
      
      if (response.success && response.data) {
        const categoriesData = Array.isArray(response.data) ? response.data : [];
        console.log('🔍 [FRONTEND] Parsed categories:', categoriesData);
        
        // Map to the expected format for state
        const mappedCategories = categoriesData.map((cat: any) => ({
          id: cat.id,
          name: cat.name
        }));
        setCategories(mappedCategories);
        console.log('🔍 [FRONTEND] Categories set to state successfully');
      } else {
        console.error('❌ [FRONTEND] Backend response success is false:', response);
        setCategories([]);
      }
    } catch (error) {
      console.error('❌ [FRONTEND] Kategoriler yüklenirken hata:', error);
      console.error('❌ [FRONTEND] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.status || 'No status',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      setCategories([]); // Set empty array on error
    }
  }, []);

  const generateWeeklyOptions = useCallback((year?: number) => {
    const targetYear = year || selectedYearForWeekly;
    const options: Array<{value: string, label: string}> = [];
    
    console.log('📅 [WEEKLY-OPTIONS] Generating weekly options for year:', targetYear);
    
    // ISO 8601 hafta hesaplama - Pazartesi ile başlayan haftalar
    // Yılın ilk Pazartesi'sini bul
    const jan1 = new Date(targetYear, 0, 1);
    const jan1Day = jan1.getDay(); // 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
    
    // İlk Pazartesi'yi hesapla
    const firstMonday = new Date(jan1);
    if (jan1Day === 0) { // Pazar ise
      firstMonday.setDate(jan1.getDate() + 1); // Pazartesi
    } else if (jan1Day === 1) { // Pazartesi ise
      // Aynı gün
    } else { // Salı-Cumartesi ise
      firstMonday.setDate(jan1.getDate() + (8 - jan1Day)); // Sonraki Pazartesi
    }
    
    // Eğer ilk Pazartesi 4 Ocak'tan sonra ise, önceki yılın son haftası olur
    if (firstMonday.getDate() > 4) {
      firstMonday.setDate(firstMonday.getDate() - 7);
    }
    
    let weekNumber = 1;
    const currentWeekStart = new Date(firstMonday);
    
    // Tüm haftaları oluştur
    while (currentWeekStart.getFullYear() <= targetYear) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6); // Pazar
      
      // Eğer hafta tamamen sonraki yıla aitse dur
      if (currentWeekStart.getFullYear() > targetYear) {
        break;
      }
      
      // Eğer haftanın çoğu sonraki yıla aitse dur
      if (currentWeekStart.getFullYear() === targetYear && weekEnd.getFullYear() > targetYear && weekEnd.getDate() > 3) {
        break;
      }
      
      const startDateStr = currentWeekStart.toISOString().split('T')[0];
      const endDateStr = weekEnd.toISOString().split('T')[0];
      const value = `${startDateStr}_${endDateStr}`;
      
      const startFormatted = currentWeekStart.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'short' 
      });
      const endFormatted = weekEnd.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'short' 
      });
      
      const label = `${weekNumber}. Hafta (${startFormatted} - ${endFormatted})`;
      
      options.push({ value, label });
      
      // Sonraki haftaya geç
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      weekNumber++;
      
      // Güvenlik için maksimum 55 hafta
      if (weekNumber > 55) break;
    }
    
    console.log('📅 [WEEKLY-OPTIONS] Generated', options.length, 'weeks for year', targetYear);
    
    setWeeklyOptions(options);
    
    // Güncel haftayı varsayılan olarak seç
    const today = new Date();
    const currentWeekOption = options.find(option => {
      const [startDate, endDate] = option.value.split('_');
      const start = new Date(startDate);
      const end = new Date(endDate);
      return today >= start && today <= end;
    });
    
    if (currentWeekOption) {
      const [startDate, endDate] = currentWeekOption.value.split('_');
      setSelectedStartDate(startDate);
      setSelectedEndDate(endDate);
      setSelectedWeek(currentWeekOption.value);
      console.log('📅 [WEEKLY-OPTIONS] Selected current week:', currentWeekOption.label);
    } else if (options.length > 0) {
      // Güncel hafta bulunamazsa ilk haftayı seç
      const [startDate, endDate] = options[0].value.split('_');
      setSelectedStartDate(startDate);
      setSelectedEndDate(endDate);
      setSelectedWeek(options[0].value);
      console.log('📅 [WEEKLY-OPTIONS] Selected first week:', options[0].label);
    }
  }, [selectedYearForWeekly]);

  const loadWeeklyRevenue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 [FRONTEND-DEBUG] Weekly revenue API call başlatılıyor:', {
        startDate: selectedStartDate,
        endDate: selectedEndDate,
        categoriesSelected: selectedCategoriesForWeekly.length,
        selectedCategories: selectedCategoriesForWeekly
      });

      console.log('🔧 [FRONTEND-DEBUG] API client config:', api?.revenue ? 'Available' : 'Not Available');
      
      // 🔧 FIX: Use custom date range API instead of year/week calculation
      console.log('📡 [FRONTEND-DEBUG] Calling api.revenue.getCustomDateRangeRevenue with exact date range...');
      console.log('📅 [DATE-DEBUG] Using custom date range:', {
        startDate: selectedStartDate,
        endDate: selectedEndDate,
        userSelection: `${selectedStartDate} to ${selectedEndDate}`,
        periodType: 'weekly'
      });

      // 🚨 CRITICAL DEBUG: Check the exact API URL being called
      console.log('🔍 [API-DEBUG] About to call custom-revenue endpoint with URL:', 
        `/activities/custom-revenue?startDate=${selectedStartDate}&endDate=${selectedEndDate}&periodType=weekly`);

      // Use custom-revenue endpoint with exact date range
      const response = await api.revenue.getCustomDateRangeRevenue(selectedStartDate, selectedEndDate, 'weekly');

      console.log('📥 [FRONTEND-DEBUG] Weekly API Response received:', {
        hasResponse: !!response,
        success: response?.success,
        hasData: !!response?.data,
        responseKeys: response ? Object.keys(response) : 'N/A',
        dataKeys: response?.data ? Object.keys(response.data) : 'N/A'
      });

      if (response.success && response.data) {
        // Backend response format: { success, data: { totalRevenue, dailyRevenue, transactions, ... } }
        let backendData = response.data as any;
        
        console.log('🔍 [FRONTEND-DEBUG] Weekly backend response structure:', {
          hasData: !!backendData,
          keys: backendData ? Object.keys(backendData) : 'N/A',
          hasTotalRevenue: !!backendData?.totalRevenue,
          hasDailyRevenue: !!backendData?.dailyRevenue,
          hasTransactions: !!backendData?.transactions,
          totalRevenue: backendData?.totalRevenue,
          dailyDataLength: backendData?.dailyRevenue?.length,
          fullBackendData: backendData
        });
        
        // 🚨 DOUBLE WRAPPING CHECK: Enhanced API client might double-wrap response
        if (backendData.success && backendData.data && !backendData.summary) {
          console.log('🔧 [API-FIX-WEEKLY] Double wrapping detected! Unwrapping response.data.data...');
          backendData = backendData.data;
          console.log('🔧 [API-FIX-WEEKLY] After unwrapping:', {
            keys: Object.keys(backendData),
            hasSummary: !!backendData.summary,
            hasDailyBreakdown: !!backendData.dailyBreakdown,
            hasTransactions: !!backendData.transactions
          });
        }
        
        console.log('🔍 [RAW-BACKEND-DATA] Complete raw response from backend:', JSON.stringify(backendData, null, 2));
        
        console.log('🔄 [DATA-TRANSFORM-START] Starting data transformation...');
        
        // Step 1: Extract period data - use backend's exact dates
        const periodData = {
          startDate: backendData?.period?.startDate || selectedStartDate,
          endDate: backendData?.period?.endDate || selectedEndDate,
          periodType: 'weekly' as const
        };
        console.log('📅 [TRANSFORM-STEP-1] Period data extracted:', periodData);
        console.log('📅 [DATE-VALIDATION] Date comparison:', {
          userSelectedStart: selectedStartDate,
          userSelectedEnd: selectedEndDate,
          backendReturnedStart: backendData?.period?.startDate,
          backendReturnedEnd: backendData?.period?.endDate,
          dateMatch: {
            startMatch: backendData?.period?.startDate === selectedStartDate,
            endMatch: backendData?.period?.endDate === selectedEndDate
          }
        });
        
        // Step 2: Extract summary data
        console.log('📊 [TRANSFORM-STEP-2] Backend summary data check:', {
          hasSummary: !!backendData?.summary,
          summaryKeys: backendData?.summary ? Object.keys(backendData.summary) : 'N/A',
          summaryData: backendData?.summary
        });
        
        const summaryData = {
          totalRevenue: backendData?.summary?.totalRevenue || 0,
          transactionCount: backendData?.summary?.transactionCount || 0,
          averageTransaction: backendData?.summary?.averageTransaction || 0
        };
        console.log('📊 [TRANSFORM-STEP-2] Summary data extracted:', summaryData);
        
        // Step 3: Extract daily breakdown
        const dailyBreakdownData = backendData?.dailyBreakdown || [];
        console.log('📋 [TRANSFORM-STEP-3] Daily breakdown data extracted:', {
          dailyBreakdownLength: dailyBreakdownData.length,
          firstDay: dailyBreakdownData[0] || 'No daily data',
          lastDay: dailyBreakdownData[dailyBreakdownData.length - 1] || 'No daily data'
        });
        
        // 📅 DATE DEBUGGING: Check daily breakdown dates order
        if (dailyBreakdownData.length > 0) {
          console.log('📅 [DATE-DEBUG] Daily breakdown dates check:', {
            totalDays: dailyBreakdownData.length,
            dateRange: dailyBreakdownData.map((day: any) => ({
              date: day.date,
              dayName: day.dayName,
              revenue: day.revenue
            })),
            sortedByDate: dailyBreakdownData.map((day: any) => day.date).sort(),
            expectedRange: `${selectedStartDate} to ${selectedEndDate}`,
            firstDate: dailyBreakdownData[0]?.date,
            lastDate: dailyBreakdownData[dailyBreakdownData.length - 1]?.date
          });
        }
        
        // Step 4: Extract transactions
        const transactionsData = backendData?.transactions || [];
        console.log('💼 [TRANSFORM-STEP-4] Transactions data extracted:', {
          transactionCount: transactionsData.length,
          firstTransaction: transactionsData[0] || 'No transactions',
          transactionsArray: transactionsData
        });
        
        // Step 5: Create final transformed object
        const weeklyRevenue: WeeklyRevenue = {
          period: periodData,
          summary: summaryData,
          dailyBreakdown: dailyBreakdownData,
          transactions: transactionsData
        };
        
        // 🎯 CATEGORY FILTERING: Apply client-side filtering if categories selected
        if (selectedCategoriesForWeekly.length > 0) {
          console.log('🔍 [CATEGORY-FILTER-WEEKLY] Applying category filter:', {
            selectedCategories: selectedCategoriesForWeekly,
            originalTransactionCount: weeklyRevenue.transactions.length,
            originalRevenue: weeklyRevenue.summary.totalRevenue
          });
          
          // Get selected category names
          const selectedCategoryNames = selectedCategoriesForWeekly.map(catId => 
            categories.find(c => c.id === catId)?.name
          ).filter(Boolean) as string[];
          
          console.log('🔍 [CATEGORY-FILTER-WEEKLY] Selected category names:', selectedCategoryNames);
          
          // Filter transactions by selected categories
          const filteredTransactions = weeklyRevenue.transactions.filter((tx: any) => 
            selectedCategoryNames.includes(tx.category_name)
          );
          
          // Recalculate totals based on filtered transactions
          const filteredRevenue = filteredTransactions.reduce((sum: number, tx: any) => 
            sum + (parseFloat(tx.amount) || 0), 0
          );
          
          // Update the weeklyRevenue object with filtered data
          weeklyRevenue.transactions = filteredTransactions;
          weeklyRevenue.summary.totalRevenue = filteredRevenue;
          weeklyRevenue.summary.transactionCount = filteredTransactions.length;
          weeklyRevenue.summary.averageTransaction = filteredTransactions.length > 0 
            ? filteredRevenue / filteredTransactions.length 
            : 0;
          
          console.log('🔍 [CATEGORY-FILTER-WEEKLY] After filtering:', {
            filteredTransactionCount: weeklyRevenue.transactions.length,
            filteredRevenue: weeklyRevenue.summary.totalRevenue
          });
        }
        
        console.log('✨ [TRANSFORM-COMPLETE] Final transformed weekly revenue object:', {
          periodKeys: Object.keys(weeklyRevenue.period),
          summaryKeys: Object.keys(weeklyRevenue.summary),
          dailyBreakdownLength: weeklyRevenue.dailyBreakdown.length,
          hasTransactions: weeklyRevenue.transactions.length > 0,
          completeObject: weeklyRevenue
        });

        console.log('✅ [FRONTEND-DEBUG] Transformed weekly revenue:', {
          totalRevenue: weeklyRevenue.summary.totalRevenue,
          transactionCount: weeklyRevenue.summary.transactionCount,
          dailyBreakdownLength: weeklyRevenue.dailyBreakdown.length
        });

        setWeeklyData(weeklyRevenue);
        console.log('🎯 [FRONTEND-DEBUG] Weekly revenue state updated successfully');
      } else {
        console.error('❌ [FRONTEND] Weekly API response failed:', { response });
        setError('Haftalık ciro alınamadı');
      }
    } catch (error: unknown) {
      console.error('Error loading weekly revenue:', error);
      setError('Haftalık ciro yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [selectedStartDate, selectedEndDate, selectedCategoriesForWeekly, categories]);

  const loadDailyRevenue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 [FRONTEND] Using new revenue API for daily data:', {
        date: selectedDailyDate,
        categoriesSelected: selectedCategoriesForDaily.length
      });

      // Use the enhanced API client instead of manual fetch
      const response = await api.revenue.getDailyRevenue(selectedDailyDate);

      if (response.success && response.data) {
        // Backend response format: { success, data: { totalRevenue, transactions, periodType, ... } }
        let backendData = response.data as any;
        
        console.log('🔍 [FRONTEND-DEBUG] Daily backend response structure:', {
          hasData: !!backendData,
          keys: backendData ? Object.keys(backendData) : 'N/A',
          hasTotalRevenue: !!backendData?.totalRevenue,
          hasTransactions: !!backendData?.transactions,
          periodType: backendData?.periodType,
          totalRevenue: backendData?.totalRevenue,
          transactionCount: backendData?.transactions?.length,
          fullBackendData: backendData
        });
        
        // 🚨 DOUBLE WRAPPING CHECK: Enhanced API client might double-wrap response
        if (backendData.success && backendData.data && !backendData.summary) {
          console.log('🔧 [API-FIX-DAILY] Double wrapping detected! Unwrapping response.data.data...');
          backendData = backendData.data;
          console.log('🔧 [API-FIX-DAILY] After unwrapping:', {
            keys: Object.keys(backendData),
            hasSummary: !!backendData.summary,
            hasDailyBreakdown: !!backendData.dailyBreakdown,
            hasTransactions: !!backendData.transactions
          });
        }
        
        console.log('🔍 [RAW-BACKEND-DATA] Complete raw response from backend:', JSON.stringify(backendData, null, 2));
        
        console.log('🔄 [DATA-TRANSFORM-START] Starting data transformation...');
        
        // Step 1: Extract period data
        const periodData = {
          startDate: backendData?.period?.startDate || selectedDailyDate,
          endDate: backendData?.period?.endDate || selectedDailyDate,
          periodType: backendData?.period?.periodType || 'daily' as const
        };
        console.log('📅 [TRANSFORM-STEP-1] Period data extracted:', periodData);
        
        // Step 2: Extract summary data
        console.log('📊 [TRANSFORM-STEP-2] Backend summary data check:', {
          hasSummary: !!backendData?.summary,
          summaryKeys: backendData?.summary ? Object.keys(backendData.summary) : 'N/A',
          summaryData: backendData?.summary
        });
        
        const summaryData = {
          totalRevenue: backendData?.summary?.totalRevenue || 0,
          transactionCount: backendData?.summary?.transactionCount || 0,
          averageTransaction: backendData?.summary?.averageTransaction || 0
        };
        console.log('📊 [TRANSFORM-STEP-2] Summary data extracted:', summaryData);
        
        // Step 3: Extract daily breakdown
        const dailyBreakdownData = backendData?.dailyBreakdown || [];
        console.log('📋 [TRANSFORM-STEP-3] Daily breakdown data extracted:', {
          dailyBreakdownLength: dailyBreakdownData.length,
          firstDay: dailyBreakdownData[0] || 'No daily data',
          lastDay: dailyBreakdownData[dailyBreakdownData.length - 1] || 'No daily data'
        });
        
        // 📅 DATE DEBUGGING: Check daily breakdown dates order
        if (dailyBreakdownData.length > 0) {
          console.log('📅 [DATE-DEBUG] Daily breakdown dates check:', {
            totalDays: dailyBreakdownData.length,
            dateRange: dailyBreakdownData.map((day: any) => ({
              date: day.date,
              dayName: day.dayName,
              revenue: day.revenue
            })),
            sortedByDate: dailyBreakdownData.map((day: any) => day.date).sort(),
            expectedRange: `${selectedStartDate} to ${selectedEndDate}`,
            firstDate: dailyBreakdownData[0]?.date,
            lastDate: dailyBreakdownData[dailyBreakdownData.length - 1]?.date
          });
        }
        
        // Step 4: Extract transactions
        const transactionsData = backendData?.transactions || [];
        console.log('💼 [TRANSFORM-STEP-4] Transactions data extracted:', {
          transactionCount: transactionsData.length,
          firstTransaction: transactionsData[0] || 'No transactions',
          transactionsArray: transactionsData
        });
        
        // Step 5: Create final transformed object (daily uses same structure as weekly)
        const dailyRevenue: WeeklyRevenue = {
          period: periodData,
          summary: summaryData,
          dailyBreakdown: dailyBreakdownData,
          transactions: transactionsData
        };
        
        // 🎯 CATEGORY FILTERING: Apply client-side filtering if categories selected
        if (selectedCategoriesForDaily.length > 0) {
          console.log('🔍 [CATEGORY-FILTER-DAILY] Applying category filter:', {
            selectedCategories: selectedCategoriesForDaily,
            originalTransactionCount: dailyRevenue.transactions.length,
            originalRevenue: dailyRevenue.summary.totalRevenue
          });
          
          // Get selected category names
          const selectedCategoryNames = selectedCategoriesForDaily.map(catId => 
            categories.find(c => c.id === catId)?.name
          ).filter(Boolean) as string[];
          
          console.log('🔍 [CATEGORY-FILTER-DAILY] Selected category names:', selectedCategoryNames);
          
          // Filter transactions by selected categories
          const filteredTransactions = dailyRevenue.transactions.filter((tx: any) => 
            selectedCategoryNames.includes(tx.category_name)
          );
          
          // Recalculate totals based on filtered transactions
          const filteredRevenue = filteredTransactions.reduce((sum: number, tx: any) => 
            sum + (parseFloat(tx.amount) || 0), 0
          );
          
          // Update the dailyRevenue object with filtered data
          dailyRevenue.transactions = filteredTransactions;
          dailyRevenue.summary.totalRevenue = filteredRevenue;
          dailyRevenue.summary.transactionCount = filteredTransactions.length;
          dailyRevenue.summary.averageTransaction = filteredTransactions.length > 0 
            ? filteredRevenue / filteredTransactions.length 
            : 0;
          
          console.log('🔍 [CATEGORY-FILTER-DAILY] After filtering:', {
            filteredTransactionCount: dailyRevenue.transactions.length,
            filteredRevenue: dailyRevenue.summary.totalRevenue
          });
        }
        
        console.log('✨ [TRANSFORM-COMPLETE] Final transformed daily revenue object:', {
          periodKeys: Object.keys(dailyRevenue.period),
          summaryKeys: Object.keys(dailyRevenue.summary),
          dailyBreakdownLength: dailyRevenue.dailyBreakdown.length,
          hasTransactions: dailyRevenue.transactions.length > 0,
          completeObject: dailyRevenue
        });

        console.log('✅ [FRONTEND-DEBUG] Transformed daily revenue:', {
          totalRevenue: dailyRevenue.summary.totalRevenue,
          transactionCount: dailyRevenue.summary.transactionCount,
          dailyBreakdownLength: dailyRevenue.dailyBreakdown.length
        });

        setDailyData(dailyRevenue);
        console.log('🎯 [FRONTEND-DEBUG] Daily revenue state updated successfully');
      } else {
        console.error('❌ [FRONTEND] Daily API response failed:', { response });
        setError('Günlük ciro alınamadı');
      }
    } catch (error: unknown) {
      console.error('Error loading daily revenue:', error);
      setError('Günlük ciro yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [selectedDailyDate, selectedCategoriesForDaily, categories]);

  // Tek merkezi data loading effect
  useEffect(() => {
    if (!isLoggedIn || user?.role !== 'admin') return;

    console.log('🔄 [MAIN-USEEFFECT] Data loading triggered:', {
      activeTab,
      selectedYear,
      selectedMonth,
      selectedYearForYearly,
      selectedStartDate,
      selectedEndDate,
      selectedDailyDate
    });

    switch (activeTab) {
      case 'monthly':
        console.log('📅 [MAIN-USEEFFECT] Loading monthly data for:', selectedYear, selectedMonth);
        loadMonthlyRevenue();
        break;
      case 'yearly':
        console.log('📅 [MAIN-USEEFFECT] Loading yearly data for:', selectedYearForYearly);
        loadYearlyRevenue();
        break;
      case 'weekly':
        console.log('📅 [MAIN-USEEFFECT] Loading weekly data for:', selectedStartDate, 'to', selectedEndDate);
        loadWeeklyRevenue();
        break;
      case 'daily':
        console.log('📅 [MAIN-USEEFFECT] Loading daily data for:', selectedDailyDate);
        loadDailyRevenue();
        break;
    }
  }, [
    isLoggedIn, 
    user, 
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
    // Categories for filtering
    categories,
    // Function dependencies
    loadMonthlyRevenue, 
    loadYearlyRevenue, 
    loadWeeklyRevenue, 
    loadDailyRevenue
  ]);

  // İlk yüklemede kategorileri yükle
  useEffect(() => {
    if (isLoggedIn && user?.role === 'admin') {
      loadCategories();
    }
  }, [isLoggedIn, user, loadCategories]);

  // STATE DEBUG: monthlyData değişikliklerini izle
  useEffect(() => {
    console.log('🔄 [STATE-DEBUG] monthlyData state changed:', {
      hasMonthlyData: !!monthlyData,
      totalRevenue: monthlyData?.summary?.totalRevenue,
      transactionCount: monthlyData?.summary?.transactionCount,
      fullMonthlyData: monthlyData
    });
  }, [monthlyData]);

  // STATE DEBUG: yearlyData değişikliklerini izle  
  useEffect(() => {
    console.log('🔄 [STATE-DEBUG] yearlyData state changed:', {
      hasYearlyData: !!yearlyData,
      totalRevenue: yearlyData?.summary?.totalRevenue,
      fullYearlyData: yearlyData
    });
  }, [yearlyData]);

  // Haftalık seçenekleri oluştur
  useEffect(() => {
    if (activeTab === 'weekly') {
      generateWeeklyOptions(selectedYearForWeekly);
    }
  }, [activeTab, selectedYearForWeekly, generateWeeklyOptions]);

  // ✅ Auth kontrolleri kaldırıldı - AuthInitializer yönlendirme yapacak

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  // Component render debug
  console.log('🎨 [COMPONENT-RENDER] Revenue page render:', {
    activeTab,
    loading,
    hasMonthlyData: !!monthlyData,
    hasYearlyData: !!yearlyData, 
    hasWeeklyData: !!weeklyData,
    hasDailyData: !!dailyData,
    monthlyDataSummary: monthlyData?.summary,
    yearlyDataSummary: yearlyData?.summary,
    selectedFilters: {
      year: selectedYear,
      month: selectedMonth,
      yearForYearly: selectedYearForYearly,
      dailyDate: selectedDailyDate
    }
  });

  return (
            <div className={`flex-1 bg-gradient-to-br min-h-screen p-6 ${theme === 'dark' ? 'from-slate-900 to-blue-950' : 'from-white to-gray-50'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Ciro Hesaplama
              </h1>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                İşlem bazlı ciro analizi ve raporlama
              </p>
            </div>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/profit')}
              className={`group relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white'
                  : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white'
              } shadow-lg hover:shadow-emerald-500/20`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg group-hover:scale-110 transition-transform duration-200">📊</span>
                <span>Kar Analizi</span>
                <span className="text-sm group-hover:translate-x-1 transition-transform duration-200">→</span>
              </div>
            </motion.button>
          </div>
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
            theme === 'dark' ? 'bg-demirhan-dark-200' : 'bg-gray-100'
          }`}>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'monthly'
                  ? theme === 'dark' 
                      ? 'bg-slate-700 text-white shadow-sm' 
                      : 'bg-white text-red-600 shadow-sm'
                  : theme === 'dark' 
                      ? 'text-gray-200 hover:text-white hover:bg-slate-700' 
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
                      ? 'bg-slate-700 text-white shadow-sm' 
                      : 'bg-white text-red-600 shadow-sm'
                  : theme === 'dark' 
                      ? 'text-gray-200 hover:text-white hover:bg-slate-700' 
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yıllık Ciro
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'weekly'
                  ? theme === 'dark' 
                      ? 'bg-slate-700 text-white shadow-sm' 
                      : 'bg-white text-red-600 shadow-sm'
                  : theme === 'dark' 
                      ? 'text-gray-200 hover:text-white hover:bg-slate-700' 
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Haftalık Ciro
            </button>
            <button
              onClick={() => setActiveTab('daily')}
                              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'daily'
                    ? theme === 'dark' 
                      ? 'bg-slate-700 text-white shadow-sm' 
                      : 'bg-white text-red-600 shadow-sm'
                    : theme === 'dark' 
                      ? 'text-gray-200 hover:text-white hover:bg-slate-700' 
                      : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Günlük Ciro
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
            {(() => {
              console.log('🎛️ [RENDER-CHECK] Monthly tab render condition check:', {
                activeTab,
                isMonthly: activeTab === 'monthly',
                hasMonthlyData: !!monthlyData,
                shouldRender: activeTab === 'monthly' && monthlyData,
                monthlyDataKeys: monthlyData ? Object.keys(monthlyData) : 'null'
              });
              return null;
            })()}
            {activeTab === 'monthly' && monthlyData && (
              (() => {
                console.log('🎨 [UI-RENDER] Monthly tab rendering with data:', {
                  activeTab,
                  hasMonthlyData: !!monthlyData,
                  totalRevenue: monthlyData?.summary?.totalRevenue,
                  transactionCount: monthlyData?.summary?.transactionCount,
                  averageTransaction: monthlyData?.summary?.averageTransaction,
                  formattedRevenue: formatCurrency(monthlyData?.summary?.totalRevenue || 0),
                  formattedCount: formatNumber(monthlyData?.summary?.transactionCount || 0),
                  formattedAverage: formatCurrency(monthlyData?.summary?.averageTransaction || 0),
                  transactionLength: monthlyData?.transactions?.length,
                  monthlyDataContent: monthlyData
                });
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Filters */}
                    <div className={`p-4 rounded-lg mb-6 border ${
                      theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                    } shadow-sm`}>
                      <div className="flex flex-col lg:flex-row gap-4 items-start">
                        <div className="flex flex-col gap-4 w-full lg:w-auto">
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                              Yıl
                            </label>
                            <select
                              value={selectedYear}
                              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                              className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-demirhan-500 w-full ${
                                theme === 'dark' 
                                  ? 'bg-slate-700 border-slate-600 text-gray-200' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              {Array.from({ length: 2040 - 2024 + 1 }, (_, i) => 2040 - i).map(year => (
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
                              className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-demirhan-500 w-full ${
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
                        </div>
                        <div className="flex-1 min-w-0 w-full lg:w-auto">
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                            Kategoriler
                          </label>
                          <div className={`p-3 border rounded-lg max-h-32 overflow-y-auto ${
                            theme === 'dark' 
                              ? 'bg-slate-700 border-slate-600' 
                              : 'bg-white border-gray-300'
                          }`}>
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                              {categories.map(cat => (
                                <label key={cat.id} className="flex items-center p-1 rounded hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={selectedCategoriesForMonthly.includes(cat.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedCategoriesForMonthly([...selectedCategoriesForMonthly, cat.id]);
                                      } else {
                                        setSelectedCategoriesForMonthly(selectedCategoriesForMonthly.filter(id => id !== cat.id));
                                      }
                                    }}
                                    className={`mr-1 rounded ${
                                      theme === 'dark' 
                                        ? 'bg-slate-700 border-slate-600 text-blue-400' 
                                        : 'bg-white border-gray-300 text-red-600'
                                    }`}
                                  />
                                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                    {cat.name}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary Cards */}
                    {monthlyData ? (
                      <>
                        {/* Kategori Filtresi Bilgisi */}
                        {selectedCategoriesForMonthly.length > 0 && (
                          <div className={`mb-6 p-4 rounded-lg border ${
                            theme === 'dark' ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
                          }`}>
                            <div className="flex items-center flex-wrap gap-2">
                              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-red-700'}`}>
                                📊 Filtrelenmiş Kategoriler:
                              </span>
                              {selectedCategoriesForMonthly.map(catId => {
                                const category = categories.find(cat => cat.id === catId);
                                return category ? (
                                  <span key={catId} className={`px-2 py-1 text-xs rounded-full ${
                                    theme === 'dark' 
                                      ? 'bg-red-600 text-white' 
                                      : 'bg-red-500 text-white'
                                  }`}>
                                    {category.name}
                                  </span>
                                ) : null;
                              })}
                              <button
                                onClick={() => setSelectedCategoriesForMonthly([])}
                                className={`ml-auto px-2 py-1 text-xs rounded transition-colors ${
                                  theme === 'dark' 
                                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                                    : 'bg-red-500 hover:bg-red-600 text-white'
                                }`}
                              >
                                Filtreyi Temizle
                              </button>
                            </div>
                          </div>
                        )}
                        
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Toplam Ciro
                              </p>
                              <p className={`text-xl md:text-2xl font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {(() => {
                                  console.log('💰 [UI-DEBUG] Rendering totalRevenue:', monthlyData.summary.totalRevenue, 'formatted:', formatCurrency(monthlyData.summary.totalRevenue));
                                  return formatCurrency(monthlyData.summary.totalRevenue);
                                })()}
                                {/* DEBUG: ₺54.800,00 (HARD-CODED TEST) */}
                              </p>
                            </div>
                            <div className={`p-3 rounded-full flex-shrink-0 ${theme === 'dark' ? 'bg-green-900/50' : 'bg-green-100'}`}>
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
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                İşlem Sayısı
                              </p>
                              <p className={`text-xl md:text-2xl font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {(() => {
                                  console.log('📊 [UI-DEBUG] Rendering transactionCount:', monthlyData.summary.transactionCount, 'formatted:', formatNumber(monthlyData.summary.transactionCount));
                                  return formatNumber(monthlyData.summary.transactionCount);
                                })()}
                                {/* DEBUG: 4 (HARD-CODED TEST) */}
                              </p>
                            </div>
                            <div className={`p-3 rounded-full flex-shrink-0 ${theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
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
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Ortalama İşlem
                              </p>
                              <p className={`text-xl md:text-2xl font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {(() => {
                                  console.log('📈 [UI-DEBUG] Rendering averageTransaction:', monthlyData.summary.averageTransaction, 'formatted:', formatCurrency(monthlyData.summary.averageTransaction));
                                  return formatCurrency(monthlyData.summary.averageTransaction);
                                })()}
                                {/* DEBUG: ₺13.700,00 (HARD-CODED TEST) */}
                              </p>
                            </div>
                            <div className={`p-3 rounded-full flex-shrink-0 ${theme === 'dark' ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                              <span className="text-2xl">📈</span>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                        {/* İşlem Listesi */}
                        {monthlyData.transactions && monthlyData.transactions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.4 }}
                          className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                        >
                            {(() => {
                              console.log('💼 [UI-DEBUG] Rendering transactions table, count:', monthlyData.transactions.length, 'first transaction:', monthlyData.transactions[0]);
                              return null;
                            })()}
                            <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              İşlem Detayları ({monthlyData.transactions.length} işlem)
                            </h3>
                            <div className="overflow-x-auto overflow-y-auto max-h-96">
                              <table className="w-full">
                                <thead>
                                  <tr className={`border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
                                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                      Tarih
                                    </th>
                                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                      Açıklama
                                    </th>
                                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                      Kategori
                                    </th>
                                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                      Araç
                                    </th>
                                    <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                      Personel
                                    </th>
                                    <th className={`text-right py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                      Tutar
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {monthlyData.transactions.map((transaction) => (
                                    <tr key={transaction.id} className={`border-b ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {new Date(transaction.transaction_date).toLocaleDateString('tr-TR')}
                                      </td>
                                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {transaction.description}
                                      </td>
                                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {transaction.category_name}
                                      </td>
                                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {transaction.vehicle_plate || '-'}
                                      </td>
                                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {transaction.personnel_name || '-'}
                                      </td>
                                      <td className={`text-right py-3 px-4 font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                        {formatCurrency(transaction.amount)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                          </div>
                        </motion.div>
                        )}
                      </>
                    ) : (
                      <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className="text-6xl mb-4">📊</div>
                        <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                          Veri Bulunamadı
                          </h3>
                        <p>Seçilen tarih aralığında işlem bulunmuyor.</p>
                      </div>
                    )}
                  </motion.div>
                )
              })()
            )}

            {/* Monthly Revenue - Veri Yok Durumu */}
            {activeTab === 'monthly' && !monthlyData && !loading && (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="text-6xl mb-4">📊</div>
                <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Veri Bulunamadı
                </h3>
                <p>Seçilen aylık dönem için veri bulunmuyor.</p>
              </div>
            )}

            {/* Yearly Revenue */}
            {activeTab === 'yearly' && yearlyData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Filters */}
                <div className={`p-4 rounded-lg mb-6 border ${
                  theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                } shadow-sm`}>
                  <div className="flex flex-col lg:flex-row gap-4 items-start">
                    <div className="w-full lg:w-auto">
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                        Yıl
                      </label>
                      <select
                        value={selectedYearForYearly}
                        onChange={(e) => setSelectedYearForYearly(parseInt(e.target.value))}
                        className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-demirhan-500 w-full ${
                          theme === 'dark' 
                            ? 'bg-slate-700 border-slate-600 text-gray-200' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                                                  {Array.from({ length: 2040 - 2024 + 1 }, (_, i) => 2040 - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                      </select>
                    </div>
                    <div className="flex-1 min-w-0 w-full lg:w-auto">
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                        Kategoriler
                      </label>
                      <div className={`p-3 border rounded-lg max-h-32 overflow-y-auto ${
                        theme === 'dark' 
                          ? 'bg-slate-700 border-slate-600' 
                          : 'bg-white border-gray-300'
                      }`}>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                          {categories.map(cat => (
                            <label key={cat.id} className="flex items-center p-1 rounded hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedCategoriesForYearly.includes(cat.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCategoriesForYearly([...selectedCategoriesForYearly, cat.id]);
                                  } else {
                                    setSelectedCategoriesForYearly(selectedCategoriesForYearly.filter(id => id !== cat.id));
                                  }
                                }}
                                className={`mr-1 rounded ${
                                  theme === 'dark' 
                                    ? 'bg-slate-700 border-slate-600 text-blue-400' 
                                    : 'bg-white border-gray-300 text-red-600'
                                }`}
                              />
                              <span className={`text-xs ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                {cat.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                {yearlyData ? (
                  <>
                    {/* Kategori Filtresi Bilgisi */}
                    {selectedCategoriesForYearly.length > 0 && (
                      <div className={`mb-6 p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center flex-wrap gap-2">
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-red-700'}`}>
                            📊 Filtrelenmiş Kategoriler:
                          </span>
                          {selectedCategoriesForYearly.map(catId => {
                            const category = categories.find(cat => cat.id === catId);
                            return category ? (
                              <span key={catId} className={`px-2 py-1 text-xs rounded-full ${
                                theme === 'dark' 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-red-500 text-white'
                              }`}>
                                {category.name}
                              </span>
                            ) : null;
                          })}
                          <button
                            onClick={() => setSelectedCategoriesForYearly([])}
                            className={`ml-auto px-2 py-1 text-xs rounded transition-colors ${
                              theme === 'dark' 
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                          >
                            Filtreyi Temizle
                          </button>
                        </div>
                      </div>
                    )}
                    
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Yıllık Ciro
                          </p>
                          <p className={`text-xl md:text-2xl font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(yearlyData.summary.totalRevenue)}
                          </p>
                        </div>
                        <div className={`p-3 rounded-full flex-shrink-0 ${theme === 'dark' ? 'bg-green-900/50' : 'bg-green-100'}`}>
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
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Toplam İşlem
                          </p>
                          <p className={`text-xl md:text-2xl font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatNumber(yearlyData.summary.totalTransactions)}
                          </p>
                        </div>
                        <div className={`p-3 rounded-full flex-shrink-0 ${theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
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
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Aylık Ortalama
                          </p>
                          <p className={`text-xl md:text-2xl font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(yearlyData.summary.averageMonthlyRevenue)}
                          </p>
                        </div>
                        <div className={`p-3 rounded-full flex-shrink-0 ${theme === 'dark' ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                          <span className="text-2xl">📈</span>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                      className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Ortalama İşlem
                          </p>
                          <p className={`text-xl md:text-2xl font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(yearlyData.summary.averageTransactionValue)}
                          </p>
                        </div>
                        <div className={`p-3 rounded-full flex-shrink-0 ${theme === 'dark' ? 'bg-yellow-900/50' : 'bg-yellow-100'}`}>
                          <span className="text-2xl">💎</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                {/* Monthly Chart */}
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
                                              {yearlyData.monthlyBreakdown.map((month) => (
                                                  <div key={month.month} className="text-center">
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

                    {/* İşlem Listesi */}
                    {yearlyData.transactions && yearlyData.transactions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 }}
                        className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                      >
                        <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          İşlem Detayları ({yearlyData.transactions.length} işlem)
                        </h3>
                        <div className="overflow-x-auto overflow-y-auto max-h-96">
                          <table className="w-full">
                            <thead>
                              <tr className={`border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
                                <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Tarih
                                </th>
                                <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Açıklama
                                </th>
                                <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Kategori
                                </th>
                                <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Araç
                                </th>
                                <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Personel
                                </th>
                                <th className={`text-right py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Tutar
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {yearlyData.transactions.map((transaction) => (
                                <tr key={transaction.id} className={`border-b ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {new Date(transaction.transaction_date).toLocaleDateString('tr-TR')}
                                  </td>
                                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {transaction.description}
                                  </td>
                                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {transaction.category_name}
                                  </td>
                                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {transaction.vehicle_plate || '-'}
                                  </td>
                                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {transaction.personnel_name || '-'}
                                  </td>
                                  <td className={`text-right py-3 px-4 font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                    {formatCurrency(transaction.amount)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                    </div>
                  </motion.div>
                    )}
                  </>
                ) : (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                      Veri Bulunamadı
                    </h3>
                    <p>Seçilen yılda işlem bulunmuyor.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Yearly Revenue - Veri Yok Durumu */}
            {activeTab === 'yearly' && !yearlyData && !loading && (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="text-6xl mb-4">📊</div>
                <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Veri Bulunamadı
                </h3>
                <p>Seçilen yıllık dönem için veri bulunmuyor.</p>
              </div>
            )}

            {/* Weekly Revenue */}
            {activeTab === 'weekly' && weeklyData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Filters */}
                <div className={`p-4 rounded-lg mb-6 border ${
                  theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                } shadow-sm`}>
                    <div className="flex flex-col lg:flex-row gap-4 items-start">
                    <div className="flex flex-col gap-4 w-full lg:w-auto">
                        <div className="flex-1 min-w-0">
                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                            Yıl Seçimi
                            </label>
                            <select
                            value={selectedYearForWeekly}
                            onChange={(e) => {
                              const newYear = parseInt(e.target.value);
                              setSelectedYearForWeekly(newYear);
                              generateWeeklyOptions(newYear);
                              setSelectedWeek(''); // Hafta seçimini sıfırla
                            }}
                            className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full ${
                                theme === 'dark' 
                                ? 'bg-slate-700 border-slate-600 text-gray-200' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                            {Array.from({ length: 2040 - 2024 + 1 }, (_, i) => 2040 - i).map(year => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                            </select>
                          </div>
                        <div className="flex-1 min-w-0">
                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                            Hafta Seçimi
                            </label>
                            <select
                            value={selectedWeek}
                            onChange={(e) => {
                              const [startDate, endDate] = e.target.value.split('_');
                              setSelectedWeek(e.target.value);
                              setSelectedStartDate(startDate);
                              setSelectedEndDate(endDate);
                            }}
                            className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full ${
                                theme === 'dark' 
                                ? 'bg-slate-700 border-slate-600 text-gray-200' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                            <option value="">Hafta seçiniz</option>
                                                          {weeklyOptions.map((option) => (
                                                                <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                              ))}
                            </select>
                          </div>
                    </div>
                    <div className="flex-1 min-w-0 w-full lg:w-auto">
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                        Kategoriler
                          </label>
                      <div className={`p-3 border rounded-lg max-h-32 overflow-y-auto ${
                              theme === 'dark' 
                          ? 'bg-slate-700 border-slate-600' 
                          : 'bg-white border-gray-300'
                      }`}>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                          {categories.map(cat => (
                            <label key={cat.id} className="flex items-center p-1 rounded hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedCategoriesForWeekly.includes(cat.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCategoriesForWeekly([...selectedCategoriesForWeekly, cat.id]);
                                  } else {
                                    setSelectedCategoriesForWeekly(selectedCategoriesForWeekly.filter(id => id !== cat.id));
                                  }
                                }}
                                className={`mr-1 rounded ${
                                  theme === 'dark' 
                                    ? 'bg-slate-700 border-slate-600 text-blue-400' 
                                    : 'bg-white border-gray-300 text-red-600'
                                }`}
                              />
                              <span className={`text-xs ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                {cat.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                {weeklyData ? (
                  <>
                    {/* Kategori Filtresi Bilgisi */}
                    {selectedCategoriesForWeekly.length > 0 && (
                      <div className={`mb-6 p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center flex-wrap gap-2">
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-red-700'}`}>
                            📊 Filtrelenmiş Kategoriler:
                          </span>
                          {selectedCategoriesForWeekly.map(catId => {
                            const category = categories.find(cat => cat.id === catId);
                            return category ? (
                              <span key={catId} className={`px-2 py-1 text-xs rounded-full ${
                              theme === 'dark' 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-red-500 text-white'
                              }`}>
                                {category.name}
                              </span>
                            ) : null;
                          })}
                          <button
                            onClick={() => setSelectedCategoriesForWeekly([])}
                            className={`ml-auto px-2 py-1 text-xs rounded transition-colors ${
                              theme === 'dark' 
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                          >
                            Filtreyi Temizle
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Haftalık Ciro
                            </p>
                            <p className={`text-xl md:text-2xl font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(weeklyData.summary.totalRevenue)}
                            </p>
                          </div>
                          <div className={`p-3 rounded-full flex-shrink-0 ${theme === 'dark' ? 'bg-green-900/50' : 'bg-green-100'}`}>
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
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              İşlem Sayısı
                            </p>
                            <p className={`text-xl md:text-2xl font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatNumber(weeklyData.summary.transactionCount)}
                            </p>
                          </div>
                          <div className={`p-3 rounded-full flex-shrink-0 ${theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
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
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Ortalama İşlem
                            </p>
                            <p className={`text-xl md:text-2xl font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(weeklyData.summary.averageTransaction)}
                            </p>
                          </div>
                          <div className={`p-3 rounded-full flex-shrink-0 ${theme === 'dark' ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                            <span className="text-2xl">📈</span>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Daily Breakdown */}
                    {weeklyData.dailyBreakdown && weeklyData.dailyBreakdown.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                      >
                        <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Günlük Ciro Dağılımı
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                                                      {weeklyData.dailyBreakdown.map((day) => (
                            <div key={day.day} className="text-center">
                              <div className={`p-4 rounded-lg border ${
                                theme === 'dark' ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'
                              }`}>
                                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {day.dayName}
                                </p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {new Date(day.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                </p>
                                <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {formatCurrency(day.revenue)}
                                </p>
                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {day.transactionCount} işlem
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* İşlem Listesi */}
                    {weeklyData.transactions && weeklyData.transactions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                        className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                      >
                        <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          İşlem Detayları ({weeklyData.transactions.length} işlem)
                        </h3>
                        <div className="overflow-x-auto overflow-y-auto max-h-96">
                          <table className="w-full">
                            <thead>
                              <tr className={`border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
                                <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Tarih
                                </th>
                                <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Açıklama
                                </th>
                                <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Kategori
                                </th>
                                <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Araç
                                </th>
                                <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Personel
                                </th>
                                <th className={`text-right py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Tutar
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {weeklyData.transactions.map((transaction) => (
                                <tr key={transaction.id} className={`border-b ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {new Date(transaction.transaction_date).toLocaleDateString('tr-TR')}
                                  </td>
                                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {transaction.description}
                                  </td>
                                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {transaction.category_name}
                                  </td>
                                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {transaction.vehicle_plate || '-'}
                                  </td>
                                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {transaction.personnel_name || '-'}
                                  </td>
                                  <td className={`text-right py-3 px-4 font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                    {formatCurrency(transaction.amount)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                      Veri Bulunamadı
                    </h3>
                    <p>Seçilen hafta için veri bulunmuyor.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Weekly Revenue - Veri Yok Durumu */}
            {activeTab === 'weekly' && !weeklyData && !loading && (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="text-6xl mb-4">📊</div>
                <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Veri Bulunamadı
                </h3>
                <p>Seçilen haftalık dönem için veri bulunmuyor.</p>
              </div>
            )}

            {/* Daily Revenue */}
            {activeTab === 'daily' && dailyData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Filters */}
                <div className={`p-4 rounded-lg mb-6 border ${
                  theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                } shadow-sm`}>
                  <div className="flex flex-col lg:flex-row gap-4 items-start">
                    <div className="w-full lg:w-auto">
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                        Tarih Seçimi
                      </label>
                      <input
                        type="date"
                        value={selectedDailyDate}
                        onChange={(e) => setSelectedDailyDate(e.target.value)}
                        className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full ${
                          theme === 'dark' 
                            ? 'bg-slate-700 border-slate-600 text-gray-200' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0 w-full lg:w-auto">
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                        Kategoriler
                      </label>
                      <div className={`p-3 border rounded-lg max-h-32 overflow-y-auto ${
                        theme === 'dark' 
                          ? 'bg-slate-700 border-slate-600' 
                          : 'bg-white border-gray-300'
                      }`}>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                          {categories.map(cat => (
                            <label key={cat.id} className="flex items-center p-1 rounded hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedCategoriesForDaily.includes(cat.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCategoriesForDaily([...selectedCategoriesForDaily, cat.id]);
                                  } else {
                                    setSelectedCategoriesForDaily(selectedCategoriesForDaily.filter(id => id !== cat.id));
                                  }
                                }}
                                className={`mr-1 rounded ${
                                  theme === 'dark' 
                                    ? 'bg-slate-700 border-slate-600 text-blue-400' 
                                    : 'bg-white border-gray-300 text-red-600'
                                }`}
                              />
                              <span className={`text-xs ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                {cat.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                {dailyData ? (
                  <>
                    {/* Kategori Filtresi Bilgisi */}
                    {selectedCategoriesForDaily.length > 0 && (
                      <div className={`mb-6 p-4 rounded-lg border ${
                        theme === 'dark' ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center flex-wrap gap-2">
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-red-700'}`}>
                            📊 Filtrelenmiş Kategoriler:
                          </span>
                          {selectedCategoriesForDaily.map(catId => {
                            const category = categories.find(cat => cat.id === catId);
                            return category ? (
                              <span key={catId} className={`px-2 py-1 text-xs rounded-full ${
                                theme === 'dark' 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-red-500 text-white'
                              }`}>
                                {category.name}
                              </span>
                            ) : null;
                          })}
                          <button
                            onClick={() => setSelectedCategoriesForDaily([])}
                            className={`ml-auto px-2 py-1 text-xs rounded transition-colors ${
                              theme === 'dark' 
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                          >
                            Filtreyi Temizle
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Günlük Ciro
                            </p>
                            <p className={`text-xl md:text-2xl font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(dailyData.summary.totalRevenue)}
                            </p>
                          </div>
                          <div className={`p-3 rounded-full flex-shrink-0 ${theme === 'dark' ? 'bg-green-900/50' : 'bg-green-100'}`}>
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
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              İşlem Sayısı
                            </p>
                            <p className={`text-xl md:text-2xl font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatNumber(dailyData.summary.transactionCount)}
                            </p>
                          </div>
                          <div className={`p-3 rounded-full flex-shrink-0 ${theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
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
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Ortalama İşlem
                            </p>
                            <p className={`text-xl md:text-2xl font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(dailyData.summary.averageTransaction)}
                            </p>
                          </div>
                          <div className={`p-3 rounded-full flex-shrink-0 ${theme === 'dark' ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                            <span className="text-2xl">📈</span>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Daily Details */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                      className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                    >
                      <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Seçilen Gün Detayı
                      </h3>
                      <div className="flex justify-center">
                        <div className="text-center max-w-md w-full">
                          <div className={`p-8 rounded-xl border-2 ${
                            theme === 'dark' 
                              ? 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-slate-600' 
                              : 'bg-gradient-to-br from-gray-50 to-white border-gray-300'
                          }`}>
                            <div className={`text-4xl mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              📅
                            </div>
                            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {new Date(selectedDailyDate).toLocaleDateString('tr-TR', { weekday: 'long' })}
                            </p>
                            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {new Date(selectedDailyDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            <div className={`mt-6 p-4 rounded-lg ${
                              theme === 'dark' ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'
                            }`}>
                              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                {formatCurrency(dailyData.summary.totalRevenue)}
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                Toplam Ciro
                              </p>
                            </div>
                            <div className={`mt-4 p-3 rounded-lg ${
                              theme === 'dark' ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'
                            }`}>
                              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                                {dailyData.summary.transactionCount}
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                İşlem Sayısı
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* İşlem Listesi */}
                    {dailyData.transactions && dailyData.transactions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                        className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                      >
                        <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          İşlem Detayları ({dailyData.transactions.length} işlem)
                        </h3>
                        <div className="overflow-x-auto overflow-y-auto max-h-96">
                          <table className="w-full">
                            <thead>
                              <tr className={`border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
                                <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Tarih
                                </th>
                                <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Açıklama
                                </th>
                                <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Kategori
                                </th>
                                <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Araç
                                </th>
                                <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Personel
                                </th>
                                <th className={`text-right py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Tutar
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {dailyData.transactions.map((transaction) => (
                                <tr key={transaction.id} className={`border-b ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {new Date(transaction.transaction_date).toLocaleDateString('tr-TR')}
                                  </td>
                                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {transaction.description}
                                  </td>
                                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {transaction.category_name}
                                  </td>
                                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {transaction.vehicle_plate || '-'}
                                  </td>
                                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {transaction.personnel_name || '-'}
                                  </td>
                                  <td className={`text-right py-3 px-4 font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                    {formatCurrency(transaction.amount)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                      Veri Bulunamadı
                    </h3>
                    <p>Seçilen günler için veri bulunmuyor.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Daily Revenue - Veri Yok Durumu */}
            {activeTab === 'daily' && !dailyData && !loading && (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className="text-6xl mb-4">📊</div>
                <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Veri Bulunamadı
                </h3>
                <p>Seçilen günlük dönem için veri bulunmuyor.</p>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default RevenuePage;