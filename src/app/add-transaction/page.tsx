"use client"
import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { motion } from 'framer-motion';
import { vehicleUtils, personnelUtils, transactionUtils } from '../lib/supabase-utils';
import { useRouter } from 'next/navigation';
import type { Vehicle, Personnel } from '../lib/supabase-utils';

const AddTransactionPage: React.FC = () => {
    const theme = useSelector((state: RootState) => state.theme.theme);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [formData, setFormData] = useState({
        vehicle_id: '',
        personnel_id: '',
        transaction_type: 'fuel',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Load vehicles and personnel on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [vehiclesData, personnelData] = await Promise.all([
                    vehicleUtils.getAllVehicles(),
                    personnelUtils.getAllPersonnel()
                ]);
                setVehicles(vehiclesData || []);
                setPersonnel(personnelData || []);
            } catch (error: unknown) {
                console.error('Error loading data:', error);
                setError('Veriler yüklenirken hata oluştu');
            }
        };
        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const transactionData = {
                ...formData,
                amount: formData.amount ? parseFloat(formData.amount) : 0,
                date: new Date(formData.date).toISOString(),
                transaction_type: formData.transaction_type as 'fuel' | 'maintenance' | 'repair' | 'toll' | 'parking' | 'other'
            };

            await transactionUtils.createTransaction(transactionData);
            alert('İşlem başarıyla eklendi!');
            router.push('/vehicles');
        } catch (error: unknown) {
            console.error('Error creating transaction:', error);
            let message = 'İşlem eklenirken hata oluştu';
            if (error && typeof error === 'object' && 'message' in error) {
                message += `: ${(error as { message?: string }).message}`;
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`flex-1 bg-gradient-to-br min-h-screen p-6 ${theme === 'dark' ? 'from-slate-900 to-blue-950' : 'from-slate-50 to-blue-50'}`}>
            {/* Header */}
            <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Yeni İşlem Ekle</h1>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Araç ve personel bilgileri ile yeni işlem kaydı oluşturun</p>
            </motion.div>

            {/* Form and Recent Transactions */}
            <motion.div 
                className="max-w-7xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Form */}
                    <motion.div 
                        className={`rounded-xl shadow-sm border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    > 
                        <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Yeni İşlem Formu</h2>
                        
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Vehicle and Personnel Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="vehicle_id" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Araç *</label>
                                <select
                                    id="vehicle_id"
                                    name="vehicle_id"
                                    value={formData.vehicle_id}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                                    required
                                >
                                    <option value="">Araç seçin</option>
                                    {vehicles.map((vehicle) => (
                                        <option key={vehicle.id} value={vehicle.id}>
                                            {vehicle.plate} - {vehicle.brand} {vehicle.model}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="personnel_id" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Personel *</label>
                                <select
                                    id="personnel_id"
                                    name="personnel_id"
                                    value={formData.personnel_id}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                                    required
                                >
                                    <option value="">Personel seçin</option>
                                    {personnel.map((person) => (
                                        <option key={person.id} value={person.id}>
                                            {person.name} - {person.position}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {/* Transaction Type and Amount */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="transaction_type" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>İşlem Türü *</label>
                                <select
                                    id="transaction_type"
                                    name="transaction_type"
                                    value={formData.transaction_type}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                                    required
                                >
                                    <option value="fuel">Yakıt</option>
                                    <option value="maintenance">Bakım</option>
                                    <option value="repair">Onarım</option>
                                    <option value="toll">Otoyol Ücreti</option>
                                    <option value="parking">Otopark</option>
                                    <option value="other">Diğer</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="amount" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Tutar (₺)</label>
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                    placeholder="0.00"
                                    step="0.01"
                                />
                            </div>
                        </div>
                        {/* Date */}
                        <div>
                            <label htmlFor="date" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Tarih *</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                                required
                            />
                        </div>
                        {/* Description */}
                        <div>
                            <label htmlFor="description" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Açıklama</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                                placeholder="İşlem detaylarını buraya yazın..."
                            />
                        </div>
                        {/* Submit Buttons */}
                        <div className="flex justify-center gap-4 pt-6 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`bg-blue-600 text-white py-4 px-8 rounded-lg font-medium ${theme === 'dark' ? 'hover:bg-blue-800' : 'hover:bg-blue-700'} focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-3 min-w-[120px] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span>{loading ? '⏳' : '📋'}</span>
                                <span>{loading ? 'Ekleniyor...' : 'Ekle'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData({
                                        vehicle_id: '',
                                        personnel_id: '',
                                        transaction_type: 'fuel',
                                        description: '',
                                        amount: '',
                                        date: new Date().toISOString().split('T')[0]
                                    });
                                }}
                                className={`bg-gray-500 text-white py-4 px-8 rounded-lg font-medium ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-700'} focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-3 min-w-[120px]`}
                            >
                                <span>🔄</span>
                                <span>Temizle</span>
                            </button>
                        </div>
                    </form>
                    </motion.div>

                    {/* Recent Transactions Preview */}
                    <motion.div 
                        className={`rounded-xl shadow-sm border p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Son Eklenen İşlemler</h2>
                        <motion.div 
                            className="space-y-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                        >
                            <motion.div 
                                className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 1.0 }}
                            > 
                                <div>
                                    <p className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>34 ABC 123 - Teslim Alma</p>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Ahmet Yılmaz • 2 saat önce</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}>
                                    Tamamlandı
                                </span>
                            </motion.div>
                            <motion.div 
                                className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 1.2 }}
                            > 
                                <div>
                                    <p className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>06 XYZ 789 - Bakım</p>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Mehmet Demir • 5 saat önce</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}`}>
                                    Devam Ediyor
                                </span>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default AddTransactionPage;