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

// Güncel API Response Interfaces (New Profit API)
interface DailyProfitResponse {
  success: boolean;
  data: {
    period: {
      type: 'daily';
      date: string;
      dayName: string;
    };
    summary: {
      totalRevenue: number;
      totalExpense: number;
      totalProfit: number;
      profitMargin: number;
      transactionCount: number;
      averageTransaction: number;
    };
    breakdowns: {
      categories: Array<{
        category: string;
        revenue: number;
        expense: number;
        profit: number;
        profitMargin: number;
        percentage: string;
      }>;
      vehicles: Array<{
        vehicle: string;
        revenue: number;
        expense: number;
        profit: number;
        profitMargin: number;
        percentage: string;
      }>;
    };
    transactions: Array<{
      id: number;
      revenue: number;
      expense: number;
      profit: number;
      description: string;
      transaction_date: string;
      category_name: string;
      vehicle_plate: string;
      personnel_name: string;
      is_expense: boolean;
    }>;
  };
}

interface WeeklyProfitResponse {
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
      totalExpense: number;
      totalProfit: number;
      profitMargin: number;
      transactionCount: number;
      averageTransaction: number;
      averageDailyProfit: number;
    };
    breakdowns: {
      daily: Array<{
        rapor_bölümü: string;
        tarih: string;
        gun_adi: string;
        gunluk_gelir: number;
        gunluk_gider: number;
        gunluk_islem_sayisi: number;
        gunluk_kar: number;
      }>;
      categories: Array<{
        category: string;
        revenue: number;
        expense: number;
        profit: number;
        profitMargin: number;
        percentage: string;
      }>;
    };
  };
}

interface MonthlyProfitResponse {
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
      totalExpense: number;
      totalProfit: number;
      profitMargin: number;
      transactionCount: number;
      averageTransaction: number;
      averageDailyProfit: number;
    };
    analysis: {
      basicAnalysis: {
        rapor_bölümü: string;
        analiz_periyodu: string;
        toplam_gelir: number;
        toplam_gider: number;
        net_kar: number;
        kar_marji_yuzde: number;
        toplam_islem_sayisi: number;
        ortalama_islem_tutari: number;
      };
      categoryAnalysis: Array<{
        rapor_bölümü: string;
        kategori_adi: string;
        kategori_gelir: number;
        kategori_gider: number;
        kategori_kar: number;
        kategori_kar_marji: number;
        islem_sayisi: number;
      }>;
      vehicleAnalysis: Array<{
        rapor_bölümü: string;
        arac_plaka: string;
        arac_bilgisi: string;
        arac_gelir: number;
        arac_gider: number;
        arac_kar: number;
        arac_kar_marji: number;
        islem_sayisi: number;
      }>;
      personnelAnalysis: Array<{
        rapor_bölümü: string;
        personel_adi: string;
        personel_gelir: number;
        personel_gider: number;
        personel_kar: number;
        personel_kar_marji: number;
        islem_sayisi: number;
        ortalama_islem_tutari: number;
      }>;
      generalStats: {
        rapor_bölümü: string;
        gelir_islem_sayisi: number;
        gider_islem_sayisi: number;
        max_gelir_islem: number;
        max_gider_islem: number;
        ort_gelir_islem: number;
        ort_gider_islem: number;
        aktif_arac_sayisi: number;
        aktif_personel_sayisi: number;
        kullanilan_kategori_sayisi: number;
      };
    };
    trends: {
      dailyTrend: Array<{
        rapor_bölümü: string;
        tarih: string;
        gun_adi: string;
        gunluk_gelir: number;
        gunluk_gider: number;
        gunluk_kar: number;
        gunluk_islem_sayisi: number;
      }>;
    };
  };
}

interface YearlyProfitResponse {
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
      totalExpense: number;
      totalProfit: number;
      profitMargin: number;
      transactionCount: number;
      averageTransaction: number;
      averageMonthlyProfit: number;
    };
    breakdowns: {
      monthly: Array<{
        month: number;
        monthName: string;
        revenue: number;
        expense: number;
        profit: number;
        profitMargin: number;
        transactionCount: number;
      }>;
      categories: Array<{
        rapor_bölümü: string;
        kategori_adi: string;
        kategori_gelir: number;
        kategori_gider: number;
        kategori_kar: number;
        kategori_kar_marji: number;
        islem_sayisi: number;
      }>;
      topTransactions: Array<{
        rapor_bölümü: string;
        islem_id: number;
        tarih: string;
        arac_plaka: string;
        personel: string;
        kategori: string;
        aciklama: string;
        gelir: number;
        gider: number;
        net_etki: number;
        odeme_yontemi: string;
        durum: string;
      }>;
    };
  };
}

// Legacy interface for backward compatibility
interface MonthlyAnalysisResponse {
  success: boolean;
  message: string;
  data: {
    basicAnalysis: {
      rapor_bölümü: string;
      analiz_periyodu: string;
      toplam_gelir: number;
      toplam_gider: number;
      net_kar: number;
      kar_marji_yuzde: number;
      toplam_islem_sayisi: number;
      ortalama_islem_tutari: number;
    };
    categoryAnalysis: Array<{
      rapor_bölümü: string;
      kategori_adi: string;
      kategori_gelir: number;
      kategori_gider: number;
      kategori_kar: number;
      kategori_kar_marji: number;
      islem_sayisi: number;
    }>;
    vehicleAnalysis: Array<{
      rapor_bölümü: string;
      arac_plaka: string;
      arac_bilgisi: string;
      arac_gelir: number;
      arac_gider: number;
      arac_kar: number;
      arac_kar_marji: number;
      islem_sayisi: number;
    }>;
    personnelAnalysis: Array<{
      rapor_bölümü: string;
      personel_adi: string;
      personel_gelir: number;
      personel_gider: number;
      personel_kar: number;
      personel_kar_marji: number;
      islem_sayisi: number;
      ortalama_islem_tutari: number;
    }>;
    dailyTrend: Array<{
      rapor_bölümü: string;
      tarih: string;
      gun_adi: string;
      gunluk_gelir: number;
      gunluk_gider: number;
      gunluk_kar: number;
      gunluk_islem_sayisi: number;
    }>;
    topProfitableTransactions: Array<{
      rapor_bölümü: string;
      islem_id: number;
      tarih: string;
      arac_plaka: string;
      personel: string;
      kategori: string;
      aciklama: string;
      gelir: number;
      gider: number;
      net_etki: number;
      odeme_yontemi: string;
      durum: string;
    }>;
    generalStats: {
      rapor_bölümü: string;
      gelir_islem_sayisi: number;
      gider_islem_sayisi: number;
      max_gelir_islem: number;
      max_gider_islem: number;
      ort_gelir_islem: number;
      ort_gider_islem: number;
      aktif_arac_sayisi: number;
      aktif_personel_sayisi: number;
      kullanilan_kategori_sayisi: number;
    };
  };
  meta: {
    year: number;
    month: number;
    monthName: string;
  };
}

interface YearlyAnalysisResponse {
  success: boolean;
  message: string;
  data: {
    yearlyAnalysis: {
      yil: number;
      yillik_toplam_gelir: number;
      yillik_toplam_gider: number;
      yillik_net_kar: number;
      yillik_kar_marji: number;
      yillik_toplam_islem_sayisi: number;
    };
    monthlyBreakdown: Array<{
      ay_numarasi: number;
      ay_adi: string;
      aylik_gelir: number;
      aylik_gider: number;
      aylik_kar: number;
      aylik_islem_sayisi: number;
    }>;
  };
  meta: {
    year: number;
  };
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
  breakdown?: {
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
    }>;
    byPersonnel?: Array<{
      personnel: string;
      revenue: number;
      expense: number;
      profit: number;
      profitMargin: number;
    }>;
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

// Missing interfaces - Adding the complete interface definitions
interface MonthlyProfit {
  period: {
    startDate: string;
    endDate: string;
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
    }>;
    byPersonnel: Array<{
      personnel: string;
      revenue: number;
      expense: number;
      profit: number;
      profitMargin: number;
    }>;
  };
  dailyTrend: Array<{
    date: string;
    dayName: string;
    revenue: number;
    expense: number;
    profit: number;
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
  topTransactions: Array<{
    id: number;
    description: string;
    amount: number;
    expense: number;
    netEffect: number;
    date: string;
    category: string;
    vehicle: string;
    personnel: string;
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
  breakdown?: {
    byCategory: Array<{
      category: string;
      revenue: number;
      expense: number;
      profit: number;
      profitMargin: number;
      percentage?: string;
    }>;
    byVehicle?: Array<{
      vehicle: string;
      revenue: number;
      expense: number;
      profit: number;
      profitMargin: number;
    }>;
    byPersonnel?: Array<{
      personnel: string;
      revenue: number;
      expense: number;
      profit: number;
      profitMargin: number;
    }>;
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

const ProfitPage: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const user = useSelector(selectUser);
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly' | 'weekly' | 'daily'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State change logger
  useEffect(() => {
    console.log('🔄 [FRONTEND] State değişikliği - activeTab:', activeTab);
  }, [activeTab]);

  useEffect(() => {
    console.log('⏳ [FRONTEND] State değişikliği - loading:', loading);
  }, [loading]);

  useEffect(() => {
    if (error) {
      console.error('❌ [FRONTEND] State değişikliği - error:', error);
    }
  }, [error]);
  
  // State'ler
  const [monthlyData, setMonthlyData] = useState<MonthlyProfit | null>(null);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedMonth, setSelectedMonth] = useState(7); // Temmuz ayı için
  const [selectedCategoriesForMonthly, setSelectedCategoriesForMonthly] = useState<number[]>([]);
  
  const [yearlyData, setYearlyData] = useState<YearlyProfit | null>(null);
  const [selectedYearForYearly, setSelectedYearForYearly] = useState(2024);
  const [selectedCategoriesForYearly, setSelectedCategoriesForYearly] = useState<number[]>([]);

  const [weeklyData, setWeeklyData] = useState<WeeklyProfit | null>(null);
  const [dailyData, setDailyData] = useState<WeeklyProfit | null>(null);

  const [selectedStartDate, setSelectedStartDate] = useState('2024-07-14');
  const [selectedEndDate, setSelectedEndDate] = useState('2024-07-20');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [selectedYearForWeekly, setSelectedYearForWeekly] = useState(2024);
  const [weeklyOptions, setWeeklyOptions] = useState<Array<{value: string, label: string}>>([]);
  const [selectedDailyDate, setSelectedDailyDate] = useState('2024-07-20');
  
  // Categories for filtering
  const [categories, setCategories] = useState<Array<{id: number, name: string}>>([]);
  const [selectedCategoriesForWeekly, setSelectedCategoriesForWeekly] = useState<number[]>([]);
  const [selectedCategoriesForDaily, setSelectedCategoriesForDaily] = useState<number[]>([]);

  // Debug: categories state değişikliklerini takip et
  useEffect(() => {
    console.log('🔍 [FRONTEND] Categories state updated:', categories);
  }, [categories]);

  // ✅ Auth kontrolü kaldırıldı - AuthInitializer yönlendirme yapacak

  // Fixed API'den kar verisi çeken fonksiyonlar
  const loadMonthlyProfit = useCallback(async () => {
          console.log('🔄 [FRONTEND-DEBUG] loadMonthlyProfit başlatıldı', {
        selectedYear,
        selectedMonth,
        selectedCategoriesForMonthly,
        timestamp: new Date().toISOString(),
        userInfo: { id: user?.id, role: user?.role }
      });

    try {
      console.log('⏳ [FRONTEND-DEBUG] Loading state başlatılıyor...');
      setLoading(true);
      setError(null);
      
      console.log('🌐 [FRONTEND-DEBUG] API çağrısı hazırlanıyor...', {
        year: selectedYear,
        month: selectedMonth,
        endpoint: `/profit/monthly?year=${selectedYear}&month=${selectedMonth}`
      });
      
      console.log('📡 [FRONTEND-DEBUG] api.profit.getMonthlyProfit çağrılıyor...');
      console.time('API_CALL_DURATION');
      
      // Use the new profit API with categories filter
      const categoriesParam = selectedCategoriesForMonthly.length > 0 ? selectedCategoriesForMonthly : undefined;
      const response = await api.profit.getMonthlyProfit(selectedYear, selectedMonth, categoriesParam);
      
      console.timeEnd('API_CALL_DURATION');
      console.log('✅ [FRONTEND-DEBUG] API Response alındı:', {
        responseExists: !!response,
        responseType: typeof response,
        responseKeys: response ? Object.keys(response) : 'N/A',
        success: response?.success,
        hasData: !!response?.data,
        dataKeys: response?.data ? Object.keys(response.data) : 'N/A'
      });
      console.log('📄 [FRONTEND-DEBUG] Full API Response:', response);
        
      // ✅ DÜZELTME: Enhanced API client response.data'yı kontrol et
      if (response && response.success && response.data) {
        console.log('✨ [FRONTEND-DEBUG] Data başarılı, processing başlıyor...');
        
        // Enhanced API client wraps backend response, so we access it properly
        let apiData = response.data as any;
        
        // Check if backend response is nested in another data property
        if (apiData.data && typeof apiData.data === 'object') {
          console.log('🔍 [FRONTEND-DEBUG] Nested data structure detected, unwrapping...');
          apiData = apiData.data;
        }
        
        console.log('🔍 [FRONTEND-DEBUG] Final API Data structure check:', {
          hasData: !!apiData,
          hasPeriod: !!apiData?.period,
          periodKeys: apiData?.period ? Object.keys(apiData.period) : 'N/A',
          hasSummary: !!apiData?.summary,
          hasAnalysis: !!apiData?.analysis,
          hasTrends: !!apiData?.trends
        });
        
        // Safely access nested properties with fallbacks from the new API structure
        const period = apiData.period || {};
        const summary = apiData.summary || {};
        const analysis = apiData.analysis || {};
        const trends = apiData.trends || {};
        
        // Extract breakdown data from analysis section (new API structure)
        const categoryAnalysis = analysis.categoryAnalysis || [];
        const vehicleAnalysis = analysis.vehicleAnalysis || [];
        const personnelAnalysis = analysis.personnelAnalysis || [];
        const dailyTrend = trends.dailyTrend || [];
        const transactions = apiData.transactions || [];
        
        // Transform to frontend interface (minimal transformation)
        const monthlyProfit: MonthlyProfit = {
          period: {
            startDate: period.startDate || '',
            endDate: period.endDate || '',
            year: period.year || selectedYear,
            month: period.month || selectedMonth,
            monthName: period.monthName || months[selectedMonth - 1]
          },
          summary: {
            totalRevenue: summary.totalRevenue || 0,
            totalExpense: summary.totalExpense || 0,
            totalProfit: summary.totalProfit || 0,
            profitMargin: summary.profitMargin || 0,
            transactionCount: summary.transactionCount || 0,
            averageTransaction: summary.averageTransaction || 0
          },
          breakdown: {
            byCategory: categoryAnalysis.map((cat: any) => ({
              category: cat?.kategori_adi || cat?.category || '',
              revenue: cat?.kategori_gelir || cat?.revenue || 0,
              expense: cat?.kategori_gider || cat?.expense || 0,
              profit: cat?.kategori_kar || cat?.profit || 0,
              profitMargin: cat?.kategori_kar_marji || cat?.profitMargin || 0,
              percentage: `${(cat?.kategori_kar_marji || cat?.profitMargin || 0).toFixed(2)}%`
            })),
            byVehicle: vehicleAnalysis.map((vehicle: any) => ({
              vehicle: vehicle?.arac_plaka || vehicle?.vehicle || '',
              revenue: vehicle?.arac_gelir || vehicle?.revenue || 0,
              expense: vehicle?.arac_gider || vehicle?.expense || 0,
              profit: vehicle?.arac_kar || vehicle?.profit || 0,
              profitMargin: vehicle?.arac_kar_marji || vehicle?.profitMargin || 0
            })),
            byPersonnel: personnelAnalysis.map((personnel: any) => ({
              personnel: personnel?.personel_adi || personnel?.personnel || '',
              revenue: personnel?.personel_gelir || personnel?.revenue || 0,
              expense: personnel?.personel_gider || personnel?.expense || 0,
              profit: personnel?.personel_kar || personnel?.profit || 0,
              profitMargin: personnel?.personel_kar_marji || personnel?.profitMargin || 0
            }))
          },
          dailyTrend: dailyTrend.map((day: any) => ({
            date: day?.tarih || day?.date || '',
            dayName: day?.gun_adi || day?.dayName || '',
            revenue: day?.gunluk_gelir || day?.revenue || 0,
            expense: day?.gunluk_gider || day?.expense || 0,
            profit: day?.gunluk_kar || day?.profit || 0,
            transactionCount: day?.gunluk_islem_sayisi || day?.transactionCount || 0
          })),
          transactions: transactions.map((tx: any) => ({
            id: tx.id?.toString() || '',
            amount: tx.amount || 0,
            expense: tx.expense || 0,
            profit: tx.profit || 0,
            description: tx.description || '',
            transaction_date: tx.transaction_date || '',
            category_name: tx.category_name || '',
            vehicle_plate: tx.vehicle_plate || '',
            personnel_name: tx.personnel_name || '',
            is_expense: tx.is_expense || false
          })),
          topTransactions: [] // Will be populated from topTransactions if available
        };
        
        console.log('📄 [FRONTEND] Standardize edilmiş monthly data:', monthlyProfit);
        setMonthlyData(monthlyProfit);
        console.log('✅ [FRONTEND-DEBUG] State güncellendi, monthlyData set edildi');
      } else {
        console.error('❌ [FRONTEND-DEBUG] Data success false:', {
          responseExists: !!response,
          success: response?.success,
          dataExists: !!response?.data,
          dataSuccess: response?.data?.success,
          hasInnerData: !!response?.data?.data,
          fullResponse: response
        });
        setError('Aylık kar alınamadı');
      }
    } catch (error: unknown) {
      console.error('💥 [FRONTEND-DEBUG] Catch error occurred:', {
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack available',
        errorName: error instanceof Error ? error.name : 'Unknown',
        fullError: error,
        timestamp: new Date().toISOString()
      });
      
      // Network hatasını kontrol et
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          console.error('🌐 [FRONTEND-DEBUG] Network error detected:', error.message);
        }
        if (error.message.includes('timeout')) {
          console.error('⏰ [FRONTEND-DEBUG] Timeout error detected:', error.message);
        }
      }
      
      setError('Aylık kar yüklenirken hata oluştu');
    } finally {
      console.log('🏁 [FRONTEND-DEBUG] loadMonthlyProfit tamamlandı', {
        finalState: { loading: false, hasData: !!monthlyData },
        timestamp: new Date().toISOString()
      });
      setLoading(false);
    }
  }, [selectedYear, selectedMonth, selectedCategoriesForMonthly]);

  const loadYearlyProfit = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🌐 [FRONTEND] Yearly API çağrısı yapılıyor...', {
        year: selectedYearForYearly
      });
      
      // Use the NEW profit API from api-endpoints with categories filter
      const categoriesParam = selectedCategoriesForYearly.length > 0 ? selectedCategoriesForYearly : undefined;
      const response = await api.profit.getYearlyProfit(selectedYearForYearly, categoriesParam);
      console.log('✅ [FRONTEND] Yearly API Response:', response);
      
      // ✅ DÜZELTME: Yeni API'de doğrudan response.data kullanılıyor
      if (response.success && response.data) {
        // ✅ DÜZELTME: Yeni API'de doğrudan response.data kullanılıyor
        const apiData = response.data as any;
        
        console.log('🔍 [FRONTEND] Yearly API Data structure check:', {
          hasData: !!apiData,
          hasPeriod: !!apiData?.period,
          hasSummary: !!apiData?.summary,
          hasMonthlyBreakdown: !!apiData?.monthlyBreakdown,
          hasTransactions: !!apiData?.transactions
        });
        
        // Safely access nested properties with fallbacks
        const period = apiData.period || {};
        const summary = apiData.summary || {};
        const breakdowns = apiData.breakdowns || {};
        const monthlyBreakdown = breakdowns.monthly || [];
        const transactions = apiData.transactions || [];
        
        // Transform to frontend interface (minimal transformation)
        const yearlyProfit: YearlyProfit = {
          year: period.year || selectedYearForYearly,
          summary: {
            totalRevenue: summary.totalRevenue || 0,
            totalExpense: summary.totalExpense || 0,
            totalProfit: summary.totalProfit || 0,
            profitMargin: summary.profitMargin || 0,
            totalTransactions: summary.totalTransactions || 0,
            averageMonthlyProfit: summary.averageMonthlyProfit || 0,
            averageTransactionValue: summary.averageTransactionValue || 0
          },
          breakdown: {
            byCategory: (breakdowns.categories || []).map((cat: any) => ({
              category: cat?.kategori_adi || cat?.category || '',
              revenue: cat?.kategori_gelir || cat?.revenue || 0,
              expense: cat?.kategori_gider || cat?.expense || 0,
              profit: cat?.kategori_kar || cat?.profit || 0,
              profitMargin: cat?.kategori_kar_marji || cat?.profitMargin || 0,
              percentage: cat?.percentage || `${(cat?.kategori_kar_marji || cat?.profitMargin || 0).toFixed(2)}%`
            })),
            byVehicle: (breakdowns.vehicles || []).map((vehicle: any) => ({
              vehicle: vehicle?.arac_plaka || vehicle?.vehicle || '',
              revenue: vehicle?.arac_gelir || vehicle?.revenue || 0,
              expense: vehicle?.arac_gider || vehicle?.expense || 0,
              profit: vehicle?.arac_kar || vehicle?.profit || 0,
              profitMargin: vehicle?.arac_kar_marji || vehicle?.profitMargin || 0
            })),
            byPersonnel: (breakdowns.personnel || []).map((personnel: any) => ({
              personnel: personnel?.personel_adi || personnel?.personnel || '',
              revenue: personnel?.personel_gelir || personnel?.revenue || 0,
              expense: personnel?.personel_gider || personnel?.expense || 0,
              profit: personnel?.personel_kar || personnel?.profit || 0,
              profitMargin: personnel?.personel_kar_marji || personnel?.profitMargin || 0
            }))
          },
          monthlyBreakdown: monthlyBreakdown.map((month: any) => ({
            month: month?.month || 0,
            monthName: month?.monthName || '',
            revenue: month?.revenue || 0,
            expense: month?.expense || 0,
            profit: month?.profit || 0,
            profitMargin: month?.profitMargin || 0,
            transactionCount: month?.transactionCount || 0
          })),
          transactions: transactions.map((tx: any) => ({
            id: tx?.id?.toString() || '',
            amount: tx?.amount || 0,
            expense: tx?.expense || 0,
            profit: tx?.profit || 0,
            description: tx?.description || '',
            transaction_date: tx?.transaction_date || '',
            category_name: tx?.category_name || '',
            vehicle_plate: tx?.vehicle_plate || '',
            personnel_name: tx?.personnel_name || '',
            is_expense: tx?.is_expense || false
          }))
        };
        
        console.log('📄 [FRONTEND] Standardize edilmiş yearly data:', yearlyProfit);
        setYearlyData(yearlyProfit);
      } else {
        console.error('❌ [FRONTEND] Yearly data success false:', {
          responseExists: !!response,
          success: response?.success,
          dataExists: !!response?.data,
          dataSuccess: response?.data?.success,
          hasInnerData: !!response?.data?.data,
        });
        setError('Yıllık kar alınamadı');
      }
    } catch (error: unknown) {
      console.error('💥 [FRONTEND] Yearly catch error:', error);
      setError('Yıllık kar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [selectedYearForYearly, selectedCategoriesForYearly]);

  const loadCategories = useCallback(async () => {
    try {
      console.log('🔍 [FRONTEND] loadCategories fonksiyonu başlatıldı');
      const response = await api.category.getTransactionCategories();
      console.log('🔍 [FRONTEND] Kategoriler API response:', response);
      
      // Enhanced API client avoids double wrapping, so backend response comes directly
      // Backend returns { success, data: [...] } and enhanced client returns it as-is
      if (response && response.success && response.data) {
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
    
    // Yılın son gününü hesapla
    const dec31 = new Date(targetYear, 11, 31);
    
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

  const loadWeeklyProfit = useCallback(async () => {
    console.log('🔄 [FRONTEND] loadWeeklyProfit başlatıldı', {
      selectedStartDate,
      selectedEndDate,
      selectedCategoriesForWeekly
    });

    try {
      setLoading(true);
      setError(null);
      
      // Calculate year and week from selectedStartDate
      const startDate = new Date(selectedStartDate);
      const currentYear = startDate.getFullYear();
      const currentWeek = Math.ceil((startDate.getTime() - new Date(currentYear, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      console.log('🌐 [FRONTEND] Weekly API çağrısı yapılıyor...', {
        year: currentYear,
        week: currentWeek
      });
      
      // Use the NEW profit API from api-endpoints with categories filter
      const categoriesParam = selectedCategoriesForWeekly.length > 0 ? selectedCategoriesForWeekly : undefined;
      const response = await api.profit.getWeeklyProfit(currentYear, currentWeek, categoriesParam);
      console.log('✅ [FRONTEND] Weekly API Response:', response);
        
      // ✅ DÜZELTME: Enhanced API client wrap yapıyor, bu yüzden response.data olarak erişmek gerekiyor
      if (response && response.success && response.data) {
        console.log('✨ [FRONTEND] Weekly data başarılı, işleniyor...');
        
        // ✅ DÜZELTME: Backend response yapısı {success: true, data: {...}} şeklinde
        const apiData = (response.data as any).data || response.data;
        
        console.log('🔍 [FRONTEND] Weekly API Data structure check:', {
          hasData: !!apiData,
          hasPeriod: !!apiData?.period,
          hasSummary: !!apiData?.summary,
          hasBreakdowns: !!apiData?.breakdowns,
          hasDaily: !!apiData?.breakdowns?.daily,
          hasVehicles: !!apiData?.breakdowns?.vehicles,
          hasPersonnel: !!apiData?.breakdowns?.personnel,
          hasTransactions: !!apiData?.transactions,
          vehicleCount: apiData?.breakdowns?.vehicles?.length || 0,
          personnelCount: apiData?.breakdowns?.personnel?.length || 0,
          dailyCount: apiData?.breakdowns?.daily?.length || 0,
          transactionCount: apiData?.transactions?.length || 0
        });
        
        // Safely access nested properties with fallbacks
        const period = apiData?.period || { startDate: selectedStartDate, endDate: selectedEndDate, periodType: 'weekly' };
        const summary = apiData?.summary || { totalRevenue: 0, totalExpense: 0, totalProfit: 0, profitMargin: 0, transactionCount: 0, averageTransaction: 0 };
        const breakdowns = apiData?.breakdowns || {};
        const dailyBreakdown = breakdowns?.daily || [];
        const transactions = apiData?.transactions || [];
        
        console.log('🔧 [FRONTEND] Weekly data mapping debug:', {
          vehiclesSample: breakdowns?.vehicles?.slice(0, 2),
          personnelSample: breakdowns?.personnel?.slice(0, 2),
          dailySample: dailyBreakdown?.slice(0, 2),
          transactionsSample: transactions?.slice(0, 2)
        });
        
        // Transform backend data to frontend format
        const weeklyProfit: WeeklyProfit = {
          period: {
            startDate: period.startDate || selectedStartDate,
            endDate: period.endDate || selectedEndDate,
            periodType: period.periodType || 'weekly'
          },
          summary: {
            totalRevenue: summary.totalRevenue || 0,
            totalExpense: summary.totalExpense || 0,
            totalProfit: summary.totalProfit || 0,
            profitMargin: summary.profitMargin || 0,
            transactionCount: summary.transactionCount || 0,
            averageTransaction: summary.averageTransaction || 0
          },
          breakdown: {
            byCategory: (breakdowns.categories || []).map((cat: any) => ({
              category: cat?.category || '',
              revenue: cat?.revenue || 0,
              expense: cat?.expense || 0,
              profit: cat?.profit || 0,
              profitMargin: cat?.profitMargin || 0,
              percentage: cat?.percentage || `${(cat?.profitMargin || 0).toFixed(2)}%`
            })),
            byVehicle: (breakdowns.vehicles || []).map((vehicle: any) => ({
              vehicle: vehicle?.arac_plaka || vehicle?.vehicle || '',
              revenue: vehicle?.arac_gelir || vehicle?.revenue || 0,
              expense: vehicle?.arac_gider || vehicle?.expense || 0,
              profit: vehicle?.arac_kar || vehicle?.profit || 0,
              profitMargin: vehicle?.arac_kar_marji || vehicle?.profitMargin || 0
            })),
            byPersonnel: (breakdowns.personnel || []).map((personnel: any) => ({
              personnel: personnel?.personel_adi || personnel?.personnel || '',
              revenue: personnel?.personel_gelir || personnel?.revenue || 0,
              expense: personnel?.personel_gider || personnel?.expense || 0,
              profit: personnel?.personel_kar || personnel?.profit || 0,
              profitMargin: personnel?.personel_kar_marji || personnel?.profitMargin || 0
            }))
          },
          dailyBreakdown: dailyBreakdown.map((day: any) => ({
            day: day?.tarih ? new Date(day.tarih).getDate() : (day?.date ? new Date(day.date).getDate() : 0),
            dayName: day?.gun_adi || day?.dayName || '',
            date: day?.tarih || day?.date || '',
            revenue: day?.gunluk_gelir || day?.revenue || 0,
            expense: day?.gunluk_gider || day?.expense || 0,
            profit: day?.gunluk_kar || day?.profit || 0,
            profitMargin: (day?.gunluk_gelir && day.gunluk_gelir > 0) ? (day.gunluk_kar / day.gunluk_gelir) * 100 : 
                         ((day?.revenue && day.revenue > 0) ? (day.profit / day.revenue) * 100 : 0),
            transactionCount: day?.gunluk_islem_sayisi || day?.transactionCount || 0,
            transactions: day?.transactions || []
          })),
          transactions: transactions.map((tx: any) => ({
            id: tx?.id?.toString() || '',
            amount: tx?.amount || 0,
            expense: tx?.expense || 0,
            profit: tx?.profit || 0,
            description: tx?.description || '',
            transaction_date: tx?.transaction_date || '',
            category_name: tx?.category_name || '',
            vehicle_plate: tx?.vehicle_plate || '',
            personnel_name: tx?.personnel_name || '',
            is_expense: tx?.is_expense || false
          }))
        };
        
        console.log('📄 [FRONTEND] Formatted weekly data:', weeklyProfit);
        setWeeklyData(weeklyProfit);
      } else {
        console.error('❌ [FRONTEND] Weekly data success false:', {
          responseExists: !!response,
          success: response?.success,
          dataExists: !!response?.data,
          message: (response as any)?.message || 'Weekly data not found'
        });
        setError((response as any)?.message || 'Haftalık kar alınamadı');
      }
    } catch (error: unknown) {
      console.error('💥 [FRONTEND] Weekly catch error:', error);
      setError('Haftalık kar yüklenirken hata oluştu');
    } finally {
      console.log('🏁 [FRONTEND] loadWeeklyProfit tamamlandı');
      setLoading(false);
    }
  }, [selectedStartDate, selectedEndDate, selectedCategoriesForWeekly]);

  const loadDailyProfit = useCallback(async () => {
    console.log('🔄 [FRONTEND] loadDailyProfit başlatıldı', {
      selectedDailyDate,
      selectedCategoriesForDaily
    });

    try {
      setLoading(true);
      setError(null);
      
      console.log('🌐 [FRONTEND] Daily API çağrısı yapılıyor...', {
        date: selectedDailyDate
      });
      
      // Use the profit API from api-endpoints with categories filter
      const categoriesParam = selectedCategoriesForDaily.length > 0 ? selectedCategoriesForDaily : undefined;
      const response = await api.profit.getDailyProfit(selectedDailyDate, categoriesParam);
      console.log('✅ [FRONTEND] Daily API Response:', response);
        
      // ✅ DÜZELTME: Enhanced API client wrap yapıyor, bu yüzden response.data olarak erişmek gerekiyor
      if (response && response.success && response.data) {
        console.log('✨ [FRONTEND] Daily data başarılı, işleniyor...');
        
        // ✅ DÜZELTME: Backend response yapısı {success: true, data: {...}} şeklinde
        const apiData = (response.data as any).data || response.data;
        
        console.log('🔍 [FRONTEND] Daily API Data structure check:', {
          hasData: !!apiData,
          hasPeriod: !!apiData?.period,
          hasSummary: !!apiData?.summary,
          hasDailyBreakdown: !!apiData?.dailyBreakdown,
          hasTransactions: !!apiData?.transactions
        });
        
        // Safely access nested properties with fallbacks
        const period = apiData?.period || { startDate: selectedDailyDate, endDate: selectedDailyDate, periodType: 'daily' };
        const summary = apiData?.summary || { totalRevenue: 0, totalExpense: 0, totalProfit: 0, profitMargin: 0, transactionCount: 0, averageTransaction: 0 };
        const breakdowns = apiData?.breakdowns || {};
        const dailyBreakdown = apiData?.dailyBreakdown || [];
        const transactions = apiData?.transactions || [];
        
        // Transform backend data to frontend format
        const dailyProfit: WeeklyProfit = {
          period: {
            startDate: period.startDate || selectedDailyDate,
            endDate: period.endDate || selectedDailyDate,
            periodType: period.periodType || 'daily'
          },
          summary: {
            totalRevenue: summary.totalRevenue || 0,
            totalExpense: summary.totalExpense || 0,
            totalProfit: summary.totalProfit || 0,
            profitMargin: summary.profitMargin || 0,
            transactionCount: summary.transactionCount || 0,
            averageTransaction: summary.averageTransaction || 0
          },
          breakdown: {
            byCategory: (breakdowns.categories || []).map((cat: any) => ({
              category: cat?.category || '',
              revenue: cat?.revenue || 0,
              expense: cat?.expense || 0,
              profit: cat?.profit || 0,
              profitMargin: cat?.profitMargin || 0,
              percentage: cat?.percentage || `${(cat?.profitMargin || 0).toFixed(2)}%`
            })),
            byVehicle: (breakdowns.vehicles || []).map((vehicle: any) => ({
              vehicle: vehicle?.arac_plaka || vehicle?.vehicle || '',
              revenue: vehicle?.arac_gelir || vehicle?.revenue || 0,
              expense: vehicle?.arac_gider || vehicle?.expense || 0,
              profit: vehicle?.arac_kar || vehicle?.profit || 0,
              profitMargin: vehicle?.arac_kar_marji || vehicle?.profitMargin || 0
            })),
            byPersonnel: (breakdowns.personnel || []).map((personnel: any) => ({
              personnel: personnel?.personel_adi || personnel?.personnel || '',
              revenue: personnel?.personel_gelir || personnel?.revenue || 0,
              expense: personnel?.personel_gider || personnel?.expense || 0,
              profit: personnel?.personel_kar || personnel?.profit || 0,
              profitMargin: personnel?.personel_kar_marji || personnel?.profitMargin || 0
            }))
          },
          dailyBreakdown: dailyBreakdown.map((day: any) => ({
            day: day?.tarih ? new Date(day.tarih).getDate() : (day?.date ? new Date(day.date).getDate() : 0),
            dayName: day?.gun_adi || day?.dayName || '',
            date: day?.tarih || day?.date || '',
            revenue: day?.gunluk_gelir || day?.revenue || 0,
            expense: day?.gunluk_gider || day?.expense || 0,
            profit: day?.gunluk_kar || day?.profit || 0,
            profitMargin: (day?.gunluk_gelir && day.gunluk_gelir > 0) ? (day.gunluk_kar / day.gunluk_gelir) * 100 : 
                         ((day?.revenue && day.revenue > 0) ? (day.profit / day.revenue) * 100 : 0),
            transactionCount: day?.gunluk_islem_sayisi || day?.transactionCount || 0,
            transactions: day?.transactions || []
          })),
          transactions: transactions.map((tx: any) => ({
            id: tx?.id?.toString() || '',
            amount: tx?.amount || 0,
            expense: tx?.expense || 0,
            profit: tx?.profit || 0,
            description: tx?.description || '',
            transaction_date: tx?.transaction_date || '',
            category_name: tx?.category_name || '',
            vehicle_plate: tx?.vehicle_plate || '',
            personnel_name: tx?.personnel_name || '',
            is_expense: tx?.is_expense || false
          }))
        };
        
        console.log('📄 [FRONTEND] Formatted daily data:', dailyProfit);
        setDailyData(dailyProfit);
      } else {
        const anyResponse = response as any;
        console.error('❌ [FRONTEND] Daily data success false:', {
          responseExists: !!response,
          success: response?.success,
          dataExists: !!response?.data,
          message: anyResponse?.message || 'Daily data not found'
        });
        setError(anyResponse?.message || 'Günlük kar alınamadı');
      }
    } catch (error: unknown) {
      console.error('💥 [FRONTEND] Daily catch error:', error);
      setError('Günlük kar yüklenirken hata oluştu');
    } finally {
      console.log('🏁 [FRONTEND] loadDailyProfit tamamlandı');
      setLoading(false);
    }
  }, [selectedDailyDate, selectedCategoriesForDaily]);

  // Centralized data loading effect
  useEffect(() => {
    console.log('🔄 [FRONTEND] useEffect tetiklendi', {
      isLoggedIn,
      userRole: user?.role,
      activeTab,
      selectedYear,
      selectedMonth,
      selectedCategoriesForMonthly: selectedCategoriesForMonthly.length
    });

    if (!isLoggedIn || user?.role !== 'admin') {
      console.log('❌ [FRONTEND] Yetki kontrolü başarısız', { isLoggedIn, userRole: user?.role });
      return;
    }

    console.log(`📂 [FRONTEND] ${activeTab} tab'ı için data loading başlatılıyor...`);

    switch (activeTab) {
      case 'monthly':
        console.log('📅 [FRONTEND] Monthly profit fonksiyonu çağrılıyor...');
        loadMonthlyProfit();
        break;
      case 'yearly':
        console.log('📊 [FRONTEND] Yearly profit fonksiyonu çağrılıyor...');
        loadYearlyProfit();
        break;
      case 'weekly':
        console.log('📈 [FRONTEND] Weekly profit fonksiyonu çağrılıyor...');
        loadWeeklyProfit();
        break;
      case 'daily':
        console.log('📋 [FRONTEND] Daily profit fonksiyonu çağrılıyor...');
        loadDailyProfit();
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
    loadMonthlyProfit,
    loadYearlyProfit,
    loadWeeklyProfit,
    loadDailyProfit
  ]);

  // Load categories once
  useEffect(() => {
    console.log('🔍 [FRONTEND] useEffect triggered for categories:', { isLoggedIn });
    if (isLoggedIn) {
      console.log('🔍 [FRONTEND] Calling loadCategories...');
      loadCategories();
    }
  }, [isLoggedIn, loadCategories]);

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
                  {Array.from({ length: 2040 - 2024 + 1 }, (_, i) => 2040 - i).map(year => (
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
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>
                      {month}
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
                  onChange={e => {
                    const newYear = Number(e.target.value);
                    setSelectedYearForWeekly(newYear);
                    generateWeeklyOptions(newYear);
                  }} 
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-3 focus:ring-emerald-500/50 transition-all ${
                    theme === 'dark' ? 'bg-slate-700 border-slate-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {Array.from({ length: 2040 - 2024 + 1 }, (_, i) => 2040 - i).map(year => (
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
                    setSelectedWeek(e.target.value);
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
            🏷️ Kategori Filtreleme (Geliştirme Aşamasında)
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
        
        <div className="overflow-x-auto overflow-y-auto max-h-96">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
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
        
        <div className="overflow-x-auto overflow-y-auto max-h-96">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className={`${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}>
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
                  
                  <EnhancedTable 
                    title="Personel Bazında Analiz" 
                    data={monthlyData.breakdown.byPersonnel} 
                    columns={[
                      { key: 'personnel', label: 'Personel' },
                      { key: 'revenue', label: 'Gelir' },
                      { key: 'expense', label: 'Gider' },
                      { key: 'profit', label: 'Kar', isProfit: true }
                    ]}
                    icon="👥"
                  />
                  
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
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <EnhancedTable 
                      title="Kategori Bazında Analiz" 
                      data={yearlyData.breakdown?.byCategory || []} 
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
                      data={yearlyData.breakdown?.byVehicle || []} 
                      columns={[
                        { key: 'vehicle', label: 'Araç' },
                        { key: 'revenue', label: 'Gelir' },
                        { key: 'expense', label: 'Gider' },
                        { key: 'profit', label: 'Kar', isProfit: true }
                      ]}
                      icon="🚗"
                    />
                  </div>
                  
                  <EnhancedTable 
                    title="Personel Bazında Analiz" 
                    data={yearlyData.breakdown?.byPersonnel || []} 
                    columns={[
                      { key: 'personnel', label: 'Personel' },
                      { key: 'revenue', label: 'Gelir' },
                      { key: 'expense', label: 'Gider' },
                      { key: 'profit', label: 'Kar', isProfit: true }
                    ]}
                    icon="👥"
                  />
                  
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
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <EnhancedTable 
                      title="Kategori Bazında Analiz" 
                      data={weeklyData.breakdown?.byCategory || []} 
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
                      data={weeklyData.breakdown?.byVehicle || []} 
                      columns={[
                        { key: 'vehicle', label: 'Araç' },
                        { key: 'revenue', label: 'Gelir' },
                        { key: 'expense', label: 'Gider' },
                        { key: 'profit', label: 'Kar', isProfit: true }
                      ]}
                      icon="🚗"
                    />
                  </div>
                  
                  <EnhancedTable 
                    title="Personel Bazında Analiz" 
                    data={weeklyData.breakdown?.byPersonnel || []} 
                    columns={[
                      { key: 'personnel', label: 'Personel' },
                      { key: 'revenue', label: 'Gelir' },
                      { key: 'expense', label: 'Gider' },
                      { key: 'profit', label: 'Kar', isProfit: true }
                    ]}
                    icon="👥"
                  />
                  
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
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <EnhancedTable 
                      title="Kategori Bazında Analiz" 
                      data={dailyData.breakdown?.byCategory || []} 
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
                      data={dailyData.breakdown?.byVehicle || []} 
                      columns={[
                        { key: 'vehicle', label: 'Araç' },
                        { key: 'revenue', label: 'Gelir' },
                        { key: 'expense', label: 'Gider' },
                        { key: 'profit', label: 'Kar', isProfit: true }
                      ]}
                      icon="🚗"
                    />
                  </div>
                  
                  <EnhancedTable 
                    title="Personel Bazında Analiz" 
                    data={dailyData.breakdown?.byPersonnel || []} 
                    columns={[
                      { key: 'personnel', label: 'Personel' },
                      { key: 'revenue', label: 'Gelir' },
                      { key: 'expense', label: 'Gider' },
                      { key: 'profit', label: 'Kar', isProfit: true }
                    ]}
                    icon="👥"
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