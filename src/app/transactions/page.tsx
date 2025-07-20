"use client"
import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { selectIsLoggedIn } from '../redux/sliceses/authSlices';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getTransactionsApi, getVehiclesApi, getTransactionCategoriesApi } from '../api';

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

// Vehicle interface


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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const [categories, setCategories] = useState<TransactionCategory[]>([]);
    
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
                    
                    // Load all data in parallel
                    const [transactionsResponse, , categoriesResponse] = await Promise.all([
                        getTransactionsApi(token),
                        getVehiclesApi(token),
                        getTransactionCategoriesApi(token)
                    ]);
                    
                    setTransactions(transactionsResponse.transactions || []);
                    setCategories(categoriesResponse.data || []);
                    
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
    }, [isLoggedIn]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

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
    };

    // Filter transactions based on current filters
    const filteredTransactions = transactions.filter(transaction => {
        // Vehicle plate filter
        if (filters.vehicle_plate && transaction.vehicle_plate) {
            if (!transaction.vehicle_plate.toLowerCase().includes(filters.vehicle_plate.toLowerCase())) {
                return false;
            }
        }

        // Category filter
        if (filters.category_id && transaction.category_id !== filters.category_id) {
            return false;
        }

        // Status filter
        if (filters.status && transaction.status !== filters.status) {
            return false;
        }

        // Date range filter
        if (filters.date_from) {
            const transactionDate = new Date(transaction.transaction_date);
            const fromDate = new Date(filters.date_from);
            if (transactionDate < fromDate) {
                return false;
            }
        }

        if (filters.date_to) {
            const transactionDate = new Date(transaction.transaction_date);
            const toDate = new Date(filters.date_to);
            toDate.setHours(23, 59, 59); // End of day
            if (transactionDate > toDate) {
                return false;
            }
        }

        // Amount range filter
        if (filters.min_amount && parseFloat(transaction.amount) < parseFloat(filters.min_amount)) {
            return false;
        }

        if (filters.max_amount && parseFloat(transaction.amount) > parseFloat(filters.max_amount)) {
            return false;
        }

        return true;
    });

    // Calculate totals for filtered transactions
    const totalAmount = filteredTransactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
    const averageAmount = filteredTransactions.length > 0 ? totalAmount / filteredTransactions.length : 0;

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
                                    {filteredTransactions.length}
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Vehicle Plate Filter */}
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
                                Minimum Tutar (₺)
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
                                Maksimum Tutar (₺)
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

                    {/* Clear Filters Button */}
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={clearFilters}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
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

                {/* Transactions Table */}
                {!loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                        className={`rounded-xl shadow-lg border overflow-hidden ${
                            theme === 'dark' 
                                ? 'bg-slate-800/50 border-slate-700' 
                                : 'bg-white/80 border-gray-200'
                        }`}
                    >
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
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    transaction.status === 'pending' 
                                                        ? theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'
                                                        : transaction.status === 'in_progress'
                                                        ? theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                                                        : transaction.status === 'completed'
                                                        ? theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                                                        : transaction.status === 'cancelled'
                                                        ? theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                                                        : theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {transaction.status === 'pending' ? 'Beklemede' : 
                                                     transaction.status === 'in_progress' ? 'Devam Ediyor' : 
                                                     transaction.status === 'completed' ? 'Tamamlandı' : 
                                                     transaction.status === 'cancelled' ? 'İptal Edildi' : 
                                                     'Bilinmiyor'}
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