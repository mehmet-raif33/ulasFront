"use client"
import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { selectIsLoggedIn } from '../redux/sliceses/authSlices';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { getTransactionsApi, getVehiclesApi, getTransactionCategoriesApi, getTransactionsSummaryStatsApi } from '../api';

// Transaction interface matching backend schema
interface Transaction {
  id: string;
  personnel_id: string;
  vehicle_id: string;
  description: string;
  amount: string; // Backend'den decimal olarak geldiği için string
  transaction_date: string;
  category_id: string;
  created_at: string;
  status?: string;
  status_notes?: string;
  status_changed_at?: string;
  status_changed_by?: string;
  // Joined data
  vehicle_plate?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  personnel_name?: string;
  category_name?: string;
  status_changed_by_name?: string;
}

// Transaction Category interface
interface TransactionCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

const TransactionsPage: React.FC = () => {
    const theme = useSelector((state: RootState) => state.theme.theme);
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<TransactionCategory[]>([]);
    
    // Stats states
    const [stats, setStats] = useState({
        total_transactions: 0,
        total_amount: 0,
        average_amount: 0,
        min_amount: 0,
        max_amount: 0
    });
    
    // Pagination states
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50, // Daha fazla işlem göster
        total: 0,
        totalPages: 0
    });
    
    // Filter states
    const [filters, setFilters] = useState({
        vehicle_plate: '',
        category_id: '',
        status: '',
        date_from: '',
        date_to: '',
        min_amount: '',
        max_amount: ''
    });

    // Giriş yapmamış kullanıcıları landing page'e yönlendir
    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/landing');
        }
    }, [isLoggedIn, router]);

    // URL parametrelerinden kategori ID'sini al ve filtreyi ayarla
    useEffect(() => {
        const categoryId = searchParams.get('category_id');
        if (categoryId) {
            setFilters(prev => ({
                ...prev,
                category_id: categoryId
            }));
        }
    }, [searchParams]);

    // İstatistikleri yükle
    const loadStats = async (token: string) => {
        try {
            const statsParams: Record<string, string> = {};
            
            // Filtreleri istatistik parametrelerine ekle
            if (filters.category_id) statsParams.category_id = filters.category_id;
            if (filters.date_from) statsParams.start_date = filters.date_from;
            if (filters.date_to) statsParams.end_date = filters.date_to;
            
            const statsResponse = await getTransactionsSummaryStatsApi(token, statsParams);
            setStats(statsResponse);
        } catch (error: unknown) {
            console.error('Error loading stats:', error);
            // İstatistik hatası kritik değil, sadece log'la
        }
    };

    // Load data on component mount
    useEffect(() => {
        if (isLoggedIn) {
            const loadData = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        setError('Token bulunamadı');
                        return;
                    }
                    
                    setLoading(true);
                    setError(null);
                    
                    // API çağrısına filtreleri ekle
                    const apiParams: Record<string, string | number> = { 
                        page: pagination.page, 
                        limit: pagination.limit 
                    };
                    
                    // Filtreleri API parametrelerine ekle
                    if (filters.category_id) apiParams.category_id = filters.category_id;
                    if (filters.date_from) apiParams.start_date = filters.date_from;
                    if (filters.date_to) apiParams.end_date = filters.date_to;
                    
                    // Load all data in parallel
                    const [transactionsResponse, , categoriesResponse] = await Promise.all([
                        getTransactionsApi(token, apiParams),
                        getVehiclesApi(token),
                        getTransactionCategoriesApi(token)
                    ]);
                    

                    
                    setTransactions(transactionsResponse.transactions || []);
                    setCategories(categoriesResponse.data || []);
                    
                    // Update pagination info
                    if (transactionsResponse.pagination) {
                        setPagination(prev => ({
                            ...prev,
                            total: transactionsResponse.pagination.total,
                            totalPages: transactionsResponse.pagination.totalPages
                        }));
                    }
                    
                    // İstatistikleri yükle
                    await loadStats(token);
                    
                } catch (error: unknown) {
                    console.error('Error loading data:', error);
                    let errorMessage = 'Veriler yüklenirken hata oluştu';
                    if (error && typeof error === 'object' && 'message' in error) {
                        errorMessage += `: ${(error as { message?: string }).message}`;
                    }
                    setError(errorMessage);
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        }
    }, [isLoggedIn, filters.category_id, filters.date_from, filters.date_to, loadStats, pagination.limit, pagination.page]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    // Filtreler değiştiğinde sayfa 1'e dön ve yeni verileri yükle
    useEffect(() => {
        if (isLoggedIn) {
            const loadFilteredData = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        setError('Token bulunamadı');
                        return;
                    }
                    
                    setLoading(true);
                    setError(null);
                    
                    // Reset to page 1 when filters change
                    setPagination(prev => ({ ...prev, page: 1 }));
                    
                    // API çağrısına filtreleri ekle
                    const apiParams: Record<string, string | number> = { 
                        page: 1, 
                        limit: pagination.limit 
                    };
                    
                    // Filtreleri API parametrelerine ekle
                    if (filters.category_id) apiParams.category_id = filters.category_id;
                    if (filters.date_from) apiParams.start_date = filters.date_from;
                    if (filters.date_to) apiParams.end_date = filters.date_to;
                    
                    const transactionsResponse = await getTransactionsApi(token, apiParams);
                    

                    
                    setTransactions(transactionsResponse.transactions || []);
                    
                    if (transactionsResponse.pagination) {
                        setPagination(prev => ({
                            ...prev,
                            page: 1,
                            total: transactionsResponse.pagination.total,
                            totalPages: transactionsResponse.pagination.totalPages
                        }));
                    }
                    
                    // İstatistikleri güncelle
                    await loadStats(token);
                    
                } catch (error: unknown) {
                    console.error('Error loading filtered data:', error);
                    let errorMessage = 'Filtrelenmiş veriler yüklenirken hata oluştu';
                    if (error && typeof error === 'object' && 'message' in error) {
                        errorMessage += `: ${(error as { message?: string }).message}`;
                    }
                    setError(errorMessage);
                } finally {
                    setLoading(false);
                }
            };
            
            // Debounce filter changes
            const timeoutId = setTimeout(loadFilteredData, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [filters, isLoggedIn, pagination.limit, loadStats]);

    const clearFilters = () => {
        setFilters({
            vehicle_plate: '',
            category_id: '',
            status: '',
            date_from: '',
            date_to: '',
            min_amount: '',
            max_amount: ''
        });
        // Reset pagination to page 1 when clearing filters
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Sayfa değiştirme fonksiyonu
    const handlePageChange = async (newPage: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Token bulunamadı');
                return;
            }
            
            setLoading(true);
            setError(null);
            
            // API çağrısına filtreleri ekle
            const apiParams: Record<string, string | number> = { 
                page: newPage, 
                limit: pagination.limit 
            };
            
            // Filtreleri API parametrelerine ekle
            if (filters.category_id) apiParams.category_id = filters.category_id;
            if (filters.date_from) apiParams.start_date = filters.date_from;
            if (filters.date_to) apiParams.end_date = filters.date_to;
            
            const transactionsResponse = await getTransactionsApi(token, apiParams);
            
            setTransactions(transactionsResponse.transactions || []);
            setPagination(prev => ({
                ...prev,
                page: newPage,
                total: transactionsResponse.pagination?.total || prev.total,
                totalPages: transactionsResponse.pagination?.totalPages || prev.totalPages
            }));
            
        } catch (error: unknown) {
            console.error('Error loading page:', error);
            let errorMessage = 'Sayfa yüklenirken hata oluştu';
            if (error && typeof error === 'object' && 'message' in error) {
                errorMessage += `: ${(error as { message?: string }).message}`;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Backend zaten filtreleme yaptığı için client-side filtreleme yapmıyoruz
    // Sadece backend'de olmayan filtreler için client-side filtreleme yapıyoruz
    const filteredTransactions = transactions.filter(transaction => {
        // Vehicle plate filter (backend'de olmayan filtre)
        if (filters.vehicle_plate && transaction.vehicle_plate) {
            if (!transaction.vehicle_plate.toLowerCase().includes(filters.vehicle_plate.toLowerCase())) {
                return false;
            }
        }
        
        // Status filter (backend'de olmayan filtre)
        if (filters.status && transaction.status !== filters.status) {
            return false;
        }
        
        // Amount range filter (backend'de olmayan filtre)
        if (filters.min_amount && parseFloat(transaction.amount) < parseFloat(filters.min_amount)) {
            return false;
        }

        if (filters.max_amount && parseFloat(transaction.amount) > parseFloat(filters.max_amount)) {
            return false;
        }
        
        return true;
    });

    // Backend'den gelen istatistikleri kullan
    const totalAmount = stats.total_amount;
    const averageAmount = stats.average_amount;

    // Get status color and text
    const getStatusInfo = (status: string | undefined) => {
        switch (status) {
            case 'pending':
                return {
                    text: 'Beklemede',
                    color: theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'
                };
            case 'in_progress':
                return {
                    text: 'Devam Ediyor',
                    color: theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                };
            case 'completed':
                return {
                    text: 'Tamamlandı',
                    color: theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                };
            case 'cancelled':
                return {
                    text: 'İptal Edildi',
                    color: theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                };
            default:
                return {
                    text: 'Bilinmiyor',
                    color: theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'
                };
        }
    };

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
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto"
            >
                {/* Header */}
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            İşlem Listesi
                        </h1>
                        <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            Tüm işlemleri görüntüleyin ve filtreleyin
                        </p>
                    </div>
                    
                    {/* İşlem Ekle Butonu */}
                    <motion.button
                        onClick={() => router.push('/add-transaction')}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-white transition-all duration-200 shadow-lg text-sm sm:text-base ${
                            theme === 'dark'
                                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                        }`}
                    >
                        <span className="flex items-center">
                            <span className="text-lg sm:text-xl mr-1 sm:mr-2">➕</span>
                            <span className="hidden sm:inline">İşlem Ekle</span>
                            <span className="sm:hidden">Ekle</span>
                        </span>
                    </motion.button>
                </div>

                {/* Error Display */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`mb-6 p-4 rounded-lg border ${
                            theme === 'dark' 
                                ? 'bg-red-900/20 border-red-800 text-red-200' 
                                : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    </motion.div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className={`p-6 rounded-xl shadow-lg border ${
                            theme === 'dark' 
                                ? 'bg-slate-800/50 border-slate-700' 
                                : 'bg-white/80 border-gray-200'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Toplam İşlem
                                </p>
                                                                 <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                     {stats.total_transactions}
                                 </p>
                            </div>
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-blue-500 text-white">
                                📊
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className={`p-6 rounded-xl shadow-lg border ${
                            theme === 'dark' 
                                ? 'bg-slate-800/50 border-slate-700' 
                                : 'bg-white/80 border-gray-200'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Toplam Tutar
                                </p>
                                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    ₺{totalAmount.toLocaleString('tr-TR')}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-green-500 text-white">
                                💰
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className={`p-6 rounded-xl shadow-lg border ${
                            theme === 'dark' 
                                ? 'bg-slate-800/50 border-slate-700' 
                                : 'bg-white/80 border-gray-200'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Ortalama Tutar
                                </p>
                                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    ₺{averageAmount.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-purple-500 text-white">
                                📈
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className={`p-6 rounded-xl shadow-lg border mb-8 ${
                        theme === 'dark' 
                            ? 'bg-slate-800/50 border-slate-700' 
                            : 'bg-white/80 border-gray-200'
                    }`}
                >
                    <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Filtreler
                    </h2>
                    
                    <div className="space-y-4">
                        {/* Vehicle Plate Filter - Full Width */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Araç Plakası
                            </label>
                            <input
                                type="text"
                                name="vehicle_plate"
                                value={filters.vehicle_plate}
                                onChange={handleFilterChange}
                                className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    theme === 'dark' 
                                        ? 'border-slate-600 bg-slate-700 text-white' 
                                        : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                placeholder="Plaka ara..."
                            />
                        </div>

                        {/* Two Column Grid for Other Filters */}
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Category Filter */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    İşlem Türü
                                </label>
                                <select
                                    name="category_id"
                                    value={filters.category_id}
                                    onChange={handleFilterChange}
                                    className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        theme === 'dark' 
                                            ? 'border-slate-600 bg-slate-700 text-white' 
                                            : 'border-gray-300 bg-white text-gray-900'
                                    }`}
                                >
                                    <option value="">Tüm İşlem Türleri</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Durum
                                </label>
                                <select
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                    className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        theme === 'dark' 
                                            ? 'border-slate-600 bg-slate-700 text-white' 
                                            : 'border-gray-300 bg-white text-gray-900'
                                    }`}
                                >
                                    <option value="">Tüm Durumlar</option>
                                    <option value="pending">Beklemede</option>
                                    <option value="in_progress">Devam Ediyor</option>
                                    <option value="completed">Tamamlandı</option>
                                    <option value="cancelled">İptal Edildi</option>
                                </select>
                            </div>

                            {/* Date From Filter */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Başlangıç Tarihi
                                </label>
                                <input
                                    type="date"
                                    name="date_from"
                                    value={filters.date_from}
                                    onChange={handleFilterChange}
                                    className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        theme === 'dark' 
                                            ? 'border-slate-600 bg-slate-700 text-white' 
                                            : 'border-gray-300 bg-white text-gray-900'
                                    }`}
                                />
                            </div>

                            {/* Date To Filter */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Bitiş Tarihi
                                </label>
                                <input
                                    type="date"
                                    name="date_to"
                                    value={filters.date_to}
                                    onChange={handleFilterChange}
                                    className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        theme === 'dark' 
                                            ? 'border-slate-600 bg-slate-700 text-white' 
                                            : 'border-gray-300 bg-white text-gray-900'
                                    }`}
                                />
                            </div>

                            {/* Min Amount Filter */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Min Tutar (₺)
                                </label>
                                <input
                                    type="number"
                                    name="min_amount"
                                    value={filters.min_amount}
                                    onChange={handleFilterChange}
                                    min="0"
                                    step="0.01"
                                    className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        theme === 'dark' 
                                            ? 'border-slate-600 bg-slate-700 text-white' 
                                            : 'border-gray-300 bg-white text-gray-900'
                                    }`}
                                    placeholder="0"
                                />
                            </div>

                            {/* Max Amount Filter */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Max Tutar (₺)
                                </label>
                                <input
                                    type="number"
                                    name="max_amount"
                                    value={filters.max_amount}
                                    onChange={handleFilterChange}
                                    min="0"
                                    step="0.01"
                                    className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        theme === 'dark' 
                                            ? 'border-slate-600 bg-slate-700 text-white' 
                                            : 'border-gray-300 bg-white text-gray-900'
                                    }`}
                                    placeholder="∞"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="mt-4">
                        <button
                            onClick={clearFilters}
                            className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                theme === 'dark'
                                    ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                            }`}
                        >
                            Filtreleri Temizle
                        </button>
                    </div>
                </motion.div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Transactions Display */}
                {!loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                    >
                        {/* Desktop Table View */}
                        <div className="hidden lg:block">
                            <div className={`rounded-xl shadow-lg border overflow-hidden ${
                                theme === 'dark' 
                                    ? 'bg-slate-800/50 border-slate-700' 
                                    : 'bg-white/80 border-gray-200'
                            }`}>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
                                            <tr>
                                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    Tarih
                                                </th>
                                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    Araç
                                                </th>
                                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    İşlem Türü
                                                </th>
                                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    Açıklama
                                                </th>
                                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    Durum
                                                </th>
                                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    Tutar
                                                </th>
                                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    Personel
                                                </th>
                                                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    İşlemler
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-700' : 'divide-gray-200'}`}>
                                            {filteredTransactions.map((transaction, index) => (
                                                <motion.tr
                                                    key={transaction.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                                    className={`${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-50'} transition-colors duration-200`}
                                                >
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                                        {new Date(transaction.transaction_date).toLocaleDateString('tr-TR')}
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                                        <div>
                                                            <div className="font-medium">{transaction.vehicle_plate || 'N/A'}</div>
                                                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                {transaction.vehicle_brand} {transaction.vehicle_model}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            theme === 'dark' 
                                                                ? 'bg-blue-900 text-blue-200' 
                                                                : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {transaction.category_name || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                                        <div className="max-w-xs truncate" title={transaction.description}>
                                                            {transaction.description || 'Açıklama yok'}
                                                        </div>
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusInfo(transaction.status).color}`}>
                                                            {getStatusInfo(transaction.status).text}
                                                        </span>
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                                        parseFloat(transaction.amount) >= 0 
                                                            ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                                                            : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                                                    }`}>
                                                        ₺{parseFloat(transaction.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                                        {transaction.personnel_name || 'N/A'}
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => router.push(`/transactions/${transaction.id}/edit`)}
                                                                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                                                                    theme === 'dark'
                                                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                                                }`}
                                                            >
                                                                Düzenle
                                                            </button>
                                                            <button
                                                                onClick={() => router.push(`/transactions/${transaction.id}`)}
                                                                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                                                                    theme === 'dark'
                                                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                                                }`}
                                                            >
                                                                Detay
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-3">
                            {filteredTransactions.map((transaction, index) => (
                                <motion.div
                                    key={transaction.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className={`p-3 rounded-lg shadow-md border ${
                                        theme === 'dark' 
                                            ? 'bg-slate-800/50 border-slate-700' 
                                            : 'bg-white/80 border-gray-200'
                                    }`}
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                {transaction.vehicle_plate || 'N/A'}
                                            </h3>
                                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {transaction.vehicle_brand} {transaction.vehicle_model}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-base font-bold ${
                                                parseFloat(transaction.amount) >= 0 
                                                    ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                                                    : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                                            }`}>
                                                ₺{parseFloat(transaction.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                            <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full mt-1 ${getStatusInfo(transaction.status).color}`}>
                                                {getStatusInfo(transaction.status).text}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-1 mb-3">
                                        <div className="flex justify-between">
                                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Tarih:</span>
                                            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                                {new Date(transaction.transaction_date).toLocaleDateString('tr-TR')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Tür:</span>
                                            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                                {transaction.category_name || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Personel:</span>
                                            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                                {transaction.personnel_name || 'N/A'}
                                            </span>
                                        </div>
                                        {transaction.description && (
                                            <div>
                                                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Açıklama:</span>
                                                <p className={`text-xs mt-0.5 line-clamp-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                                    {transaction.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => router.push(`/transactions/${transaction.id}/edit`)}
                                            className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 ${
                                                theme === 'dark'
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                            }`}
                                        >
                                            Düzenle
                                        </button>
                                        <button
                                            onClick={() => router.push(`/transactions/${transaction.id}`)}
                                            className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 ${
                                                theme === 'dark'
                                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                            }`}
                                        >
                                            Detay
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2 mt-6 mb-4">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                        pagination.page <= 1
                                            ? theme === 'dark' 
                                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : theme === 'dark'
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    }`}
                                >
                                    Önceki
                                </button>
                                
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Sayfa {pagination.page} / {pagination.totalPages}
                                </span>
                                
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                        pagination.page >= pagination.totalPages
                                            ? theme === 'dark' 
                                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : theme === 'dark'
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    }`}
                                >
                                    Sonraki
                                </button>
                            </div>
                        )}

                        {/* Total Count */}
                        {pagination.total > 0 && (
                            <div className="text-center mb-4">
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Toplam {pagination.total} işlem bulundu
                                </p>
                            </div>
                        )}

                        {/* Empty State */}
                        {filteredTransactions.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📋</div>
                                <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                                    İşlem Bulunamadı
                                </h3>
                                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                    {Object.values(filters).some(filter => filter !== '') 
                                        ? 'Seçilen filtrelere uygun işlem bulunamadı.'
                                        : 'Henüz işlem eklenmemiş.'
                                    }
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default TransactionsPage;