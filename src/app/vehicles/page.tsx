"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '../redux/store';
import { selectIsLoggedIn } from '../redux/sliceses/authSlices';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getVehiclesApi, createVehicleApi } from '../api';
import { useToast } from '../AppLayoutClient';

// Vehicle interface matching backend schema
interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  customer_email?: string;
  customer_phone?: string;
  created_at: string;
}

const VehiclesPage: React.FC = () => {
    const theme = useSelector((state: RootState) => state.theme.theme);
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const router = useRouter();
    const { showToast } = useToast();
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });
    const [hasMore, setHasMore] = useState(true);
    const [formData, setFormData] = useState({
        plate: '',
        brand: '',
        model: '',
        year: '',
        color: '',
        customer_email: '',
        customer_phone: ''
    });

    // Load vehicles function
    const loadVehicles = useCallback(async (page: number = 1, reset: boolean = false) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Token bulunamadı');
                return;
            }
            
            setLoading(true);
            const response = await getVehiclesApi(token, {
                page,
                limit: pagination.limit,
                search: searchTerm
            });
            
            if (reset) {
                setVehicles(response.data || []);
            } else {
                setVehicles(prev => [...prev, ...(response.data || [])]);
            }
            
            setPagination(response.pagination);
            setHasMore(page < response.pagination.totalPages);
        } catch (error: unknown) {
            console.error('Error loading vehicles:', error);
            setError('Araçlar yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, pagination.limit]);

    // Giriş yapmamış kullanıcıları landing page'e yönlendir
    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/landing');
        }
    }, [isLoggedIn, router]);

    useEffect(() => {
        if (isLoggedIn) {
            loadVehicles(1, true);
        }
    }, [isLoggedIn, loadVehicles]);

    // Load more vehicles (infinite scroll)
    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            loadVehicles(pagination.page + 1, false);
        }
    }, [loading, hasMore, pagination.page, loadVehicles]);

    // Search effect
    useEffect(() => {
        if (isLoggedIn) {
            loadVehicles(1, true);
        }
    }, [searchTerm, isLoggedIn, loadVehicles]);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        const sentinel = document.getElementById('scroll-sentinel');
        if (sentinel) {
            observer.observe(sentinel);
        }

        return () => {
            if (sentinel) {
                observer.unobserve(sentinel);
            }
        };
    }, [hasMore, loading, loadMore]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
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
            // Form validasyonu
            if (!formData.plate.trim()) {
                setError('Plaka alanı zorunludur');
                showToast('Plaka alanı zorunludur', 'error');
                return;
            }
            
            if (!formData.brand.trim()) {
                setError('Marka alanı zorunludur');
                showToast('Marka alanı zorunludur', 'error');
                return;
            }
            
            if (!formData.model.trim()) {
                setError('Model alanı zorunludur');
                showToast('Model alanı zorunludur', 'error');
                return;
            }
            
            if (!formData.year || parseInt(formData.year) < 1900 || parseInt(formData.year) > new Date().getFullYear() + 1) {
                setError('Geçerli bir yıl giriniz');
                showToast('Geçerli bir yıl giriniz', 'error');
                return;
            }

            const vehicleData = {
                plate: formData.plate.trim().toUpperCase(),
                brand: formData.brand.trim(),
                model: formData.model.trim(),
                year: parseInt(formData.year),
                color: formData.color.trim(),
                customer_email: formData.customer_email.trim(),
                customer_phone: formData.customer_phone.trim()
            };


            
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token bulunamadı');
            }

            const response = await createVehicleApi(token, vehicleData);
            
            // Add to local state
            setVehicles(prev => [...prev, response.data]);
            

            showToast('Araç başarıyla eklendi!', 'success');
            setShowAddForm(false);
            setError(null);
            setLoading(false);
            
            setFormData({
                plate: '',
                brand: '',
                model: '',
                year: '',
                color: '',
                customer_email: '',
                customer_phone: ''
            });
        } catch (error: unknown) {
            console.error('Error creating vehicle:', error);
            let message = 'Araç eklenirken hata oluştu';
            if (error && typeof error === 'object' && 'message' in error) {
                message += `: ${(error as { message?: string }).message}`;
            }
            setError(message);
            showToast(message, 'error');
            setLoading(false);
        }
    };

    // No need for client-side filtering since we're using backend search

    return (
        <div className={`flex-1 bg-gradient-to-br min-h-screen p-6 ${theme === 'dark' ? 'from-slate-900 to-blue-950' : 'from-slate-50 to-blue-50'}`}>
            {/* Header */}
            <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Araç Yönetimi</h1>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Filo araçlarınızı yönetin ve takip edin</p>
            </motion.div>

            {/* Error Message */}
            {error && (
                <motion.div 
                    className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {error}
                </motion.div>
            )}

            {/* Search and Add Button */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Araç ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full px-4 py-2 pl-10 pr-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    theme === 'dark' 
                                        ? 'bg-slate-700 border-slate-600 text-gray-100' 
                                        : 'bg-white border-gray-300 text-gray-800'
                                }`}
                            />
                            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        {searchTerm && (
                            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {pagination.total} araç bulundu
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
                    >
                        + Araç Ekle
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {loading && vehicles.length === 0 && (
                <motion.div 
                    className="flex items-center justify-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </motion.div>
            )}

            {/* Add Vehicle Modal */}
            {showAddForm && (
                <motion.div 
                    className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div 
                        className={`w-full max-w-md rounded-xl shadow-lg p-6 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Yeni Araç Ekle</h2>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Plaka *</label>
                                <input
                                    type="text"
                                    name="plate"
                                    value={formData.plate}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        theme === 'dark' 
                                            ? 'bg-slate-700 border-slate-600 text-gray-100' 
                                            : 'bg-white border-gray-300 text-gray-800'
                                    }`}
                                    placeholder="34ABC123"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Marka *</label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        theme === 'dark' 
                                            ? 'bg-slate-700 border-slate-600 text-gray-100' 
                                            : 'bg-white border-gray-300 text-gray-800'
                                    }`}
                                    placeholder="Toyota"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Model *</label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        theme === 'dark' 
                                            ? 'bg-slate-700 border-slate-600 text-gray-100' 
                                            : 'bg-white border-gray-300 text-gray-800'
                                    }`}
                                    placeholder="Corolla"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Yıl *</label>
                                <input
                                    type="number"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        theme === 'dark' 
                                            ? 'bg-slate-700 border-slate-600 text-gray-100' 
                                            : 'bg-white border-gray-300 text-gray-800'
                                    }`}
                                    placeholder="2020"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Renk</label>
                                <input
                                    type="text"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        theme === 'dark' 
                                            ? 'bg-slate-700 border-slate-600 text-gray-100' 
                                            : 'bg-white border-gray-300 text-gray-800'
                                    }`}
                                    placeholder="Beyaz"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Müşteri E-posta</label>
                                <input
                                    type="email"
                                    name="customer_email"
                                    value={formData.customer_email}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        theme === 'dark' 
                                            ? 'bg-slate-700 border-slate-600 text-gray-100' 
                                            : 'bg-white border-gray-300 text-gray-800'
                                    }`}
                                    placeholder="musteri@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Müşteri Telefon</label>
                                <input
                                    type="tel"
                                    name="customer_phone"
                                    value={formData.customer_phone}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        theme === 'dark' 
                                            ? 'bg-slate-700 border-slate-600 text-gray-100' 
                                            : 'bg-white border-gray-300 text-gray-800'
                                    }`}
                                    placeholder="+90 555 123 45 67"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Ekleniyor...' : 'Ekle'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}

            {/* Vehicles Grid */}
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                {vehicles.map((vehicle, index) => (
                    <motion.div
                        key={vehicle.id}
                        className={`rounded-xl shadow-sm border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                        whileHover={{ y: -2 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-blue-500 text-white`}>
                                    🚗
                                </div>
                                <div>
                                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                                        {vehicle.plate}
                                    </h3>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {vehicle.brand} {vehicle.model}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className={`flex justify-between text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                <span>Yıl:</span>
                                <span>{vehicle.year}</span>
                            </div>
                            <div className={`flex justify-between text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                <span>Renk:</span>
                                <span>{vehicle.color || 'Belirtilmemiş'}</span>
                            </div>
                            {vehicle.customer_email && (
                                <div className={`flex justify-between text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <span>E-posta:</span>
                                    <span className="truncate max-w-32">{vehicle.customer_email}</span>
                                </div>
                            )}
                            {vehicle.customer_phone && (
                                <div className={`flex justify-between text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    <span>Telefon:</span>
                                    <span>{vehicle.customer_phone}</span>
                                </div>
                            )}
                            <div className={`flex justify-between text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                <span>Eklenme:</span>
                                <span>{vehicle.created_at ? new Date(vehicle.created_at).toLocaleDateString('tr-TR') : 'Tarih yok'}</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <Link 
                                href={`/vehicles/${vehicle.plate}`}
                                className={`block text-center py-2 px-4 rounded-lg transition-colors ${
                                    theme === 'dark' 
                                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                            >
                                Detayları Gör
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Empty State */}
            {vehicles.length === 0 && !loading && (
                <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="text-6xl mb-4">🚗</div>
                    <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                        {searchTerm ? 'Araç Bulunamadı' : 'Henüz Araç Yok'}
                    </h3>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        {searchTerm 
                            ? `"${searchTerm}" araması için sonuç bulunamadı.`
                            : 'İlk aracınızı eklemek için "Araç Ekle" butonuna tıklayın.'
                        }
                    </p>
                </motion.div>
            )}

            {/* Infinite Scroll Sentinel */}
            {hasMore && (
                <div id="scroll-sentinel" className="py-4 text-center">
                    {loading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    ) : (
                        <button
                            onClick={loadMore}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                theme === 'dark' 
                                    ? 'bg-slate-700 text-gray-200 hover:bg-slate-600' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Daha Fazla Yükle
                        </button>
                    )}
                </div>
            )}

            {/* Loading More Indicator */}
            {loading && vehicles.length > 0 && (
                <div className="py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Daha fazla araç yükleniyor...
                    </p>
                </div>
            )}
        </div>
    );
};

export default VehiclesPage;