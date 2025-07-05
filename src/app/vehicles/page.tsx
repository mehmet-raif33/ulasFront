"use client"
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { vehicleUtils } from '../lib/supabase-utils';
import type { Vehicle } from '../lib/supabase-utils';

const VehiclesPage: React.FC = () => {
    const theme = useSelector((state: RootState) => state.theme.theme);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [formData, setFormData] = useState({
        plate: '',
        brand: '',
        model: '',
        year: '',
        fuel_type: 'dizel',
        status: 'active'
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Load vehicles on component mount
    useEffect(() => {
        const loadVehicles = async () => {
            try {
                const vehiclesData = await vehicleUtils.getAllVehicles();
                setVehicles(vehiclesData || []);
            } catch (error: unknown) {
                console.error('Error loading vehicles:', error);
                setError('Araçlar yüklenirken hata oluştu');
            }
        };
        loadVehicles();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted, starting...');
        setLoading(true);
        setError(null);

        try {
            // Form validasyonu
            if (!formData.plate.trim()) {
                setError('Plaka alanı zorunludur');
                return;
            }
            
            if (!formData.brand.trim()) {
                setError('Marka alanı zorunludur');
                return;
            }
            
            if (!formData.model.trim()) {
                setError('Model alanı zorunludur');
                return;
            }
            
            if (!formData.year || parseInt(formData.year) < 1900 || parseInt(formData.year) > new Date().getFullYear() + 1) {
                setError('Geçerli bir yıl giriniz');
                return;
            }

            const vehicleData = {
                plate: formData.plate.trim().toUpperCase(),
                brand: formData.brand.trim(),
                model: formData.model.trim(),
                year: parseInt(formData.year),
                fuel_type: formData.fuel_type,
                status: formData.status as 'active' | 'inactive' | 'maintenance'
            };

            console.log('Sending vehicle data:', vehicleData);
            const result = await vehicleUtils.createVehicle(vehicleData);
            console.log('Vehicle created successfully:', result);
            alert('Araç başarıyla eklendi!');
            setShowAddForm(false);
            setError(null);
            setLoading(false);
            
            // Reload vehicles
            const vehiclesData = await vehicleUtils.getAllVehicles();
            setVehicles(vehiclesData || []);
            
            setFormData({
                plate: '',
                brand: '',
                model: '',
                year: '',
                fuel_type: 'dizel',
                status: 'active'
            });
        } catch (error: unknown) {
            console.error('Error creating vehicle:', error);
            let message = 'Araç eklenirken hata oluştu';
            if (error && typeof error === 'object' && 'message' in error) {
                message += `: ${(error as { message?: string }).message}`;
            }
            setError(message);
            setLoading(false);
        } finally {
            console.log('Form submission completed');
        }
    };

    const filteredVehicles = vehicles.filter(vehicle =>
        vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        if (theme === 'dark') {
          if (status === 'active') return 'bg-green-900 text-green-200';
          if (status === 'maintenance') return 'bg-yellow-900 text-yellow-200';
          if (status === 'inactive') return 'bg-red-900 text-red-200';
        }
        if (status === 'active') return 'bg-green-100 text-green-800';
        if (status === 'maintenance') return 'bg-yellow-100 text-yellow-800';
        if (status === 'inactive') return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status: string) => {
        const texts = {
            active: 'Aktif',
            maintenance: 'Bakımda',
            inactive: 'Pasif'
        };
        return texts[status as keyof typeof texts] || status;
    };

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
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Araç bilgilerini görüntüleyin ve yönetin</p>
            </motion.div>



            {/* Stats Cards */}
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <motion.div 
                    className={`rounded-xl shadow-sm border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: 0.2 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Toplam Araç</p>
                            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicles.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center text-2xl">
                            🚗
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    className={`rounded-xl shadow-sm border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: 0.25 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Aktif Araçlar</p>
                            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicles.filter(v => v.status === 'active').length}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-500 text-white rounded-lg flex items-center justify-center text-2xl">
                            ✅
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    className={`rounded-xl shadow-sm border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: 0.3 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Bakımda</p>
                            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicles.filter(v => v.status === 'maintenance').length}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-500 text-white rounded-lg flex items-center justify-center text-2xl">
                            🔧
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    className={`rounded-xl shadow-sm border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: 0.35 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Ortalama Yaş</p>
                            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>2.2</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center text-2xl">
                            📊
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Search and Add Button */}
            <motion.div 
                className="flex flex-col sm:flex-row gap-4 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
            >
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Araç ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                    />
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className={`bg-blue-600 text-white px-6 py-3 rounded-lg font-medium ${theme === 'dark' ? 'hover:bg-blue-800' : 'hover:bg-blue-700'} transition-colors duration-200 flex items-center justify-center space-x-2`}
                >
                    <span>🚗</span>
                    <span>Yeni Araç</span>
                </button>
            </motion.div>

            {/* Vehicles Grid */}
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
            >
                {filteredVehicles.map((vehicle, index) => (
                    <motion.div
                        key={vehicle.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: 0.6 + (index * 0.05) }}
                    >
                        <Link 
                            href={`/vehicles/${vehicle.plate.replace(/\s+/g, '')}`}
                            className={`block rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{vehicle.plate}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>{getStatusText(vehicle.status)}</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <span className={`text-gray-500 ${theme === 'dark' ? 'dark:text-gray-400' : ''}`}>🚙</span>
                                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{vehicle.brand} {vehicle.model}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className={`text-gray-500 ${theme === 'dark' ? 'dark:text-gray-400' : ''}`}>📅</span>
                                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{vehicle.year}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className={`text-gray-500 ${theme === 'dark' ? 'dark:text-gray-400' : ''}`}>⛽</span>
                                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{vehicle.fuel_type}</span>
                                </div>

                            </div>
                            <div className={`flex gap-2 mt-6 pt-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        // Düzenle işlemi burada yapılacak
                                    }}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${theme === 'dark' ? 'bg-blue-900 text-blue-200 hover:bg-blue-800' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                                >
                                    Düzenle
                                </button>
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        // Sil işlemi burada yapılacak
                                    }}
                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${theme === 'dark' ? 'bg-red-900 text-red-200 hover:bg-red-800' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                                >
                                    Sil
                                </button>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            {/* Add Vehicle Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className={`rounded-xl shadow-lg max-w-md w-full p-6 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`}> 
                        <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Yeni Araç Ekle</h2>
                        
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Plaka *</label>
                                <input
                                    type="text"
                                    name="plate"
                                    value={formData.plate}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                    placeholder="34 ABC 123"
                                    maxLength={20}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Marka *</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Model *</label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={formData.model}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Yıl *</label>
                                <input
                                    type="number"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                    placeholder="2020"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Yakıt Türü</label>
                                    <select
                                        name="fuel_type"
                                        value={formData.fuel_type}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                                        required
                                    >
                                        <option value="benzin">Benzin</option>
                                        <option value="dizel">Dizel</option>
                                        <option value="elektrik">Elektrik</option>
                                        <option value="hibrit">Hibrit</option>
                                        <option value="lpg">LPG</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Durum</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                                        required
                                    >
                                        <option value="active">Aktif</option>
                                        <option value="maintenance">Bakımda</option>
                                        <option value="inactive">Pasif</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className={`flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium ${theme === 'dark' ? 'hover:bg-blue-800' : 'hover:bg-blue-700'} transition-colors duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Ekleniyor...' : 'Ekle'}
                                </button>
                                <button type="button" onClick={() => setShowAddForm(false)} className={`flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-medium ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-700'} transition-colors duration-200`}>
                                    İptal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehiclesPage;