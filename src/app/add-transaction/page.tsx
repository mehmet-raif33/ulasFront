"use client"
import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { selectIsLoggedIn } from '../redux/sliceses/authSlices';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getVehiclesApi, getPersonnelApi, getTransactionCategoriesApi, createTransactionApi, createVehicleApi } from '../api';

// Vehicle interface matching backend schema
interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  created_at: string;
}

// Personnel interface matching backend schema


// Transaction Category interface
interface TransactionCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

const AddTransactionPage: React.FC = () => {
    const theme = useSelector((state: RootState) => state.theme.theme);
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

    const [categories, setCategories] = useState<TransactionCategory[]>([]);
    
    // Form states
    const [isNewVehicle, setIsNewVehicle] = useState(false);
    const [formData, setFormData] = useState({
        vehicle_id: '',
        category_id: '',
        description: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0]
    });
    
    // New vehicle form data
    const [newVehicleData, setNewVehicleData] = useState({
        plate: '',
        brand: '',
        model: '',
        year: '',
        color: ''
    });

    // Giriş yapmamış kullanıcıları landing page'e yönlendir
    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/landing');
        }
    }, [isLoggedIn, router]);

    // Load vehicles, personnel, and categories on component mount
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
                    const [vehiclesResponse, , categoriesResponse] = await Promise.all([
                        getVehiclesApi(token),
                        getPersonnelApi(token),
                        getTransactionCategoriesApi(token)
                    ]);
                    
                    setVehicles(vehiclesResponse.data || []);
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleNewVehicleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewVehicleData({
            ...newVehicleData,
            [e.target.name]: e.target.value
        });
    };

    const handleVehicleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'new') {
            setIsNewVehicle(true);
            setFormData({ ...formData, vehicle_id: '' });
        } else {
            setIsNewVehicle(false);
            setFormData({ ...formData, vehicle_id: value });
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token bulunamadı');
            }

            let vehicleId = formData.vehicle_id;

            // Eğer yeni araç ekleniyorsa, önce araç oluştur
            if (isNewVehicle) {
                // Yeni araç validasyonu
                if (!newVehicleData.plate.trim()) {
                    setError('Plaka alanı zorunludur');
                    return;
                }
                
                if (!newVehicleData.brand.trim()) {
                    setError('Marka alanı zorunludur');
                    return;
                }
                
                if (!newVehicleData.model.trim()) {
                    setError('Model alanı zorunludur');
                    return;
                }
                
                if (!newVehicleData.year || parseInt(newVehicleData.year) < 1900 || parseInt(newVehicleData.year) > new Date().getFullYear() + 1) {
                    setError('Geçerli bir yıl giriniz');
                    return;
                }

                const vehicleData = {
                    plate: newVehicleData.plate.trim().toUpperCase(),
                    brand: newVehicleData.brand.trim(),
                    model: newVehicleData.model.trim(),
                    year: parseInt(newVehicleData.year),
                    color: newVehicleData.color.trim()
                };

                // Yeni araç oluştur
                const vehicleResponse = await createVehicleApi(token, vehicleData);
                vehicleId = vehicleResponse.data.id;
                
                // Yerel state'e yeni aracı ekle
                setVehicles(prev => [...prev, vehicleResponse.data]);
            }

            // İşlem validasyonu
            if (!vehicleId) {
                setError('Araç seçimi zorunludur');
                return;
            }
            
            if (!formData.category_id) {
                setError('İşlem türü seçimi zorunludur');
                return;
            }
            
            if (!formData.description.trim()) {
                setError('Açıklama alanı zorunludur');
                return;
            }
            
            if (!formData.amount || parseFloat(formData.amount) <= 0) {
                setError('Geçerli bir tutar giriniz');
                return;
            }
            
            if (!formData.transaction_date) {
                setError('İşlem tarihi zorunludur');
                return;
            }

            const transactionData = {
                vehicle_id: vehicleId,
                category_id: formData.category_id,
                amount: parseFloat(formData.amount),
                description: formData.description.trim(),
                transaction_date: formData.transaction_date
            };

            await createTransactionApi(token, transactionData);
            
            // Başarı mesajı göster ve işlemler sayfasına yönlendir
            alert('İşlem başarıyla eklendi!');
            router.push('/transactions');
            
        } catch (error: unknown) {
            console.error('Transaction creation error:', error);
            let errorMessage = 'İşlem eklenirken hata oluştu';
            if (error && typeof error === 'object' && 'message' in error) {
                errorMessage = (error as { message?: string }).message || errorMessage;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading && vehicles.length === 0) {
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
                className="max-w-4xl mx-auto"
            >
                {/* Header */}
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Yeni İşlem Ekle
                        </h1>
                        <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            Araç filo yönetim sistemine yeni işlem kaydı ekleyin
                        </p>
                    </div>
                    
                    {/* Geri Dön Butonu */}
                    <motion.button
                        onClick={() => router.push('/transactions')}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            theme === 'dark'
                                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        }`}
                    >
                        <span className="flex items-center">
                            <span className="text-lg mr-2">←</span>
                            İşlemlere Dön
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

                {/* Form */}
                <motion.form
                    onSubmit={handleSubmit}
                    className={`p-8 rounded-2xl shadow-xl backdrop-blur-sm border ${
                        theme === 'dark' 
                            ? 'bg-slate-800/50 border-slate-700' 
                            : 'bg-white/80 border-gray-200'
                    }`}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Vehicle Selection Type */}
                        <div className="md:col-span-2">
                            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Araç Seçimi *
                            </label>
                            <select
                                value={isNewVehicle ? 'new' : formData.vehicle_id}
                                onChange={handleVehicleTypeChange}
                                className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    theme === 'dark' 
                                        ? 'border-slate-600 bg-slate-700 text-white' 
                                        : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                required
                            >
                                <option value="">Araç seçimi yapın</option>
                                <option value="new">➕ Yeni Araç Ekle</option>
                                {vehicles.map((vehicle) => (
                                    <option key={vehicle.id} value={vehicle.id}>
                                        {vehicle.plate} - {vehicle.brand} {vehicle.model} ({vehicle.year})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* New Vehicle Form */}
                        {isNewVehicle && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="md:col-span-2 p-6 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/50"
                            >
                                <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    🚗 Yeni Araç Bilgileri
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Plaka *
                                        </label>
                                        <input
                                            type="text"
                                            name="plate"
                                            value={newVehicleData.plate}
                                            onChange={handleNewVehicleInputChange}
                                            className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                theme === 'dark' 
                                                    ? 'border-slate-600 bg-slate-700 text-white' 
                                                    : 'border-gray-300 bg-white text-gray-900'
                                            }`}
                                            placeholder="34ABC123"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Marka *
                                        </label>
                                        <input
                                            type="text"
                                            name="brand"
                                            value={newVehicleData.brand}
                                            onChange={handleNewVehicleInputChange}
                                            className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                theme === 'dark' 
                                                    ? 'border-slate-600 bg-slate-700 text-white' 
                                                    : 'border-gray-300 bg-white text-gray-900'
                                            }`}
                                            placeholder="Toyota"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Model *
                                        </label>
                                        <input
                                            type="text"
                                            name="model"
                                            value={newVehicleData.model}
                                            onChange={handleNewVehicleInputChange}
                                            className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                theme === 'dark' 
                                                    ? 'border-slate-600 bg-slate-700 text-white' 
                                                    : 'border-gray-300 bg-white text-gray-900'
                                            }`}
                                            placeholder="Corolla"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Yıl *
                                        </label>
                                        <input
                                            type="number"
                                            name="year"
                                            value={newVehicleData.year}
                                            onChange={handleNewVehicleInputChange}
                                            min="1900"
                                            max={new Date().getFullYear() + 1}
                                            className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                theme === 'dark' 
                                                    ? 'border-slate-600 bg-slate-700 text-white' 
                                                    : 'border-gray-300 bg-white text-gray-900'
                                            }`}
                                            placeholder="2020"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Renk
                                        </label>
                                        <input
                                            type="text"
                                            name="color"
                                            value={newVehicleData.color}
                                            onChange={handleNewVehicleInputChange}
                                            className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                theme === 'dark' 
                                                    ? 'border-slate-600 bg-slate-700 text-white' 
                                                    : 'border-gray-300 bg-white text-gray-900'
                                            }`}
                                            placeholder="Beyaz"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Category Selection */}
                        <div className="md:col-span-2">
                            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                İşlem Türü Seçimi *
                            </label>
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleInputChange}
                                className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    theme === 'dark' 
                                        ? 'border-slate-600 bg-slate-700 text-white' 
                                        : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                required
                            >
                                <option value="">İşlem türü seçiniz</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Tutar (₺) *
                            </label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                                className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    theme === 'dark' 
                                        ? 'border-slate-600 bg-slate-700 text-white' 
                                        : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        {/* Transaction Date */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                İşlem Tarihi *
                            </label>
                            <input
                                type="date"
                                name="transaction_date"
                                value={formData.transaction_date}
                                onChange={handleInputChange}
                                className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    theme === 'dark' 
                                        ? 'border-slate-600 bg-slate-700 text-white' 
                                        : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Açıklama *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    theme === 'dark' 
                                        ? 'border-slate-600 bg-slate-700 text-white' 
                                        : 'border-gray-300 bg-white text-gray-900'
                                }`}
                                placeholder="İşlem detaylarını açıklayın..."
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                                loading
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:shadow-lg'
                            } ${
                                theme === 'dark'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {isNewVehicle ? 'Araç ve İşlem Ekleniyor...' : 'Ekleniyor...'}
                                </div>
                            ) : (
                                isNewVehicle ? 'Araç ve İşlem Ekle' : 'İşlem Ekle'
                            )}
                        </button>
                    </div>
                </motion.form>
            </motion.div>
        </div>
    );
};

export default AddTransactionPage;